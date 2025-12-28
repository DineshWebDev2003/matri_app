<?php

namespace Database\Seeders;

use App\Models\CasteInfo;
use Illuminate\Database\Seeder;

class CasteInfoSeeder extends Seeder
{
    public function run()
    {
        // Clear existing data
        CasteInfo::truncate();

        // Hindu Castes (religion_id = 1)
        $hinduCastes = [
            'Brahmin', 'Kshatriya', 'Vaishya', 'Shudra',
            'Vanniyar', 'Gounder', 'Thevar', 'Nadar',
            'Chettiar', 'Mudaliar', 'Pillai', 'Naicker',
            'Reddy', 'Gowda', 'Lingayat', 'Vokkaliga',
            'Maratha', 'Jat', 'Gujjar', 'Rajput',
            'Kamma', 'Kapu', 'Balija', 'Velama',
            'Baniya', 'Khatri', 'Arora', 'Bhumihar',
            'Kayastha', 'Kurmi', 'Yadav', 'Kuruba',
            'Besta', 'Mala', 'Madiga', 'Chamar',
            'Dusadh', 'Pasi', 'Other'
        ];

        foreach ($hinduCastes as $caste) {
            CasteInfo::create([
                'religion_id' => 1, // Hindu
                'name' => $caste
            ]);
        }

        // Muslim Castes (religion_id = 2)
        $muslimCastes = [
            'Shaikh', 'Sayyid', 'Mughal', 'Pathan',
            'Ansari', 'Qureshi', 'Siddiqui', 'Faruqi',
            'Usmani', 'Khan', 'Mirza', 'Malik',
            'Sheikh', 'Syed', 'Memon', 'Bohra',
            'Khoja', 'Dudhwala', 'Rayeen', 'Qassab',
            'Mansoori', 'Salmani', 'Fareedi', 'Other'
        ];

        foreach ($muslimCastes as $caste) {
            CasteInfo::create([
                'religion_id' => 2, // Muslim
                'name' => $caste
            ]);
        }

        // Christian Castes (religion_id = 3)
        $christianCastes = [
            'Roman Catholic', 'Protestant', 'Syro-Malabar', 'Syro-Malankara',
            'Jacobite', 'Orthodox', 'Latin Catholic', 'CSI',
            'Knanaya', 'Goan Catholic', 'Mangalorean Catholic', 'Anglo-Indian',
            'Nadar Christian', 'Dalian', 'Baptist', 'Pentecostal',
            'Seventh-day Adventist', 'Other'
        ];

        foreach ($christianCastes as $caste) {
            CasteInfo::create([
                'religion_id' => 3, // Christian
                'name' => $caste
            ]);
        }

        // Sikh Castes (religion_id = 4)
        $sikhCastes = [
            'Jat Sikh', 'Khatri', 'Arora', 'Ramgarhia',
            'Ahluwalia', 'Bhatia', 'Kamboj', 'Lubana',
            'Mazhabi', 'Ramdasia', 'Rai Sikh', 'Saini',
            'Tarkhan', 'Other'
        ];

        foreach ($sikhCastes as $caste) {
            CasteInfo::create([
                'religion_id' => 4, // Sikh
                'name' => $caste
            ]);
        }
    }
}
