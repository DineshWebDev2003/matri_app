<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        $this->call(MaritalStatusSeeder::class);
        $this->call(BloodGroupSeeder::class);
        // \App\Models\User::factory(10)->create();
        
        // Seed religion_infos if not already seeded
        $this->call([
            ReligionInfoSeeder::class,
            CasteInfoSeeder::class,
            SidebarPermissionsSeeder::class,
            StatesTableSeeder::class,
            IndianCitiesSeeder::class
        ]);
    }
}
