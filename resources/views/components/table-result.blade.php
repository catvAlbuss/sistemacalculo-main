<table class="w-full table-fixed text-gray-800 dark:text-white">
  <colgroup>
    <col style="width: 30%;">
    <col style="width: 10%;">
    <col style="width: 30%;">
    <col style="width: 15%;">
    <col style="width: 10%;">
  </colgroup>
  <x-thead-calc :$title></x-thead-calc>
  {{ $slot }}
</table>
