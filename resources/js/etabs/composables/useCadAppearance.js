import {ref, onBeforeUnmount} from 'vue';

// Cambia unicamente la apariencia. El visor y el documento nunca se remontan.
export function useCadAppearance() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const theme = ref(media.matches ? 'dark' : 'light');
  const change = event => {theme.value = event.matches ? 'dark' : 'light';};
  media.addEventListener('change', change);
  onBeforeUnmount(() => media.removeEventListener('change', change));
  return {theme};
}
