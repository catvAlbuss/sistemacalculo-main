<?php

namespace App\Livewire;

use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Livewire\Component;
use Livewire\WithPagination;
use Illuminate\Support\Str;



class SubscriptionPlansManagement extends Component
{
    use WithPagination;

    public $name, $slug, $description, $price = 0, $duration_days;
    public $type = 'trial';
    public $is_active = true;
    public $features = [];
    public $featureInput = '';
    public $sort_order = 0;

    public $planId;
    public $isEditing = false;
    public $showModal = false;
    public $search = '';

    protected $paginationTheme = 'tailwind';

    protected function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:subscription_plans,slug,' . $this->planId,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_days' => 'required_unless:type,lifetime|nullable|integer|min:1',
            'type' => 'required|in:trial,monthly,yearly,lifetime',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ];
    }
    //resources/views/livewire/subscription-plans-management.blade.php
    public function render()
    {
        $plans = Subscription::with('activeSubscriptions')->get();

        Log::info('Planes obtenidos:', ['plans' => $plans->toArray()]);

        return view('livewire.subscription-plans-management', [
            'plans' => $plans,
        ]);
    }

    // public function render()
    // {
    //     $plans = Subscription::with('activeSubscriptions')
    //         ->when($this->search, function ($query) {
    //             $query->where('name', 'like', '%' . $this->search . '%')
    //                 ->orWhere('description', 'like', '%' . $this->search . '%');
    //         })
    //         ->ordered()
    //         ->paginate(10);
    //     Log::info('Planes obtenidos:', ['plans' => $plans->toArray()]);
    //     return view('livewire.subscription-plans-management', [
    //         'plans' => $plans,
    //     ]);
    // }

    public function updatedName($value)
    {
        if (!$this->isEditing) {
            $this->slug = Str::slug($value);
        }
    }

    public function updatedType($value)
    {
        // Establecer duración por defecto según tipo
        switch ($value) {
            case 'trial':
                $this->duration_days = 15;
                $this->price = 0;
                break;
            case 'monthly':
                $this->duration_days = 30;
                break;
            case 'yearly':
                $this->duration_days = 365;
                break;
            case 'lifetime':
                $this->duration_days = null;
                break;
        }
    }

    public function addFeature()
    {
        if (!empty(trim($this->featureInput))) {
            $this->features[] = trim($this->featureInput);
            $this->featureInput = '';
        }
    }

    public function removeFeature($index)
    {
        unset($this->features[$index]);
        $this->features = array_values($this->features);
    }

    public function openModal()
    {
        $this->resetForm();
        $this->showModal = true;
    }

    public function closeModal()
    {
        $this->showModal = false;
        $this->resetForm();
    }

    public function store()
    {
        $this->validate();

        $planData = [
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'duration_days' => $this->type === 'lifetime' ? null : $this->duration_days,
            'type' => $this->type,
            'is_active' => $this->is_active,
            'features' => $this->features,
            'sort_order' => $this->sort_order,
        ];

        Subscription::create($planData);

        session()->flash('message', 'Plan creado exitosamente.');
        $this->closeModal();
    }

    public function edit($id)
    {
        $plan = Subscription::findOrFail($id);

        $this->planId = $plan->id;
        $this->name = $plan->name;
        $this->slug = $plan->slug;
        $this->description = $plan->description;
        $this->price = $plan->price;
        $this->duration_days = $plan->duration_days;
        $this->type = $plan->type;
        $this->is_active = $plan->is_active;
        $this->features = $plan->features ?? [];
        $this->sort_order = $plan->sort_order;

        $this->isEditing = true;
        $this->showModal = true;
    }

    public function update()
    {
        $this->validate();

        $plan = Subscription::findOrFail($this->planId);

        $plan->update([
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'duration_days' => $this->type === 'lifetime' ? null : $this->duration_days,
            'type' => $this->type,
            'is_active' => $this->is_active,
            'features' => $this->features,
            'sort_order' => $this->sort_order,
        ]);

        session()->flash('message', 'Plan actualizado exitosamente.');
        $this->closeModal();
    }

    public function delete($id)
    {
        $plan = Subscription::findOrFail($id);

        // Verificar si hay suscripciones activas
        if ($plan->activeSubscriptions()->count() > 0) {
            session()->flash('error', 'No se puede eliminar el plan porque tiene suscripciones activas.');
            return;
        }

        $plan->delete();
        session()->flash('message', 'Plan eliminado exitosamente.');
    }

    public function toggleStatus($id)
    {
        $plan = Subscription::findOrFail($id);
        $plan->update(['is_active' => !$plan->is_active]);
        session()->flash('message', 'Estado del plan actualizado.');
    }

    private function resetForm()
    {
        $this->reset([
            'name',
            'slug',
            'description',
            'price',
            'duration_days',
            'type',
            'is_active',
            'features',
            'featureInput',
            'sort_order',
            'planId',
            'isEditing',
        ]);
        $this->resetValidation();
    }

    public function updatingSearch()
    {
        $this->resetPage();
    }
}
