@extends('admin.layouts.app')
@section('panel')
<div class="card shadow-sm">
    <div class="card-body">
        <h5 class="mb-4">Bulk User Import</h5>
        @if(isset($rows))
            <h6 class="mb-3">Preview (showing {{ count($rows) }} of {{ $totalRows ?? count($rows) }} records)</h6>
            @if(count($rows) > 0)
            <div class="table-responsive">
                <table class="table table-bordered small">
                    <thead>
                        @foreach(array_keys($rows[0]) as $col)
                            <th>{{ $col }}</th>
                        @endforeach
                    </thead>
                    <tbody>
                        @foreach($rows as $r)
                            <tr>
                                @foreach($r as $val)
                                    <td>{{ $val }}</td>
                                @endforeach
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @else
                <div class="alert alert-warning">No valid rows were found in the uploaded file.</div>
            @endif
            <form method="POST" action="{{ route('admin.users.bulk-add.store') }}">
                @csrf
                <input type="hidden" name="tmp" value="{{ $tmp }}">
                <button class="btn btn--primary"><i class="las la-check"></i> Confirm & Import</button>
                <a href="{{ route('admin.users.bulk-add') }}" class="btn btn-outline-secondary ms-2">Cancel</a>
            </form>
        @else>
        <a href="{{ route('admin.users.bulk-add.sample') }}" class="btn btn-outline-primary mb-3">
            <i class="las la-download"></i> Download Sample CSV
        </a>
        @if(session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @elseif(session('error'))
            <div class="alert alert-danger">{{ session('error') }}</div>
        @endif
        <form method="POST" action="{{ route('admin.users.bulk-add.preview') }}" enctype="multipart/form-data">
            @csrf
            <div class="mb-3">
                <label class="form-label">Upload CSV File</label>
                <input type="file" name="file" class="form-control" accept=".csv" required>
                <small class="text-muted">Make sure you follow the column order from the sample file. Max size 2 MB.</small>
            </div>
                        <button type="submit" class="btn btn--primary"><i class="las la-upload"></i> Preview</button>
        </form>
        @endif
        </form>
    </div>
</div>
@endsection
