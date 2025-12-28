<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('career_infos', function (Blueprint $table) {
            if (!Schema::hasColumn('career_infos','designation')) {
                $table->string('designation')->nullable()->after('id');
            }
            if (!Schema::hasColumn('career_infos','company')) {
                $table->string('company')->nullable()->after('designation');
            }
            if (!Schema::hasColumn('career_infos','years')) {
                $table->string('years')->nullable()->after('company');
            }
        });
    }

    public function down(): void
    {
        Schema::table('career_infos', function (Blueprint $table) {
            foreach(['years','company','designation'] as $col){
                if (Schema::hasColumn('career_infos',$col)){
                    $table->dropColumn($col);
                }
            }
        });
    }
};
