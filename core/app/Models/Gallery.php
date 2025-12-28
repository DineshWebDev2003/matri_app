<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'image',
        'status',
        'is_profile',
        'type',
    ];

    protected $casts = [
        'is_profile' => 'boolean',
        'user_id' => 'integer',
    ];

    const STATUS_PENDING  = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    const TYPE_PHOTO      = 'photo';
    const TYPE_HOROSCOPE  = 'horoscope';
    const TYPE_ID_PROOF   = 'id_proof';

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($gallery) {
            // If this image is marked as profile, unset others for the same user
            if ($gallery->is_profile) {
                self::where('user_id', $gallery->user_id)
                    ->where('id', '!=', $gallery->id ?? 0)
                    ->update(['is_profile' => false]);
            }
        });
    }

    public function scopeApproved($q){
        return $q->where('status', self::STATUS_APPROVED);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
}
