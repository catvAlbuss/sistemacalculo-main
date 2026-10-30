@props(['label', 'strong' => false])
@php
    $size = $strong ? '15px' : '13px';
    $weight = $strong ? 'bold' : 'normal';
@endphp
<tr>
    <td style="padding:8px 12px 8px 0;border-bottom:1px solid #e7eaee;color:{{ $strong ? '#12263f' : '#6b7280' }};font-size:{{ $size }};font-weight:{{ $weight }};vertical-align:top;width:38%;">{{ $label }}</td>
    <td style="padding:8px 0;border-bottom:1px solid #e7eaee;color:#111827;font-size:{{ $size }};font-weight:{{ $weight }};text-align:right;vertical-align:top;word-break:break-word;">{{ $slot }}</td>
</tr>
