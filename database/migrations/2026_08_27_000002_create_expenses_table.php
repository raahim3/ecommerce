<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expense_category_id')->constrained('expense_categories')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('USD');
            $table->date('expense_date');
            $table->string('payment_method')->default('bank_transfer'); // cash, bank_transfer, credit_card, paypal, other
            $table->string('payment_status')->default('paid'); // paid, pending
            $table->string('vendor_name')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('receipt_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes for fast filtering & analytics
            $table->index('expense_date');
            $table->index('payment_status');
            $table->index(['expense_date', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
