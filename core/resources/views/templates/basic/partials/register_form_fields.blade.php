@csrf
<div class="section__head text-center">
    <h2 class="login-title mt-0">{{ __($registerContent->data_values->heading) }}</h2>
    <p class="t-short-para mx-auto mb-0 text-center">
        {{ __($registerContent->data_values->subheading) }}
    </p>
</div>
<div class="row g-3">
    <div class="col-sm-12">
        <div class="input--group">
            <select class="form-select form--control form-control" id="looking_for" name="looking_for" required>
                <option value="">@lang('Select One')</option>
                <option value="1" @selected(old('looking_for') == 1)>Groom (மணமகன்)</option>
                <option value="2" @selected(old('looking_for') == 2)>Bride (மணமகள்)</option>
            </select>
            <label class="form--label" for="looking_for">@lang('Looking For')</label>
        </div>
    </div>
    <div class="col-sm-6">
        <div class="input--group">
            <input class="form-control form--control" id="firstname" name="firstname" type="text" value="{{ old('firstname') }}" autocomplete="off" placeholder="none" required>
            <label class="form--label" for="firstname">@lang('First Name')</label>
        </div>
    </div>
    <div class="col-sm-6">
        <div class="input--group">
            <input class="form-control form--control" id="lastname" name="lastname" type="text" value="{{ old('lastname') }}" autocomplete="off" placeholder="none" required>
            <label class="form--label" for="lastname">@lang('Last Name')</label>
        </div>
    </div>
    <div class="col-sm-6">
        <div class="input--group">
            <input class="form-control form--control checkUser" id="email" name="email" type="email" value="{{ old('email') }}" placeholder="none" required>
            <label class="form--label" for="email">@lang('E-Mail Address')</label>
        </div>
    </div>

    <input type="hidden" name="country" value="India">
    <input type="hidden" name="country_code" value="IN">
    <input type="hidden" name="mobile_code" value="91">

    <div class="col-sm-6 mt-4">
        <div class="input--group">
            <div class="input-group country-code">
                <span class="input-group-text mobile-code">+91</span>
                <input name="mobile_code" type="hidden" value="91">
                <input name="country_code" type="hidden" value="IN">
                <input class="form-control form--control checkUser" id="mobile" name="mobile" type="number" value="{{ old('mobile') }}" placeholder="none" required>
            </div>
            <small class="text-danger mobileExist"></small>
        </div>
    </div>

    <!-- Date of Birth -->
    <div class="col-sm-6 mt-4">
        <div class="input--group position-relative">
            <input class="form-control form--control" id="birth_date" name="birth_date" type="date" value="{{ old('birth_date') }}" required>
            <label class="form--label" for="birth_date">@lang('Date of Birth')</label>
        </div>
    </div>

    <div class="col-sm-6 mt-4">
        <div class="input--group position-relative">
            <input class="form-control form--control" id="password" name="password" type="password" placeholder="none" required autocomplete="new-password">
            <label class="form--label" for="password">@lang('Password')</label>
            <span class="position-absolute top-50 end-0 translate-middle-y pe-3" style="cursor: pointer; z-index: 10;">
                <i class="fas fa-eye toggle-password" data-target="password" style="color: #6c757d; transition: color 0.3s ease;"></i>
            </span>
            @if ($general->secure_password)
                <div class="input-popup">
                    <p class="error lower">@lang('1 small letter minimum')</p>
                    <p class="error capital">@lang('1 capital letter minimum')</p>
                    <p class="error number">@lang('1 number minimum')</p>
                    <p class="error special">@lang('1 special character minimum')</p>
                    <p class="error minimum">@lang('6 character password')</p>
                </div>
            @endif
        </div>
    </div>

    <!-- Religion -->
    <div class="col-sm-6 mt-4">
        <div class="input--group">
            <select class="form-select form--control form-control" id="religion" name="religion" required>
                <option value="">@lang('Select Religion')</option>
                @foreach($religions as $rel)
                    <option value="{{ $rel->id }}" @selected(old('religion') == $rel->id)>{{ __($rel->name) }}</option>
                @endforeach
            </select>
            <label class="form--label" for="religion">@lang('Religion')</label>
        </div>
    </div>

    <!-- Caste -->
    <div class="col-sm-6 mt-4">
        <div class="input--group">
            <select class="form-select form--control form-control" id="caste" name="caste" required data-old="{{ old('caste') }}">
                <option value="">@lang('Select Caste')</option>
                @if(old('religion'))
                    @php
                        $oldCastes = \App\Models\CasteInfo::where('religion_id', old('religion'))->orderBy('name')->pluck('name');
                    @endphp
                    @foreach($oldCastes as $casteName)
                        <option value="{{ $casteName }}" @selected(old('caste') == $casteName)>{{ __($casteName) }}</option>
                    @endforeach
                @endif
            </select>
            <label class="form--label" for="caste">@lang('Caste')</label>
        </div>
    </div>

    <!-- Captcha -->
    <x-captcha />

    @if ($general->agree)
        <div class="col-sm-12 mt-4">
            <div class="input--group d-flex align-items-center justify-content-start flex-wrap text-start">
                <div class="form--check me-2">
                    <input class="form-check-input" id="agree" name="agree" type="checkbox" @checked(old('agree')) required>
                    <label class="form-check-label" for="agree">
                        @lang('I agree with ')
                    </label>
                    @foreach ($policyPages as $policy)
                        <a href="{{ route('policy.pages', [slug($policy->data_values->title), $policy->id]) }}" target="_blank">
                            {{ __($policy->data_values->title) }}
                        </a>@if (!$loop->last),@endif
                    @endforeach
                </div>
            </div>
        </div>
    @endif

    <div class="col-12">
        <button class="btn btn--md btn--base w-100" type="submit"> @lang('Register') </button>
    </div>

