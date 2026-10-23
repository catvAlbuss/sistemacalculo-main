// Standalone Predim uses the same Alpine navigation as the public Laravel pages.
// It does not mount Livewire or the application's PDF runtime.
import { Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';

window.Alpine = Alpine;
Alpine.start();
