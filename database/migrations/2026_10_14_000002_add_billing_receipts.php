<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->string('receipt_type', 10)->nullable();
            $table->string('document_type', 3)->nullable();
            $table->string('document_number', 11)->nullable();
            $table->string('billing_name')->nullable();
            $table->string('billing_address')->nullable();
            $table->string('billing_email')->nullable();
        });
        Schema::create('billing_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_request_id')->unique()->constrained()->restrictOnDelete();
            $table->string('number', 30)->unique();
            $table->string('receipt_type', 10);
            $table->string('document_type', 3);
            $table->string('document_number', 11);
            $table->string('customer_name');
            $table->string('customer_address')->nullable();
            $table->string('customer_email');
            $table->json('issuer');
            $table->string('description');
            $table->string('currency', 3)->default('PEN');
            $table->decimal('total', 10, 2);
            $table->string('charge_id')->unique();
            $table->timestamp('issued_at');
            $table->string('electronic_status')->default('not_sent');
            $table->string('external_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_receipts');
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->dropColumn(['receipt_type', 'document_type', 'document_number', 'billing_name', 'billing_address', 'billing_email']);
        });
    }
};
