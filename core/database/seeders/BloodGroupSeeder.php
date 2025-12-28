<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BloodGroup;

class BloodGroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
        foreach($groups as $g){
            BloodGroup::updateOrCreate(['name'=>$g]);
        }
    }
}
