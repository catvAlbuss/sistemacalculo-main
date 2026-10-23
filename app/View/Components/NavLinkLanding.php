<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class NavLinkLanding extends Component
{
    /**
     * Create a new component instance.
     */
    /* public bool $active = false; */

    public function __construct(public bool $active)
    {
        //
    }

    public function get_class(): string
    {
        return $this->active
            ? 'en-nav-link is-active'
            : 'en-nav-link';
    }

    public function aria_current(): string
    {
        return $this->active ? 'page' : 'false';
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.nav-link-landing');
    }
}
