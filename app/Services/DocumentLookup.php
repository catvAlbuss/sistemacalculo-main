<?php

namespace App\Services;

use App\Models\DocumentRecord;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DocumentLookup
{
    /** A RUC's address and status change more often than a person's name. */
    private const VALID_DAYS = ['DNI' => 365, 'RUC' => 180];

    public function enabled(): bool
    {
        return filled(config('services.apiperu.token'));
    }

    public function find(string $type, string $number): array
    {
        $key = hash_hmac('sha256', $type.':'.$number, config('app.key'));
        $record = DocumentRecord::where('lookup_key', $key)->first();
        $stored = $record?->readable();
        if ($stored && $record->looked_up_at->isAfter(now()->subDays(self::VALID_DAYS[$type]))) {
            return ['success' => true, 'data' => $stored];
        }
        if ($record && !$stored) {
            $record->delete();
        }
        $result = $this->query($type, $number, $key);
        if ($result['success']) {
            // Only provider answers are saved: what a customer types is never offered to another person.
            DocumentRecord::updateOrCreate(['lookup_key' => $key], ['data' => $result['data'], 'looked_up_at' => now()]);

            return $result;
        }

        // An old answer is better than none when the provider is down or out of credit.
        return $stored ? ['success' => true, 'data' => $stored] : $result;
    }

    private function query(string $type, string $number, string $key): array
    {
        if (!$this->enabled()) {
            return $this->failure('La consulta no está disponible. Puedes completar tus datos manualmente.');
        }
        if (Cache::has('document-missing:'.$key)) {
            return $this->failure('No encontramos datos para ese documento. Revisa el número o ingrésalos manualmente.');
        }
        $resource = strtolower($type);
        try {
            // One documented POST per lookup; no retries that could consume additional provider credit.
            $response = Http::withToken(config('services.apiperu.token'))->acceptJson()
                ->connectTimeout(3)->timeout(8)->post('https://api.apiperu.dev/'.$resource, [$resource => $number]);
        } catch (ConnectionException) {
            return $this->failure('La consulta no respondió. Puedes completar tus datos manualmente.');
        }
        $payload = $response->json();
        if ($response->status() === 404) {
            Cache::put('document-missing:'.$key, true, now()->addDay());
        }
        if (!$response->successful() || !is_array($payload) || ($payload['success'] ?? false) !== true || !is_array($payload['data'] ?? null)) {
            return $this->failure('No encontramos datos para ese documento. Revisa el número o ingrésalos manualmente.');
        }
        $data = $payload['data'];
        $returnedNumber = $data[$type === 'RUC' ? 'ruc' : 'numero'] ?? null;
        if (!is_scalar($returnedNumber) || (string) $returnedNumber !== $number) {
            return $this->failure('No pudimos confirmar los datos de ese documento. Puedes ingresarlos manualmente.');
        }
        if ($type === 'RUC') {
            $name = $this->field($data, 'nombre_o_razon_social');
            $address = $this->field($data, 'direccion_completa') ?: $this->field($data, 'direccion');
        } else {
            $name = trim(implode(' ', array_filter([
                $this->field($data, 'nombres'), $this->field($data, 'apellido_paterno'), $this->field($data, 'apellido_materno'),
            ]))) ?: $this->field($data, 'nombre_completo');
            $address = '';
        }
        if ($name === '') {
            return $this->failure('La consulta no devolvió un nombre. Puedes ingresarlo manualmente.');
        }
        $result = ['name' => mb_substr($name, 0, 255), 'address' => mb_substr($address, 0, 255)];
        if ($type === 'RUC') {
            foreach (['ubigeo_sunat', 'ubigeo'] as $locationKey) {
                $code = $data[$locationKey] ?? null;
                if (is_string($code) && preg_match('/^[0-9]{6}$/', $code) && \App\Models\Ubigeo::whereKey($code)->exists()) {
                    $result['ubigeo'] = $code;
                    break;
                }
            }
        }

        return ['success' => true, 'data' => $result];
    }

    private function field(array $data, string $key): string
    {
        return is_string($data[$key] ?? null) ? trim($data[$key]) : '';
    }

    private function failure(string $message): array
    {
        return ['success' => false, 'message' => $message];
    }
}
