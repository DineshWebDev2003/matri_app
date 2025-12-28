<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            if(!Schema::hasColumn('galleries','status')){
                $table->string('status')->default('pending')->after('image');
            }
            if(!Schema::hasColumn('galleries','type')){
                $table->string('type')->default('photo')->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            if(Schema::hasColumn('galleries','status')){
                $table->dropColumn('status');
            }
            if(Schema::hasColumn('galleries','type')){
                $table->dropColumn('type');
            }
        });
    }
};
