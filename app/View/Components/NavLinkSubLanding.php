<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use App\View\Components\NavLinkLanding;

class NavLinkSubLanding extends NavLinkLanding
{
    /**
     * Create a new component instance.
     */
    public function __construct(
        bool $active,
        public string $name
    ) {
        parent::__construct($active);
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.nav-link-sub-landing');
    }
}
