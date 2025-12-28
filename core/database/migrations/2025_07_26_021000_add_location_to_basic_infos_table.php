<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('basic_infos')) {
            return;
        }
        Schema::table('basic_infos', function (Blueprint $table) {
            if (!Schema::hasColumn('basic_infos', 'country')) {
                $table->unsignedBigInteger('country')->nullable()->after('mother_tongue');
            }
            if (!Schema::hasColumn('basic_infos', 'state')) {
                $table->unsignedBigInteger('state')->nullable()->after('country');
            }
            if (!Schema::hasColumn('basic_infos', 'city')) {
                $table->unsignedBigInteger('city')->nullable()->after('state');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('basic_infos')) {
            return;
        }
        Schema::table('basic_infos', function (Blueprint $table) {
            foreach (['city','state','country'] as $col) {
                if (Schema::hasColumn('basic_infos', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
