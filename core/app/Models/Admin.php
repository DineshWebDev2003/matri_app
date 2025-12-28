<?php

namespace App\Models;


use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class Admin extends Authenticatable
{
    use HasRoles;

    /**
     * Set guard name for spatie/permission.
     *
     * @var string
     */
    protected string $guard_name = 'admin';
    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

}
