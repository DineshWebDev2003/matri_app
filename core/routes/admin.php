<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Here is where you can register admin routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "admin" middleware group. Now create something great!
|
*/

Route::namespace('Auth')->group(function () {

    Route::controller('LoginController')->group(function () {
        Route::get('/', 'showLoginForm')->name('login');
        Route::post('/', 'login')->name('login');
        Route::get('logout', 'logout')->name('logout');
    });

    // Admin Password Reset
    Route::controller('ForgotPasswordController')->prefix('password')->name('password.')->group(function () {
        Route::get('reset', 'showLinkRequestForm')->name('reset');
        Route::post('reset', 'sendResetCodeEmail');
        Route::get('code-verify', 'codeVerify')->name('code.verify');
        Route::post('verify-code', 'verifyCode')->name('verify.code');
    });

    Route::controller('ResetPasswordController')->group(function () {
        Route::get('password/reset/{token}', 'showResetForm')->name('password.reset.form');
        Route::post('password/reset/change', 'reset')->name('password.change');
    });
});

Route::middleware(['admin'])->group(function () {
    Route::controller('AdminController')->group(function () {
        Route::get('dashboard', 'dashboard')->name('dashboard');
        Route::get('profile', 'profile')->name('profile');
        Route::post('profile', 'profileUpdate')->name('profile.update');
        Route::get('password', 'password')->name('password');
        Route::post('password', 'passwordUpdate')->name('password.update');
        Route::post('quick-cache-clear', 'quickCacheClear')->name('quick-cache-clear');

        //Notification
        Route::get('notifications', 'notifications')->name('notifications');
        Route::get('notification/read/{id}', 'notificationRead')->name('notification.read');
        Route::get('notifications/read-all', 'readAll')->name('notifications.readAll');

        //Report Bugs
        Route::get('request-report', 'requestReport')->name('request.report');
        Route::post('request-report', 'reportSubmit');

        Route::get('download-attachments/{file_hash}', 'downloadAttachment')->name('download.attachment');
    });

    //package
    Route::controller('PackageController')->prefix('package')->name('package.')->group(function () {
        Route::get('/', 'index')->name('all');
        Route::post('save/{id?}', 'save')->name('save');
        Route::post('status/{id}', 'updateStatus')->name('update.status');
    });

    // Religion
    Route::controller('ReligionController')->prefix('religion')->name('religion.')->group(function () {
        Route::get('/', 'index')->name('all');
        Route::post('save/{id?}', 'save')->name('save');
        Route::post('delete/{id?}', 'delete')->name('delete');
    });

    // Caste
    Route::controller('CasteController')->prefix('caste')->name('caste.')->group(function () {
        Route::get('/', 'index')->name('all');
        Route::post('save/{id?}', 'save')->name('save');
        Route::post('delete/{id?}', 'delete')->name('delete');
    });
    // --- end caste ---

    // Blood Group
    Route::controller('BloodGroupController')->prefix('blood-group')->name('blood.group.')->group(function () {
        Route::get('/', 'index')->name('all');
        Route::post('save/{id?}', 'save')->name('save');
        Route::post('delete/{id?}', 'delete')->name('delete');
    });

    // Profession
    Route::controller('ProfessionController')->prefix('profession')->name('profession.')->group(function () {
        Route::get('/', 'index')->name('all');
        Route::post('save/{id?}', 'save')->name('save');
        Route::post('delete/{id?}', 'delete')->name('delete');
    });

    // Marital Status
    Route::controller('MaritalStatusController')->prefix('marital-status')->name('marital.status.')->group(function () {
        Route::get('/', 'index')->name('all');
        Route::post('save/{id?}', 'save')->name('save');
        Route::post('delete/{id?}', 'delete')->name('delete');
    });

    // Roles & Permissions
    Route::controller('RoleController')->prefix('roles')->name('roles.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('create', 'create')->name('create');
        Route::post('store', 'store')->name('store');
        Route::get('edit/{id}', 'edit')->name('edit');
        Route::post('update/{id}', 'update')->name('update');
        Route::post('delete/{id}', 'delete')->name('delete');
    });

    // Staff Accounts
    Route::controller('StaffController')->prefix('staff')->name('staff.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('create', 'create')->name('create');
        Route::post('store', 'store')->name('store');
        Route::get('edit/{id}', 'edit')->name('edit');
        Route::post('update/{id}', 'update')->name('update');
        Route::post('delete/{id}', 'delete')->name('delete');
    });

    // Users Manager
    Route::controller('ManageUsersController')->name('users.')->prefix('users')->group(function () {
        Route::get('/', 'allUsers')->name('index'); // new alias for admin.users.index
        Route::get('/', 'allUsers')->name('all');
        Route::get('active', 'activeUsers')->name('active');
        Route::get('banned', 'bannedUsers')->name('banned');
        Route::get('email-verified', 'emailVerifiedUsers')->name('email.verified');
        Route::get('email-unverified', 'emailUnverifiedUsers')->name('email.unverified');
        Route::get('mobile-unverified', 'mobileUnverifiedUsers')->name('mobile.unverified');
        Route::get('kyc-unverified', 'kycUnverifiedUsers')->name('kyc.unverified');
        Route::get('kyc-pending', 'kycPendingUsers')->name('kyc.pending');
        Route::get('mobile-verified', 'mobileVerifiedUsers')->name('mobile.verified');

        Route::get('detail/{id}', 'detail')->name('detail');
        Route::get('reports/{id}', 'report')->name('report');
        Route::get('kyc-data/{id}', 'kycDetails')->name('kyc.details');
        Route::post('kyc-approve/{id}', 'kycApprove')->name('kyc.approve')->middleware('role:Super Admin,admin');
        Route::post('kyc-reject/{id}', 'kycReject')->name('kyc.reject')->middleware('role:Super Admin,admin');
        Route::post('update/{id}', 'update')->name('update');
        Route::get('send-notification/{id}', 'showNotificationSingleForm')->name('notification.single');
        Route::post('send-notification/{id}', 'sendNotificationSingle')->name('notification.single');
        Route::get('login/{id}', 'login')->name('login');
        Route::post('status/{id}', 'status')->name('status')->middleware('role:Super Admin,admin');

        Route::get('send-notification', 'showNotificationAllForm')->name('notification.all');
        Route::post('send-notification', 'sendNotificationAll')->name('notification.all.send');
        Route::get('notification-log/{id}', 'notificationLog')->name('notification.log');
    });

    // user interactions
    Route::controller('UserInteractionController')->prefix('user')->name('user.')->group(function () {
        Route::get('interests', 'interests')->name('interests');
        Route::get('ignored-profile', 'ignoredProfile')->name('ignored.profile');
        Route::get('reports', 'reports')->name('reports');
    });

    // Deposit Gateway
    Route::name('gateway.')->prefix('gateway')->group(function () {

        // Automatic Gateway
        Route::controller('AutomaticGatewayController')->prefix('automatic')->name('automatic.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('edit/{alias}', 'edit')->name('edit');
            Route::post('update/{code}', 'update')->name('update');
            Route::post('remove/{id}', 'remove')->name('remove');
            Route::post('status/{id}', 'status')->name('status')->middleware('role:Super Admin,admin');
        });


        // Manual Methods
        Route::controller('ManualGatewayController')->prefix('manual')->name('manual.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('new', 'create')->name('create');
            Route::post('new', 'store')->name('store');
            Route::get('edit/{alias}', 'edit')->name('edit');
            Route::post('update/{id}', 'update')->name('update');
            Route::post('status/{id}', 'status')->name('status')->middleware('role:Super Admin,admin');
        });
    });


    // DEPOSIT SYSTEM
    // Deposit / Purchased Packages Approval
    Route::controller('DepositController')
        ->name('deposit.')
        ->prefix('deposit')
        ->middleware('permission:payments.list,admin')
        ->group(function () {
        Route::get('/', 'deposit')->name('list');
        Route::get('pending', 'pending')->name('pending');
        Route::get('rejected', 'rejected')->name('rejected');
        Route::get('approved', 'approved')->name('approved');
        Route::get('successful', 'successful')->name('successful');
        Route::get('initiated', 'initiated')->name('initiated');
        Route::get('details/{id}', 'details')->name('details');

        Route::post('reject', 'reject')->name('reject')->middleware('permission:payments.approve');
        Route::post('approve/{id}', 'approve')->name('approve')->middleware('permission:payments.approve');
    });

    // Report
    Route::controller('ReportController')->name('report.')->prefix('report')->group(function () {
        Route::get('login/history', 'loginHistory')->name('login.history');
        Route::get('purchase/history', 'purchaseHistory')->name('purchase.history');
        Route::get('login/ipHistory/{ip}', 'loginIpHistory')->name('login.ipHistory');
        Route::get('notification/history', 'notificationHistory')->name('notification.history');
        Route::get('email/detail/{id}', 'emailDetails')->name('email.details');
    });

    // Admin Support
    Route::controller('SupportTicketController')->prefix('ticket')->name('ticket.')->group(function () {
        Route::get('/', 'tickets')->name('index');
        Route::get('pending', 'pendingTicket')->name('pending');
        Route::get('closed', 'closedTicket')->name('closed');
        Route::get('answered', 'answeredTicket')->name('answered');
        Route::get('view/{id}', 'ticketReply')->name('view');
        Route::post('reply/{id}', 'replyTicket')->name('reply');
        Route::post('close/{id}', 'closeTicket')->name('close');
        Route::get('download/{ticket}', 'ticketDownload')->name('download');
        Route::post('delete/{id}', 'ticketDelete')->name('delete');
    });


    // Language Manager
    Route::controller('LanguageController')->prefix('language')->name('language.')->group(function () {
        Route::get('/', 'langManage')->name('manage');
        Route::post('/', 'langStore')->name('manage.store');
        Route::post('delete/{id}', 'langDelete')->name('manage.delete');
        Route::post('update/{id}', 'langUpdate')->name('manage.update');
        Route::get('edit/{id}', 'langEdit')->name('key');
        Route::post('import', 'langImport')->name('import.lang');
        Route::post('store/key/{id}', 'storeLanguageJson')->name('store.key');
        Route::post('delete/key/{id}', 'deleteLanguageJson')->name('delete.key');
        Route::post('update/key/{id}', 'updateLanguageJson')->name('update.key');
    });

    Route::controller('GeneralSettingController')->group(function () {
        // General Setting
        Route::get('general-setting', 'index')->name('setting.index');
        Route::post('general-setting', 'update')->name('setting.update');

        //configuration
        Route::get('setting/system-configuration', 'systemConfiguration')->name('setting.system.configuration');
        Route::post('setting/system-configuration', 'systemConfigurationSubmit');

        // Logo-Icon
        Route::get('setting/logo-icon', 'logoIcon')->name('setting.logo.icon');
        Route::post('setting/logo-icon', 'logoIconUpdate')->name('setting.logo.icon');

        //Custom CSS
        Route::get('custom-css', 'customCss')->name('setting.custom.css');
        Route::post('custom-css', 'customCssSubmit');

        //Cookie
        Route::get('cookie', 'cookie')->name('setting.cookie');
        Route::post('cookie', 'cookieSubmit');

        //maintenance_mode
        Route::get('maintenance-mode', 'maintenanceMode')->name('maintenance.mode');
        Route::post('maintenance-mode', 'maintenanceModeSubmit');

        //socialite credentials
        Route::get('setting/social/credentials', 'socialiteCredentials')->name('setting.socialite.credentials');
        Route::post('setting/social/credentials/update/{key}', 'updateSocialiteCredential')->name('setting.socialite.credentials.update');
        Route::post('setting/social/credentials/status/{key}', 'updateSocialiteCredentialStatus')->name('setting.socialite.credentials.status.update');
    });


    //KYC setting
    Route::controller('KycController')->group(function () {
        Route::get('kyc-setting', 'setting')->name('kyc.setting');
        Route::post('kyc-setting', 'settingUpdate');
    });

    //Notification Setting
    Route::name('setting.notification.')->controller('NotificationController')->prefix('notification')->group(function () {
        //Template Setting
        Route::get('global', 'global')->name('global');
        Route::post('global/update', 'globalUpdate')->name('global.update');
        Route::get('templates', 'templates')->name('templates');
        Route::get('template/edit/{id}', 'templateEdit')->name('template.edit');
        Route::post('template/update/{id}', 'templateUpdate')->name('template.update');

        //Email Setting
        Route::get('email/setting', 'emailSetting')->name('email');
        Route::post('email/setting', 'emailSettingUpdate');
        Route::post('email/test', 'emailTest')->name('email.test');

        //SMS Setting
        Route::get('sms/setting', 'smsSetting')->name('sms');
        Route::post('sms/setting', 'smsSettingUpdate');
        Route::post('sms/test', 'smsTest')->name('sms.test');
    });

    // Plugin
    Route::controller('ExtensionController')->prefix('extensions')->name('extensions.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('update/{id}', 'update')->name('update');
        Route::post('status/{id}', 'status')->name('status')->middleware('role:Super Admin,admin');
    });

    //System Information
    Route::controller('SystemController')->name('system.')->prefix('system')->group(function () {
        Route::get('info', 'systemInfo')->name('info');
        Route::get('server-info', 'systemServerInfo')->name('server.info');
        Route::get('optimize', 'optimize')->name('optimize');
        Route::get('optimize-clear', 'optimizeClear')->name('optimize.clear');
    });


    // SEO
    Route::get('seo', 'FrontendController@seoEdit')->name('seo');


    // Frontend
    Route::name('frontend.')->prefix('frontend')->group(function () {

        Route::controller('FrontendController')->group(function () {
            Route::get('templates', 'templates')->name('templates');
            Route::post('templates', 'templatesActive')->name('templates.active');
            Route::get('frontend-sections/{key}', 'frontendSections')->name('sections');
            Route::post('frontend-content/{key}', 'frontendContent')->name('sections.content');
            Route::get('frontend-element/{key}/{id?}', 'frontendElement')->name('sections.element');
            Route::post('remove/{id}', 'remove')->name('remove');
        });

        // Page Builder
        Route::controller('PageBuilderController')->group(function () {
            Route::get('manage-pages', 'managePages')->name('manage.pages');
            Route::post('manage-pages', 'managePagesSave')->name('manage.pages.save');
            Route::post('manage-pages/update', 'managePagesUpdate')->name('manage.pages.update');
            Route::post('manage-pages/delete/{id}', 'managePagesDelete')->name('manage.pages.delete');
            Route::get('manage-section/{id}', 'manageSection')->name('manage.section');
            Route::post('manage-section/{id}', 'manageSectionUpdate')->name('manage.section.update');
        });
    });
    // Gallery Moderation
    Route::get('/gallery-moderation/{filter?}', [\App\Http\Controllers\Admin\GalleryController::class,'moderate'])->name('gallery.moderate')->where('filter','all|approved|rejected');
    Route::post('/gallery/status/update', [\App\Http\Controllers\Admin\GalleryController::class,'updateStatus'])->name('gallery.update-status');

    // The following route group defines the admin.users.all route and related user management routes for the admin panel.
    Route::controller(\App\Http\Controllers\Admin\UserController::class)->prefix('users')->name('users.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/store', 'store')->name('store');
        Route::get('/edit/{id}', 'edit')->name('edit');
        Route::post('/update/{id}', 'update')->name('update');
        Route::post('/bulk-action', 'bulkAction')->name('bulk-action');
        Route::get('/confirm-email/{id}', 'confirmEmail')->name('confirm-email');
        Route::post('/add-comment/{id}', 'addComment')->name('add-comment');
        Route::get('/view-comments/{id}', 'viewComments')->name('view-comments');
        Route::get('/view-profile/{id}', 'viewProfile')->name('view-profile');
        Route::get('/bulk-add', 'bulkAddForm')->name('bulk-add');
        Route::post('/bulk-add/preview', 'bulkAddPreview')->name('bulk-add.preview');
        Route::post('/bulk-add', 'bulkAddStore')->name('bulk-add.store');
        Route::get('/bulk-add/sample', 'bulkAddSample')->name('bulk-add.sample');

        // Follow-up reports
        Route::get('/follow-up-reports', [\App\Http\Controllers\Admin\FollowUpController::class,'selectStaff'])->name('followup.select-staff');
        Route::get('/follow-up-reports/{staff}', [\App\Http\Controllers\Admin\FollowUpController::class,'list'])->name('followup.list');
        Route::post('/follow-up-reports/update-status', [\App\Http\Controllers\Admin\FollowUpController::class,'updateStatus'])->name('followup.update-status');

        
        Route::get('users/expired-members', [\App\Http\Controllers\Admin\UserController::class,'expiredMembers'])->name('admin.users.expired');
        Route::get('/active-to-paid', 'activeToPaid')->name('active-to-paid');
        Route::match(['get','post'],'change-plan/{id}', 'changePlan')->name('change-plan');

        

        // Approve/Reject a gallery image (photo, horoscope, id_proof)
        Route::post('/gallery/{id}/status', 'approveDocument')->name('gallery.status');

        // Delete a gallery image
        Route::post('/{user}/gallery/{gallery}/delete', 'deleteGallery')->name('gallery.delete');
        Route::get('change-membership-plan', 'changeMembershipPlan')->name('change-plan-list');
        Route::get('/expired', 'expired')->name('expired');
                Route::post('send-confirmation-email/{id}', 'sendConfirmationEmail')->name('send-confirmation-email');
    });
});
