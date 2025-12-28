@php
    $user = auth()->user();
@endphp
@extends($activeTemplate . 'layouts.frontend')
@section('content')
    <div class="login section basic-info">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="login__wrapper basic-information">
                        <form class="info-form" action="{{ route('user.data.submit', 'basicInfo') }}" autocomplete="off" method="POST">
                            @csrf
                            <div class="section__head text-center">
                                <h2 class="login-title mt-0">@lang('Basic Information')</h2>
                                <p>@lang('Fill up your basic information with authenticated data, you also can skip this step by clicking skip button')</p>
                            </div>
                            <div class="row gy-4">
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <input class="datepicker-here form-control form--control" name="birth_date" data-date-format="yyyy-mm-dd" data-language="en" data-position='bottom right' data-range="false" type="text" value="{{ old('birth_date', optional($user->basicInfo)->birth_date ?? $user->birth_date) }}" autocomplete="off" required>
                                        <label class="form--label">@lang('Date Of Birth')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select id="religion" class="form-select form-control form--control" name="religion_id" required>
                                            <option value="">@lang('Select One')</option>
                                            @foreach ($religions as $religion)
                                                <option value="{{ $religion->id }}" @if(old('religion', optional($user->basicInfo)->religion_id)==$religion->id) selected @endif>
                                                    {{ __($religion->name) }}
                                                </option>
                                            @endforeach
                                        </select>
                                        <label class="form--label">@lang('Religion')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" id="caste" name="caste">
                                            <option value="">@lang('Select Caste')</option>
                                        </select>
                                        <label class="form--label">@lang('Caste')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="gender" required>
                                            <option value="">@lang('Select One')</option>
                                            <option value="m" @if (old('gender') == 'm') selected @endif>
                                                @lang('Male')</option>
                                            <option value="f" @if (old('gender') == 'f') selected @endif>
                                                @lang('Female')</option>
                                        </select>
                                        <label class="form--label">@lang('Gender')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="looking_for" required>
                                            <option value="">@lang('Looking For')</option>
                                            <option value="2" @if (old('looking_for') == '2') selected @endif>
                                                @lang('Bride') (Female)</option>
                                            <option value="1" @if (old('looking_for') == '1') selected @endif>
                                                @lang('Groom') (Male)</option>
                                        </select>
                                        <label class="form--label">@lang('Looking For')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="marital_status" required>
                                            <option value="">@lang('Select One')</option>
                                            @foreach ($maritalStatuses as $maritalStatus)
                                                <option value="{{ $maritalStatus->title }}" @if (old('marital_status') == $maritalStatus->title) selected @endif>
                                                    {{ __($maritalStatus->title) }}
                                                </option>
                                            @endforeach
                                        </select>
                                        <label class="form--label">@lang('Marital Status')</label>
                                    </div>
                                </div>

                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-control form--control select2-auto-tokenize" name="languages[]" multiple="multiple" placeholder="none">
                                            @foreach (old('languages', []) as $oldLanguage)
                                                <option value="{{ $oldLanguage }}" selected>{{ $oldLanguage }}</option>
                                            @endforeach
                                        </select>
                                        <label class="form--label">@lang('Languages')</label>
                                    </div>
                                </div>

                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select id="profession" class="form-select form-control form--control select2-auto-tokenize" name="profession">
                                                @foreach($professions ?? [] as $pro)
                                                    <option value="{{ $pro }}" @selected(old('profession')==$pro)>{{ $pro }}</option>
                                                @endforeach
                                                @if(old('profession'))
                                                    <option value="{{ old('profession') }}" selected>{{ old('profession') }}</option>
                                                @endif
                                            </select>
                                        <label class="form--label">@lang('Profession')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <input class="form-control form--control" name="financial_condition" type="text" value="{{ old('financial_condition') }}">
                                        <label class="form--label">@lang('Annual Income')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="smoking_status">
                                            <option value="">@lang('Select One')</option>
                                            <option value="1" @selected(old('smoking_status') == 1)>@lang('Smoker')</option>
                                            <option value="0" @selected(old('smoking_status') == 0)>@lang('Non-smoker')</option>
                                        </select>
                                        <label class="form--label">@lang('Smoking Habits')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="drinking_status">
                                            <option value="">@lang('Select One')</option>
                                            <option value="1" @selected(old('drinking_status') == 1)>@lang('Drunker')</option>
                                            <option value="0" @selected(old('drinking_status') == 0)>@lang('Non-drunker')</option>
                                        </select>
                                        <label class="form--label">@lang('Drinking Status')</label>
                                    </div>
                                </div>

                                <small>@lang('Present Address')</small>

                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="pre_country" @disabled(@$user->address->country)>
                                            <option value="">@lang('Select One')</option>
                                            @foreach ($countries as $country)
                                                <option value="{{ $country->country }}" @if (old('pre_country', @$user->address->country) == $country->country) selected @endif>
                                                    {{ __($country->country) }}
                                                </option>
                                            @endforeach
                                        </select>
                                        <label class="form--label">@lang('Permanent Country')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="pre_state" id="pre_state"></select>
                                        <label class="form--label">@lang('State')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <input class="form-control form--control" name="pre_zip" type="text" value="{{ old('pre_zip', @$user->address->zip) }}">
                                        <label class="form--label">@lang('Zip Code')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="pre_city" id="pre_city"></select>
                                        <label class="form--label">@lang('City')</label>
                                    </div>
                                </div>

                                <small>
                                    <div class="form--check">
                                        @lang('Permanent Address') :
                                        <input class="form-check-input" id="copyAddress" type="checkbox" checked disabled>
                                        <label class="form-check-label" for="copyAddress">
                                            @lang('Same as present address?')
                                        </label>
                                    </div>
                                </small>

                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control" name="per_country">
                                            <option value="">@lang('Select One')</option>
                                            @foreach ($countries as $country)
                                                <option value="{{ $country->country }}" @if (old('per_country') == $country->country) selected @endif>
                                                    {{ __($country->country) }}
                                                </option>
                                            @endforeach
                                        </select>
                                        <label class="form--label">@lang('Present Country')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control permanent" name="per_state" id="per_state"></select>
                                        <label class="form--label">@lang('State')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <input class="form-control form--control permanent" name="per_zip" type="text" value="{{ old('per_zip') }}">
                                        <label class="form--label">@lang('Zip Code')</label>
                                    </div>
                                </div>
                                <div class="col-sm-6">
                                    <div class="input--group">
                                        <select class="form-select form-control form--control permanent" name="per_city" id="per_city"></select>
                                        <label class="form--label">@lang('City')</label>
                                    </div>
                                </div>
                                <div class="append-form d-none"></div>
                                <div class="d-flex justify-content-end flex-wrap gap-2">
                                    <button class="btn btn-sm btn--dark skip-all" type="button"><i class="las la-hand-point-right"></i> @lang('Skip All')</button>
                                    <button class="btn btn-sm btn--warning skip-btn" type="button"><i class="las la-forward"></i> @lang('Skip')</button>
                                    <button class="btn btn-sm btn-success" name="button_value" type="submit" value="submit">@lang('Next') <i class="las la-arrow-right"></i></button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('style-lib')
    <link href="{{ asset('assets/admin/css/vendor/select2.min.css') }}" rel="stylesheet">
