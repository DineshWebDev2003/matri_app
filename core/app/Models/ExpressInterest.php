<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Represents an "interest" (heart) that one user sends to another.
 */
class ExpressInterest extends Model
{
    /**
     * Table backing the model.
     */
    protected $table = 'express_interests';

    protected $fillable = [
        'user_id',       // profile that received the interest
        'interested_by', // user who sent the interest
        'status',        // 0=pending,1=accepted,2=rejected
    ];

    /* --------------------------------------------------------------------- */
    /* Relations                                                             */
    /* --------------------------------------------------------------------- */

    /**
     * Target user profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Sender of the interest.
     */
    public function interestedBy()
    {
        return $this->belongsTo(User::class, 'interested_by');
    }
}
