<div class="row g-4">
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Height</label>
            <input type="text" name="height" class="form-control" value="{{ $user->physicalAttributes->height ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Weight</label>
            <input type="text" name="weight" class="form-control" value="{{ $user->physicalAttributes->weight ?? '' }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Body Type</label>
            <select name="body_type" class="form-select">
                <option value="">Select Body Type</option>
                @foreach(['Slim','Average','Athletic','Heavy'] as $type)
                    <option value="{{ $type }}" {{ (isset($user->physicalAttributes) && $user->physicalAttributes->body_type == $type) ? 'selected' : '' }}>{{ $type }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Complexion</label>
            <select name="complexion" class="form-select">
                <option value="">Select Complexion</option>
                @foreach(['Fair','Medium','Wheatish','Dark'] as $comp)
                    <option value="{{ $comp }}" {{ (isset($user->physicalAttributes) && $user->physicalAttributes->complexion == $comp) ? 'selected' : '' }}>{{ $comp }}</option>
                @endforeach
            </select>
        </div>
    </div>
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Blood Group</label>
            <select name="blood_group" class="form-select">
                <option value="">Select Blood Group</option>
                @foreach(['A+','A-','B+','B-','AB+','AB-','O+','O-'] as $bg)
                    <option value="{{ $bg }}" {{ (isset($user->physicalAttributes) && $user->physicalAttributes->blood_group == $bg) ? 'selected' : '' }}>{{ $bg }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Physical Status</label>
            <select name="physical_status" class="form-select">
                <option value="">Select Physical Status</option>
                @foreach(['Normal','Physically Challenged'] as $ps)
                    <option value="{{ $ps }}" {{ (isset($user->physicalAttributes) && $user->physicalAttributes->physical_status == $ps) ? 'selected' : '' }}>{{ $ps }}</option>
                @endforeach
            </select>
        </div>
    </div>
</div> 