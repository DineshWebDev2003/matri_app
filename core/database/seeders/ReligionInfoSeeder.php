<?php

namespace Database\Seeders;

use App\Models\ReligionInfo;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class ReligionInfoSeeder extends Seeder
{
    public function run()
    {
        // Do not truncate to avoid FK constraint issues

        $religions = [
            ['id' => 1, 'name' => 'Hindu'],
            ['id' => 2, 'name' => 'Muslim'],
            ['id' => 3, 'name' => 'Christian'],
            ['id' => 4, 'name' => 'Sikh'],
            ['id' => 5, 'name' => 'Buddhist'],
            ['id' => 6, 'name' => 'Jain'],
            ['id' => 7, 'name' => 'Parsi'],
            ['id' => 8, 'name' => 'Other']
        ];

        // Insert or update to preserve IDs
        foreach ($religions as $row) {
            ReligionInfo::updateOrCreate(['id' => $row['id']], $row);
        }
    }
}
