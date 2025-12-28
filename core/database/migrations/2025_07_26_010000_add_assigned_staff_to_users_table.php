<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'assigned_staff')) {
                $table->unsignedBigInteger('assigned_staff')->nullable();
                // If you have a staffs table (admins with guard 'staff') you can add FK
                // $table->foreign('assigned_staff')->references('id')->on('admins')->nullOnDelete();
            }
            if (!Schema::hasColumn('users', 'assigned_franchise')) {
                $table->unsignedBigInteger('assigned_franchise')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'assigned_franchise')) {
                $table->dropColumn('assigned_franchise');
            }
            if (Schema::hasColumn('users', 'assigned_staff')) {
                $table->dropColumn('assigned_staff');
            }
        });
    }
};
