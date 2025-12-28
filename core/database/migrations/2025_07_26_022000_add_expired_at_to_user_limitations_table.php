<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('user_limitations')) {
            return;
        }
        Schema::table('user_limitations', function (Blueprint $table) {
            if (!Schema::hasColumn('user_limitations', 'expired_at')) {
                $table->dateTime('expired_at')->nullable()->after('package_id');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('user_limitations')) {
            return;
        }
        Schema::table('user_limitations', function (Blueprint $table) {
            if (Schema::hasColumn('user_limitations', 'expired_at')) {
                $table->dropColumn('expired_at');
            }
        });
    }
};
