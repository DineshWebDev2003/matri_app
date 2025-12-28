<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('education_infos', function (Blueprint $table) {
            if (!Schema::hasColumn('education_infos','degree')) {
                $table->string('degree')->nullable()->after('id');
            }
            if (!Schema::hasColumn('education_infos','institution')) {
                $table->string('institution')->nullable()->after('degree');
            }
            if (!Schema::hasColumn('education_infos','year')) {
                $table->string('year')->nullable()->after('institution');
            }
        });
    }

    public function down(): void
    {
        Schema::table('education_infos', function (Blueprint $table) {
            foreach(['year','institution','degree'] as $col){
                if (Schema::hasColumn('education_infos',$col)){
                    $table->dropColumn($col);
                }
            }
        });
    }
};
