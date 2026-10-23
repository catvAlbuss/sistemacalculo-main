<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\PaymentTask;
use App\Services\PaymentTasks;
use App\Services\PeruvianBusinessDays;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ComplaintController extends Controller
{
    public function create()
    {
        return response()->view('legal.complaint-form', ['submissionKey' => (string) Str::uuid()])
            ->header('Cache-Control', 'private, no-store');
    }

    public function store(Request $request, PaymentTasks $tasks)
    {
        $data = $request->validate([
            'submission_key' => 'required|uuid', 'website' => 'nullable|size:0',
            'type' => 'required|in:reclamo,queja', 'name' => 'required|string|max:150',
            'document_type' => 'required|in:DNI,CE,PASAPORTE,RUC',
            'document_number' => ['required', 'string', 'max:20', 'regex:/^[a-zA-Z0-9-]+$/'],
            'address' => 'required|string|max:255', 'phone' => ['required', 'string', 'regex:/^[0-9+() -]{6,20}$/'],
            'email' => 'required|email|max:150', 'minor' => 'required|boolean',
            'guardian_name' => 'nullable|required_if:minor,1|string|max:150',
            'guardian_document' => 'nullable|required_if:minor,1|string|max:20',
            'guardian_address' => 'nullable|required_if:minor,1|string|max:255',
            'guardian_phone' => ['nullable', 'required_if:minor,1', 'string', 'regex:/^[0-9+() -]{6,20}$/'],
            'item_type' => 'required|in:producto,servicio', 'amount' => 'nullable|numeric|min:0|max:9999999.99',
            'item_description' => 'required|string|max:500', 'detail' => 'required|string|min:10|max:3000',
            'request' => 'required|string|min:5|max:2000', 'accept_privacy' => 'required|accepted',
        ]);
        if (($data['document_type'] === 'DNI' && !preg_match('/^\d{8}$/', $data['document_number']))
            || ($data['document_type'] === 'RUC' && !preg_match('/^\d{11}$/', $data['document_number']))) {
            throw ValidationException::withMessages(['document_number' => 'Ingresa 8 dígitos para DNI u 11 para RUC.']);
        }
        $key = $data['submission_key'];
        unset($data['submission_key'], $data['website'], $data['accept_privacy']);
        $data['email'] = strtolower(trim($data['email']));
        $data['minor'] = $request->boolean('minor');
        if (!$data['minor']) {
            foreach (['guardian_name', 'guardian_document', 'guardian_address', 'guardian_phone'] as $field) {
                $data[$field] = null;
            }
        }
        $fingerprint = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
        try {
            $complaint = Cache::lock('complaint:'.$key, 15)->block(3, fn () => DB::transaction(function () use ($key, $data, $fingerprint, $tasks) {
                $existing = Complaint::where('submission_key', $key)->lockForUpdate()->first();
                if ($existing) {
                    if (!hash_equals($existing->payload_hash, $fingerprint)) {
                        throw ValidationException::withMessages(['submission_key' => 'Esta hoja ya fue registrada con otros datos. Abre una nueva hoja.']);
                    }

                    return $existing;
                }
                $complaint = Complaint::create(array_merge($data, [
                    'submission_key' => $key, 'payload_hash' => $fingerprint,
                    'provider' => config('legal.provider'), 'legal_version' => config('legal.version'),
                    'due_on' => app(PeruvianBusinessDays::class)->deadline(CarbonImmutable::now('America/Lima'), 15),
                ]));
                $complaint->update(['code' => now('America/Lima')->format('Y').'-'.str_pad((string) $complaint->id, 6, '0', STR_PAD_LEFT)]);
                foreach (['complaint_copy', 'complaint_admin'] as $kind) {
                    $tasks->create($kind, null, ['complaint_id' => $complaint->id], (string) $complaint->id);
                }

                return $complaint;
            }));
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException) {
            throw ValidationException::withMessages(['submission_key' => 'La hoja se está guardando. Espera un momento y reintenta.']);
        }
        $this->dispatch($complaint, $tasks);

        return redirect($complaint->copyUrl())->with('success', 'Hoja registrada. Puedes imprimir tu copia; el envío al correo se procesará sin perder tu registro.');
    }

    public function copy(Complaint $complaint)
    {
        return response()->view('legal.complaint-copy', ['complaint' => $complaint, 'admin' => false])
            ->header('Cache-Control', 'private, no-store')->header('Referrer-Policy', 'no-referrer')->header('X-Robots-Tag', 'noindex, nofollow');
    }

    public function index(Request $request)
    {
        $filters = $request->validate(['status' => 'nullable|in:pending,answered,overdue', 'search' => 'nullable|string|max:100']);
        $complaints = Complaint::query()
            ->when($filters['status'] ?? null, function ($query, $status) {
                $status === 'overdue' ? $query->where('status', 'pending')->where('due_on', '<', today('America/Lima')->toDateString())
                    : $query->where('status', $status);
            })
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where(fn ($q) => $q->where('code', 'like', '%'.$search.'%')->orWhere('name', 'like', '%'.$search.'%')))
            ->orderBy('status', 'desc')->orderBy('due_on')->paginate(20)->withQueryString();

        return response()->view('legal.complaint-admin', compact('complaints'))->header('Cache-Control', 'private, no-store');
    }

    public function show(Complaint $complaint)
    {
        return response()->view('legal.complaint-copy', ['complaint' => $complaint, 'admin' => true,
            'tasks' => PaymentTask::whereIn('task_key', array_map(fn ($kind) => hash('sha256', $kind.':'.$complaint->id),
                ['complaint_copy', 'complaint_admin', 'complaint_answer']))->get(),
        ])->header('Cache-Control', 'private, no-store');
    }

    public function answer(Request $request, Complaint $complaint, PaymentTasks $tasks)
    {
        $data = $request->validate(['answer' => 'required|string|min:10|max:5000']);
        DB::transaction(function () use ($complaint, $data, $request, $tasks) {
            $locked = Complaint::whereKey($complaint->id)->lockForUpdate()->firstOrFail();
            if ($locked->status !== 'pending') {
                return;
            }
            $locked->update(['answer' => $data['answer'], 'status' => 'answered',
                'answered_by' => $request->user()->id, 'answered_at' => now()]);
            $tasks->create('complaint_answer', null, ['complaint_id' => $locked->id], (string) $locked->id);
        });
        $this->dispatch($complaint, $tasks);

        return back()->with('success', 'La primera respuesta quedó registrada. Su envío se procesa con reintentos.');
    }

    private function dispatch(Complaint $complaint, PaymentTasks $tasks): void
    {
        foreach (['complaint_copy', 'complaint_admin', 'complaint_answer'] as $kind) {
            $task = PaymentTask::where('task_key', hash('sha256', $kind.':'.$complaint->id))->first();
            if ($task) {
                $tasks->dispatch($task);
            }
        }
    }
}
