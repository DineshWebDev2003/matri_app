<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('basic_infos')) {
            return; // table handled by original install; skip if missing
        }
        Schema::table('basic_infos', function (Blueprint $table) {
            if (!Schema::hasColumn('basic_infos', 'religion_id')) {
                $table->unsignedBigInteger('religion_id')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('basic_infos', 'caste')) {
                $table->string('caste', 64)->nullable()->after('religion_id');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('basic_infos')) {
            return;
        }
        Schema::table('basic_infos', function (Blueprint $table) {
            if (Schema::hasColumn('basic_infos', 'caste')) {
                $table->dropColumn('caste');
            }
            if (Schema::hasColumn('basic_infos', 'religion_id')) {
                $table->dropColumn('religion_id');
            }
        });
    }
};
