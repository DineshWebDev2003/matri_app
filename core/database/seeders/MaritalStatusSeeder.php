<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MaritalStatus;

class MaritalStatusSeeder extends Seeder
{
    public function run(): void
    {
        $titles = ['Unmarried','Divorced','Widowed','Separated'];
        foreach ($titles as $title){
            MaritalStatus::updateOrCreate(['title'=>$title]);
        }
    }
}
