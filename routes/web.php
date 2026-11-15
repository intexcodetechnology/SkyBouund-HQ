<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Middleware\UseTenantWorkspace;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('workspace/branch', [WorkspaceController::class, 'switchBranch'])->name('workspace.branch');
    Route::middleware(UseTenantWorkspace::class)->group(function () {
        Route::get('dashboard', [WorkspaceController::class, 'dashboard'])->name('dashboard');
        Route::get('auto-dialing', [WorkspaceController::class, 'dialer'])->name('autodial');
        Route::get('customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::post('customers', [CustomerController::class, 'store'])->name('customers.store');
        Route::patch('customers/{customer}', [CustomerController::class, 'update'])->whereUuid('customer')->name('customers.update');
        Route::delete('customers/{customer}', [CustomerController::class, 'destroy'])->whereUuid('customer')->name('customers.destroy');
        Route::get('tasks', [TaskController::class, 'index'])->name('tasks.index');
        Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
        Route::patch('tasks/{task}', [TaskController::class, 'update'])->whereUuid('task')->name('tasks.update');
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::patch('products/{product}', [ProductController::class, 'update'])->whereUuid('product')->name('products.update');
        Route::get('agents', [WorkspaceController::class, 'agents'])->name('agents.index');
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/customers.csv', [ReportController::class, 'export'])->name('reports.export');
        Route::get('system-settings', [WorkspaceController::class, 'settings'])->name('system.settings');
    });
});
require __DIR__.'/settings.php';
