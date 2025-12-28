<?php

namespace App\Http\Controllers\MobileApi\Auth;

use App\Http\Controllers\Api\Auth\RegisterController as BaseRegisterController;

class RegisterController extends BaseRegisterController
{
    public function __construct()
    {
        \Log::info('📲 MobileApi RegisterController instantiated');
        parent::__construct();
    }

    /**
     * Handle a registration request from the mobile application.
     */
    public function register(\Illuminate\Http\Request $request)
    {
        \Log::info('📲 MobileApi Registration Request Payload', $request->all());
        return parent::register($request);
    }
}
