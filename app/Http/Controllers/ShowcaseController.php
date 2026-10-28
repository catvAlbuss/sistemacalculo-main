<?php

namespace App\Http\Controllers;

use App\Services\ProductShowcase;
use Illuminate\Http\Request;

class ShowcaseController extends Controller
{
    public function home(ProductShowcase $catalog)
    {
        return response()->view('welcome', ['products' => $catalog->products(), 'videos' => $catalog->videos()]);
    }

    public function index(ProductShowcase $catalog)
    {
        $products = collect($catalog->products())->map(function ($product, $slug) {
            $info = app(\App\Services\ProgramInformation::class)->for($slug, $product);
            return array_merge($product, ['description' => $info['purpose'], 'features' => $info['outputs']]);
        })->all();
        return response()->view('showcase.index', ['products' => $products, 'videos' => $catalog->videos()]);
    }

    public function show(string $slug, ProductShowcase $catalog)
    {
        $product = $catalog->products()[$slug] ?? abort(404);
        $information = app(\App\Services\ProgramInformation::class)->for($slug, $product);
        $related = collect($catalog->products())->filter(fn ($item, $key) => $key !== $slug && $item['category'] === $product['category'])->take(3);
        return response()->view('showcase.product', compact('slug', 'product', 'information', 'related') + ['video' => $catalog->videos()->get($slug)]);
    }

    public function trial(Request $request, ProductShowcase $catalog)
    {
        if ($request->user()?->subscriptions()->exists()) {
            return redirect()->route('plans.mine')->with('subscription_notice', 'La prueba se ofrece una sola vez por cuenta. Revisa tu acceso o elige un plan pagado.');
        }
        $plan = $catalog->trialPlan();
        return $plan ? redirect()->route('planes.register', ['plan' => $plan->id])
            : redirect()->route('landing.plans')->withErrors(['subscription_plan_id' => 'La prueba no está disponible por el momento. Contacta con soporte.']);
    }
}
