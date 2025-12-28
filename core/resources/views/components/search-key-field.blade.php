@props(['placeholder' => 'Search...', 'btn' => 'btn--primary'])
<div class="input-group w-auto flex-fill">
    <input class="form-control bg--white" name="search" placeholder="{{ __($placeholder) }}" type="search" value="{{ request()->search }}">
    <button class="btn {{ $btn }}" type="submit"><i class="la la-search"></i></button>
</div>
