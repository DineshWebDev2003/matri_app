<div class="mb-3">
    @php($galleries = collect(data_get($user, 'galleries', [])))
    @php($profile = $galleries->where('is_profile', true)->first())
    <div class="mb-3">
        <label class="form-label fw-bold">Profile Photo</label>
        @if($profile)
            <div class="d-flex align-items-center mb-2">
                <img src="{{ getImage(getFilePath('userProfile') . '/' . $profile->image, getFileSize('userProfile')) }}" alt="Profile Photo" style="height:80px;width:80px;object-fit:cover;border-radius:4px;margin-right:10px;">
                <button type="button" class="btn btn-sm btn-primary me-2 view-photo" data-img="{{ asset(getFilePath('userProfile') . '/' . $profile->image) }}">View Full</button>
            </div>
        @else
            <p class="text-muted">No profile photo uploaded yet.</p>
        @endif
        <input type="file" name="profile_photo" accept="image/*" class="form-control">
        <small class="text-muted">Upload a new profile photo to replace the existing one.</small>
    </div>

    <label class="form-label fw-bold">Gallery ({{ $galleries->where('type', \App\Models\Gallery::TYPE_PHOTO)->where('status','!=', \App\Models\Gallery::STATUS_REJECTED)->count() }} / {{ data_get($user, 'limitation.image_upload_limit', 'N/A') }})</label>
    <table class="table table-bordered mb-3">
        <thead>
            <tr>
                <th style="width: 10%">#</th>
                <th style="width: 40%">Photo</th>
                <th class="text-center" style="width: 50%">Actions</th>
            </tr>
        </thead>
        <tbody>
            @php($photos = $galleries->where('type', \App\Models\Gallery::TYPE_PHOTO))
            @forelse($photos as $idx => $gallery)
                <tr>
                    <td>{{ $idx + 1 }}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-primary view-photo" data-img="{{ asset('assets/images/user/gallery/' . $gallery->image) }}">View Photo</button>
                    </td>
                    <td class="text-center">
                        <form method="POST" action="{{ route('admin.users.gallery.status', $gallery->id) }}" class="d-inline">
                            @csrf
                            <input type="hidden" name="action" value="approve">
                            <button type="submit" class="btn btn-sm btn-success">Accept</button>
                        </form>
                        <form method="POST" action="{{ route('admin.users.gallery.delete', [$user->id ?? 0, $gallery->id]) }}" class="d-inline" onsubmit="return confirm('Delete this photo?')">
                            @csrf
                            <button type="submit" class="btn btn-sm btn-danger">Reject</button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" class="text-center">No photos uploaded yet.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
    @php($uploaded = $galleries->where('type', \App\Models\Gallery::TYPE_PHOTO)->where('status','!=', \App\Models\Gallery::STATUS_REJECTED)->count())
    @php($limit = data_get($user, 'limitation.image_upload_limit', 0))
    @if(!$user || $uploaded < $limit || $limit == 0)
        <div class="mb-3">
            <label class="form-label">Upload New Image</label>
            <input type="file" name="gallery_images[]" class="form-control" multiple accept="image/*">
            <small class="text-muted">You can upload up to {{ $limit ? max($limit - $uploaded, 0) : 'N/A' }} more images.</small>
        </div>
    @else
        <div class="alert alert-info">Image upload limit reached for this user.</div>
    @endif
</div>

@push('modal')
<div class="modal fade" id="photoModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Photo</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-center">
        <img id="photoModalImg" src="" class="img-fluid" alt="photo">
      </div>
    </div>
  </div>
</div>
@endpush

@push('script')
<script>
document.addEventListener('click',function(e){
    const btn=e.target.closest('.view-photo');
    if(btn){ console.log('View photo clicked'); }
    if(!btn) return;
    const src=btn.getAttribute('data-img');
    const imgEl=document.getElementById('photoModalImg');
    if(imgEl){ imgEl.src=src; }
    const modalEl=document.getElementById('photoModal');
    if(!modalEl) return;
    if(window.bootstrap && bootstrap.Modal){
        const modal=new bootstrap.Modal(modalEl);
        modal.show();
    }else if(typeof $!== 'undefined' && $.fn.modal){
        $(modalEl).modal('show');
    }
});
</script>
@endpush 