@extends($activeTemplate . 'layouts.master')
@section('content')
    <div class="row">
        <div class="col-12">
            <!--Basic information-->
            @include($activeTemplate . 'user.profile_setting.basic')
        </div>

        <div class="col-12 mt-4">
            <!--Partner Expectation-->
            @include($activeTemplate . 'user.profile_setting.partner_expectation')
        </div>
        <div class="col-12 mt-4">
            <!--Physical attributes-->
            @include($activeTemplate . 'user.profile_setting.physical_attributes')
        </div>

        <div class="col-12 mt-4">
            <!--Family Info-->
            @include($activeTemplate . 'user.profile_setting.family')
        </div>

        <div class="col-12 mt-4">
            <!--Career Info-->
            @include($activeTemplate . 'user.profile_setting.career')
        </div>

        <div class="col-12 mt-4">
            <!--Education Info-->
            @include($activeTemplate . 'user.profile_setting.education')
        </div>
    </div>
@endsection
