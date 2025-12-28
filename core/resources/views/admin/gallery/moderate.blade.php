@extends('admin.layouts.app')
@section('panel')
<div class="row justify-content-center mb-3">
    <div class="col-lg-12">
        <div class="card b-radius--10">
            <div class="card-body">
                <div class="d-flex justify-content-between flex-wrap mb-3 align-items-center">
    <!-- Status Tabs -->
    <ul class="nav nav-pills" id="statusTabs">
        <li class="nav-item">
            <a class="nav-link {{ $filter=='all'?'active':'' }}" href="{{ route('admin.gallery.moderate', ['filter'=>'all','range'=>request('range','all')]) }}">All <span class="badge bg-light text-dark">{{ $counts['all'] }}</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link {{ $filter=='approved'?'active':'' }}" href="{{ route('admin.gallery.moderate', ['filter'=>'approved','range'=>request('range','all')]) }}">Approved <span class="badge bg-light text-dark">{{ $counts['approved'] }}</span></a>
        </li>
        <li class="nav-item">
            <a class="nav-link {{ $filter=='rejected'?'active':'' }}" href="{{ route('admin.gallery.moderate', ['filter'=>'rejected','range'=>request('range','all')]) }}">Unapproved <span class="badge bg-light text-dark">{{ $counts['rejected'] }}</span></a>
        </li>
    </ul>

    <!-- Date Range Select -->
    <form action="{{ route('admin.gallery.moderate') }}" method="get" class="d-flex align-items-center">
        <input type="hidden" name="filter" value="{{ $filter }}">
        <select name="range" class="form-control me-2">
            <option value="all" {{ request('range')=='all'?'selected':'' }}>All Time</option>
            <option value="today" {{ request('range')=='today'?'selected':'' }}>Today</option>
            <option value="last7" {{ request('range')=='last7'?'selected':'' }}>Last 7 Days</option>
            <option value="last30" {{ request('range')=='last30'?'selected':'' }}>Last 30 Days</option>
        </select>
        <button type="submit" class="btn btn--primary ms-2 px-4" style="white-space:nowrap">Filter</button>
    </form>
</div>

                        
                <div class="table-responsive--sm table-responsive">
                    <table class="table table--light style--two">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>User</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($galleries as $gallery)
                            <tr>
                                <td class="text-center">
                                        <button type="button" class="btn btn-sm btn-outline-primary view-photo" data-img="{{ asset('assets/images/user/gallery/'.$gallery->image) }}">View Photo</button>
                                    </td>
                                <td>
                                    <span class="fw-bold">90KLYNM{{ $gallery->user_id }}</span><br>
                                    <small>{{ $gallery->user->username??'' }}<br>{{ $gallery->user->email??'' }}</small>
                                </td>
                                <td class="text-center">
                                    @if($gallery->status=='approved')
                                            <span class="fs-4">😊</span>
                                        @elseif($gallery->status=='rejected')
                                            <span class="fs-4">😞</span>
                                        @else
                                            <span class="fs-4">⏳</span>
                                        @endif
                                </td>
                                <td>{{ showDateTime($gallery->created_at) }}</td>
                                <td class="text-center">
                                    @if($gallery->status=='pending')
                                        <form class="d-inline ajax-status-form" method="post" action="{{ route('admin.gallery.update-status') }}">
                                            @csrf
                                            <input type="hidden" name="id" value="{{ $gallery->id }}">
                                            <input type="hidden" name="status" value="approved">
                                            <button class="btn btn--success btn-sm">Approve</button>
                                        </form>
                                        <form class="d-inline ajax-status-form" method="post" action="{{ route('admin.gallery.update-status') }}">
                                            @csrf
                                            <input type="hidden" name="id" value="{{ $gallery->id }}">
                                            <input type="hidden" name="status" value="rejected">
                                            <button class="btn btn--danger btn-sm" onclick="return confirm('Reject & delete this image?')">Reject</button>
                                        </form>
                                    @endif
                                </td>
                            </tr>
                            @empty
                            <tr><td colspan="100%" class="text-center">No data found</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                {{ $galleries->links() }}
            </div>
        </div>
    </div>
</div>
<!-- Image Modal -->
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
@endsection

@push('script')
<script>
(function($){
    // open modal
        $(document).on('click','.view-photo',function(){
            var src=$(this).data('img');
            $('#photoModalImg').attr('src',src);
            $('#photoModal').modal('show');
        });

        $(document).on('submit','.ajax-status-form',function(e){
        e.preventDefault();
        var form=$(this);
        var row=form.closest('tr');
        $.post(form.attr('action'),form.serialize(),function(res){
            if(res.success){
                if(res.deleted){ row.remove(); }
                else {
                    var status=form.find('input[name="status"]').val();
                    row.find('td:eq(2)').html(status=='approved'?'<span class="text--success"><i class="las la-check-circle"></i></span>':'<span class="text--danger"><i class="las la-times-circle"></i></span>');
                    row.find('.ajax-status-form').remove();
                }
            }
        }).fail(()=>alert('Something went wrong'));
    });
})(jQuery);
</script>
@endpush
