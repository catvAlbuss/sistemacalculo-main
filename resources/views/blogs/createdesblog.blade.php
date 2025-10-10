<x-app-layout>
    <x-slot name="header">
        <div class="flex">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('Blog') }}
            </h2>
        </div>
    </x-slot>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.1/dist/flowbite.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/flowbite@3.1.1/dist/flowbite.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-6 lg:px-8">
            <input type="hidden" name="previewblog" id="previewblog" value="{{ $blog->descripciondetall }}">
            <input type="hidden" id="blog-id" value="{{ $blog->id }}">
            <div class="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                    <div class="flex flex-wrap items-center">
                        <div class="flex items-center space-x-1 rtl:space-x-reverse flex-wrap">
                            <button id="toggleBoldButton" data-tooltip-target="tooltip-bold" type="button"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6" />
                                </svg>
                                <span class="sr-only">Bold</span>
                            </button>
                            <div id="tooltip-bold" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Negrita
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleItalicButton" data-tooltip-target="tooltip-italic" type="button"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="m8.874 19 6.143-14M6 19h6.33m-.66-14H18" />
                                </svg>
                                <span class="sr-only">Italic</span>
                            </button>
                            <div id="tooltip-italic" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                cursiva
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleUnderlineButton" data-tooltip-target="tooltip-underline" type="button"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                                        d="M6 19h12M8 5v9a4 4 0 0 0 8 0V5M6 5h4m4 0h4" />
                                </svg>
                                <span class="sr-only">Underline</span>
                            </button>
                            <div id="tooltip-underline" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                subrayado
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleStrikeButton" data-tooltip-target="tooltip-strike" type="button"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M7 6.2V5h12v1.2M7 19h6m.2-14-1.677 6.523M9.6 19l1.029-4M5 5l6.523 6.523M19 19l-7.477-7.477" />
                                </svg>
                                <span class="sr-only">Strike</span>
                            </button>
                            <div id="tooltip-strike" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Tachar texto
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleHighlightButton" data-tooltip-target="tooltip-highlight" type="button"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                                        d="M9 19.2H5.5c-.3 0-.5-.2-.5-.5V16c0-.2.2-.4.5-.4h13c.3 0 .5.2.5.4v2.7c0 .3-.2.5-.5.5H18m-6-1 1.4 1.8h.2l1.4-1.7m-7-5.4L12 4c0-.1 0-.1 0 0l4 8.8m-6-2.7h4m-7 2.7h2.5m5 0H17" />
                                </svg>
                                <span class="sr-only">Highlight</span>
                            </button>
                            <div id="tooltip-highlight" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Resaltar Texto
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleCodeButton" type="button" data-tooltip-target="tooltip-code"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="m8 8-4 4 4 4m8 0 4-4-4-4m-2-3-4 14" />
                                </svg>
                                <span class="sr-only">Code</span>
                            </button>
                            <div id="tooltip-code" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Código de formato
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleLinkButton" data-tooltip-target="tooltip-link" type="button"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961" />
                                </svg>
                                <span class="sr-only">Link</span>
                            </button>
                            <div id="tooltip-link" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Agregar Link
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="removeLinkButton" data-tooltip-target="tooltip-remove-link" type="button"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                                        d="M13.2 9.8a3.4 3.4 0 0 0-4.8 0L5 13.2A3.4 3.4 0 0 0 9.8 18l.3-.3m-.3-4.5a3.4 3.4 0 0 0 4.8 0L18 9.8A3.4 3.4 0 0 0 13.2 5l-1 1m7.4 14-1.8-1.8m0 0L16 16.4m1.8 1.8 1.8-1.8m-1.8 1.8L16 20" />
                                </svg>
                                <span class="sr-only">Remove link</span>
                            </button>
                            <div id="tooltip-remove-link" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Eliminar link
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleTextSizeButton" data-dropdown-toggle="textSizeDropdown" type="button"
                                data-tooltip-target="tooltip-text-size"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3" />
                                </svg>
                                <span class="sr-only">Text size</span>
                            </button>
                            <div id="tooltip-text-size" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Tamaño de texto
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <div id="textSizeDropdown"
                                class="z-10 hidden w-72 rounded-sm bg-white p-2 shadow-sm dark:bg-gray-700">
                                <ul class="space-y-1 text-sm font-medium" aria-labelledby="toggleTextSizeButton">
                                    <li>
                                        <button data-text-size="16px" type="button"
                                            class="flex justify-between items-center w-full text-base rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">16px
                                            (Default)
                                        </button>
                                    </li>
                                    <li>
                                        <button data-text-size="12px" type="button"
                                            class="flex justify-between items-center w-full text-xs rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">12px
                                            (Tiny)
                                        </button>
                                    </li>
                                    <li>
                                        <button data-text-size="14px" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">14px
                                            (Small)
                                        </button>
                                    </li>
                                    <li>
                                        <button data-text-size="18px" type="button"
                                            class="flex justify-between items-center w-full text-lg rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">18px
                                            (Lead)
                                        </button>
                                    </li>
                                    <li>
                                        <button data-text-size="24px" type="button"
                                            class="flex justify-between items-center w-full text-2xl rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">24px
                                            (Large)
                                        </button>
                                    </li>
                                    <li>
                                        <button data-text-size="36px" type="button"
                                            class="flex justify-between items-center w-full text-4xl rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">36px
                                            (Huge)
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <button id="toggleTextColorButton" data-dropdown-toggle="textColorDropdown"
                                type="button" data-tooltip-target="tooltip-text-color"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="25" height="24" fill="none" viewBox="0 0 25 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                                        d="m6.532 15.982 1.573-4m-1.573 4h-1.1m1.1 0h1.65m-.077-4 2.725-6.93a.11.11 0 0 1 .204 0l2.725 6.93m-5.654 0H8.1m.006 0h5.654m0 0 .617 1.569m5.11 4.453c0 1.102-.854 1.996-1.908 1.996-1.053 0-1.907-.894-1.907-1.996 0-1.103 1.907-4.128 1.907-4.128s1.909 3.025 1.909 4.128Z" />
                                </svg>
                                <span class="sr-only">Color</span>
                            </button>
                            <div id="tooltip-text-color" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Color
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <div id="textColorDropdown"
                                class="z-10 hidden w-48 rounded-sm bg-white p-2 shadow-sm dark:bg-gray-700">
                                <div
                                    class="grid grid-cols-6 gap-2 group mb-3 items-center p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input type="color" id="color" value="#e66465"
                                        class="border-gray-200 border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 rounded-md p-px px-1 hover:bg-gray-50 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 w-full h-8 col-span-3" />
                                    <label for="color"
                                        class="text-gray-500 dark:text-gray-400 text-sm font-medium col-span-3 group-hover:text-gray-900 dark:group-hover:text-white">Selecciona</label>
                                </div>
                                <div class="grid grid-cols-6 gap-1 mb-3">
                                    <button type="button" data-hex-color="#1A56DB" style="background-color: #1A56DB"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Blue</span></button>
                                    <button type="button" data-hex-color="#0E9F6E" style="background-color: #0E9F6E"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Green</span></button>
                                    <button type="button" data-hex-color="#FACA15" style="background-color: #FACA15"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Yellow</span></button>
                                    <button type="button" data-hex-color="#F05252" style="background-color: #F05252"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Red</span></button>
                                    <button type="button" data-hex-color="#FF8A4C" style="background-color: #FF8A4C"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Orange</span></button>
                                    <button type="button" data-hex-color="#0694A2" style="background-color: #0694A2"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Teal</span></button>
                                    <button type="button" data-hex-color="#B4C6FC" style="background-color: #B4C6FC"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Light indigo</span></button>
                                    <button type="button" data-hex-color="#8DA2FB" style="background-color: #8DA2FB"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Indigo</span></button>
                                    <button type="button" data-hex-color="#5145CD" style="background-color: #5145CD"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Purple</span></button>
                                    <button type="button" data-hex-color="#771D1D" style="background-color: #771D1D"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Brown</span></button>
                                    <button type="button" data-hex-color="#FCD9BD" style="background-color: #FCD9BD"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Light orange</span></button>
                                    <button type="button" data-hex-color="#99154B" style="background-color: #99154B"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Bordo</span></button>
                                    <button type="button" data-hex-color="#7E3AF2" style="background-color: #7E3AF2"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Dark Purple</span></button>
                                    <button type="button" data-hex-color="#CABFFD" style="background-color: #CABFFD"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Light</span></button>
                                    <button type="button" data-hex-color="#D61F69" style="background-color: #D61F69"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Dark Pink</span></button>
                                    <button type="button" data-hex-color="#F8B4D9" style="background-color: #F8B4D9"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Pink</span></button>
                                    <button type="button" data-hex-color="#F6C196" style="background-color: #F6C196"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Cream</span></button>
                                    <button type="button" data-hex-color="#A4CAFE" style="background-color: #A4CAFE"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Light Blue</span></button>
                                    <button type="button" data-hex-color="#5145CD" style="background-color: #5145CD"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Dark Blue</span></button>
                                    <button type="button" data-hex-color="#B43403" style="background-color: #B43403"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Orange Brown</span></button>
                                    <button type="button" data-hex-color="#FCE96A" style="background-color: #FCE96A"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Light Yellow</span></button>
                                    <button type="button" data-hex-color="#1E429F" style="background-color: #1E429F"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Navy Blue</span></button>
                                    <button type="button" data-hex-color="#768FFD" style="background-color: #768FFD"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Light Purple</span></button>
                                    <button type="button" data-hex-color="#BCF0DA" style="background-color: #BCF0DA"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Light Green</span></button>
                                    <button type="button" data-hex-color="#EBF5FF" style="background-color: #EBF5FF"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Sky Blue</span></button>
                                    <button type="button" data-hex-color="#16BDCA" style="background-color: #16BDCA"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Cyan</span></button>
                                    <button type="button" data-hex-color="#E74694" style="background-color: #E74694"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Pink</span></button>
                                    <button type="button" data-hex-color="#83B0ED" style="background-color: #83B0ED"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Darker Sky
                                            Blue</span></button>
                                    <button type="button" data-hex-color="#03543F" style="background-color: #03543F"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Forest Green</span></button>
                                    <button type="button" data-hex-color="#111928" style="background-color: #111928"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Black</span></button>
                                    <button type="button" data-hex-color="#4B5563" style="background-color: #4B5563"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Stone</span></button>
                                    <button type="button" data-hex-color="#6B7280" style="background-color: #6B7280"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Gray</span></button>
                                    <button type="button" data-hex-color="#D1D5DB" style="background-color: #D1D5DB"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Light Gray</span></button>
                                    <button type="button" data-hex-color="#F3F4F6" style="background-color: #F3F4F6"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Cloud Gray</span></button>
                                    <button type="button" data-hex-color="#F3F4F6" style="background-color: #F3F4F6"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Cloud Gray</span></button>
                                    <button type="button" data-hex-color="#F9FAFB" style="background-color: #F9FAFB"
                                        class="w-6 h-6 rounded-md"><span class="sr-only">Heaven Gray</span></button>
                                </div>
                                <button type="button" id="reset-color"
                                    class="py-1.5 text-sm font-medium text-gray-500 focus:outline-none bg-white rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:text-white w-full dark:hover:bg-gray-600">Reset
                                    color</button>
                            </div>
                            <button id="toggleFontFamilyButton" data-dropdown-toggle="fontFamilyDropdown"
                                type="button" data-tooltip-target="tooltip-font-family"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="m10.6 19 4.298-10.93a.11.11 0 0 1 .204 0L19.4 19m-8.8 0H9.5m1.1 0h1.65m7.15 0h-1.65m1.65 0h1.1m-7.7-3.985h4.4M3.021 16l1.567-3.985m0 0L7.32 5.07a.11.11 0 0 1 .205 0l2.503 6.945h-5.44Z" />
                                </svg>
                                <span class="sr-only">Fuentes</span>
                            </button>
                            <div id="tooltip-font-family" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Fuentes
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <div id="fontFamilyDropdown"
                                class="z-10 hidden w-48 rounded-sm bg-white p-2 shadow-sm dark:bg-gray-700">
                                <ul class="space-y-1 text-sm font-medium" aria-labelledby="toggleFontFamilyButton">
                                    <li>
                                        <button data-font-family="Inter, ui-sans-serif" type="button"
                                            class="flex justify-between items-center w-full text-sm font-sans rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">Default
                                        </button>
                                    </li>
                                    <li>
                                        <button data-font-family="Arial, sans-serif" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white"
                                            style="font-family: Arial, sans-serif;">Arial
                                        </button>
                                    </li>
                                    <li>
                                        <button data-font-family="'Courier New', monospace" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white"
                                            style="font-family: 'Courier New', monospace;">Courier New
                                        </button>
                                    </li>
                                    <li>
                                        <button data-font-family="Georgia, serif" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white"
                                            style="font-family: Georgia, serif;">Georgia
                                        </button>
                                    </li>
                                    <li>
                                        <button data-font-family="'Lucida Sans Unicode', sans-serif" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white"
                                            style="font-family: 'Lucida Sans Unicode', sans-serif;">Lucida Sans
                                            Unicode
                                        </button>
                                    </li>
                                    <li>
                                        <button data-font-family="Tahoma, sans-serif" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white"
                                            style="font-family: Tahoma, sans-serif;">Tahoma
                                        </button>
                                    </li>
                                    <li>
                                        <button data-font-family="'Times New Roman', serif;" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white"
                                            style="font-family: 'Times New Roman', serif;">Times New Roman
                                        </button>
                                    </li>
                                    <li>
                                        <button data-font-family="'Trebuchet MS', sans-serif" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white"
                                            style="font-family: 'Trebuchet MS', sans-serif;">Trebuchet MS
                                        </button>
                                    </li>
                                    <li>
                                        <button data-font-family="Verdana, sans-serif" type="button"
                                            class="flex justify-between items-center w-full text-sm rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white"
                                            style="font-family: Verdana, sans-serif;">Verdana
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div class="px-1">
                                <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                            </div>
                            <button id="toggleLeftAlignButton" type="button"
                                data-tooltip-target="tooltip-left-align"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="M6 6h8m-8 4h12M6 14h8m-8 4h12" />
                                </svg>
                                <span class="sr-only">Align left</span>
                            </button>
                            <div id="tooltip-left-align" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Alinear a la izquierda
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleCenterAlignButton" type="button"
                                data-tooltip-target="tooltip-center-align"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="M8 6h8M6 10h12M8 14h8M6 18h12" />
                                </svg>
                                <span class="sr-only">Align center</span>
                            </button>
                            <div id="tooltip-center-align" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Alinear a la Center
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <button id="toggleRightAlignButton" type="button"
                                data-tooltip-target="tooltip-right-align"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2" d="M18 6h-8m8 4H6m12 4h-8m8 4H6" />
                                </svg>
                                <span class="sr-only">Align right</span>
                            </button>
                            <div id="tooltip-right-align" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Alinear a la Derecha
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                            <div class="px-1">
                                <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                            </div>
                            <button id="toggleJSONButton" data-tooltip-target="tooltip-json"
                                data-modal-target="source-code-modal" data-modal-toggle="source-code-modal"
                                type="button"
                                class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6-2a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm0 0h-1a5 5 0 0 1-5-5v-.5" />
                                </svg>
                                <span class="sr-only">JSON</span>
                            </button>
                            <button type="button" id="actualizar-blog"
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Actualizar Blog
                            </button>
                            <div id="tooltip-json" role="tooltip"
                                class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                                Get JSON
                                <div class="tooltip-arrow" data-popper-arrow></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 pt-2 flex-wrap">
                        <button id="typographyDropdownButton" data-dropdown-toggle="typographyDropdown"
                            class="flex items-center justify-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-50 dark:bg-gray-600 dark:text-gray-400 dark:hover:bg-gray-500 dark:hover:text-white dark:focus:ring-gray-600"
                            type="button">
                            Formato
                            <svg class="-me-0.5 ms-1.5 h-3.5 w-3.5" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m19 9-7 7-7-7" />
                            </svg>
                        </button>
                        <div class="ps-1.5">
                            <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                        </div>
                        <!-- Heading Dropdown -->
                        <div id="typographyDropdown"
                            class="z-10 hidden w-72 rounded-sm bg-white p-2 shadow-sm dark:bg-gray-700">
                            <ul class="space-y-1 text-sm font-medium" aria-labelledby="typographyDropdownButton">
                                <li>
                                    <button id="toggleParagraphButton" type="button"
                                        class="flex justify-between items-center w-full text-base rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">Parrafo
                                        <div class="space-x-1.5">
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Cmd</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Alt</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">0</kbd>
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <button data-heading-level="1" type="button"
                                        class="flex justify-between items-center w-full text-base rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">Titulo
                                        1
                                        <div class="space-x-1.5">
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Cmd</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Alt</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">1</kbd>
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <button data-heading-level="2" type="button"
                                        class="flex justify-between items-center w-full text-base rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">Titulo
                                        2
                                        <div class="space-x-1.5">
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Cmd</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Alt</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">2</kbd>
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <button data-heading-level="3" type="button"
                                        class="flex justify-between items-center w-full text-base rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">Titulo
                                        3
                                        <div class="space-x-1.5">
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Cmd</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Alt</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">3</kbd>
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <button data-heading-level="4" type="button"
                                        class="flex justify-between items-center w-full text-base rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">Titulo
                                        4
                                        <div class="space-x-1.5">
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Cmd</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Alt</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">4</kbd>
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <button data-heading-level="5" type="button"
                                        class="flex justify-between items-center w-full text-base rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">Titulo
                                        5
                                        <div class="space-x-1.5">
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Cmd</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Alt</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">5</kbd>
                                        </div>
                                    </button>
                                </li>
                                <li>
                                    <button data-heading-level="6" type="button"
                                        class="flex justify-between items-center w-full text-base rounded-sm px-3 py-2 hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-600 dark:text-white">Titulo
                                        6
                                        <div class="space-x-1.5">
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Cmd</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">Alt</kbd>
                                            <kbd
                                                class="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500">6</kbd>
                                        </div>
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <button id="addImageButton" type="button" data-tooltip-target="tooltip-image"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd" d="M13 10a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z"
                                    clip-rule="evenodd" />
                                <path fill-rule="evenodd"
                                    d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 .556-.227 1.06-.593 1.422A.999.999 0 0 1 20.5 20H4a2.002 2.002 0 0 1-2-2V6Zm6.892 12 3.833-5.356-3.99-4.322a1 1 0 0 0-1.549.097L4 12.879V6h16v9.95l-3.257-3.619a1 1 0 0 0-1.557.088L11.2 18H8.892Z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span class="sr-only">Add image</span>
                        </button>
                        <div id="tooltip-image" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Imagen
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="addVideoButton" type="button" data-tooltip-target="tooltip-video"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd"
                                    d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Zm-2 4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H9Zm0 2h2v2H9v-2Zm7.965-.557a1 1 0 0 0-1.692-.72l-1.268 1.218a1 1 0 0 0-.308.721v.733a1 1 0 0 0 .37.776l1.267 1.032a1 1 0 0 0 1.631-.776v-2.984Z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span class="sr-only">Add video</span>
                        </button>
                        <div id="tooltip-video" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Video
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleListButton" type="button" data-tooltip-target="tooltip-list"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                                    d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5" />
                            </svg>
                            <span class="sr-only">Toggle list</span>
                        </button>
                        <div id="tooltip-list" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Lista
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleOrderedListButton" type="button"
                            data-tooltip-target="tooltip-ordered-list"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 6h8m-8 6h8m-8 6h8M4 16a2 2 0 1 1 3.321 1.5L4 20h5M4 5l2-1v6m-2 0h4" />
                            </svg>
                            <span class="sr-only">Toggle ordered list</span>
                        </button>
                        <div id="tooltip-ordered-list" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            lista ordenada
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleBlockquoteButton" type="button"
                            data-tooltip-target="tooltip-blockquote-list"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd"
                                    d="M6 6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3H5a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3h-1a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3Z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span class="sr-only">Toggle blockquote</span>
                        </button>
                        <div id="tooltip-blockquote-list" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Comillas
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleHRButton" type="button" data-tooltip-target="tooltip-hr-list"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 12h14" />
                                <path stroke="currentColor" stroke-linecap="round"
                                    d="M6 9.5h12m-12 9h12M6 7.5h12m-12 9h12M6 5.5h12m-12 9h12" />
                            </svg>
                            <span class="sr-only">Toggle Horizontal Rule</span>
                        </button>
                        <div id="tooltip-hr-list" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Linea Horizontal
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        {{-- Tablas --}}
                        <div class="ps-1.5">
                            <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                        </div>
                        <button id="addTableButton" type="button" data-tooltip-target="tooltip-table"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15v3c0 .5523.44772 1 1 1h10.5M3 15v-4m0 4h11M3 11V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5M3 11h18m0 0v1M8 11v8m4-8v8m4-8v2m1 4h2m0 0h2m-2 0v2m0-2v-2" />
                            </svg>
                            <span class="sr-only">Add table</span>
                        </button>
                        <div id="tooltip-table" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Agregar Tabla
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="deleteTableButton" type="button" data-tooltip-target="tooltip-delete-table"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h10.5M3 15.5v-4m0 4h11m-11-4v-5c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5m-18 0h18m0 0v1m-13-1v8m4-8v8m4-8v2m1.8956 5.9528 1.5047-1.5047m0 0 1.5048-1.5048m-1.5048 1.5048 1.4605 1.4604m-1.4605-1.4604-1.4604-1.4605" />
                            </svg>
                            <span class="sr-only">Delete table</span>
                        </button>
                        <div id="tooltip-delete-table" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Eliminar Table
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <div class="px-1">
                            <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                        </div>
                        <button id="addColumnBeforeButton" type="button"
                            data-tooltip-target="tooltip-add-column-before"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15 5.5v14m-8-7h2m0 0h2m-2 0v2m0-2v-2m12 1h-6m6 4h-6m-11 4h16c.5523 0 1-.4477 1-1v-12c0-.55228-.4477-1-1-1H4c-.55228 0-1 .44772-1 1v12c0 .5523.44772 1 1 1Z" />
                            </svg>
                            <span class="sr-only">Add column before</span>
                        </button>
                        <div id="tooltip-add-column-before" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Agregar columna antes
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="addColumnAfterButton" type="button"
                            data-tooltip-target="tooltip-add-column-after"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5.5v14m8-7h-2m0 0h-2m2 0v2m0-2v-2m-12 1h6m-6 4h6m11 4H4c-.55228 0-1-.4477-1-1v-12c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z" />
                            </svg>
                            <span class="sr-only">Add column after</span>
                        </button>
                        <div id="tooltip-add-column-after" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Agregar columna despues
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="removeColumnButton" type="button" data-tooltip-target="tooltip-remove-column"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5.5v14m-6-8h6m-6 4h6m4.5061-1.4939L15.0123 12.5m0 0 1.5061-1.5061M15.0123 12.5l1.5061 1.5061M15.0123 12.5l-1.5062-1.5061M20 19.5H4c-.55228 0-1-.4477-1-1v-12c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v12c0 .5523-.4477 1-1 1Z" />
                            </svg>
                            <span class="sr-only">Remove column</span>
                        </button>
                        <div id="tooltip-remove-column" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Eliminar Columna
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <div class="px-1">
                            <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                        </div>
                        <button id="addRowBeforeButton" type="button" data-tooltip-target="tooltip-add-row-before"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-3m-18 0v-9c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v9m-18 0h18m-13 0v4m4-4v4m4-4v4m-6-9h2m0 0h2m-2 0v2m0-2v-2" />
                            </svg>
                            <span class="sr-only">Add row before</span>
                        </button>
                        <div id="tooltip-add-row-before" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Agregar fila antes
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="addRowAfterButton" type="button" data-tooltip-target="tooltip-add-row-after"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 9.5v-3c0-.55228.44772-1 1-1h16c.5523 0 1 .44771 1 1v3m-18 0v9c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-9m-18 0h18m-13 0v-4m4 4v-4m4 4v-4m-6 9h2m0 0h2m-2 0v-2m0 2v2" />
                            </svg>
                            <span class="sr-only">Add row after</span>
                        </button>
                        <div id="tooltip-add-row-after" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Agregar fila despues
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="removeRowButton" type="button" data-tooltip-target="tooltip-remove-row"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-3m-18 0v-9c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v9m-18 0h18m-13 0v4m4-4v4m4-4v4m-5.5061-7.4939L12 10.5m0 0 1.5061-1.50614M12 10.5l1.5061 1.5061M12 10.5l-1.5061-1.50614" />
                            </svg>
                            <span class="sr-only">Remove row</span>
                        </button>
                        <div id="tooltip-remove-row" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Eliminar fila
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <div class="px-1">
                            <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                        </div>
                        <button id="mergeCellsButton" type="button" data-tooltip-target="tooltip-merge-cells"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M10 18.5v2H4v-16h6v2m4 12v2h6v-16h-6v2m-6.49543 8.4954L10 12.5m0 0-2.49543-2.4954M10 12.5H4.05191m12.50199 2.5539L14 12.5m0 0 2.5539-2.55392M14 12.5h5.8319" />
                            </svg>
                            <span class="sr-only">Merge cells</span>
                        </button>
                        <div id="tooltip-merge-cells" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Fusionar celdas
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="splitCellsButton" type="button" data-tooltip-target="tooltip-split-cells"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 18.5v2h6v-16H4v2m16 12v2h-6v-16h6v2M6.49545 14.9954 4.00003 12.5m0 0 2.49542-2.4954M4.00003 12.5h5.94809m7.49798 2.5539L20 12.5m0 0-2.5539-2.55392M20 12.5h-5.8319" />
                            </svg>
                            <span class="sr-only">Split cells</span>
                        </button>
                        <div id="tooltip-split-cells" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Dividir celdas
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="mergeOrSplitButton" type="button" data-tooltip-target="tooltip-merge-or-split"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M18.5045 14.9954 21 12.5m0 0-2.4955-2.4954M21 12.5h-5.9481m-9.49798 2.5539L3 12.5m0 0 2.55392-2.55392M3 12.5h5.83192m.16807 7v-14H15v14H8.99999Z" />
                            </svg>
                            <span class="sr-only">Merge or split</span>
                        </button>
                        <div id="tooltip-merge-or-split" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Fusionar o dividir
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <div class="px-1">
                            <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                        </div>
                        <button id="toggleHeaderColumnButton" type="button"
                            data-tooltip-target="tooltip-toggle-header-column"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15 5.5v14m6-8h-6m6 4h-6m-9-3h1.99093M4 19.5h16c.5523 0 1-.4477 1-1v-12c0-.55228-.4477-1-1-1H4c-.55228 0-1 .44772-1 1v12c0 .5523.44772 1 1 1Zm8-7c0 1.1046-.8954 2-2 2-1.10457 0-2-.8954-2-2s.89543-2 2-2c1.1046 0 2 .8954 2 2Z" />
                            </svg>
                            <span class="sr-only">Toggle header column</span>
                        </button>
                        <div id="tooltip-toggle-header-column" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Alternar columna de encabezado
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleHeaderRowButton" type="button"
                            data-tooltip-target="tooltip-toggle-header-row"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-3m-18 0v-9c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v9m-18 0h18m-13 0v4m4-4v4m4-4v4m-7-9h1.9909M15 10.5c0 1.1046-.8954 2-2 2s-2-.8954-2-2c0-1.10457.8954-2 2-2s2 .89543 2 2Z" />
                            </svg>
                            <span class="sr-only">Toggle header row</span>
                        </button>
                        <div id="tooltip-toggle-header-row" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Alternar fila de encabezado
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="toggleHeaderCellButton" type="button"
                            data-tooltip-target="tooltip-toggle-header-cell"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h16c.5523 0 1-.4477 1-1v-3m-18 0v-9c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v9m-18 0h18m-13 0v4m4-4v4m4-4v4m-7-9h1.9909M15 10.5c0 1.1046-.8954 2-2 2s-2-.8954-2-2c0-1.10457.8954-2 2-2s2 .89543 2 2Z" />
                            </svg>
                            <span class="sr-only">Toggle header cell</span>
                        </button>
                        <div id="tooltip-toggle-header-cell" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Alternar celda de encabezado
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button data-modal-toggle="cell-attribute-modal" data-modal-target="cell-attribute-modal"
                            type="button" data-tooltip-target="tooltip-add-cell-attribute"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h8v-8m-9 4v-4m0 4h9m-9-4v-5c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v4m-18 1h11m6.25 5c0 1.2426-1.0073 2.25-2.25 2.25m2.25-2.25c0-1.2426-1.0073-2.25-2.25-2.25m2.25 2.25H21m-3 2.25c-1.2426 0-2.25-1.0074-2.25-2.25M18 18.75v.75m-2.25-3c0-1.2426 1.0074-2.25 2.25-2.25m-2.25 2.25H15m3-2.25v-.75m-1.591 1.409-.5303-.5303m4.2426 4.2426-.5303-.5303m-3.182 0-.5303.5303m4.2426-4.2426-.5303.5303" />
                            </svg>
                            <span class="sr-only">Add cell attribute</span>
                        </button>
                        <div id="tooltip-add-cell-attribute" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Agregar atributo de celda
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <div class="px-1">
                            <span class="block w-px h-4 bg-gray-300 dark:bg-gray-600"></span>
                        </div>
                        <button id="fixTablesButton" type="button" data-tooltip-target="tooltip-fix-tables"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h4v-4m-5 0v-4m0 4h5m-5-4v-5c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v1.98935M3 11.5h5v4m9.4708 4.1718-.8696-1.4388-2.8164-.235-2.573-4.2573 1.4873-2.8362 1.4441 2.3893c.3865.6396 1.2183.8447 1.8579.4582.6396-.3866.8447-1.2184.4582-1.858l-1.444-2.38925h3.1353l2.6101 4.27715-1.0713 2.5847.8695 1.4388" />
                            </svg>
                            <span class="sr-only">Fix tables</span>
                        </button>
                        <div id="tooltip-fix-tables" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Arreglar tablas
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="previousCellButton" type="button" data-tooltip-target="tooltip-previous-cell"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h9.5M3 15.5v-4m0 4h9m-9-4v-5c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5H3Zm5 0v8m4-8v8m5.9001-1.0999L16 16.5m0 0 1.9001-1.9001M16 16.5h5" />
                            </svg>
                            <span class="sr-only">Previous cell</span>
                        </button>
                        <div id="tooltip-previous-cell" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Celda anterior
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                        <button id="nextCellButton" type="button" data-tooltip-target="tooltip-next-cell"
                            class="p-1.5 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 15.5v3c0 .5523.44772 1 1 1h9.5M3 15.5v-4m0 4h9m-9-4v-5c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5H3Zm5 0v8m4-8v8m7.0999-1.0999L21 16.5m0 0-1.9001-1.9001M21 16.5h-5" />
                            </svg>
                            <span class="sr-only">Next cell</span>
                        </button>
                        <div id="tooltip-next-cell" role="tooltip"
                            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                            Siguiente celda
                            <div class="tooltip-arrow" data-popper-arrow></div>
                        </div>
                    </div>
                </div>
                <div class="px-4 py-2 bg-white rounded-b-lg dark:bg-gray-800">
                    <label for="wysiwyg-example" class="sr-only">Publish post</label>
                    <div id="wysiwyg-example" class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                        style="max-height: 400px; overflow-y: auto;">
                    </div>
                </div>
                <div id="cell-attribute-modal" tabindex="-1" aria-hidden="true"
                    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div class="relative p-4 w-full max-w-md max-h-full">
                        <!-- Modal content -->
                        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                            <!-- Modal header -->
                            <div
                                class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                    Add cell attribute
                                </h3>
                                <button type="button"
                                    class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    data-modal-hide="cell-attribute-modal">
                                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span class="sr-only">Close modal</span>
                                </button>
                            </div>
                            <!-- Modal body -->
                            <div class="p-4 md:p-5">
                                <form id="addCellAttributeForm" class="space-y-4" action="#">
                                    <div>
                                        <label for="attribute-name"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Attribute
                                            name</label>
                                        <input type="text" name="attribute-name" id="attribute-name"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                            value="backgroundColor" placeholder="eg. backgroundColor" />
                                    </div>
                                    <div>
                                        <label for="attribute-value"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Attribute
                                            value</label>
                                        <input type="text" name="attribute-value" id="attribute-value"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                            value="#E1EFFE;" placeholder="#E1EFFE;" />
                                    </div>
                                    <button type="submit" id="addCellAttributeButton"
                                        class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Set
                                        attribute</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="source-code-modal" tabindex="-1" aria-hidden="true"
                    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div class="relative p-4 w-full max-w-xl max-h-full">
                        <!-- Modal content -->
                        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                            <!-- Modal header -->
                            <div
                                class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                    JSON/HTML data export result
                                </h3>
                                <button type="button"
                                    class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                    data-modal-hide="source-code-modal">
                                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span class="sr-only">Close modal</span>
                                </button>
                            </div>
                            <!-- Modal body -->
                            <div
                                class="p-4 md:p-5 format lg:format-lg dark:format-invert focus:outline-none format-blue max-w-none">
                                <pre><code id="sourceCode"></code></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script type="module">
        import {
            Editor
        } from 'https://esm.sh/@tiptap/core@2.6.6';
        import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.6.6';
        import Highlight from 'https://esm.sh/@tiptap/extension-highlight@2.6.6';
        import Underline from 'https://esm.sh/@tiptap/extension-underline@2.6.6';
        import Link from 'https://esm.sh/@tiptap/extension-link@2.6.6';
        import TextAlign from 'https://esm.sh/@tiptap/extension-text-align@2.6.6';
        import Image from 'https://esm.sh/@tiptap/extension-image@2.6.6';
        import YouTube from 'https://esm.sh/@tiptap/extension-youtube@2.6.6';
        import TextStyle from 'https://esm.sh/@tiptap/extension-text-style@2.6.6';
        import FontFamily from 'https://esm.sh/@tiptap/extension-font-family@2.6.6';
        import {
            Color
        } from 'https://esm.sh/@tiptap/extension-color@2.6.6';
        import Bold from 'https://esm.sh/@tiptap/extension-bold@2.6.6'; // Import the Bold extension
        import Table from 'https://esm.sh/@tiptap/extension-table@2.6.6';
        import TableCell from 'https://esm.sh/@tiptap/extension-table-cell@2.6.6';
        import TableHeader from 'https://esm.sh/@tiptap/extension-table-header@2.6.6';
        import TableRow from 'https://esm.sh/@tiptap/extension-table-row@2.6.6';


        const previsual = document.getElementById('previewblog').value;
        const informacionBlog1 = JSON.parse(previsual);

        // const informacionBlog1 = {
        //     "type": "doc",
        //     "content": [{
        //             "type": "paragraph",
        //             "attrs": {
        //                 "textAlign": "left"
        //             }
        //         },
        //         {
        //             "type": "image",
        //             "attrs": {
        //                 "src": "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70._SX1080_FMjpg_.jpg",
        //                 "alt": null,
        //                 "title": null
        //             }
        //         },
        //         {
        //             "type": "paragraph",
        //             "attrs": {
        //                 "textAlign": "left"
        //             },
        //             "content": [{
        //                     "type": "text",
        //                     "text": "La Empresa R&A es una emprea munti nacional"
        //                 },
        //                 {
        //                     "type": "text",
        //                     "marks": [{
        //                         "type": "bold"
        //                     }],
        //                     "text": "open-source library of UI components"
        //                 },
        //                 {
        //                     "type": "text",
        //                     "text": " based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more."
        //                 }
        //             ]
        //         },
        //         {
        //             "type": "paragraph",
        //             "attrs": {
        //                 "textAlign": "left"
        //             },
        //             "content": [{
        //                 "type": "text",
        //                 "text": "It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.gdfgfdgdfgdgdgdgd"
        //             }]
        //         },
        //         {
        //             "type": "paragraph",
        //             "attrs": {
        //                 "textAlign": "left"
        //             },
        //             "content": [{
        //                 "type": "text",
        //                 "text": "Here is an example of a button component:"
        //             }]
        //         },
        //         {
        //             "type": "table",
        //             "content": [{
        //                     "type": "tableRow",
        //                     "content": [{
        //                             "type": "tableHeader",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "#"
        //                                 }]
        //                             }]
        //                         },
        //                         {
        //                             "type": "tableHeader",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "Poryectos"
        //                                 }]
        //                             }]
        //                         },
        //                         {
        //                             "type": "tableHeader",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "Reprentante"
        //                                 }]
        //                             }]
        //                         }
        //                     ]
        //                 },
        //                 {
        //                     "type": "tableRow",
        //                     "content": [{
        //                             "type": "tableCell",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null,
        //                                 "backgroundColor": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "01"
        //                                 }]
        //                             }]
        //                         },
        //                         {
        //                             "type": "tableCell",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null,
        //                                 "backgroundColor": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "Proyecto Rizabal Asociados"
        //                                 }]
        //                             }]
        //                         },
        //                         {
        //                             "type": "tableCell",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null,
        //                                 "backgroundColor": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "Gobierno regional huanuco"
        //                                 }]
        //                             }]
        //                         }
        //                     ]
        //                 },
        //                 {
        //                     "type": "tableRow",
        //                     "content": [{
        //                             "type": "tableCell",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null,
        //                                 "backgroundColor": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "02"
        //                                 }]
        //                             }]
        //                         },
        //                         {
        //                             "type": "tableCell",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null,
        //                                 "backgroundColor": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "Poryecto Construye "
        //                                 }]
        //                             }]
        //                         },
        //                         {
        //                             "type": "tableCell",
        //                             "attrs": {
        //                                 "colspan": 1,
        //                                 "rowspan": 1,
        //                                 "colwidth": null,
        //                                 "backgroundColor": null
        //                             },
        //                             "content": [{
        //                                 "type": "paragraph",
        //                                 "attrs": {
        //                                     "textAlign": "left"
        //                                 },
        //                                 "content": [{
        //                                     "type": "text",
        //                                     "text": "Gobierno regional Pasco"
        //                                 }]
        //                             }]
        //                         }
        //                     ]
        //                 }
        //             ]
        //         },
        //         {
        //             "type": "paragraph",
        //             "attrs": {
        //                 "textAlign": "left"
        //             },
        //             "content": [{
        //                 "type": "text",
        //                 "marks": [{
        //                     "type": "code"
        //                 }],
        //                 "text": "<button type=\"button\" class=\"text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800\">Default</button>"
        //             }]
        //         },
        //         {
        //             "type": "paragraph",
        //             "attrs": {
        //                 "textAlign": "left"
        //             },
        //             "content": [{
        //                     "type": "text",
        //                     "text": "Learn more about all components from the "
        //                 },
        //                 {
        //                     "type": "text",
        //                     "marks": [{
        //                         "type": "link",
        //                         "attrs": {
        //                             "href": "https://flowbite.com/docs/getting-started/introduction/",
        //                             "target": "_blank",
        //                             "rel": "noopener noreferrer nofollow",
        //                             "class": null
        //                         }
        //                     }],
        //                     "text": "Flowbite Docs"
        //                 },
        //                 {
        //                     "type": "text",
        //                     "text": "."
        //                 }
        //             ]
        //         }
        //     ]
        // };

        const TipTapExtensionTableCell = TableCell.extend({
            addAttributes() {
                return {
                    ...this.parent?.(),
                    backgroundColor: {
                        default: null,
                        renderHTML: (attributes) => {
                            if (!attributes.backgroundColor) {
                                return {}
                            }

                            return {
                                style: 'background-color: ' + attributes.backgroundColor,
                            }
                        },
                        parseHTML: (element) => {
                            return element.style.backgroundColor.replace(/['"]+/g, '')
                        },
                    },
                }
            },
        });

        window.addEventListener('load', function() {
            if (document.getElementById("wysiwyg-example")) {
                const FontSizeTextStyle = TextStyle.extend({
                    addAttributes() {
                        return {
                            fontSize: {
                                default: null,
                                parseHTML: element => element.style.fontSize,
                                renderHTML: attributes => {
                                    if (!attributes.fontSize) {
                                        return {};
                                    }
                                    return {
                                        style: 'font-size: ' + attributes.fontSize
                                    };
                                },
                            },
                        };
                    },
                });
                const CustomBold = Bold.extend({
                    // Override the renderHTML method
                    renderHTML({
                        mark,
                        HTMLAttributes
                    }) {
                        const {
                            style,
                            ...rest
                        } = HTMLAttributes;

                        // Merge existing styles with font-weight
                        const newStyle = 'font-weight: bold;' + (style ? ' ' + style : '');

                        return ['span', {
                            ...rest,
                            style: newStyle.trim()
                        }, 0];
                    },
                    // Ensure it doesn't exclude other marks
                    addOptions() {
                        return {
                            ...this.parent?.(),
                            HTMLAttributes: {},
                        };
                    },
                });
                // tip tap editor setup
                const editor = new Editor({
                    element: document.querySelector('#wysiwyg-example'),
                    extensions: [
                        StarterKit.configure({
                            textStyle: false,
                            bold: false,
                            marks: {
                                bold: false,
                            },
                        }),
                        Table.configure({
                            resizable: true,
                        }),
                        TableRow,
                        TableHeader,
                        TableCell,
                        TipTapExtensionTableCell,
                        // Include the custom Bold extension
                        CustomBold,
                        TextStyle,
                        Color,
                        FontSizeTextStyle,
                        FontFamily,
                        Highlight,
                        Underline,
                        Link.configure({
                            openOnClick: false,
                            autolink: true,
                            defaultProtocol: 'https',
                        }),
                        TextAlign.configure({
                            types: ['heading', 'paragraph'],
                        }),
                        Image,
                        YouTube,
                    ],
                    //Cargas de informacion
                    //content: '<p>Flowbite is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p><p>Here is an example of a button component:</p><code>&#x3C;button type=&#x22;button&#x22; class=&#x22;text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800&#x22;&#x3E;Default&#x3C;/button&#x3E;</code><p>Learn more about all components from the <a href="https://flowbite.com/docs/getting-started/introduction/">Flowbite Docs</a>.</p>',
                    content: informacionBlog1,
                    editorProps: {
                        attributes: {
                            class: 'format lg:format-lg dark:format-invert focus:outline-none format-blue max-w-none',
                        },
                    }
                });

                // Botón para actualizar
                document.getElementById('actualizar-blog').addEventListener('click', function() {
                    const contenidoEditor = editor.getJSON();
                    const id = document.getElementById('blog-id').value;

                    const data = {
                        descripciondetall: JSON.stringify(contenidoEditor),
                    };
                    $.ajax({
                        url: `/blogs/${id}/updateblogdetaill`,
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        },
                        data: data,
                        success: function(response) {
                            if (response.success) {
                                Swal.fire({
                                    icon: 'success',
                                    title: '¡Éxito!',
                                    text: 'Blog actualizado correctamente.',
                                    confirmButtonText: 'Aceptar'
                                }).then(() => {
                                    window.location.href =
                                        '{{ route('blogs_list') }}';
                                });
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: '¡Error!',
                                    text: 'Error al actualizar el blog.',
                                    confirmButtonText: 'Aceptar'
                                });
                            }
                        },
                        error: function(xhr, status, error) {
                            Swal.fire({
                                icon: 'error',
                                title: '¡Error!',
                                text: 'Error al actualizar el blog.',
                                confirmButtonText: 'Aceptar'
                            });
                        },
                    });
                });

                // set up custom event listeners for the buttons
                document.getElementById('toggleBoldButton').addEventListener('click', () => editor.chain().focus()
                    .toggleBold().run());
                document.getElementById('toggleItalicButton').addEventListener('click', () => editor.chain().focus()
                    .toggleItalic().run());
                document.getElementById('toggleUnderlineButton').addEventListener('click', () => editor.chain()
                    .focus().toggleUnderline().run());
                document.getElementById('toggleStrikeButton').addEventListener('click', () => editor.chain().focus()
                    .toggleStrike().run());
                document.getElementById('toggleHighlightButton').addEventListener('click', () => {
                    const isHighlighted = editor.isActive('highlight');
                    // when using toggleHighlight(), judge if is is already highlighted.
                    editor.chain().focus().toggleHighlight({
                        color: isHighlighted ? undefined :
                            '#ffc078' // if is already highlighted，unset the highlight color
                    }).run();
                });

                document.getElementById('toggleLinkButton').addEventListener('click', () => {
                    const url = window.prompt('Enter image URL:', 'https://flowbite.com');
                    editor.chain().focus().toggleLink({
                        href: url
                    }).run();
                });
                document.getElementById('removeLinkButton').addEventListener('click', () => {
                    editor.chain().focus().unsetLink().run()
                });
                document.getElementById('toggleCodeButton').addEventListener('click', () => {
                    editor.chain().focus().toggleCode().run();
                })

                document.getElementById('toggleLeftAlignButton').addEventListener('click', () => {
                    editor.chain().focus().setTextAlign('left').run();
                });
                document.getElementById('toggleCenterAlignButton').addEventListener('click', () => {
                    editor.chain().focus().setTextAlign('center').run();
                });
                document.getElementById('toggleRightAlignButton').addEventListener('click', () => {
                    editor.chain().focus().setTextAlign('right').run();
                });
                document.getElementById('toggleListButton').addEventListener('click', () => {
                    editor.chain().focus().toggleBulletList().run();
                });
                document.getElementById('toggleOrderedListButton').addEventListener('click', () => {
                    editor.chain().focus().toggleOrderedList().run();
                });
                document.getElementById('toggleBlockquoteButton').addEventListener('click', () => {
                    editor.chain().focus().toggleBlockquote().run();
                });
                document.getElementById('toggleHRButton').addEventListener('click', () => {
                    editor.chain().focus().setHorizontalRule().run();
                });
                document.getElementById('addImageButton').addEventListener('click', () => {
                    const url = window.prompt('Enter image URL:', 'https://placehold.co/600x400');
                    if (url) {
                        editor.chain().focus().setImage({
                            src: url
                        }).run();
                    }
                });
                document.getElementById('addVideoButton').addEventListener('click', () => {
                    const url = window.prompt('Enter YouTube URL:',
                        'https://www.youtube.com/watch?v=KaLxCiilHns');
                    if (url) {
                        editor.commands.setYoutubeVideo({
                            src: url,
                            width: 640,
                            height: 480,
                        })
                    }
                });

                // typography dropdown
                const typographyDropdown = FlowbiteInstances.getInstance('Dropdown', 'typographyDropdown');

                document.getElementById('toggleParagraphButton').addEventListener('click', () => {
                    editor.chain().focus().setParagraph().run();
                    typographyDropdown.hide();
                });

                document.querySelectorAll('[data-heading-level]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const level = button.getAttribute('data-heading-level');
                        editor.chain().focus().toggleHeading({
                            level: parseInt(level)
                        }).run()
                        typographyDropdown.hide();
                    });
                });

                const textSizeDropdown = FlowbiteInstances.getInstance('Dropdown', 'textSizeDropdown');

                // Loop through all elements with the data-text-size attribute
                document.querySelectorAll('[data-text-size]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const fontSize = button.getAttribute('data-text-size');

                        // Apply the selected font size via pixels using the TipTap editor chain
                        editor.chain().focus().setMark('textStyle', {
                            fontSize
                        }).run();

                        // Hide the dropdown after selection
                        textSizeDropdown.hide();
                    });
                });

                // Listen for color picker changes
                const colorPicker = document.getElementById('color');
                colorPicker.addEventListener('input', (event) => {
                    const selectedColor = event.target.value;

                    // Apply the selected color to the selected text
                    editor.chain().focus().setColor(selectedColor).run();
                })

                document.querySelectorAll('[data-hex-color]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const selectedColor = button.getAttribute('data-hex-color');

                        // Apply the selected color to the selected text
                        editor.chain().focus().setColor(selectedColor).run();
                    });
                });

                document.getElementById('reset-color').addEventListener('click', () => {
                    editor.commands.unsetColor();
                })

                const fontFamilyDropdown = FlowbiteInstances.getInstance('Dropdown', 'fontFamilyDropdown');

                // Loop through all elements with the data-font-family attribute
                document.querySelectorAll('[data-font-family]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const fontFamily = button.getAttribute('data-font-family');

                        // Apply the selected font size via pixels using the TipTap editor chain
                        editor.chain().focus().setFontFamily(fontFamily).run();

                        // Hide the dropdown after selection
                        fontFamilyDropdown.hide();
                    });
                });

                // set up custom event listeners for the buttons
                document.getElementById('addTableButton').addEventListener('click', () => {
                    editor.chain().focus().insertTable({
                        rows: 3,
                        cols: 3,
                        withHeaderRow: true
                    }).run();
                });

                // add column before
                document.getElementById('addColumnBeforeButton').addEventListener('click', () => {
                    editor.chain().focus().addColumnBefore().run();
                });

                // add column after
                document.getElementById('addColumnAfterButton').addEventListener('click', () => {
                    editor.chain().focus().addColumnAfter().run();
                });

                // remove column
                document.getElementById('removeColumnButton').addEventListener('click', () => {
                    editor.chain().focus().deleteColumn().run();
                });

                // add row before
                document.getElementById('addRowBeforeButton').addEventListener('click', () => {
                    editor.chain().focus().addRowBefore().run();
                });

                // add row after
                document.getElementById('addRowAfterButton').addEventListener('click', () => {
                    editor.chain().focus().addRowAfter().run();
                });

                // remove row
                document.getElementById('removeRowButton').addEventListener('click', () => {
                    editor.chain().focus().deleteRow().run();
                });

                // delete table
                document.getElementById('deleteTableButton').addEventListener('click', () => {
                    editor.chain().focus().deleteTable().run();
                });

                // merge cells
                document.getElementById('mergeCellsButton').addEventListener('click', () => {
                    editor.chain().focus().mergeCells().run();
                });

                // split cells
                document.getElementById('splitCellsButton').addEventListener('click', () => {
                    editor.chain().focus().splitCell().run();
                });

                // merge or split
                document.getElementById('mergeOrSplitButton').addEventListener('click', () => {
                    editor.chain().focus().mergeOrSplit().run();
                });

                // toggle header column
                document.getElementById('toggleHeaderColumnButton').addEventListener('click', () => {
                    editor.chain().focus().toggleHeaderColumn().run();
                });

                // toggle header row
                document.getElementById('toggleHeaderRowButton').addEventListener('click', () => {
                    editor.chain().focus().toggleHeaderRow().run();
                });

                // toggle header cell
                document.getElementById('toggleHeaderCellButton').addEventListener('click', () => {
                    editor.chain().focus().toggleHeaderCell().run();
                });

                const cellAttributeModal = FlowbiteInstances.getInstance('Modal', 'cell-attribute-modal');

                document.getElementById('addCellAttributeForm').addEventListener('submit', (e) => {

                    e.preventDefault();

                    const attributeName = document.getElementById('attribute-name').value;
                    const attributeValue = document.getElementById('attribute-value').value;

                    if (attributeName && attributeValue) {
                        const result = editor.commands.setCellAttribute(attributeName ? attributeName : '',
                            attributeValue ? attributeValue : '');
                        document.getElementById('addCellAttributeForm').reset();
                        cellAttributeModal.hide();
                    }
                });

                // fix tables
                document.getElementById('fixTablesButton').addEventListener('click', () => {
                    editor.commands.fixTables();
                });

                // go to previous cell
                document.getElementById('previousCellButton').addEventListener('click', () => {
                    editor.chain().focus().goToPreviousCell().run();
                });

                // go to the next cell
                document.getElementById('nextCellButton').addEventListener('click', () => {
                    editor.chain().focus().goToNextCell().run();
                });

                const sourceCodeModal = FlowbiteInstances.getInstance('Modal', 'source-code-modal');
                const sourceCodeWrapper = document.getElementById('sourceCode');

                document.getElementById('toggleJSONButton').addEventListener('click', () => {
                    // basically just use editor.getJSON(); to get the raw json
                    sourceCode.innerHTML = JSON.stringify(editor.getJSON(), null, 2)
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;");
                });
            }
            // if (document.getElementById("VistaPrevia")) {
            //     const FontSizeTextStyle = TextStyle.extend({
            //         addAttributes() {
            //             return {
            //                 fontSize: {
            //                     default: null,
            //                     parseHTML: element => element.style.fontSize,
            //                     renderHTML: attributes => {
            //                         if (!attributes.fontSize) {
            //                             return {};
            //                         }
            //                         return {
            //                             style: 'font-size: ' + attributes.fontSize
            //                         };
            //                     },
            //                 },
            //             };
            //         },
            //     });
            //     const CustomBold = Bold.extend({
            //         // Override the renderHTML method
            //         renderHTML({
            //             mark,
            //             HTMLAttributes
            //         }) {
            //             const {
            //                 style,
            //                 ...rest
            //             } = HTMLAttributes;

            //             // Merge existing styles with font-weight
            //             const newStyle = 'font-weight: bold;' + (style ? ' ' + style : '');

            //             return ['span', {
            //                 ...rest,
            //                 style: newStyle.trim()
            //             }, 0];
            //         },
            //         // Ensure it doesn't exclude other marks
            //         addOptions() {
            //             return {
            //                 ...this.parent?.(),
            //                 HTMLAttributes: {},
            //             };
            //         },
            //     });
            //     // tip tap editor setup
            //     const editor = new Editor({
            //         element: document.querySelector('#VistaPrevia'),
            //         extensions: [
            //             StarterKit.configure({
            //                 textStyle: false,
            //                 bold: false,
            //                 marks: {
            //                     bold: false,
            //                 },
            //             }),
            //             Table.configure({
            //                 resizable: true,
            //             }),
            //             TableRow,
            //             TableHeader,
            //             TableCell,
            //             TipTapExtensionTableCell,
            //             // Include the custom Bold extension
            //             CustomBold,
            //             TextStyle,
            //             Color,
            //             FontSizeTextStyle,
            //             FontFamily,
            //             Highlight,
            //             Underline,
            //             Link.configure({
            //                 openOnClick: false,
            //                 autolink: true,
            //                 defaultProtocol: 'https',
            //             }),
            //             TextAlign.configure({
            //                 types: ['heading', 'paragraph'],
            //             }),
            //             Image,
            //             YouTube,
            //         ],
            //         //Cargas de informacion
            //         //content: '<p>Flowbite is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p><p>Here is an example of a button component:</p><code>&#x3C;button type=&#x22;button&#x22; class=&#x22;text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800&#x22;&#x3E;Default&#x3C;/button&#x3E;</code><p>Learn more about all components from the <a href="https://flowbite.com/docs/getting-started/introduction/">Flowbite Docs</a>.</p>',
            //         content: informacionBlog1,
            //         editorProps: {
            //             attributes: {
            //                 class: 'format lg:format-lg dark:format-invert focus:outline-none format-blue max-w-none',
            //             },
            //         },
            //         editable: false, // Establecer en false para que no sea editable
            //     });
            // }
        })
    </script>
</x-app-layout>
