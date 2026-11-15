<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\AuditLog;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /** @return array{Builder<Customer>, array<string, mixed>} */
    private function query(Request $request): array
    {
        abort_unless($request->user()->can('reports.view'), 403);
        $filters = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'], 'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'status' => ['nullable', Rule::in(array_keys(config('crm.lifecycle')))],
            'organisation_id' => ['prohibited'], 'branch_id' => ['prohibited'],
        ]);
        $query = Customer::query()->when($filters['from'] ?? null, fn ($q, $date) => $q->where('created_at', '>=', $date.' 00:00:00'))
            ->when($filters['to'] ?? null, fn ($q, $date) => $q->where('created_at', '<', CarbonImmutable::parse($date, 'UTC')->addDay()))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('lifecycle_status', $status));

        return [$query, $filters];
    }

    public function index(Request $request): Response
    {
        [$query, $filters] = $this->query($request);

        return Inertia::render('reports/index', ['filters' => $filters, 'total' => (clone $query)->count(), 'byStatus' => $query->select('lifecycle_status', DB::raw('count(*) as total'))->groupBy('lifecycle_status')->pluck('total', 'lifecycle_status'), 'lifecycle' => config('crm.lifecycle')]);
    }

    public function export(Request $request): \Illuminate\Http\Response
    {
        abort_unless($request->user()->can('reports.export'), 403);
        [$query] = $this->query($request);
        $rows = $query->orderBy('id')->limit(10001)->get(['display_name', 'phone', 'lifecycle_status', 'created_at']);
        abort_if($rows->count() > 10000, 422, 'Narrow the filters to export at most 10,000 customers.');
        $handle = fopen('php://temp', 'r+');
        if ($handle === false) {
            throw new \RuntimeException('Unable to prepare export.');
        }
        fwrite($handle, "\xEF\xBB\xBF");
        fputcsv($handle, ['Name', 'Phone', 'Lifecycle', 'Created at (UTC)'], ',', '"', '');
        foreach ($rows as $row) {
            $values = [$row->display_name, $row->phone, $row->lifecycle_status, $row->created_at->format('Y-m-d H:i:s')];
            fputcsv($handle, array_map(fn ($value) => preg_match('/^[\s]*[=+@\-]/u', $value) ? "'".$value : $value, $values), ',', '"', '');
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);
        app(AuditLog::class)->record($request->user()->id, 'customer.exported', 'customer', metadata: ['count' => $rows->count()]);

        return response($csv, 200, ['Content-Type' => 'text/csv; charset=UTF-8', 'Content-Disposition' => 'attachment; filename="skybound-customers.csv"', 'Cache-Control' => 'no-store']);
    }
}
