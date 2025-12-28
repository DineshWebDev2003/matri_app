<div class="mb-4">
    <h6 class="fw-bold mb-3">User Documents</h6>
    <table class="table table-bordered mb-3">
        <thead>
            <tr>
                <th style="width:10%">#</th>
                <th style="width:40%">Document</th>
                <th style="width:20%">Type</th>
                <th style="width:30%" class="text-center">Actions</th>
            </tr>
        </thead>
        <tbody>
            @php
                $docs = $user->galleries->whereIn('type',[\App\Models\Gallery::TYPE_ID_PROOF, \App\Models\Gallery::TYPE_HOROSCOPE]);
            @endphp
            @forelse($docs as $idx => $doc)
                <tr>
                    <td>{{ $idx+1 }}</td>
                    <td>
                        <a href="{{ route('user.document', $doc->image) }}" target="_blank" class="btn btn-sm btn-primary">View</a>
                    </td>
                    <td>{{ ucfirst(str_replace('_',' ', $doc->type)) }}</td>
                    <td class="text-center">
                        @if($doc->status == \App\Models\Gallery::STATUS_PENDING)
                            <form method="POST" class="d-inline" action="{{ route('admin.gallery.update-status') }}">
                                @csrf
                                <input type="hidden" name="id" value="{{ $doc->id }}">
                                <input type="hidden" name="status" value="approved">
                                <button class="btn btn-success btn-sm">Approve</button>
                            </form>
                            <form method="POST" class="d-inline" action="{{ route('admin.gallery.update-status') }}" onsubmit="return confirm('Reject & delete this document?')">
                                @csrf
                                <input type="hidden" name="id" value="{{ $doc->id }}">
                                <input type="hidden" name="status" value="rejected">
                                <button class="btn btn-danger btn-sm">Reject</button>
                            </form>
                        @else
                            <span class="badge bg-{{ $doc->status=='approved' ? 'success':'danger' }}">{{ ucfirst($doc->status) }}</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr><td colspan="4" class="text-center">No documents uploaded</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="row g-3 mt-3">
        <div class="col-md-6">
            <label class="form-label fw-bold">Upload Horoscope</label>
            <input type="file" name="horoscope_photo" accept=".jpg,.jpeg,.png,.pdf" class="form-control">
            <small class="text-muted">jpg, png or pdf up to 2 MB.</small>
        </div>
        <div class="col-md-6">
            <label class="form-label fw-bold">Upload ID Proof</label>
            <input type="file" name="id_proof_photo" accept=".jpg,.jpeg,.png,.pdf" class="form-control">
            <small class="text-muted">jpg, png or pdf up to 2 MB.</small>
        </div>
    </div>
</div>
