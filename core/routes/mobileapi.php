<?php

use App\Models\GeneralSetting;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Mobile API Routes
|--------------------------------------------------------------------------
|
| Replicates all existing API endpoints for the mobile application under
| the MobileApi controller namespace. These routes will be registered at
| the URI prefix /api/mobile (see RouteServiceProvider).
|
*/

Route::namespace('MobileApi')->name('mobile_api.')->group(function () {

    Route::get('general-setting', function () {
        $general = GeneralSetting::first();
        $notify[] = 'General setting data';
        return response()->json([
            'remark' => 'general_setting',
            'status' => 'success',
            'message' => ['success' => $notify],
            'data' => [
                'general_setting' => $general,
            ],
        ]);
    });



    // Auth routes
    Route::namespace('Auth')->prefix('auth')->group(function () {
        Route::post('login', 'LoginController@login');
        Route::post('register', 'RegisterController@register');

        Route::controller('ForgotPasswordController')->group(function () {
            Route::post('password/email', 'sendResetCodeEmail')->name('password.email');
            Route::post('password/verify-code', 'verifyCode')->name('password.verify.code');
            Route::post('password/reset', 'reset')->name('password.update');
        });
    });

    // Dropdown options (religions, castes etc)
    Route::get('options', function () {
        $religions = \App\Models\ReligionInfo::select('id','name')->orderBy('name')->get();
        return response()->json([
            'remark' => 'dropdown_options',
            'status' => 'success',
            'data'   => [
                'religions' => $religions,
            ]
        ]);
    });

    // Castes by religion
    Route::get('castes/{id}', function ($id) {
        $castes = \App\Models\CasteInfo::where('religion_id', $id)->select('id','name')->orderBy('name')->get();
        return response()->json([
            'remark' => 'castes_list',
            'status' => 'success',
            'data'   => [
                'castes' => $castes,
            ]
        ]);
    });

    // Country list
    Route::get('get-countries', function () {
        $c = json_decode(file_get_contents(resource_path('views/partials/country.json')));
        $notify[] = 'General setting data';
        foreach ($c as $k => $country) {
            $countries[] = [
                'country' => $country->country,
                'dial_code' => $country->dial_code,
                'country_code' => $k,
            ];
        }
        return response()->json([
            'remark' => 'country_data',
            'status' => 'success',
            'message' => ['success' => $notify],
            'data' => [
                'countries' => $countries,
            ],
        ]);
    });

    // Sanctum-protected routes
    Route::middleware('auth:sanctum')->group(function () {

        // Support Ticket API Routes
        Route::controller('TicketController')->prefix('support-tickets')->group(function () {
            Route::get('/', 'index');      // List tickets
            Route::post('/', 'store');     // Create ticket
            Route::get('{id}', 'show');    // Ticket detail
        });

        // Authorization
        Route::controller('AuthorizationControllerApi')->group(function () {
            Route::get('authorization', 'authorization')->name('authorization');
            Route::get('resend-verify/{type}', 'sendVerifyCode')->name('send.verify.code');
            Route::post('verify-email', 'emailVerification')->name('verify.email');
            Route::post('verify-mobile', 'mobileVerification')->name('verify.mobile');
            Route::post('verify-g2fa', 'g2faVerification')->name('go2fa.verify');
        });

        Route::middleware(['check.status'])->group(function () {
            // Registration Process Routes (Step-by-step)
            Route::controller('RegistrationProcessController')->group(function () {
                // Step 1: Basic Info
                Route::post('profile/basic-info', 'submitBasicInfo');
                Route::post('profile/basic-info/skip', 'skipBasicInfo');
                
                // Step 2: Physical Attributes
                Route::post('profile/physical-attributes', 'submitPhysicalInfo');
                Route::post('profile/physical-attributes/skip', 'skipPhysicalInfo');
                
                // Step 3: Family Info
                Route::post('profile/family-info', 'submitFamilyInfo');
                Route::post('profile/family-info/skip', 'skipFamilyInfo');
                
                // Step 4: Partner Expectation
                Route::post('profile/partner-expectation', 'submitPartnerExpectation');
                Route::post('profile/partner-expectation/skip', 'skipPartnerExpectation');
                
                // Step 5: Career Info
                Route::post('profile/career-info', 'submitCareerInfo');
                Route::post('profile/career-info/skip', 'skipCareerInfo');
                
                // Step 6: Education Info
                Route::post('profile/education-info', 'submitEducationInfo');
                Route::post('profile/education-info/skip', 'skipEducationInfo');
            });

            Route::post('user-data-submit', 'UserControllerApi@userDataSubmit')->name('data.submit');
            
            // Profile routes available even if profile is NOT complete
            Route::controller('UserControllerApi')->group(function () {
                Route::get('user/details', 'getProfileDetails')->name('user.details');
                // Route::post('user/update', 'updateProfileDetails')->name('user.update'); // Deprecated
                
                // New Profile Update Endpoints
                Route::post('user/update/basic-info', 'updateBasicInfo');
                Route::post('user/update/residence-info', 'updateResidenceInfo');
                Route::post('user/update/physical-info', 'updatePhysicalInfo');
                Route::post('user/update/family-info', 'updateFamilyInfo');
                Route::post('user/update/education-info', 'updateEducationInfo');
                Route::post('user/update/career-info', 'updateCareerInfo');
                Route::post('user/update/partner-preference', 'updatePartnerPreference');
            });
            
            // Recommended & New Matches (Accessible early)
            Route::get('recommended-matches', 'RecommendedControllerApi@index')->name('matches.recommended');
            Route::get('new-matches', 'NewestControllerApi@index')->name('matches.new');

            Route::middleware('registration.complete')->group(function () {
                Route::get('dashboard', function () {
                    // identical implementation as in api.php
                    try {
                        $user = auth()->user();
                        $userLimitation = \DB::table('user_limitations')->where('user_id', $user->id)->first();
                        $remainingContactView = $userLimitation->contact_view_limit ?? 0;
                        $remainingInterests = $userLimitation->interest_express_limit ?? 0;
                        $remainingImageUpload = $userLimitation->image_upload_limit ?? 0;
                        $interestReceived = \DB::table('express_interests')->where('user_id', $user->id)->count();
                        $interestSent = \DB::table('express_interests')->where('interested_by', $user->id)->count();
                        $galleryCount = \DB::table('galleries')->where('user_id', $user->id)->count();
                        try {
                            $shortlisted = \DB::table('shortlists')->where('user_id', $user->id)->count();
                        } catch (\Exception $e) {
                            $shortlisted = 0;
                        }
                        $userData = $user->toArray();
                        $userData['remaining_contact_view'] = $remainingContactView;
                        $userData['remaining_interests'] = $remainingInterests;
                        $userData['remaining_image_upload'] = $remainingImageUpload;
                        $userData['interest_received'] = $interestReceived;
                        $userData['interest_sent'] = $interestSent;
                        $userData['shortlisted'] = $shortlisted;
                        $userData['gallery_count'] = $galleryCount;
                        if ($userLimitation) {
                            $package = \DB::table('packages')->where('id', $userLimitation->package_id)->first();
                            $userData['package_name'] = $package->name ?? 'FREE MATCH';
                            $userData['package_id'] = $userLimitation->package_id;
                            $userData['expire_date'] = $userLimitation->expire_date;
                        } else {
                            $userData['package_name'] = 'FREE MATCH';
                            $userData['package_id'] = 4;
                            $userData['expire_date'] = null;
                        }
                        return response()->json([
                            'status' => 'success',
                            'data' => $userData
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Dashboard API error: ' . $e->getMessage());
                        return response()->json([
                            'status' => 'error',
                            'message' => ['error' => ['Dashboard data unavailable']]
                        ], 500);
                    }
                });

                // other routes identical to api.php
                Route::get('user-info', function () {
                    $notify[] = 'User information';
                    return response()->json([
                        'remark' => 'user_info',
                        'status' => 'success',
                        'message' => ['success' => $notify],
                        'data' => [
                            'user' => auth()->user()
                        ]
                    ]);
                });

                Route::controller('UserControllerApi')->group(function () {
                    Route::get('kyc-form', 'kycForm')->name('kyc.form');
                    Route::post('kyc-submit', 'kycSubmit')->name('kyc.submit');
                    Route::any('deposit/history', 'depositHistory')->name('deposit.history');
                });

                // Profile settings routes
                Route::controller('ProfileControllerApi')->group(function () {
                    // Get all profile data
                    Route::get('profile-settings', 'getProfileSettings');
                    
                    // Update profile sections
                    Route::post('profile-settings/basic', 'updateBasicInfo');
                    Route::post('profile-settings/physical-attributes', 'updatePhysicalAttributes');
                    Route::post('profile-settings/family-info', 'updateFamilyInfo');
                    Route::post('profile-settings/partner-expectation', 'updatePartnerExpectation');
                    
                    // Photos
                    Route::post('profile-settings/photo', 'updateProfilePhoto');
                    
                    // Career & Education (CRUD operations)
                    Route::apiResource('profile-settings/careers', 'CareerController');
                    Route::apiResource('profile-settings/educations', 'EducationController');
                });
                
                // Change password
                Route::post('change-password', 'UserControllerApi@submitPassword');

// -------------------------------------------------------------------------
// Locations
// -------------------------------------------------------------------------
Route::get('locations/states', '\\App\\Http\\Controllers\\LocationController@states');

                // Profile settings routes using existing web controller
                Route::controller('ProfileControllerApi')->group(function () {
                    Route::get('profile-settings', 'getProfileSettings');
                    Route::post('profile-settings/basic', 'updateProfile');
                    Route::post('profile-settings/partner-expectation', 'updatePartnerExpectation');
                    Route::post('profile-settings/physical-attributes', 'updatePhysicalAttributes');
                    Route::post('profile-settings/family-info', 'updateFamilyInfo');
                    Route::post('profile-settings/career', 'updateCareerInfo');
                    Route::post('profile-settings/education', 'updateEducationInfo');
                    Route::post('profile-settings/photo', 'updateProfileImage');
                });

                // Member/Profile endpoints for mobile app
                Route::controller('UserControllerApi')->group(function () {
                    Route::get('members', 'getMembers')->name('members.list');
                    Route::get('members/{id}', 'getMember')->whereNumber('id')->name('members.show');
                    Route::get('members/search', [\App\Http\Controllers\MobileApi\SearchControllerApi::class,'search'])->name('members.search');
                    Route::post('view-contact/{id}', 'viewContact')->name('members.view-contact');
                    // Alias used by mobile app to unlock contact
                    Route::post('contact/unlock', 'ContactControllerApi@unlock')->name('alias.contact.unlock');
                    Route::post('express-interest/{id}', 'expressInterest')->name('members.express-interest');
                    Route::delete('remove-interest/{id}', 'removeInterest')->name('members.remove-interest');
                    Route::get('interested-profiles', 'getInterestedProfiles')->name('members.interested');
                    Route::get('interest-requests', 'getInterestRequests')->name('members.interest-requests');
                    
                });

                // Interest Controller overrides
                Route::controller('InterestControllerApi')->group(function () {
                    Route::post('express-interest', 'expressInterest')->name('interest.express');
                    Route::delete('express-interest/{userId}', 'removeInterest')->name('interest.remove');
                    Route::get('my-interests', 'getInterestedProfiles')->name('interest.profiles');
                    Route::get('interest-requests', 'getInterestRequests')->name('interest.requests');
                    Route::get('interest-status/{userId}', 'checkInterestStatus')->name('interest.status');
                    Route::controller('ShortListedProfileController')->group(function () {
                        Route::post('add-to-short-list', 'add')->name('shortlist.add');
                        Route::post('remove-from-short-list', 'remove')->name('shortlist.remove');
                    });
                    Route::get('shortlisted-hearts', 'shortlistedHearts')->name('alias.shortlisted.hearts');
                });

                // Alias routes
                Route::get('new-members', 'NewMemberControllerApi@index')->name('alias.new.members');
                Route::get('new-members/{id}', 'NewMemberControllerApi@show')->whereNumber('id')->name('alias.new.members.show');
                Route::get('hearted-profiles', 'InterestControllerApi@getInterestedProfiles')->name('alias.hearted.profiles');
                Route::get('heart-requests', 'InterestControllerApi@getInterestRequests')->name('alias.heart.requests');
                Route::get('ignored-hearts', 'IgnoredProfileControllerApi@getIgnoredProfiles')->name('alias.ignored.hearts');
                Route::get('package-info', 'PackageControllerApi@packageInfo')->name('alias.package.info');
                Route::get('all-plans', 'PlanControllerApi@allPlans')->name('alias.all.plans');
                Route::get('partner-options', 'PartnerOptionsController@options')->name('alias.partner.options');
                
                // User Plan/Package endpoints
                Route::controller('UserControllerApi')->group(function () {
                    Route::get('user-plan', 'getUserPlan')->name('user.plan');
                    Route::get('user-info', 'getUserInfo')->name('user.info');
                    Route::post('upload-profile-image', 'uploadProfileImage')->name('user.upload.profile');
                    Route::post('upload-gallery-image', 'uploadGalleryImage')->name('user.upload.gallery');
                    Route::get('gallery-images', 'getGalleryImages')->name('user.gallery');
                    Route::get('view-contact/{userId}', 'viewContact')->name('user.view.contact');
                });

                // Messaging API endpoints
                Route::controller('MessageControllerApi')->group(function () {
                    Route::get('conversations', 'getConversations')->name('api.conversations');
                    Route::get('conversations/{conversationId}/messages', 'getMessages')->name('api.messages');
                    Route::post('conversations/{conversationId}/messages', 'sendMessage')->name('api.send.message');
                    Route::post('conversations', 'createConversation')->name('api.create.conversation');
                    Route::post('conversations/{conversationId}/call', 'initiateCall')->name('api.initiate.call');
                    Route::post('conversations/{conversationId}/video-call', 'initiateVideoCall')->name('api.initiate.video.call');
                    Route::put('messages/{messageId}/read', 'markAsRead')->name('api.mark.read');
                });

                // Payment
                Route::controller('PaymentControllerApi')->group(function () {
                    // Mobile Razorpay
                    Route::post('razorpay/order', 'createOrder');
                    Route::post('razorpay/verify', 'verifyPayment');
                    Route::get('deposit/methods', 'methods')->name('deposit');
                    Route::post('deposit/insert', 'depositInsert')->name('deposit.insert');
                    Route::get('deposit/confirm', 'depositConfirm')->name('deposit.confirm');
                    Route::get('deposit/manual', 'manualDepositConfirm')->name('deposit.manual.confirm');
                    Route::post('deposit/manual', 'manualDepositUpdate')->name('deposit.manual.update');
                });
            });
        });

        Route::get('logout', 'Auth\\LoginController@logout');
    });
});
