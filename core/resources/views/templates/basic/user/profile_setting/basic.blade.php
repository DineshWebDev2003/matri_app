 <!-- Basic information -->
 <div class="public-profile__accordion accordion custom--accordion" id="accordionPanelsStayOpenExample">
     <div class="accordion-item basic-information" id="basicInformation">
         <h2 class="accordion-header" id="panelsStayOpen-basicInfo">
             <button class="accordion-button" data-bs-target="#panelsStayOpen-collapseBasicInfo" data-bs-toggle="collapse" type="button" aria-controls="panelsStayOpen-collapseBasicInfo" aria-expanded="true">
                 @lang('Basic Information')
             </button>
         </h2>
         <div class="accordion-collapse collapse show" id="panelsStayOpen-collapseBasicInfo" aria-labelledby="panelsStayOpen-basicInfo">
             <div class="accordion-body">
                 <form class="basic-info" action="" autocomplete="off" method="POST">
                     @csrf
                     <input name="method" type="hidden" value="basicInfo">
                     <div class="row">
                         <div class="col-sm-6">
                             <div class="input--group">
                                 <input class="form-control form--control" name="firstname" type="text" value="{{ old('firstname', @$user->firstname) }}" required>
                                 <label class="form--label">@lang('First Name')</label>
                             </div>
                         </div>
                         <div class="col-sm-6">
                             <div class="input--group">
                                 <input class="form-control form--control" name="lastname" type="text" value="{{ old('lastname', @$user->lastname) }}" required>
                                 <label class="form--label">@lang('Last Name')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <input class="birth-date form-control form--control" name="birth_date" data-date-format="yyyy-mm-dd" data-language="en" data-position='bottom right' data-range="false" type="text" value="{{ old('birth_date', @$user->basicInfo->birth_date) }}" autocomplete="off" required>
                                 <label class="form--label">@lang('Date Of Birth')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" id="religion" name="religion_id" required>
                                     <option value="">@lang('Select One')</option>
                                     @foreach ($religions as $religion)
                                         <option value="{{ $religion->id }}" @selected(old('religion_id', @$user->basicInfo->religion_id) == $religion->id)>
                                             {{ __($religion->name) }}
                                         </option>
                                     @endforeach
                                 </select>
                                 <label class="form--label">@lang('Religion')</label>
                             </div>
                         </div>
                         <!-- Caste -->
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" id="caste" name="caste" data-old="{{ old('caste', @$user->basicInfo->caste) }}">
                                     <option value="">{{ __('Select Caste') }}</option>
                                     @if(old('religion_id', @$user->basicInfo->religion_id))
                                         @php
                                             $oldCastes = \App\Models\CasteInfo::where('religion_id', old('religion_id', @$user->basicInfo->religion_id))->orderBy('name')->pluck('name');
                                         @endphp
                                         @foreach($oldCastes as $casteName)
                                             <option value="{{ $casteName }}" @selected(old('caste', @$user->basicInfo->caste) == $casteName)>{{ __($casteName) }}</option>
                                         @endforeach
                                     @endif
                                 </select>
                                 <label class="form--label" for="caste">@lang('Caste')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" name="gender">
                                     <option value="">@lang('Select')</option>
                                     <option value="Male" @selected(old('gender', @$user->basicInfo->gender) == 'Male')>@lang('Male')</option>
                                     <option value="Female" @selected(old('gender', @$user->basicInfo->gender) == 'Female')>@lang('Female')</option>
                                 </select>
                                 <label class="form--label">@lang('Gender')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" name="marital_status">
                                     <option value="">@lang('Select One')</option>
                                     @foreach ($maritalStatuses as $maritalStatus)
                                         <option value="{{ $maritalStatus->title }}" @selected(old('marital_status', @$user->basicInfo->marital_status) == $maritalStatus->title)>
                                             {{ __($maritalStatus->title) }}
                                         </option>
                                     @endforeach
                                 </select>
                                 <label class="form--label">@lang('Marital Status')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-control form--control select2-auto-tokenize" name="language[]" multiple="multiple" required placeholder="none">
                                     @if (@$user->basicInfo)
                                         @foreach (@$user->basicInfo->language as $language)
                                             <option value="{{ $language }}" selected>{{ $language }}</option>
                                         @endforeach
                                     @endif
                                 </select>
                                 <label class="form--label">@lang('Languages')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <input class="form-control form--control" name="mother_tongue" type="text" value="{{ old('mother_tongue', @$user->basicInfo->mother_tongue) }}">
                                 <label class="form--label">@lang('Mother Tongue')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <input class="form-control form--control" name="profession" type="text" value="{{ old('profession', @$user->basicInfo->profession) }}" required>
                                 <label class="form--label">@lang('Profession')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <input class="form-control form--control" name="financial_condition" type="text" value="{{ old('financial_condition', @$user->basicInfo->financial_condition) }}" required>
                                 <label class="form--label">@lang('Annual Income')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" name="smoking_status">
                                     <option value="">@lang('Select One')</option>
                                     <option value="0" @selected(old('smoking_status', @$user->basicInfo->smoking_status) == 0)>@lang('Non-smoker')</option>
                                     <option value="1" @selected(old('smoking_status', @$user->basicInfo->smoking_status) == 1)>@lang('Smoker')</option>
                                 </select>
                                 <label class="form--label">@lang('Smoking Habits')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" name="drinking_status">
                                     <option value="">@lang('Select One')</option>
                                     <option value="0" @selected(old('drinking_status', @$user->basicInfo->drinking_status) == 0)>@lang('Non-drunker')</option>
                                     <option value="1" @selected(old('drinking_status', @$user->basicInfo->drinking_status) == 1)>@lang('Drunker')</option>
                                 </select>
                                 <label class="form--label">@lang('Drinking Status')</label>
                             </div>
                         </div>

                         <small class="my-3">@lang('Present Address')</small>

                         <div class="col-sm-6">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" name="pre_country" @disabled(@$user->basicInfo->present_address->country)>
                                     <option value="">@lang('Select One')</option>
                                     @foreach ($countries as $country)
                                         <option value="{{ $country->country }}" @selected(old('pre_country', @$user->basicInfo->present_address->country) == $country->country)>
                                             {{ __($country->country) }}
                                         </option>
                                     @endforeach
                                 </select>
                                 <label class="form--label">@lang('Present Country')</label>
                             </div>
                         </div>
                         <div class="col-sm-6">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" name="pre_state" id="pre_state"></select>
                                 <label class="form--label">@lang('State')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <input class="form-control form--control" name="pre_zip" type="text" value="{{ old('pre_zip', @$user->basicInfo->present_address->zip) }}">
                                 <label class="form--label">@lang('Zip Code')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-select form-control form--control" name="pre_city" id="pre_city" required></select>
                                 <label class="form--label">@lang('City')</label>
                             </div>
                         </div>

                         <small class="my-3">
                             <div class="remeber-me">
                                 @lang('Permanent Address') :
                                 <input class="form-check-input" id="copyAddress" type="checkbox" checked disabled>
                                 <label class="form-check-label" for="copyAddress">
                                     @lang('Same as present address?')
                                 </label>
                             </div>
                         </small>

                         <div class="col-sm-6">
                             <div class="input--group">
                                 <select class="form-select form-control form--control permanent" name="per_country">
                                     <option value="">@lang('Select One')</option>
                                     @foreach ($countries as $country)
                                         <option value="{{ $country->country }}" @selected(old('per_country', @$user->basicInfo->permanent_address->country) == $country->country)>
                                             {{ __($country->country) }}
                                         </option>
                                     @endforeach
                                 </select>
                                 <label class="form--label">@lang('Permanent Country')</label>
                             </div>
                         </div>
                         <div class="col-sm-6">
                             <div class="input--group">
                                 <select class="form-select form-control form--control permanent" name="per_state" id="per_state"></select>
                                 <label class="form--label">@lang('State')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <input class="form-control form--control permanent" name="per_zip" type="text" value="{{ old('per_zip', @$user->basicInfo->permanent_address->zip) }}">
                                 <label class="form--label">@lang('Zip Code')</label>
                             </div>
                         </div>
                         <div class="col-sm-6 mt-4">
                             <div class="input--group">
                                 <select class="form-select form-control form--control permanent" name="per_city" id="per_city" required></select>
                                 <label class="form--label">@lang('City')</label>
                             </div>
                         </div>
                         <div class="col-sm-12">
                             <button class="btn btn--base w-100 mt-4" type="submit">@lang('Submit')</button>
                         </div>
                     </div>
                 </form>
             </div>
         </div>
     </div>
 </div>
 <!-- Basic information end-->

 @push('style-lib')
     <link href="{{ asset('assets/admin/css/vendor/select2.min.css') }}" rel="stylesheet">
 @endpush

 @push('script-lib')
     <script src="{{ asset('assets/admin/js/vendor/datepicker.min.js') }}"></script>
     <script src="{{ asset('assets/admin/js/vendor/datepicker.en.js') }}"></script>
     <script src="{{ asset('assets/admin/js/vendor/select2.min.js') }}"></script>
 @endpush

 @push('script')
     <script>
         (function($) {
             "use strict";

             $('.birth-date').datepicker({
                 autoClose: true
             });

             $('#copyAddress').on('change', function() {
                 if ($(this).is(':checked')) {
                     let country = $('[name=pre_country]').val();
                     let state = $('[name=pre_state]').val();
                     let zip = $('[name=pre_zip]').val();
                     let city = $('[name=pre_city]').val();

                     $('[name=per_country] [value="' + country + '"]').prop('selected', true);
                     $('[name=per_state]').val(state);
                     $('[name=per_zip]').val(zip);
                     $('[name=per_city]').val(city);
                 } else {
                     $('.permanent').val('');
                 }
             });

             $('.select2-auto-tokenize').select2({
                 tags: true,
                 tokenSeparators: [',']
             });

             let basicForm = $('.basic-info');
             let religion = "{{ @$user->basicInfo->religion_id }}";
             let gender = "{{ @$user->basicInfo->gender }}";
             let maritalStatus = "{{ @$user->basicInfo->marital_status }}";
             let smokingStatus = "{{ @$user->basicInfo->smoking_status }}";
             let drinkingStatus = "{{ @$user->basicInfo->drinking_status }}";
             let permanentCountry = "{{ @$user->basicInfo->permanent_address->country }}";

             basicForm.find('[name=religion_id]').val(religion);
             // load castes based on religion on page load
             loadCastes(basicForm, religion, "{{ @$user->basicInfo->caste }}");
             basicForm.find('[name=gender]').val(gender);
             basicForm.find('[name=marital_status]').val(maritalStatus);
             basicForm.find('[name=smoking_status]').val(smokingStatus);
             basicForm.find('[name=drinking_status]').val(drinkingStatus);
             basicForm.find('[name=per_country]').val(permanentCountry);
         // Load castes helper
 function loadCastes($form, rel, selected){
     const $caste = $form.find('select[name="caste"]');
     if(!rel){
         $caste.html(`<option value="">{{ __('Select Caste') }}</option>`);
         return;
     }
     $caste.html(`<option value="">{{ __('Loading...') }}</option>`);
     $.get('{{ url('castes') }}/'+encodeURIComponent(rel), function(data){
         let opts=`<option value="">{{ __('Select Caste') }}</option>`;
         $.each(data,function(i,n){opts+=`<option value="${n}">${n}</option>`;});
         opts+=`<option value="__other__">{{ __('Other') }}</option>`;
         $caste.html(opts);
         if(selected){ $caste.val(selected); }
     });
 }
 // religion change handler
 $(document).on('change', '#religion', function(){
     const rel = $(this).val();
     const selected = $('#caste').attr('data-old');
     loadCastes(basicForm, rel, selected);
 });
 // caste selection persist
 $(document).on('change','#caste',function(){
     $(this).attr('data-old', $(this).val());
 });
 // ----- Dynamic States & Cities (AJAX) -----
function populateStatesAjax(selected=''){
    $.getJSON('{{ url('locations/states') }}', function(states){
        const $preState = $('#pre_state');
        const $perState = $('#per_state');
        $preState.html('<option value="">{{ __('Select State') }}</option>');
        $perState.html('<option value="">{{ __('Select State') }}</option>');
        $.each(states, function(id,name){
            const opt1 = $('<option>',{value:id,text:name});
            const opt2 = opt1.clone();
            if(id==selected.pre){ opt1.attr('selected',true); }
            if(id==selected.per){ opt2.attr('selected',true); }
            $preState.append(opt1);
            $perState.append(opt2);
        });
        // populate cities for initially selected states
        if(selected.pre){ loadCitiesAjax($('#pre_state')); }
        if(selected.per){ loadCitiesAjax($('#per_state'), true); }
    });
}
function loadCitiesAjax($stateSel, isPermanent=false){
    const stateId = $stateSel.val();
    const $citySel = isPermanent ? $('#per_city') : ( $stateSel.attr('id')=='pre_state' ? $('#pre_city') : $('#per_city') );
    if(!stateId){ $citySel.html('<option value="">{{ __('Select City') }}</option>'); return; }
    $.getJSON('{{ url('locations/cities') }}/'+stateId, function(cities){
        $citySel.html('<option value="">{{ __('Select City') }}</option>');
        $.each(cities, function(_,name){
            $citySel.append($('<option>',{value:name,text:name}));
        });
    });
}
// on page load
populateStatesAjax({pre:"{{ old('pre_state', @$user->basicInfo->present_address->state) }}", per:"{{ old('per_state', @$user->basicInfo->permanent_address->state) }}"});
$('#pre_state').on('change', function(){ loadCitiesAjax($(this));});
$('#per_state').on('change', function(){ loadCitiesAjax($(this), true);});

            // ---- Custom modifications: lock permanent address and restrict country ----
            // Ensure checkbox is checked and not editable and hide its label row
            $('#copyAddress').prop('checked', true).prop('disabled', true);
            $('#copyAddress').closest('small').addClass('d-none');
            // Hide all permanent address input groups and make their fields non-required
            $('.permanent').closest('.col-sm-6').addClass('d-none');
            $('.permanent').prop('required', false);
            // Restrict present country to India only and disable selector
            const $preCountry = $('[name=pre_country]');
            $preCountry.find('option').each(function(){
                if($(this).val() !== 'India') $(this).remove();
            });
            $preCountry.val('India').prop('disabled', true);

    $(document).on('change','#caste',function(){
     $(this).attr('data-old', $(this).val());
 });
})(jQuery)
     </script>
 @endpush
