@props(['title'])
<p style="margin:22px 0 0;padding-bottom:7px;border-bottom:2px solid #12263f;color:#12263f;font-size:12px;font-weight:bold;letter-spacing:.6px;text-transform:uppercase;">{{ $title }}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">{{ $slot }}</table>
