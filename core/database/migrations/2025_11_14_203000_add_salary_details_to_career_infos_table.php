<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('career_infos', function (Blueprint $table) {
            if (!Schema::hasColumn('career_infos', 'salary_details')) {
                $table->string('salary_details')->nullable()->after('years');
            }
        });
    }

    public function down(): void
    {
        Schema::table('career_infos', function (Blueprint $table) {
            if (Schema::hasColumn('career_infos', 'salary_details')) {
                $table->dropColumn('salary_details');
            }
        });
    }
};
