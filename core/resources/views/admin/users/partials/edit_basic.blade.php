@php
    $authAdmin = auth()->guard('admin')->user();
    $canManagePlan = $authAdmin && $authAdmin->hasRole('Super Admin');
@endphp

<div class="row g-4">
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Gender</label>
            <select name="gender" class="form-select">
                <option value="">Select Gender</option>
                <option value="Male" {{ old('gender', optional(optional($user)->basicInfo)->gender) == 'Male' ? 'selected' : '' }}>Male</option>
                <option value="Female" {{ old('gender', optional(optional($user)->basicInfo)->gender) == 'Female' ? 'selected' : '' }}>Female</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Looking For</label>
            <select name="looking_for" class="form-select">
                <option value="">Select Preference</option>
                <option value="1" {{ old('looking_for', optional($user)->looking_for) == 1 ? 'selected' : '' }}>Bridegroom</option>
                <option value="2" {{ old('looking_for', optional($user)->looking_for) == 2 ? 'selected' : '' }}>Bride</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">First Name</label>
            <input type="text" name="firstname" class="form-control" value="{{ optional($user)->firstname }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <input type="email" name="email" class="form-control" value="{{ optional($user)->email }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Marital Status</label>
            <select name="marital_status" class="form-select">
                <option value="">Select Marital Status</option>
                @foreach(['Unmarried','Divorced','Widowed','Separated'] as $ms)
                    <option value="{{ $ms }}" {{ old('marital_status', optional(optional($user)->basicInfo)->marital_status) == $ms ? 'selected' : '' }}>{{ $ms }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Mobile</label>
            <input type="text" name="mobile" class="form-control" value="{{ optional($user)->mobile }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Mother Tongue</label>
            <input type="text" name="mother_tongue" class="form-control" value="{{ optional(optional($user)->basicInfo)->mother_tongue }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Religion</label>
            <select name="religion_id" id="religion_id" class="form-select">
                <option value="">Select Religion</option>
                @php
                    $allReligions = isset($religions) ? $religions : \App\Models\ReligionInfo::all();
                @endphp
                @foreach($allReligions as $rel)
                    <option value="{{ $rel->id }}" {{ optional(optional($user)->basicInfo)->religion_id == $rel->id ? 'selected' : '' }}>{{ $rel->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Caste</label>
            <select name="caste" id="caste" class="form-select">
                <option value="">Select Caste</option>
                @if(optional(optional($user)->basicInfo)->religion_id)
                    @foreach(\App\Models\CasteInfo::where('religion_id', optional(optional($user)->basicInfo)->religion_id)->orderBy('name')->get() as $casteItem)
                        <option value="{{ $casteItem->name }}" {{ optional(optional($user)->basicInfo)->caste == $casteItem->name ? 'selected' : '' }}>{{ $casteItem->name }}</option>
                    @endforeach
                @endif
            </select>
        </div>
        @push('script')
        <script>
        document.addEventListener('DOMContentLoaded', function () {
            function loadCastes(religionId, selected = '') {
                const casteSelect = document.getElementById('caste');
                if (!casteSelect) return;
                casteSelect.innerHTML = '<option value="">Select Caste</option>';
                if (!religionId) return;
                fetch('{{ url('castes') }}/' + religionId)
                    .then(res => res.json())
                    .then(data => {
                        data.forEach(function (c) {
                            const opt = document.createElement('option');
                            opt.value = c;
                            opt.textContent = c;
                            if (c === selected) { opt.selected = true; }
                            casteSelect.appendChild(opt);
                        });
                    });
            }

            const religionSel = document.getElementById('religion_id');
            const initialReligion = religionSel ? religionSel.value : '';
            const initialCaste = "{{ optional(optional($user)->basicInfo)->caste }}";
            loadCastes(initialReligion, initialCaste);

            if (religionSel) {
                religionSel.addEventListener('change', function () {
                    loadCastes(this.value);
                });
            }
        });
        </script>
        @endpush
    </div>
    <div class="col-md-6">
        <div class="mb-3">
            <label class="form-label fw-bold">Last Name</label>
            <input type="text" name="lastname" class="form-control" value="{{ optional($user)->lastname }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Password <small>(leave blank to keep unchanged)</small></label>
            <input type="password" name="password" class="form-control" placeholder="Leave blank to keep unchanged">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Date of Birth</label>
            <input type="date" name="birth_date" class="form-control" value="{{ old('birth_date', optional(optional($user)->basicInfo)->birth_date) }}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Assign Staff</label>
            <select name="assigned_staff" class="form-select">
                <option value="">Select Staff</option>
                @foreach($staffs as $staff)
                    <option value="{{ $staff->id }}" {{ old('assigned_staff', optional($user)->assigned_staff) == $staff->id ? 'selected' : '' }}>{{ $staff->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Assign Franchise</label>
            <input type="text" name="assigned_franchise" class="form-control" value="{{ optional($user)->assigned_franchise }}">
        </div>
        @if($canManagePlan)
            <div class="mb-3">
                <label class="form-label fw-bold">Plan Name</label>
                <select name="package_id" id="package_id" class="form-select" {{ isset($user) ? 'disabled' : '' }}>
                    <option value="">Select Plan</option>
                    @foreach($packages as $package)
                        <option value="{{ $package->id }}"
                            data-validity="{{ $package->validity_days }}"
                            {{ data_get($user, 'limitation.package_id') == $package->id ? 'selected' : '' }}>
                            {{ $package->name }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Plan Expired On</label>
                @php
                    $lim = data_get($user, 'limitation');
                    $expiry = $lim->expired_at ?? null;
                    if(!$expiry && ($lim->validity_period ?? 0) > 0){
                        $expiry = \Carbon\Carbon::parse($lim->updated_at)->addDays($lim->validity_period);
                    }
                @endphp
                <input type="text" name="plan_expired_on" id="plan_expired_on" class="form-control" value="{{ $expiry ? \Carbon\Carbon::parse($expiry)->format('d-m-Y') : 'N/A' }}" readonly>
            </div>
            @push('script')
                <script>
                document.addEventListener('DOMContentLoaded', function() {
                    const planSelect = document.getElementById('package_id');
                    const expiryInput = document.getElementById('plan_expired_on');
                    if(!planSelect || !expiryInput){
                        return;
                    }
                    planSelect.addEventListener('change', function() {
                        const selected = planSelect.options[planSelect.selectedIndex];
                        const validity = parseInt(selected.getAttribute('data-validity')) || 0;
                        if (validity > 0) {
                            const today = new Date();
                            today.setDate(today.getDate() + validity);
                            const formatted = ('0'+today.getDate()).slice(-2)+'-'+('0'+(today.getMonth()+1)).slice(-2)+'-'+today.getFullYear();
                            expiryInput.value = formatted;
                        } else {
                            expiryInput.value = 'N/A';
                        }
                    });
                });
                </script>
            @endpush
        @endif
    </div>
</div> 