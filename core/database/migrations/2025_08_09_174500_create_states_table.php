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
        if (!Schema::hasTable('states')) {
            Schema::create('states', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 3)->default('IN')->index();
            $table->string('name');
            $table->timestamps();
            $table->unique(['country_code', 'name']);
                    });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('states');
    }
};
