<div x-show="showSubscriptionModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
    style="display: none;">
      <div class="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.away="showSubscriptionModal = false">
        <h2 class="text-xl font-bold mb-4">Gestionar Plan de <span class="text-blue-600"
                x-text="subscriptionData.name"></span></h2>

        <!-- Suscripción Actual -->
        <template x-if="subscriptionData.current_subscription">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4 border border-blue-200">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="font-semibold text-lg text-gray-800">Plan Actual</p>
                        <p class="text-blue-600 font-bold" x-text="subscriptionData.current_subscription.plan.name"></p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold"
                          :class="{
                              'bg-green-100 text-green-800': subscriptionData.current_subscription.status === 'active',
                              'bg-red-100 text-red-800': subscriptionData.current_subscription.status === 'cancelled',
                              'bg-yellow-100 text-yellow-800': subscriptionData.current_subscription.status === 'suspended'
                          }"
                          x-text="subscriptionData.current_subscription.status === 'active' ? 'Activo' : 
                                  subscriptionData.current_subscription.status === 'cancelled' ? 'Cancelado' : 'Suspendido'">
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-3">
                    <div>
                        <p class="text-gray-600">Inicio:</p>
                        <p class="font-medium" x-text="new Date(subscriptionData.current_subscription.starts_at).toLocaleDateString('es-PE')"></p>
                    </div>
                    <div>
                        <p class="text-gray-600">Expiración:</p>
                        <p class="font-medium" x-text="subscriptionData.subscription_ends_at ? new Date(subscriptionData.subscription_ends_at).toLocaleDateString('es-PE') : 'De por vida'"></p>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div class="flex flex-wrap gap-2 mt-3">
                    <!-- Cancelar Suscripción -->
                    <template x-if="subscriptionData.current_subscription.status === 'active'">
                        <form :action="`/subscription/${subscriptionData.current_subscription.id}`"
                            method="POST" class="inline-block"
                            onsubmit="return confirm('¿Estás seguro de cancelar (dar de baja) esta suscripción?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="text-xs bg-red-500 text-white py-1.5 px-3 rounded hover:bg-red-600 transition">
                                <i class="fas fa-times-circle mr-1"></i> Cancelar Plan
                            </button>
                        </form>
                    </template>

                    <!-- Suspender Suscripción -->
                    <template x-if="subscriptionData.current_subscription.status === 'active'">
                        <form :action="`/subscription/${subscriptionData.current_subscription.id}/suspend`"
                            method="POST" class="inline-block"
                            onsubmit="return confirm('¿Estás seguro de suspender esta suscripción?');">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="text-xs bg-yellow-500 text-white py-1.5 px-3 rounded hover:bg-yellow-600 transition">
                                <i class="fas fa-pause-circle mr-1"></i> Suspender
                            </button>
                        </form>
                    </template>

                    <!-- Reactivar Suscripción -->
                    <template x-if="subscriptionData.current_subscription.status === 'suspended'">
                        <form :action="`/subscription/${subscriptionData.current_subscription.id}/reactivate`"
                            method="POST" class="inline-block"
                            onsubmit="return confirm('¿Estás seguro de reactivar esta suscripción?');">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="text-xs bg-green-500 text-white py-1.5 px-3 rounded hover:bg-green-600 transition">
                                <i class="fas fa-play-circle mr-1"></i> Reactivar
                            </button>
                        </form>
                    </template>

                    <!-- Extender Suscripción -->
                    <template x-if="subscriptionData.current_subscription.status === 'active' && subscriptionData.subscription_ends_at">
                        <button @click="showExtendForm = !showExtendForm" 
                                class="text-xs bg-indigo-500 text-white py-1.5 px-3 rounded hover:bg-indigo-600 transition">
                            <i class="fas fa-calendar-plus mr-1"></i> Extender
                        </button>
                    </template>
                </div>

                <!-- Formulario de Extensión -->
                <template x-if="subscriptionData.current_subscription.status === 'active' && subscriptionData.subscription_ends_at">
                    <div x-show="showExtendForm" x-transition class="mt-3 pt-3 border-t border-blue-200">
                        <form :action="`/subscription/${subscriptionData.current_subscription.id}/extend`"
                            method="POST" class="flex gap-2 items-end">
                            @csrf
                            @method('PATCH')
                            <div class="flex-1">
                                <label class="block text-xs text-gray-600 mb-1">Días a extender:</label>
                                <input type="number" name="days" min="1" max="3650" value="30" required
                                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            <button type="submit" class="bg-indigo-600 text-white text-xs py-1.5 px-4 rounded hover:bg-indigo-700 transition">
                                Extender
                            </button>
                            <button type="button" @click="showExtendForm = false" class="bg-gray-300 text-gray-700 text-xs py-1.5 px-3 rounded hover:bg-gray-400 transition">
                                Cancelar
                            </button>
                        </form>
                    </div>
                </template>
            </div>
        </template>

        <!-- Sin Suscripción Activa -->
        <template x-if="!subscriptionData.current_subscription">
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-triangle text-yellow-400"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-yellow-700">Este usuario no tiene una suscripción activa.</p>
                    </div>
                </div>
            </div>
        </template>

        <hr class="my-4">

        <!-- Asignar/Cambiar Plan -->
        <h3 class="text-lg font-semibold mb-3 flex items-center">
            <i class="fas fa-exchange-alt text-blue-600 mr-2"></i>
            Asignar/Cambiar Plan
        </h3>
        <form :action="`/planUser/${subscriptionData.id}/subscription`" method="POST">
            @csrf
            <div class="mb-4">
                <label for="subscription_plan_id" class="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar Plan <span class="text-red-500">*</span>
                </label>
                <select name="subscription_plan_id" id="subscription_plan_id"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required>
                    <option value="">-- Seleccione un plan --</option>
                    @foreach ($plans as $plan)
                        <option value="{{ $plan->id }}">
                            {{ $plan->name }} - {{ $plan->formatted_price }} ({{ $plan->duration_text }})
                        </option>
                    @endforeach
                </select>
                <p class="text-xs text-gray-500 mt-1">
                    <i class="fas fa-info-circle"></i> Si el usuario tiene un plan activo, este será cancelado automáticamente.
                </p>
            </div>

            <div class="mb-4">
                <label for="ends_at" class="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Finalización (Opcional)
                </label>
                <input type="date" name="ends_at" id="ends_at"
                    :min="new Date().toISOString().split('T')[0]"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <p class="text-xs text-gray-500 mt-1">
                    <i class="fas fa-info-circle"></i> Dejar en blanco para usar la duración del plan. Para planes vitalicios se ignorará esta fecha.
                </p>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t">
                <button type="button" @click="showSubscriptionModal = false"
                    class="bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                    <i class="fas fa-times mr-1"></i> Cancelar
                </button>
                <button type="submit"
                    class="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition">
                    <i class="fas fa-check mr-1"></i> Asignar Plan
                </button>
            </div>
        </form>
    </div>
</div>
