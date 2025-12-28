<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class IndianCitiesSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = base_path('database/India-State-Cities-Database/combined.json');
        $data = json_decode(file_get_contents($jsonPath), true);
        if(!$data || empty($data['states'])){ return; }

        foreach ($data['states'] as $stateEntry) {
            DB::table('states')->updateOrInsert([
                'name'=>$stateEntry['name']
            ],[]);
            $stateId = DB::table('states')->where('name',$stateEntry['name'])->value('id');
            if(!$stateId){ continue; }
            foreach ($stateEntry['cities'] as $city) {
                DB::table('cities')->updateOrInsert(
                    ['state_id'=>$stateId,'name'=>$city],
                    []
                );
            }
        }
    }
}
