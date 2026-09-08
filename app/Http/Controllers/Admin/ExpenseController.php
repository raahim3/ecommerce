<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // 1. Determine Date Range for Main Filter
        $datePreset = $request->input('date_preset', 'this_month');
        $startDate = null;
        $endDate = null;

        switch ($datePreset) {
            case 'today':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'this_week':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                break;
            case 'this_month':
                $startDate = $startOfMonth;
                $endDate = $endOfMonth;
                break;
            case 'last_month':
                $startDate = $startOfLastMonth;
                $endDate = $endOfLastMonth;
                break;
            case 'this_quarter':
                $startDate = $now->copy()->firstOfQuarter();
                $endDate = $now->copy()->lastOfQuarter();
                break;
            case 'this_year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                break;
            case 'custom':
                if ($request->filled('start_date')) {
                    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
                }
                if ($request->filled('end_date')) {
                    $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
                }
                break;
            case 'all':
            default:
                $startDate = null;
                $endDate = null;
                break;
        }

        // 2. Query Builder for Filtered Expenses
        $query = Expense::with(['category', 'user']);

        if ($startDate && $endDate) {
            $query->whereBetween('expense_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        } elseif ($startDate) {
            $query->where('expense_date', '>=', $startDate->format('Y-m-d'));
        } elseif ($endDate) {
            $query->where('expense_date', '<=', $endDate->format('Y-m-d'));
        }

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('category_id') && $request->input('category_id') !== 'all') {
            $query->where('expense_category_id', $request->input('category_id'));
        }

        if ($request->filled('payment_status') && $request->input('payment_status') !== 'all') {
            $query->where('payment_status', $request->input('payment_status'));
        }

        if ($request->filled('payment_method') && $request->input('payment_method') !== 'all') {
            $query->where('payment_method', $request->input('payment_method'));
        }

        // 3. Calculate Summary KPIs
        // Total filtered expenses
        $filteredTotalAmount = (clone $query)->sum('amount');
        $filteredPaidAmount = (clone $query)->where('payment_status', 'paid')->sum('amount');
        $filteredPendingAmount = (clone $query)->where('payment_status', 'pending')->sum('amount');
        $filteredPendingCount = (clone $query)->where('payment_status', 'pending')->count();

        // Month-over-Month comparison
        $thisMonthExpenses = Expense::whereBetween('expense_date', [
            $startOfMonth->format('Y-m-d'),
            $endOfMonth->format('Y-m-d'),
        ])->sum('amount');

        $lastMonthExpenses = Expense::whereBetween('expense_date', [
            $startOfLastMonth->format('Y-m-d'),
            $endOfLastMonth->format('Y-m-d'),
        ])->sum('amount');

        $expenseMoMChange = $lastMonthExpenses > 0
            ? round((($thisMonthExpenses - $lastMonthExpenses) / $lastMonthExpenses) * 100, 1)
            : ($thisMonthExpenses > 0 ? 100 : 0);

        // Store Revenue & Estimated Net Profit calculation
        $orderQuery = Order::where('payment_status', 'paid');
        if ($startDate && $endDate) {
            $orderQuery->whereBetween('placed_at', [$startDate, $endDate]);
        } elseif ($startDate) {
            $orderQuery->where('placed_at', '>=', $startDate);
        } elseif ($endDate) {
            $orderQuery->where('placed_at', '<=', $endDate);
        }
        $revenue = $orderQuery->sum('total_amount');
        $netProfit = $revenue - $filteredPaidAmount;
        $profitMargin = $revenue > 0 ? round(($netProfit / $revenue) * 100, 1) : 0;

        // 4. Category Spending Breakdown (for distribution bars/charts)
        $categoryBreakdown = (clone $query)
            ->selectRaw('expense_category_id, SUM(amount) as total_amount, COUNT(*) as count')
            ->groupBy('expense_category_id')
            ->with('category')
            ->get()
            ->map(function ($item) use ($filteredTotalAmount) {
                $percentage = $filteredTotalAmount > 0
                    ? round(($item->total_amount / $filteredTotalAmount) * 100, 1)
                    : 0;

                return [
                    'category_id' => $item->expense_category_id,
                    'name' => $item->category?->name ?? 'Uncategorized',
                    'color' => $item->category?->color ?? '#64748B',
                    'total_amount' => (float) $item->total_amount,
                    'percentage' => $percentage,
                    'count' => $item->count,
                ];
            })
            ->sortByDesc('total_amount')
            ->values();

        // 5. Paginated Expense List
        $expenses = $query
            ->orderBy('expense_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        // 6. Categories for Modals and Filters
        $categories = ExpenseCategory::withCount('expenses')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/expenses', [
            'expenses' => $expenses,
            'categories' => $categories,
            'stats' => [
                'totalExpenses' => round((float) $filteredTotalAmount, 2),
                'paidExpenses' => round((float) $filteredPaidAmount, 2),
                'pendingAmount' => round((float) $filteredPendingAmount, 2),
                'pendingCount' => $filteredPendingCount,
                'thisMonthExpenses' => round((float) $thisMonthExpenses, 2),
                'lastMonthExpenses' => round((float) $lastMonthExpenses, 2),
                'expenseMoMChange' => $expenseMoMChange,
                'periodRevenue' => round((float) $revenue, 2),
                'netProfit' => round((float) $netProfit, 2),
                'profitMargin' => $profitMargin,
            ],
            'categoryBreakdown' => $categoryBreakdown,
            'filters' => [
                'search' => $request->input('search', ''),
                'category_id' => $request->input('category_id', 'all'),
                'payment_status' => $request->input('payment_status', 'all'),
                'payment_method' => $request->input('payment_method', 'all'),
                'date_preset' => $datePreset,
                'start_date' => $request->input('start_date', ''),
                'end_date' => $request->input('end_date', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'expense_category_id' => ['required', 'exists:expense_categories,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'expense_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,credit_card,paypal,other'],
            'payment_status' => ['required', 'string', 'in:paid,pending'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'receipt_url' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string'],
        ]);

        $general = \App\Models\Setting::get('general', []);
        $currencyCode = explode(' ', $general['currency'] ?? 'USD')[0];

        $validated['user_id'] = auth()->id();
        $validated['currency'] = $currencyCode ?: 'USD';

        Expense::create($validated);

        return redirect()->back()->with('success', 'Expense recorded successfully.');
    }

    public function update(Request $request, int $id)
    {
        $expense = Expense::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'expense_category_id' => ['required', 'exists:expense_categories,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'expense_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,credit_card,paypal,other'],
            'payment_status' => ['required', 'string', 'in:paid,pending'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'receipt_url' => ['nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string'],
        ]);

        $expense->update($validated);

        return redirect()->back()->with('success', 'Expense updated successfully.');
    }

    public function destroy(int $id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return redirect()->back()->with('success', 'Expense deleted successfully.');
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:expense_categories,name'],
            'color' => ['nullable', 'string', 'max:20'],
            'monthly_budget' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['color'] = $validated['color'] ?: '#6366F1';
        $validated['is_active'] = true;

        ExpenseCategory::create($validated);

        return redirect()->back()->with('success', 'Expense category created.');
    }

    public function updateCategory(Request $request, int $id)
    {
        $category = ExpenseCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:expense_categories,name,' . $category->id],
            'color' => ['nullable', 'string', 'max:20'],
            'monthly_budget' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        if (!empty($validated['color'])) {
            $category->color = $validated['color'];
        }
        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroyCategory(int $id)
    {
        $category = ExpenseCategory::findOrFail($id);

        if ($category->expenses()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category with associated expenses. Reassign or delete expenses first.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully.');
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Expense::with(['category', 'user']);

        // Apply same filters for export
        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }
        if ($request->filled('category_id') && $request->input('category_id') !== 'all') {
            $query->where('expense_category_id', $request->input('category_id'));
        }
        if ($request->filled('payment_status') && $request->input('payment_status') !== 'all') {
            $query->where('payment_status', $request->input('payment_status'));
        }
        if ($request->filled('payment_method') && $request->input('payment_method') !== 'all') {
            $query->where('payment_method', $request->input('payment_method'));
        }
        if ($request->filled('start_date')) {
            $query->where('expense_date', '>=', $request->input('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->where('expense_date', '<=', $request->input('end_date'));
        }

        $expenses = $query->orderBy('expense_date', 'desc')->get();

        $filename = 'expenses_export_' . date('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($expenses) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'ID',
                'Date',
                'Title',
                'Category',
                'Vendor',
                'Amount',
                'Currency',
                'Payment Method',
                'Payment Status',
                'Reference / Invoice #',
                'Notes',
                'Recorded By',
            ]);

            foreach ($expenses as $expense) {
                fputcsv($file, [
                    $expense->id,
                    $expense->expense_date ? $expense->expense_date->format('Y-m-d') : '',
                    $expense->title,
                    $expense->category?->name ?? 'Uncategorized',
                    $expense->vendor_name ?? 'N/A',
                    number_format($expense->amount, 2, '.', ''),
                    $expense->currency,
                    ucwords(str_replace('_', ' ', $expense->payment_method)),
                    ucfirst($expense->payment_status),
                    $expense->reference_number ?? '',
                    $expense->notes ?? '',
                    $expense->user?->name ?? 'System',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
