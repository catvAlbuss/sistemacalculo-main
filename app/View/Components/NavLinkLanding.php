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
            ? 'block rounded-sm px-3 py-2 md:p-0 bg-blue-700 text-white md:bg-transparent md:text-blue-700 dark:text-white md:dark:text-blue-500'
            : 'block rounded-sm px-3 py-2 md:p-0 md:border-0 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent md:dark:hover:text-blue-500';
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
