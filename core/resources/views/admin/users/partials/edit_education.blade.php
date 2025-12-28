<div class="mb-3">
    <label class="form-label fw-bold">Education Details</label>
    <div id="education-list">
        @foreach(($user->educationInfo ?? []) as $i => $edu)
            <div class="row g-2 align-items-end mb-2">
                <div class="col-md-4">
                    <input type="text" name="education[{{ $i }}][degree]" class="form-control" placeholder="Degree" value="{{ $edu->degree ?? '' }}">
                </div>
                <div class="col-md-4">
                    <input type="text" name="education[{{ $i }}][institution]" class="form-control" placeholder="Institution" value="{{ $edu->institution ?? '' }}">
                </div>
                <div class="col-md-3">
                    <input type="text" name="education[{{ $i }}][year]" class="form-control" placeholder="Year" value="{{ $edu->year ?? '' }}">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm remove-education">&times;</button>
                </div>
            </div>
        @endforeach
    </div>
    <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="add-education">Add Education</button>
</div>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        let eduIndex = {{ isset($user) && $user->educationInfo ? $user->educationInfo->count() : 0 }};
        document.getElementById('add-education').onclick = function() {
            const list = document.getElementById('education-list');
            const row = document.createElement('div');
            row.className = 'row g-2 align-items-end mb-2';
            row.innerHTML = `
                <div class="col-md-4">
                    <input type="text" name="education[${eduIndex}][degree]" class="form-control" placeholder="Degree">
                </div>
                <div class="col-md-4">
                    <input type="text" name="education[${eduIndex}][institution]" class="form-control" placeholder="Institution">
                </div>
                <div class="col-md-3">
                    <input type="text" name="education[${eduIndex}][year]" class="form-control" placeholder="Year">
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-danger btn-sm remove-education">&times;</button>
                </div>
            `;
            list.appendChild(row);
            eduIndex++;
        };
        document.getElementById('education-list').addEventListener('click', function(e) {
            if(e.target.classList.contains('remove-education')) {
                e.target.closest('.row').remove();
            }
        });
    });
</script> 