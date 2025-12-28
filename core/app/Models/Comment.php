<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'user_id',
        'admin_id',
        'comment',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
} 