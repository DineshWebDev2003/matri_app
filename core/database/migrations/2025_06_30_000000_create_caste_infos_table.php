<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('caste_infos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('religion_id');
            $table->string('name', 100);
            $table->timestamps();

            $table->foreign('religion_id')->references('id')->on('religion_infos')->onDelete('cascade');
            $table->unique(['religion_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('caste_infos');
    }
};
