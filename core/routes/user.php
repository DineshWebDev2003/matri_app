<?php

use Illuminate\Support\Facades\Route;

Route::namespace('User\Auth')->name('user.')->group(function () {

    Route::controller('LoginController')->group(function () {
        Route::get('/login', 'showLoginForm')->name('login');
        Route::post('/login', 'login');
        Route::get('logout', 'logout')->name('logout');
    });

    Route::controller('RegisterController')->group(function () {
        Route::get('register', 'showRegistrationForm')->name('register');
        Route::post('register', 'register')->middleware('registration.status');
        Route::post('check-mail', 'checkUser')->name('checkUser');
    });

    Route::controller('SocialiteController')->group(function () {
        Route::get('social-login/{provider}', 'socialLogin')->name('social.login');
        Route::get('social-login/callback/{provider}', 'callback')->name('social.login.callback');
    });

    Route::controller('ForgotPasswordController')->prefix('password')->name('password.')->group(function () {
        Route::get('reset', 'showLinkRequestForm')->name('request');
        Route::post('email', 'sendResetCodeEmail')->name('email');
        Route::get('code-verify', 'codeVerify')->name('code.verify');
        Route::post('verify-code', 'verifyCode')->name('verify.code');
    });
    Route::controller('ResetPasswordController')->group(function () {
        Route::post('password/reset', 'reset')->name('password.update');
        Route::get('password/reset/{token}', 'showResetForm')->name('password.reset');
    });
});

Route::middleware('auth')->name('user.')->group(function () {
    //authorization
    Route::namespace('User')->controller('AuthorizationController')->group(function () {
        Route::get('authorization', 'authorizeForm')->name('authorization');
        Route::get('resend-verify/{type}', 'sendVerifyCode')->name('send.verify.code');
        Route::post('verify-email', 'emailVerification')->name('verify.email');
        Route::post('verify-mobile', 'mobileVerification')->name('verify.mobile');
        Route::post('verify-g2fa', 'g2faVerification')->name('go2fa.verify');
    });

    Route::namespace('User')->controller('UserController')->group(function () {
        Route::get('information', 'information')->name('information');
        Route::post('information/store', 'storeInformation')->name('information.store');
    });

    Route::middleware(['check.status', 'lastActivity'])->group(function () {

        // Dashboard accessible regardless of profile completion
        Route::get('dashboard', [\App\Http\Controllers\User\UserController::class, 'home'])->name('home');

        // Registration wizard routes
        Route::get('user-data', 'User\RegistrationProcessController@userData')->name('data');
        Route::post('user-data-submit/{step?}', 'User\RegistrationProcessController@userDataSubmit')->name('data.submit');

        Route::middleware('registration.complete')->namespace('User')->group(function () {

            Route::controller('UserController')->group(function () {

                //KYC
                Route::get('kyc-form', 'kycForm')->name('kyc.form');
                Route::get('kyc-data', 'kycData')->name('kyc.data');
                Route::post('kyc-submit', 'kycSubmit')->name('kyc.submit');

                //Report
                Route::any('purchase/history', 'purchaseHistory')->name('purchase.history');

                Route::get('attachment-download/{fil_hash}', 'attachmentDownload')->name('attachment.download');
            });

            //Search Member
            Route::controller('MemberController')->prefix('members')->name('member')->group(function () {
                Route::get('member-profile/{id}', 'profile')->name('.profile.public');
            });

            //Actions
            Route::controller('ActionController')->group(function () {
                Route::post('report', 'report')->name('report');
                Route::post('ignore/{id}', 'ignore')->name('ignore');
                Route::get('interest-limit', 'interestLimit')->name('interest.limit');
                Route::get('contact-limit', 'contactLimit')->name('contact.limit');
                Route::post('add-to-short-list', 'addToShortList')->name('add.short.list');
                Route::post('express-interest', 'expressInterest')->name('express.interest');
                Route::post('view-contact', 'viewContact')->name('contact.view')->middleware('kyc');
                Route::post('remove-from-short-list', 'removeFromShortList')->name('remove.short.list');
            });

            //Profile setting
            Route::controller('ProfileController')->group(function () {
                Route::get('profile-setting', 'profile')->name('profile.setting');
                Route::post('profile-setting', 'updateProfile');
                Route::post('profile/picture/update', 'updateProfileImage')->name('profile.picture.update');
                Route::post('profile-setting/career/update/{id?}', 'updateCareerInfo')->name('career.update');
                Route::post('profile-setting/career/delete/{id}', 'deleteCareerInfo')->name('career.delete');
                Route::post('profile-setting/education/update/{id?}', 'updateEducationInfo')->name('education.update');
                Route::post('profile-setting/education/delete/{id}', 'deleteEducationInfo')->name('education.delete');
                Route::get('change-password', 'changePassword')->name('change.password');
                Route::post('change-password', 'submitPassword');
            });

            //Gallery
            Route::controller('GalleryController')->group(function () {
                Route::get('gallery', 'index')->name('gallery');
                Route::post('gallery', 'upload');
                Route::post('gallery/delete', 'delete')->name('gallery.delete');
                Route::post('gallery/unpublished/delete', 'deleteUnpublishedImages')->name('gallery.unpublished.delete');
            });

            //Short listed profile
            Route::controller('ShortListedProfileController')->prefix('shortlists')->name('shortlist')->group(function () {
                Route::get('', 'index');
                Route::post('remove/{id}', 'remove')->name('.remove');
            });

            //Ignored profile
            Route::controller('IgnoredProfileController')->prefix('ignored-list')->name('ignored')->group(function () {
                Route::get('', 'index')->name('.list');
                Route::post('remove/{id}', 'remove')->name('.remove');
            });

            //interest
            Route::controller('InterestController')->prefix('interest')->name('interest')->group(function () {
                Route::get('all', 'interestList')->name('.list');
                Route::get('request', 'interestRequests')->name('.requests');
                Route::get('accept-interest/{id}', 'acceptInterest')->name('.accept');
                Route::post('remove/{id}', 'remove')->name('.remove');
            });

            //Message
            Route::controller('MessageController')->prefix('message')->name('message.')->group(function () {
                Route::get('inbox/{id?}', 'index')->name('index');
                Route::post('store', 'messageStore')->name('store');

                Route::get('load', 'loadMessage')->name('load');
                Route::get('member/search', 'memberSearch')->name('member.list');
                Route::get('member/append', 'appendMember')->name('member.append');
            });
        });

        // Payment
        Route::middleware('registration.complete')->prefix('payment')->name('payment.')->controller('Gateway\PaymentController')->group(function () {
            Route::post('purchase/package/{id?}', 'purchase')->name('purchase.package');
            Route::get('confirm', 'depositConfirm')->name('confirm');
            Route::get('manual', 'manualDepositConfirm')->name('manual.confirm');
            Route::post('manual', 'manualDepositUpdate')->name('manual.update');
        });
    });
});
