<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BasicInfo extends Model
{
    protected $guarded = [];

    public function religionInfo()
    {
        return $this->belongsTo(\App\Models\ReligionInfo::class, 'religion_id');
    }

    // Normalize gender on retrieval (m/f to Male/Female)
    public function getGenderAttribute($value)
    {
        if ($value === 'm') return 'Male';
        if ($value === 'f') return 'Female';
        return $value;
    }

    protected $casts = [
        'present_address'   => 'object',
        'permanent_address' => 'object',
        // keep json cast for storage, accessor will normalise retrieval
        'language'          => 'json',
    ];

    /**
     * Always return language as an array.
     */
    public function getLanguageAttribute($value)
    {
        if (is_array($value)) {
            return $value;
        }
        if (empty($value)) {
            return [];
        }
        $decoded = null;
        // attempt json decode
        if (is_string($value)) {
            $decoded = json_decode($value, true);
        }
        return is_array($decoded) ? $decoded : [$value];
    }

    /**
     * Resolve the state name if stored as ID.
     */
    public function getStateAttribute($value)
    {
        if (!$value) return null;
        // if numeric assume id
        if (is_numeric($value)) {
            return optional(\App\Models\State::find($value))->name ?? $value;
        }
        return $value;
    }

    /**
     * Country attribute: if blank use present_address country.
     */
    public function getCountryAttribute($value)
    {
        if ($value) return $value;
        return optional($this->present_address)->country;
    }
}