</div>

@push('style-lib')
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&display=swap" rel="stylesheet">
@endpush

@push('style')
    <style>
        
        .pass-toggle{position:absolute;right:10px;top:50%;transform:translateY(-50%);cursor:pointer;z-index:5;}
        .input--group.position-relative .pass-toggle i{font-size:1rem;color:#999;}
        .password-field{padding-right:2rem;}

        /* Apply Merriweather bold to form labels and input headings */
        .form--label {
            font-family: 'Merriweather', serif !important;
            font-weight: 700 !important;
        }
        ::placeholder {
            font-family: 'Merriweather', serif !important;
            font-weight: 700 !important;
        }
    </style>
@endpush

@push('script')
<script>
"use strict";
(function($){
    // Password toggle functionality
    document.addEventListener('DOMContentLoaded', function() {
        const togglePassword = document.querySelector('.toggle-password');
        
        if (togglePassword) {
            togglePassword.addEventListener('click', function(e) {
                const targetId = this.getAttribute('data-target');
                const password = document.getElementById(targetId);
                
                if (password) {
                    // Toggle the type attribute
                    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                    password.setAttribute('type', type);
                    
                    // Toggle the eye / eye slash icon
                    this.classList.toggle('fa-eye');
                    this.classList.toggle('fa-eye-slash');
                    
                    // Change the color when showing the password
                    if (type === 'text') {
                        this.style.color = '#ff6b6b';
                    } else {
                        this.style.color = '#6c757d';
                    }
                }
            });
        }
    });

    // Existing code
    $('input[name=mobile_code]').val('91');
    $('input[name=country_code]').val('IN');
    $('.mobile-code').text('+91');

    function loadCastes($form, rel, selected){
        const $caste = $form.find('select[name="caste"]');
        if(!rel){
            $caste.html(`<option value="">{{ __("Select Caste") }}</option>`);
            return;
        }
        $caste.html(`<option value="">{{ __("Loading...") }}</option>`);
        $.get('{{ url('castes') }}/'+encodeURIComponent(rel), function(data){
            let opts=`<option value="">{{ __("Select Caste") }}</option>`;
            $.each(data,function(i,n){opts+=`<option value="${n}">${n}</option>`;});
            opts+=`<option value="__other__">{{ __("Other") }}</option>`;
            $caste.html(opts);
            if(selected){ $caste.val(selected); }
        });
    }

    // Load castes when religion changes
    // Track caste selection so it persists on next reload
    $(document).on('change','select[name="caste"]',function(){
        $(this).attr('data-old', $(this).val());
    });

    $(document).on('change', 'select[name="religion"]', function(){
        const $form = $(this).closest('form');
        const rel = $(this).val();
        const selected = $form.find('select[name="caste"]').attr('data-old');
        loadCastes($form, rel, selected);
    });

    // show/hide other caste input (if banner version added extra input, banner JS can hook separately)
    $('#caste').on('change', function(){
        if($(this).val()==='__other__'){
            if(!$('#caste_other').length){$(this).after('<input type="text" id="caste_other" name="caste" class="form-control form--control mt-2" placeholder="@lang('Enter Caste')">');}
            $(this).removeAttr('name').prop('required',false);
        }else{
            $('#caste_other').remove();
            $(this).attr('name','caste').prop('required',true);
        }
    });

    // toggle password visibility
    $(document).on('click', '.pass-toggle', function(){
        const $icon=$(this).find('i');
        const $input=$(this).closest('.input--group').find('.password-field');
        if($input.attr('type')==='password'){$input.attr('type','text');$icon.removeClass('la-eye').addClass('la-eye-slash');}
        else{$input.attr('type','password');$icon.removeClass('la-eye-slash').addClass('la-eye');}
    });
    // Trigger change on page load if a religion is preselected (e.g., after validation error)
    $('select[name="religion"]').each(function(){
        const $form=$(this).closest('form');
        const rel=$(this).val();
        const selected=$form.find('select[name="caste"]').attr('data-old');
        loadCastes($form, rel, selected);
    });
})(jQuery);
</script>
@endpush
