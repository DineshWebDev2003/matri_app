<div class="mb-3">
    <label class="form-label fw-bold">Career Details</label>
    <div id="career-list">
        @foreach(($user->careerInfo ?? []) as $i => $career)
            <div class="row g-2 align-items-end mb-2">
                <div class="col-md-3">
                    <input type="text" name="career[{{ $i }}][designation]" class="form-control" placeholder="Designation" value="{{ $career->designation ?? '' }}">
                </div>
                <div class="col-md-3">
                    <input type="text" name="career[{{ $i }}][company]" class="form-control" placeholder="Company" value="{{ $career->company ?? '' }}">
                </div>
                <div class="col-md-3">
                    <input type="text" name="career[{{ $i }}][salary_details]" class="form-control" placeholder="Salary Details" value="{{ $career->salary_details ?? '' }}">
                </div>
                <div class="col-md-2">
                    <input type="text" name="career[{{ $i }}][years]" class="form-control" placeholder="Years" value="{{ $career->years ?? '' }}">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm remove-career">&times;</button>
                </div>
            </div>
        @endforeach
    </div>
    <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="add-career">Add Career</button>
</div>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        let careerIndex = {{ isset($user) && $user->careerInfo ? $user->careerInfo->count() : 0 }};
        document.getElementById('add-career').onclick = function() {
            const list = document.getElementById('career-list');
            const row = document.createElement('div');
            row.className = 'row g-2 align-items-end mb-2';
            row.innerHTML = `
                <div class="col-md-3">
                    <input type="text" name="career[${careerIndex}][designation]" class="form-control" placeholder="Designation">
                </div>
                <div class="col-md-3">
                    <input type="text" name="career[${careerIndex}][company]" class="form-control" placeholder="Company">
                </div>
                <div class="col-md-3">
                    <input type="text" name="career[${careerIndex}][salary_details]" class="form-control" placeholder="Salary Details">
                </div>
                <div class="col-md-2">
                    <input type="text" name="career[${careerIndex}][years]" class="form-control" placeholder="Years">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm remove-career">&times;</button>
                </div>
            `;
            list.appendChild(row);
            careerIndex++;
        };

        document.getElementById('career-list').addEventListener('click', function(e) {
            if(e.target.classList.contains('remove-career')) {
                e.target.closest('.row').remove();
            }
        });
    });
</script>