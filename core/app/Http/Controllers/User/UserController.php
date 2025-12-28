<?php

namespace App\Http\Controllers\User;

use App\Constants\Status;
use App\Http\Controllers\Controller;
use App\Lib\FormProcessor;
use App\Models\Form;
use App\Models\PurchaseHistory;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function home()
    {
        $pageTitle = 'Dashboard';
        $user = User::where('id', auth()->id())->with(['limitation.package', 'interests' => function ($query) {
            $query->orderBy('id', 'desc')->take(10);
        }, 'interests.profile.basicInfo', 'interests.conversation', 'interestRequests' => function ($query) {
            $query->orderBy('id', 'desc')->take(10);
        }, 'interestRequests.user.basicInfo', 'interestRequests.conversation'])->withCount(['galleries as total_images', 'shortListedProfile as totalShortlisted', 'interests as interestSent', 'interestRequests as totalInterestRequests'])->first();

        return view($this->activeTemplate . 'user.dashboard', compact('pageTitle', 'user'));
    }

    public function purchaseHistory()
    {
        $pageTitle = 'Package Purchase History';
        $purchasedPackages = PurchaseHistory::where('status', '!=', Status::PAYMENT_INITIATE)->where('user_id', auth()->id())->searchable(['package:name'])->with(['deposit', 'deposit.gateway:code,name'])->orderby('id', 'desc')->paginate(getPaginate());
        return view($this->activeTemplate . 'user.purchase_history', compact('pageTitle', 'purchasedPackages'));
    }

    public function kycForm()
    {
        if (auth()->user()->kv == 2) {
            $notify[] = ['error', 'Your KYC is under review'];
            return to_route('user.home')->withNotify($notify);
        }
        if (auth()->user()->kv == 1) {
            $notify[] = ['error', 'You are already KYC verified'];
            return to_route('user.home')->withNotify($notify);
        }
        $pageTitle = 'KYC Form';
        $form = Form::where('act', 'kyc')->first();
        return view($this->activeTemplate . 'user.kyc.form', compact('pageTitle', 'form'));
    }

    public function kycData()
    {
        $user = auth()->user();
        $pageTitle = 'KYC Data';
        return view($this->activeTemplate . 'user.kyc.info', compact('pageTitle', 'user'));
    }

    public function kycSubmit(Request $request)
    {
        $form = Form::where('act', 'kyc')->first();
        $formData = $form->form_data;
        $formProcessor = new FormProcessor();
        $validationRule = $formProcessor->valueValidation($formData);
        $request->validate($validationRule);
        $userData = $formProcessor->processFormData($request, $formData);
        $user = auth()->user();
        $user->kyc_data = $userData;
        $user->kv = 2;
        $user->save();

        $notify[] = ['success', 'KYC data submitted successfully'];
        return to_route('user.home')->withNotify($notify);
    }

    public function attachmentDownload($fileHash)
    {
        $filePath = decrypt($fileHash);
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        $general = gs();
        $title = slug($general->site_name) . '- attachments.' . $extension;
        $mimetype = mime_content_type($filePath);
        header('Content-Disposition: attachment; filename="' . $title);
        header("Content-Type: " . $mimetype);
        return readfile($filePath);
    }

    public function information()
    {
        $user = auth()->user();
        $pageTitle = 'Provide Your Information';
        return view($this->activeTemplate . 'user.information', compact('pageTitle', 'user'));
    }

    public function storeInformation(Request $request)
    {
        $countryData = (array)json_decode(file_get_contents(resource_path('views/partials/country.json')));
        $countryCodes = implode(',', array_keys($countryData));
        $mobileCodes = implode(',', array_column($countryData, 'dial_code'));

        $user = auth()->user();

        $emailValidation       = 'nullable';
        $mobileValidation      = 'nullable';
        $mobileCodeValidation  = 'nullable';
        $countryCodeValidation = 'nullable';

        if (!$user->mobile) {
            $mobileValidation = 'required|regex:/^([0-9]*)$/';
            $mobileCodeValidation = 'required|in:' . $mobileCodes;
            $countryCodeValidation = 'required|in:' . $countryCodes;
        }

        if (!$user->email) {
            $emailValidation = 'required|string|email|unique:users';
        }

        $request->validate([
            'email' => $emailValidation,
            'mobile' => $mobileValidation,
            'mobile_code' => $mobileCodeValidation,
            'country_code' => $countryCodeValidation
        ]);

        if (!$user->mobile) {
            $exist = User::where('mobile', $request->mobile_code . $request->mobile)->first();
            if ($exist) {
                $notify[] = ['error', 'The mobile number already exists'];
                return back()->withNotify($notify)->withInput();
            }

            $user->country_code = $request->country_code;
            $user->mobile = $request->mobile_code . $request->mobile;
        }

        if (!$user->email) {
            $user->email = $request->email;
        }

        $user->save();

        $notify[] = ['success', 'Information save successfully'];
        return to_route('user.data')->withNotify($notify);
    }
}