@endpush

@push('style')
    <style>
        /* Align Select2 single-select appearance with other inputs */
        .basic-info .select2-container--default .select2-selection--single {
            height: 45px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 10px 12px;
            display: flex;
            align-items: center;
        }
        .basic-info .select2-selection__rendered { line-height: 24px; }
        .basic-info .select2-selection__arrow { height: 100%; right: 10px; }
    </style>
@endpush

@push('script-lib')
    <script src="{{ asset('assets/admin/js/vendor/select2.min.js') }}"></script>
    <script src="{{ asset('assets/admin/js/vendor/datepicker.min.js') }}"></script>
    <script src="{{ asset('assets/admin/js/vendor/datepicker.en.js') }}"></script>
@endpush

@push('script')
    <script>
        "use strict";
        // enforce permanent address same as present address
        const copyAddress = $('#copyAddress');
        const perFields = $('[name^="per_"]').closest('.col-sm-6');
        copyAddress.prop('checked', true).prop('disabled', true);
        perFields.addClass('d-none');
        copyAddress.closest('small').addClass('d-none');
        $('.skip-btn').on('click', function() {
            $('.info-form').submit();
        });

        $('.select2-auto-tokenize').select2({
            dropdownParent: $('.basic-info'),
            tags: true,
            tokenSeparators: [',']
        });

        const preCaste = "{{ optional($user->basicInfo)->caste }}";

        $('#religion').on('change', function () {
            const rel = $(this).val();
            const $caste = $('#caste');
            if (!rel) { $caste.html('<option value="">@lang("Select Caste")</option>'); return; }
            $caste.html('<option value="">@lang("Loading...")</option>');
            $.get('{{ url('castes') }}/' + encodeURIComponent(rel), function (data) {
                let opts = '<option value="">@lang("Select Caste")</option>';
                $.each(data, function (i, name) {
                    opts += `<option value="${name}">${name}</option>`;
                });
                $caste.html(opts);
                if (preCaste) {
                    $caste.val(preCaste);
                }
            });
        });

        // trigger once on load to populate if religion already selected

