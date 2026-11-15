<?php

use App\Models\User;
use App\Services\Tenancy\TenantContext;
use Database\Seeders\WorkspacePermissionSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

uses(DatabaseMigrations::class);

beforeEach(function () {
    if (DB::getDriverName() !== 'mysql' || ! str_ends_with(DB::connection()->getDatabaseName(), '_testing')) {
        throw new RuntimeException('CRM integration tests require a dedicated MySQL *_testing database.');
    }
    $this->withoutVite();
    $this->org = (string) Str::uuid();
    $this->otherOrg = (string) Str::uuid();
    $this->branch = (string) Str::uuid();
    $this->otherBranch = (string) Str::uuid();
    $this->siblingBranch = (string) Str::uuid();
    foreach ([$this->org, $this->otherOrg] as $id) {
        DB::table('organisations')->insert(['id' => $id, 'name' => 'Test organisation']);
    }
    foreach ([[$this->org, $this->branch], [$this->otherOrg, $this->otherBranch], [$this->org, $this->siblingBranch]] as [$org, $branch]) {
        DB::table('branches')->insert(['id' => $branch, 'organisation_id' => $org, 'name' => $branch]);
    }
    $this->actor = User::factory()->create(['two_factor_secret' => encrypt('JBSWY3DPEHPK3PXP'), 'two_factor_confirmed_at' => now()]);
    DB::table('branch_memberships')->insert(['user_id' => $this->actor->id, 'organisation_id' => $this->org, 'branch_id' => $this->branch, 'active' => true]);
    (new WorkspacePermissionSeeder)->run();
    setPermissionsTeamId($this->org);
    $this->actor->assignRole('HQ Admin');
    setPermissionsTeamId(null);
    $this->actingAs($this->actor);
    $this->payload = ['display_name' => 'Example Customer', 'phone' => '+60123456789', 'ic' => '900101101234', 'lifecycle_status' => 'pending', 'action_status' => 'follow_up', 'do_not_call' => false, 'existing_product' => 'Existing Model', 'installed_on' => '2025-01-01', 'expires_on' => '2027-01-01', 'contract_months' => 24, 'remark' => 'Follow up next week.'];
    $this->foreign = (string) Str::uuid();
    $this->sibling = (string) Str::uuid();
    foreach ([[$this->otherOrg, $this->otherBranch, $this->foreign], [$this->org, $this->siblingBranch, $this->sibling]] as [$org, $branch, $id]) {
        DB::table('customers')->insert(['id' => $id, 'organisation_id' => $org, 'branch_id' => $branch, 'display_name' => 'Hidden Customer', 'phone' => '+60111111111', 'created_at' => now(), 'updated_at' => now()]);
    }
});

it('creates an encrypted customer, installation and lead atomically', function () {
    $this->post('/customers', $this->payload)->assertSessionHasNoErrors()->assertRedirect('/customers');
    $stored = DB::table('customers')->where('display_name', 'Example Customer')->first();
    expect($stored->organisation_id)->toBe($this->org)->and($stored->branch_id)->toBe($this->branch)->and($stored->ic)->not->toBe('900101101234');
    expect(decrypt($stored->ic, false))->toBe('900101101234');
    $this->assertDatabaseHas('customer_products', ['customer_id' => $stored->id, 'legacy_product_name' => 'Existing Model']);
    $this->assertDatabaseHas('leads', ['customer_id' => $stored->id, 'action_status' => 'follow_up']);
    $response = $this->get('/customers')->assertOk();
    expect($response->getContent())->not->toContain('900101101234')->and(count($response->viewData('page')['props']['customers']['data']))->toBe(1);
    $this->assertDatabaseHas('audit_events', ['action' => 'customer.created', 'entity_id' => $stored->id]);
});

it('denies foreign and sibling branch IDs for reads, updates and archives', function () {
    foreach ([$this->foreign, $this->sibling] as $id) {
        $this->get('/auto-dialing?customer='.$id)->assertNotFound();
        $this->patch('/customers/'.$id, [...$this->payload, 'version' => 1])->assertNotFound();
        $this->delete('/customers/'.$id, ['version' => 1])->assertNotFound();
    }
    expect(DB::table('customers')->where('display_name', 'Hidden Customer')->count())->toBe(2);
});

it('rejects tenant overrides and unauthorised branch selection', function () {
    $this->post('/customers', [...$this->payload, 'organisation_id' => $this->otherOrg, 'branch_id' => $this->otherBranch])->assertSessionHasErrors(['organisation_id', 'branch_id']);
    $this->post('/workspace/branch', ['branch_id' => $this->siblingBranch])->assertForbidden();
    $this->withSession(['active_branch_id' => $this->otherBranch])->get('/customers')->assertForbidden();
});

it('enforces role restrictions and administrative two factor setup', function () {
    $this->actor->two_factor_secret = null;
    $this->actor->two_factor_confirmed_at = null;
    $this->actor->save();
    $this->get('/customers')->assertRedirect('/settings/security');
    setPermissionsTeamId($this->org);
    $this->actor->syncRoles(['Agent']);
    setPermissionsTeamId(null);
    $this->post('/customers', $this->payload)->assertForbidden();
    $this->get('/reports/customers.csv')->assertForbidden();
    $this->get('/customers')->assertOk();
});

