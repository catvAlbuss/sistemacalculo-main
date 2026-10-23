import { Livewire } from '../../vendor/livewire/livewire/dist/livewire.esm';
import { pdfReady } from './app_begin';

pdfReady.catch(error => console.error('No se pudo cargar la exportación PDF:', error))
  .finally(() => Livewire.start());
