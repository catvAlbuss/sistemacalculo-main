<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path :d="icons[name] || icons.layers" />
  </svg>
</template>
<script setup>
defineProps({name:{type:String,default:'layers'}});
const icons = {
  brand:'M3 20V4h3l7 16h3V4M21 5h-3v14h3',
  foundation:'M9 2h6v12H9zM4 14h16v4H4zM2 21h20',
  agent:'m12 2 2 7 7 3-7 2-2 8-2-8-7-2 7-3z',
  results:'M3 3h18v18H3zm0 6h18M9 3v18M3 15h18',
  layers:'m12 2 10 5-10 5L2 7zm-10 10 10 5 10-5M2 17l10 5 10-5',
};
</script>