// ----- Dynamic States & Cities (AJAX) -----
function populateStatesAjax(selected={}){
    $.getJSON('{{ url('locations/states') }}', function(states){
        const $preState=$('#pre_state');
        const $perState=$('#per_state');
        $preState.html('<option value="">{{ __('Select State') }}</option>');
        $perState.html('<option value="">{{ __('Select State') }}</option>');
        $.each(states,function(id,name){
           const opt1=$('<option>',{value:id,text:name});
           const opt2=opt1.clone();
           if(id==selected.pre){opt1.attr('selected',true);} 
           if(id==selected.per){opt2.attr('selected',true);} 
           $preState.append(opt1);
           $perState.append(opt2);
        });
        if(selected.pre){loadCitiesAjax($('#pre_state'));}
        if(selected.per){loadCitiesAjax($('#per_state'),true);}
    });
}
function loadCitiesAjax($stateSel,isPermanent=false){
    const stateId=$stateSel.val();
    const $citySel=isPermanent?$('#per_city'):($stateSel.attr('id')=='pre_state'?$('#pre_city'):$('#per_city'));
    if(!stateId){$citySel.html('<option value="">{{ __('Select City') }}</option>');return;}
    $.getJSON('{{ url('locations/cities') }}/'+stateId,function(cities){
        $citySel.html('<option value="">{{ __('Select City') }}</option>');
        $.each(cities,function(_,name){
            $citySel.append($('<option>',{value:name,text:name}));
        });
    });
}
// init
populateStatesAjax({pre:"{{ old('pre_state', @$user->address->state) }}", per:"{{ old('per_state') }}"});
$('#pre_state').on('change',function(){loadCitiesAjax($(this));});
$('#per_state').on('change',function(){loadCitiesAjax($(this),true);});
const stateCityMap={
"Andhra Pradesh":["Visakhapatnam","Vijayawada","Guntur","Nellore"],
"Bihar":["Patna","Gaya","Bhagalpur"],
"Delhi":["New Delhi","Delhi"],
"Gujarat":["Ahmedabad","Surat","Vadodara"],
"Karnataka":["Bengaluru","Mysuru","Mangalore"],
"Kerala":["Thiruvananthapuram","Kochi","Kozhikode"],
"Maharashtra":["Mumbai","Pune","Nagpur"],
"Tamil Nadu":["Chennai","Coimbatore","Madurai"],
"Telangana":["Hyderabad","Warangal"],
"Uttar Pradesh":["Lucknow","Kanpur","Varanasi"]};
function populateStates($sel,selected=''){
 $sel.html('<option value="">{{ __('Select State') }}</option>');
 $.each(stateCityMap,function(st){const opt=$('<option>',{value:st,text:st});if(st===selected){opt.attr('selected',true);} $sel.append(opt);});
}
function populateCities($stateSel,$citySel,selected=''){
 const st=$stateSel.val();
 $citySel.html('<option value="">{{ __('Select City') }}</option>');
 if(stateCityMap[st]){
  stateCityMap[st].forEach(function(c){const opt=$('<option>',{value:c,text:c});if(c===selected){opt.attr('selected',true);} $citySel.append(opt);});
 }
}
populateStates($('#pre_state'), "{{ old('pre_state', @$user->address->state) }}");
populateStates($('#per_state'), "{{ old('per_state') }}");
populateCities($('#pre_state'), $('#pre_city'), "{{ old('pre_city', @$user->address->city) }}");
populateCities($('#per_state'), $('#per_city'), "{{ old('per_city') }}");
$('#pre_state').on('change', function(){populateCities($('#pre_state'), $('#pre_city'));});
$('#per_state').on('change', function(){populateCities($('#per_state'), $('#per_city'));});
        $('#religion').trigger('change');

        $('#copyAddress').on('change', function() {
            let perCountry = $('[name=per_country]');
            let perState = $('[name=per_state]');
            let perZip = $('[name=per_zip]');
            let perCity = $('[name=per_city]');
            if ($(this).is(':checked')) {
                perCountry.val($('[name=pre_country]').val());
                perState.val($('[name=pre_state]').val());
                perZip.val($('[name=pre_zip]').val());
                perCity.val($('[name=pre_city]').val());
            } else {
                perCountry.val('');
                perState.val('');
                perZip.val('');
                perCity.val('');
            }
        })

        $('.skip-all').on('click', function() {
            $('.append-form').append(`<input type="hidden" name="skip_all" value="1" >`);
            $('.info-form').submit();
        })
    </script>
@endpush
