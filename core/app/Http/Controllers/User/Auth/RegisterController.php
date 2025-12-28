<?php

namespace App\Http\Controllers\User\Auth;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\Package;
use App\Models\User;
use App\Models\BasicInfo;
use App\Models\ReligionInfo;
use Illuminate\Support\Facades\Schema;
use App\Models\UserLimitation;
use App\Models\UserLogin;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->middleware('guest');
        $this->middleware('registration.status')->except('registrationNotAllowed');
    }

    public function showRegistrationForm()
    {
        $pageTitle = "Register";
        $religions = ReligionInfo::orderBy('name')->get();
        return view($this->activeTemplate . 'user.auth.register', compact('pageTitle','religions'));
    }


    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        $general = gs();
        // Accept any password with minimum length 6 (no leak or complexity checks)
        $passwordValidation = Password::min(6);
        $agree = 'nullable';
        if ($general->agree) {
            $agree = 'required';
        }
        $countryData = (array)json_decode(file_get_contents(resource_path('views/partials/country.json')));
        $countryCodes = implode(',', array_keys($countryData));
        $mobileCodes = implode(',', array_column($countryData, 'dial_code'));
        $countries = implode(',', array_column($countryData, 'country'));
        $validate = Validator::make($data, [
            'looking_for'  => 'required|integer|in:1,2',
            'email'        => 'required|string|email|unique:users',
            'mobile'       => 'required|regex:/^([0-9]*)$/',
            'password'     => ['required', $passwordValidation],
            
            'firstname'     => 'required|string|max:40',
            'lastname'     => 'required|string|max:40',
            'birth_date'  => 'required|date|before:today',
            'religion'    => 'required|exists:religion_infos,id',
            'caste'       => ['required', Rule::exists('caste_infos', 'name')->where(fn($q) => $q->where('religion_id', $data['religion']))],
            'captcha'      => 'sometimes|required',
            'mobile_code'  => 'required|in:' . $mobileCodes,
            'country_code' => 'required|in:' . $countryCodes,
            'country'      => 'required|in:' . $countries,
            'agree'        => $agree
        ]);
        return $validate;
    }

    public function register(Request $request)
    {
        $this->validator($request->all())->validate();

        $request->session()->regenerateToken();

        if ($request->username && preg_match("/[^a-z0-9_]/", trim($request->username))) {
            $notify[] = ['info', 'Username can contain only small letters, numbers and underscore.'];
            $notify[] = ['error', 'No special character, space or capital letters in username.'];
            return back()->withNotify($notify)->withInput($request->all());
        }

        if (!verifyCaptcha()) {
            $notify[] = ['error', 'Invalid captcha provided'];
            return back()->withNotify($notify);
        }


        $exist = User::where('mobile', $request->mobile_code . $request->mobile)->first();
        if ($exist) {
            $notify[] = ['error', 'The mobile number already exists'];
            return back()->withNotify($notify)->withInput();
        }

        event(new Registered($user = $this->create($request->all())));

        $this->guard()->login($user);

        return $this->registered($request, $user)
            ?: redirect($this->redirectPath());
    }


    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array $data
     * @return \App\User
     */
    protected function create(array $data)
    {
        $general = gs();

        //User Create
        $user               = new User();
        $user->profile_id   = getNumber(8);
        $user->looking_for  = $data['looking_for'];
        $user->email        = strtolower($data['email']);
        $user->password     = Hash::make($data['password']);
        // Set default active status
        $user->status = \App\Constants\Status::USER_UNAPPROVED;
        // Auto-generate username from email prefix
        $user->username = Str::slug(explode('@', $data['email'])[0]) . rand(1000,9999);
        $user->firstname    = $data['firstname'];
        $user->lastname     = $data['lastname'];
        $user->country_code = $data['country_code'];
        $user->mobile       = $data['mobile_code'] . $data['mobile'];
        $user->address      = [
            'address' => '',
            'state' => '',
            'zip' => '',
            'country' => isset($data['country']) ? $data['country'] : null,
            'city' => ''
        ];
        $user->kv = $general->kv ? Status::NO : Status::YES;
        $user->ev = $general->ev ? Status::NO : Status::YES;
        $user->sv = $general->sv ? Status::NO : Status::YES;
        // Set initial approval status
        $user->status = \App\Constants\Status::USER_UNAPPROVED;
        $user->save();

        // store basic info: religion and caste at signup
        try {
            $basic = new BasicInfo();
            $basic->user_id = $user->id;
            $basic->religion_id = $data['religion'];
            // also store religion name for legacy code compatibility
            if (Schema::hasColumn('basic_infos', 'religion')) {
                $basic->religion = optional(\App\Models\ReligionInfo::find($data['religion']))->name;
            }
            $basic->caste = $data['caste'];
        $basic->birth_date = $data['birth_date'];
            $basic->save();
        } catch (\Throwable $e) {
            // silently ignore if table or columns not present to avoid breaking registration
        }

        $this->userLimitation($user);

        $adminNotification = new AdminNotification();
        $adminNotification->user_id = $user->id;
        $adminNotification->title = 'New member registered';
        $adminNotification->click_url = urlPath('admin.users.detail', $user->id);
        $adminNotification->save();


        //Login Log Create
        $ip = getRealIP();
        $exist = UserLogin::where('user_ip', $ip)->first();
        $userLogin = new UserLogin();

        //Check exist or not
        if ($exist) {
            $userLogin->longitude =  $exist->longitude;
            $userLogin->latitude =  $exist->latitude;
            $userLogin->city =  $exist->city;
            $userLogin->country_code = $exist->country_code;
            $userLogin->country =  $exist->country;
        } else {
            $info = json_decode(json_encode(getIpInfo()), true);
            $userLogin->longitude =  @implode(',', $info['long']);
            $userLogin->latitude =  @implode(',', $info['lat']);
            $userLogin->city =  @implode(',', $info['city']);
            $userLogin->country_code = @implode(',', $info['code']);
            $userLogin->country =  @implode(',', $info['country']);
        }

        $userAgent = osBrowser();
        $userLogin->user_id = $user->id;
        $userLogin->user_ip =  $ip;

        $userLogin->browser = @$userAgent['browser'];
        $userLogin->os = @$userAgent['os_platform'];
        $userLogin->save();

        return $user;
    }

    public function checkUser(Request $request)
    {
        $exist['data'] = false;
        $exist['type'] = null;
        if ($request->email) {
            $exist['data'] = User::where('email', $request->email)->exists();
            $exist['type'] = 'email';
        }
        if ($request->mobile) {
            $exist['data'] = User::where('mobile', $request->mobile)->exists();
            $exist['type'] = 'mobile';
        }
        if ($request->username) {
            $exist['data'] = User::where('username', $request->username)->exists();
            $exist['type'] = 'username';
        }
        return response($exist);
    }

    protected function userLimitation($user)
    {
        $limitation = new UserLimitation();
        $general = gs();
        $package = Package::find($general->default_package_id);

        $packageId = @$package->id ?? 0;
        $validityPeriod = @$package->validity_period ?? 0;
        $expireDate = Carbon::now()->addDays($validityPeriod);

        $limitation->user_id = $user->id;
        $limitation->package_id = $packageId;
        $limitation->interest_express_limit = @$package->interest_express_limit ?? 0;
        $limitation->contact_view_limit = @$package->contact_view_limit ?? 0;
        $limitation->image_upload_limit = @$package->image_upload_limit ?? 0;
        $limitation->validity_period = $validityPeriod ?? 0;
        $limitation->expire_date = $expireDate ?? Carbon::now();
        $limitation->save();
    }

    public function registered()
    {
        return to_route('user.home');
    }
}
