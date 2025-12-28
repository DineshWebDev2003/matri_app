<?php

namespace App\View\Components;

use App\Models\User;
use Illuminate\View\Component;

class InterestExpressModal extends Component
{
    public function __construct()
    {

    }

    public function render()
    {
        $user = User::with('limitation')->where('id', auth()->id())->first();
        return view('components.interest-express-modal', compact('user'));
    }
}
