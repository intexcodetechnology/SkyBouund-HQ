<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveProductRequest;
use App\Models\ProductCategory;
use App\Models\ProductModel;
use App\Services\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('products.view'), 403);

        return Inertia::render('products/index', ['products' => ProductModel::with('category')->latest()->paginate(15)]);
    }

    public function store(SaveProductRequest $request): RedirectResponse
    {
        return $this->save($request);
    }

    public function update(SaveProductRequest $request, string $product): RedirectResponse
    {
        return $this->save($request, $product);
    }

    private function save(SaveProductRequest $request, ?string $id = null): RedirectResponse
    {
        return DB::transaction(function () use ($request, $id) {
            $data = $request->validated();
            $product = $id ? ProductModel::query()->lockForUpdate()->findOrFail($id) : new ProductModel;
            if ($id && $product->version !== (int) $data['version']) {
                throw ValidationException::withMessages(['version' => 'This product changed. Reload before saving.']);
            }
            $category = ProductCategory::firstOrCreate(['name' => $data['category']]);
            $product->fill(collect($data)->only(['name', 'model_code', 'monthly_price', 'description', 'is_active'])->all());
            $product->category_id = $category->id;
            $product->version = $id ? $product->version + 1 : 1;
            $product->save();
            app(AuditLog::class)->record($request->user()->id, $id ? 'product.updated' : 'product.created', 'product', $product->id);

            return back()->with('success', 'Product saved to the organisation catalog.');
        });
    }
}
