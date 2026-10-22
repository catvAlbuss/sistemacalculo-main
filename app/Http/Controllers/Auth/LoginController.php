<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\SignIn;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function __invoke(Request $request, SignIn $signIn)
    {
        $request->merge(['email' => is_string($request->input('email')) ? trim($request->input('email')) : $request->input('email')]);
        $data = $request->validate(['email' => 'required|string|email', 'password' => 'required|string']);
        $signIn->authenticate($data['email'], $data['password'], $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
