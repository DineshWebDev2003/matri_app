<?php

use Illuminate\Support\Facades\Route;

Route::get('/clear', function () {
    \Illuminate\Support\Facades\Artisan::call('optimize:clear');
});

// User Support Ticket
Route::controller('TicketController')->prefix('ticket')->name('ticket.')->group(function () {
    Route::get('/', 'supportTicket')->name('index');
    Route::get('new', 'openSupportTicket')->name('open');
    Route::post('create', 'storeSupportTicket')->name('store');
    Route::get('view/{ticket}', 'viewTicket')->name('view');
    Route::post('reply/{ticket}', 'replyTicket')->name('reply');
    Route::post('close/{ticket}', 'closeTicket')->name('close');
    Route::get('download/{ticket}', 'ticketDownload')->name('download');
});

Route::get('app/deposit/confirm/{hash}', 'Gateway\PaymentController@appDepositConfirm')->name('deposit.app.confirm');
Route::get('payment-method/data', 'Gateway\\PaymentController@paymentMethodData')->name('payment.method.data');

// Document view route for admin/user documents
Route::get('user-doc/{filename}', function ($filename) {
    $path = public_path('assets/images/user/gallery/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    return response()->file($path);
})->name('user.document');

// AJAX: get states & cities
Route::get('locations/states', [\App\Http\Controllers\LocationController::class,'states'])->name('ajax.states');
Route::get('locations/cities/{state}', [\App\Http\Controllers\LocationController::class,'cities'])->name('ajax.cities');

// AJAX: get castes by religion
Route::get('castes/{religion}', function ($religion) {
    return \App\Models\CasteInfo::where('religion_id', $religion)->orderBy('name')->pluck('name');
})->name('ajax.castes');

Route::controller('SiteController')->group(function () {

    //member search
    Route::get('members', 'members')->name('member.list');

    Route::get('/contact', 'contact')->name('contact');
    Route::post('/contact', 'contactSubmit');
    Route::get('/change/{lang?}', 'changeLanguage')->name('lang');

    Route::get('cookie-policy', 'cookiePolicy')->name('cookie.policy');

    Route::get('/cookie/accept', 'cookieAccept')->name('cookie.accept');

    Route::get('packages', 'packages')->name('packages');

    Route::get('stories', 'stories')->name('stories');
    Route::get('story/{slug}/{id}', 'storyDetails')->name('story.details');

    Route::get('policy/{slug}/{id}', 'policyPages')->name('policy.pages');

    Route::get('placeholder-image/{size}', 'placeholderImage')->name('placeholder.image');


    Route::get('/{slug}', 'pages')->name('pages');
    Route::get('/', 'index')->name('home');
});

Route::get('ipn/phonepe/{trx}',
    [\App\Http\Controllers\Gateway\Phonepe\CallbackController::class,'handle'])
    ->name('ipn.phonepe');