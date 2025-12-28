<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StandardizeGenderValues extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Standardize gender values in basic_infos table
        DB::table('basic_infos')
            ->whereIn('gender', ['m', 'M', '1', 'male', 'Male'])
            ->update(['gender' => 'Male']);

        DB::table('basic_infos')
            ->whereIn('gender', ['f', 'F', '2', 'female', 'Female'])
            ->update(['gender' => 'Female']);

        // Update any other unexpected values to NULL
        DB::table('basic_infos')
            ->whereNotIn('gender', ['Male', 'Female'])
            ->update(['gender' => null]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // This is a one-way migration as we can't reliably restore original values
    }
}
