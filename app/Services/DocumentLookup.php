<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class DocumentLookup
{
    public function enabled(): bool
    {
        return filled(config('services.apiperu.token'));
    }

    public function find(string $type, string $number): array
    {
        if (!$this->enabled()) {
            return $this->failure('La consulta no está disponible. Puedes completar tus datos manualmente.');
        }
        $key = 'document-lookup:'.hash('sha256', $type.':'.$number);
        if ($cached = Cache::get($key)) {
            return ['success' => true, 'data' => $cached];
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
        Cache::put($key, $result, now()->addHours(6));

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
