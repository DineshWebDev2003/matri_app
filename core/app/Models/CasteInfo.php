<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CasteInfo extends Model
{
    protected $table = 'caste_infos';
    protected $fillable = ['religion_id','name'];

    public function religion()
    {
        return $this->belongsTo(ReligionInfo::class, 'religion_id');
    }
}