it('saves edits, rejects stale versions and archives without deleting history', function () {
    $this->post('/customers', $this->payload)->assertSessionHasNoErrors();
    $id = DB::table('customers')->where('display_name', 'Example Customer')->value('id');
    $this->patch('/customers/'.$id, [...$this->payload, 'ic' => '', 'display_name' => 'Updated Customer', 'version' => 1])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('customers', ['id' => $id, 'display_name' => 'Updated Customer', 'version' => 2]);
    $this->patch('/customers/'.$id, [...$this->payload, 'version' => 1])->assertSessionHasErrors('version');
    $this->delete('/customers/'.$id, ['version' => 2])->assertRedirect();
    expect(DB::table('customers')->where('id', $id)->value('deleted_at'))->not->toBeNull();
    expect(DB::table('leads')->where('customer_id', $id)->exists())->toBeTrue();
});

it('filters reports and exports only authorised rows with CSV formula protection', function () {
    $this->post('/customers', [...$this->payload, 'display_name' => '=Example formula'])->assertSessionHasNoErrors();
    $response = $this->get('/reports/customers.csv?status=pending')->assertOk();
    expect($response->getContent())->toContain("'=Example formula")->not->toContain('Hidden Customer')->not->toContain('900101101234');
    $this->get('/reports?from=2026-11-20&to=2026-11-01')->assertSessionHasErrors('to');
    $empty = $this->get('/reports/customers.csv?status=active')->assertOk();
    expect($empty->getContent())->not->toContain('Example formula');
    $this->assertDatabaseHas('audit_events', ['action' => 'customer.exported', 'organisation_id' => $this->org]);
});

it('rejects task assignment across branches and permits a valid follow up', function () {
    $this->post('/customers', $this->payload)->assertSessionHasNoErrors();
    $lead = DB::table('leads')->value('id');
    $outsider = User::factory()->create();
    $task = ['lead_id' => $lead, 'assigned_user_id' => $outsider->id, 'title' => 'Call back', 'due_on' => '2026-11-20'];
    $this->post('/tasks', $task)->assertSessionHasErrors('assigned_user_id');
    $this->post('/tasks', [...$task, 'assigned_user_id' => $this->actor->id])->assertSessionHasNoErrors();
    $id = DB::table('tasks')->value('id');
    $this->patch('/tasks/'.$id, ['status' => 'completed', 'version' => 1])->assertSessionHasNoErrors();
    $this->assertDatabaseHas('tasks', ['id' => $id, 'status' => 'completed', 'version' => 2]);
});

it('keeps the product catalog within its organisation and rejects foreign product IDs', function () {
    $data = ['category' => 'Water', 'name' => 'Example Model', 'model_code' => 'EXAMPLE-1', 'monthly_price' => '77.00', 'is_active' => true];
    $this->post('/products', $data)->assertSessionHasNoErrors();
    $foreignCategory = (string) Str::uuid();
    $foreignProduct = (string) Str::uuid();
    DB::table('product_categories')->insert(['id' => $foreignCategory, 'organisation_id' => $this->otherOrg, 'name' => 'Hidden Category']);
    DB::table('product_models')->insert(['id' => $foreignProduct, 'organisation_id' => $this->otherOrg, 'category_id' => $foreignCategory, 'name' => 'Hidden Product', 'model_code' => 'HIDDEN', 'monthly_price' => 10]);
    $this->patch('/products/'.$foreignProduct, [...$data, 'model_code' => 'OTHER', 'version' => 1])->assertNotFound();
    $response = $this->get('/products')->assertOk();
    expect($response->getContent())->not->toContain('Hidden Product');
});

it('clears tenant state and permission scope after a failed request', function () {
    $this->patch('/customers/'.$this->foreign, [...$this->payload, 'version' => 1])->assertNotFound();
    expect(getPermissionsTeamId())->toBeNull();
    expect(fn () => app(TenantContext::class)->current())->toThrow(LogicException::class);
});

it('rolls back a customer edit when installation validation fails', function () {
    $this->post('/customers', $this->payload)->assertSessionHasNoErrors();
    $id = DB::table('customers')->where('display_name', 'Example Customer')->value('id');
    $this->patch('/customers/'.$id, [...$this->payload, 'display_name' => 'Must Roll Back', 'existing_product' => '', 'installed_on' => '', 'expires_on' => '', 'contract_months' => '', 'version' => 1])->assertSessionHasErrors('existing_product');
    $this->assertDatabaseHas('customers', ['id' => $id, 'display_name' => 'Example Customer', 'version' => 1]);
});

it('enforces composite tenant foreign keys in MySQL', function () {
    expect(fn () => DB::table('customer_products')->insert([
        'id' => (string) Str::uuid(), 'organisation_id' => $this->org, 'branch_id' => $this->branch,
        'customer_id' => $this->foreign, 'legacy_product_name' => 'Forbidden association',
    ]))->toThrow(QueryException::class);
});

it('rejects negative prices and stale product or task edits', function () {
    $data = ['category' => 'Water', 'name' => 'Versioned Model', 'model_code' => 'VERSION-1', 'monthly_price' => '77.00', 'is_active' => true];
    $this->post('/products', [...$data, 'monthly_price' => '-1'])->assertSessionHasErrors('monthly_price');
    $this->post('/products', $data)->assertSessionHasNoErrors();
    $id = DB::table('product_models')->value('id');
    $this->patch('/products/'.$id, [...$data, 'version' => 1])->assertSessionHasNoErrors();
    $this->patch('/products/'.$id, [...$data, 'version' => 1])->assertSessionHasErrors('version');
    expect(fn () => DB::table('product_models')->where('id', $id)->update(['monthly_price' => -1]))->toThrow(QueryException::class);
});

it('revokes workspace access when branch membership is disabled', function () {
    DB::table('branch_memberships')->where('user_id', $this->actor->id)->update(['active' => false]);
    $this->get('/customers')->assertForbidden();
    $this->post('/customers', $this->payload)->assertForbidden();
    $this->get('/reports/customers.csv')->assertForbidden();
});
