<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if(!Schema::hasTable('basic_infos')) return;
        Schema::table('basic_infos', function (Blueprint $table) {
            if(!Schema::hasColumn('basic_infos','horoscope_file')){
                $table->string('horoscope_file',255)->nullable()->after('mother_tongue');
            }
            if(!Schema::hasColumn('basic_infos','id_proof_file')){
                $table->string('id_proof_file',255)->nullable()->after('horoscope_file');
            }
        });
    }

    public function down(): void
    {
        if(!Schema::hasTable('basic_infos')) return;
        Schema::table('basic_infos', function (Blueprint $table) {
            if(Schema::hasColumn('basic_infos','id_proof_file')){
                $table->dropColumn('id_proof_file');
            }
            if(Schema::hasColumn('basic_infos','horoscope_file')){
                $table->dropColumn('horoscope_file');
            }
        });
    }
};
