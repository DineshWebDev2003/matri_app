<div class="row g-4">
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Country</label>
            <input type="text" name="country" class="form-control" value="{{ $user->basicInfo->country ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">State</label>
            <input type="text" name="state" class="form-control" value="{{ $user->basicInfo->state ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">City</label>
            <input type="text" name="city" class="form-control" value="{{ $user->basicInfo->city ?? '' }}">
        </div>
    </div>
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Address</label>
            <input type="text" name="address" class="form-control" value="{{ $user->address->address ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Pincode</label>
            <input type="text" name="pincode" class="form-control" value="{{ $user->address->pincode ?? '' }}">
        </div>
    </div>
</div> 