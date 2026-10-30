@props(['href', 'secondary' => false])
<a href="{{ $href }}" style="display:inline-block;margin:0 6px 8px 0;padding:11px 22px;font-size:13px;font-weight:bold;text-decoration:none;border:1px solid #12263f;{{ $secondary ? 'color:#12263f;background-color:#ffffff;' : 'color:#ffffff;background-color:#12263f;' }}">{{ $slot }}</a>
