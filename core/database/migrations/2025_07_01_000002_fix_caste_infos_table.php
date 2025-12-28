<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('caste_infos')) {
            Schema::create('caste_infos', function (Blueprint $table) {
                $table->id();
                $table->foreignId('religion_id')->constrained('religion_infos')->onDelete('cascade');
                $table->string('name');
                $table->timestamps();
                
                $table->unique(['religion_id', 'name']);
            });
        } else {
            // Ensure columns exist if table exists
            Schema::table('caste_infos', function (Blueprint $table) {
                if (!Schema::hasColumn('caste_infos', 'religion_id')) {
                    $table->foreignId('religion_id')->after('id')->constrained('religion_infos')->onDelete('cascade');
                }
                if (!Schema::hasColumn('caste_infos', 'name')) {
                    $table->string('name')->after('religion_id');
                }
            });
        }
    }

    public function down()
    {
        // Don't drop the table to preserve data
        // Schema::dropIfExists('caste_infos');
    }
};
