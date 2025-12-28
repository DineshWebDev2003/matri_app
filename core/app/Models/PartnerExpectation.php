<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerExpectation extends Model
{
    protected $guarded = [];

    protected $casts = [
        'language' => 'array'
    ];
}
