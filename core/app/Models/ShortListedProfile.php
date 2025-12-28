<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Model;

class ShortListedProfile extends Model
{
    use Searchable;
    public function profile()
    {
        return $this->belongsTo(User::class, 'profile_id');
    }
}
