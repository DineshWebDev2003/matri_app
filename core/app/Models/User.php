<?php

namespace App\Models;

use App\Constants\Status;
use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Cache;

class User extends Authenticatable
{
    use HasApiTokens, Searchable;

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $fillable = [
        'google_id',
        'looking_for'
    ];

    protected $hidden = [
        'password', 'remember_token', 'ver_code',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'skipped_step' => 'array',
        'completed_step' => 'array',
        'address' => 'object',
        'kyc_data' => 'object',
        'ver_code_send_at' => 'datetime'
    ];

    public function online()
    {
        return Cache::has('online-user' . $this->id);
    }

    public function loginLogs()
    {
        return $this->hasMany(UserLogin::class);
    }

    public function deposits()
    {
        return $this->hasMany(Deposit::class)->where('status', '!=', Status::PAYMENT_INITIATE);
    }

    public function staff()
    {
        return $this->belongsTo(\App\Models\Admin::class, 'assigned_staff');
    }

    public function limitation()
    {
        return $this->hasOne(UserLimitation::class);
    }

    public function purchaseHistory()
    {
        return $this->hasMany(PurchaseHistory::class);
    }

    public function basicInfo()
    {
        return $this->hasOne(BasicInfo::class);
    }

    public function physicalAttributes()
    {
        return $this->hasOne(PhysicalAttribute::class);
    }

    public function family()
    {
        return $this->hasOne(FamilyInfo::class);
    }

    public function educationInfo()
    {
        return $this->hasMany(EducationInfo::class);
    }

    public function careerInfo()
    {
        return $this->hasMany(CareerInfo::class);
    }

    public function partnerExpectation()
    {
        return $this->hasOne(PartnerExpectation::class);
    }

    public function galleries()
    {
        return $this->hasMany(Gallery::class)->latest('id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function shortListedProfile()
    {
        return $this->hasMany(ShortListedProfile::class);
    }
    public function ignoredProfile()
    {
        return $this->hasMany(IgnoredProfile::class);
    }

    public function ignoredBy()
    {
        return $this->hasMany(IgnoredProfile::class, 'ignored_id');
    }

    public function interests()
    {
        return $this->hasMany(UserInterest::class);
    }

    public function interestRequests()
    {
        return $this->hasMany(UserInterest::class, 'interesting_id');
    }

    public function contacts()
    {
        return $this->hasMany(ContactView::class);
    }

    public function senderConversation()
    {
        return $this->hasMany(Conversation::class, 'sender_id');
    }

    public function receiverConversation()
    {
        return $this->hasMany(Conversation::class, 'receiver_id');
    }

    public function conversations()
    {
        return $this->senderConversation->merge($this->receiverConversation);
    }

    public function comments()
    {
        return $this->hasMany(\App\Models\Comment::class, 'user_id');
    }

    public function fullname(): Attribute
    {
        return new Attribute(
            get: fn () => $this->firstname . ' ' . $this->lastname,
        );
    }

    // SCOPES
    public function scopeActive($query)
    {
        $query->where('status', Status::USER_ACTIVE)->where('ev', Status::VERIFIED)->where('sv', Status::VERIFIED);
    }

    public function scopeBanned($query)
    {
        $query->where('status', Status::USER_BAN);
    }

    public function scopeEmailUnverified($query)
    {
        $query->where('ev', Status::UNVERIFIED);
    }

    public function scopeMobileUnverified($query)
    {
        $query->where('sv', Status::UNVERIFIED);
    }

    public function scopeKycUnverified($query)
    {
        $query->where('kv', Status::KYC_UNVERIFIED);
    }

    public function scopeKycPending($query)
    {
        $query->where('kv', Status::KYC_PENDING);
    }

    public function scopeEmailVerified($query)
    {
        $query->where('ev', Status::VERIFIED);
    }

    public function scopeMobileVerified($query)
    {
        $query->where('sv', Status::VERIFIED);
    }

    public function scopeWithBalance($query)
    {
        $query->where('balance', '>', 0);
    }
}
