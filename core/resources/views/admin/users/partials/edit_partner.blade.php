<div class="row g-4">
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Preferred Age Range</label>
            <input type="text" name="partner_age_range" class="form-control" value="{{ $user->partnerExpectation->age_range ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Preferred Height Range</label>
            <input type="text" name="partner_height_range" class="form-control" value="{{ $user->partnerExpectation->height_range ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Preferred Religion</label>
            <input type="text" name="partner_religion" class="form-control" value="{{ $user->partnerExpectation->religion ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Preferred Caste</label>
            <input type="text" name="partner_caste" class="form-control" value="{{ $user->partnerExpectation->caste ?? '' }}">
        </div>
    </div>
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Preferred Education</label>
            <input type="text" name="partner_education" class="form-control" value="{{ $user->partnerExpectation->education ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Preferred Occupation</label>
            <input type="text" name="partner_occupation" class="form-control" value="{{ $user->partnerExpectation->occupation ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Other Preferences</label>
            <textarea name="partner_other" class="form-control">{{ $user->partnerExpectation->other ?? '' }}</textarea>
        </div>
    </div>
</div> 