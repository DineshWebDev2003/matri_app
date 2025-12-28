<?php

namespace App\Http\Controllers;

use App\Models\State;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function states()
    {
        return response()->json(State::orderBy('name')->pluck('name', 'id'));
    }

    public function cities($stateId)
    {
        $state = State::findOrFail($stateId);
        return response()->json($state->cities()->orderBy('name')->pluck('name')->values());
    }
}
