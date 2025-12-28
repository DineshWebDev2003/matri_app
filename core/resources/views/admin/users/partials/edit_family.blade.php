<div class="row g-4">
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Father's Name</label>
            <input type="text" name="father_name" class="form-control" value="{{ $user->family->father_name ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Mother's Name</label>
            <input type="text" name="mother_name" class="form-control" value="{{ $user->family->mother_name ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Family Type</label>
            <select name="family_type" class="form-select">
                <option value="">Select Family Type</option>
                @foreach(['Nuclear','Joint'] as $ftype)
                    <option value="{{ $ftype }}" {{ (isset($user->family) && $user->family->family_type == $ftype) ? 'selected' : '' }}>{{ $ftype }}</option>
                @endforeach
            </select>
        </div>
    </div>
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Family Status</label>
            <input type="text" name="family_status" class="form-control" value="{{ $user->family->family_status ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Family Values</label>
            <input type="text" name="family_values" class="form-control" value="{{ $user->family->family_values ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Siblings</label>
            <input type="text" name="siblings" class="form-control" value="{{ $user->family->siblings ?? '' }}">
        </div>
    </div>
</div> 