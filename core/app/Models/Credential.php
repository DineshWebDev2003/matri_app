<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Credential extends Model
{
    protected $casts = [
        'key_data' => 'object'
    ];

    //scope
    public function scopeActive($query){
        return $query->where('status', 1);
    }

    public function scopeInactive($query){
        return $query->where('status', 0);
    }
}
