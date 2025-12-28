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
            if (!Schema::hasColumn('basic_infos', 'mother_tongue')) {
                $table->string('mother_tongue', 100)->nullable()->after('marital_status');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('basic_infos')) {
            return;
        }
        Schema::table('basic_infos', function (Blueprint $table) {
            if (Schema::hasColumn('basic_infos', 'mother_tongue')) {
                $table->dropColumn('mother_tongue');
            }
        });
    }
};
