<table class="w-full table-fixed text-gray-800 dark:text-white">
  <colgroup>
    <col style="width: 40%;">
    <col style="width: 20%;">
    <col style="width: 20%;">
    <col style="width: 20%;">
  </colgroup>
  <x-thead-calc-input :$title></x-thead-calc-input>
  {{ $slot }}
</table>
