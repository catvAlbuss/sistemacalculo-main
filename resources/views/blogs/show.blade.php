<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Rizabal Asociados</title>
    <link rel="icon" type="image/x-icon" href="{{ url('/assets/img/logo_rizabalAsociados.png') }}">
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.1/dist/flowbite.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/flowbite@3.1.1/dist/flowbite.min.js"></script>

</head>

<body class="antialiased bg-gray-100 dark:bg-gray-900">
    <!-- Navbar -->
    <nav class="border-gray-200">
        <div class="container mx-auto flex flex-wrap items-center justify-between">
            <a href="#" class="text-white text-lg font-bold py-2">
                <style>
                    /* Estilo por defecto para el tema claro */
                    .logo {
                        filter: invert(0);
                    }

                    /* Estilo para el tema oscuro */
                    @media (prefers-color-scheme: dark) {
                        .logo {
                            filter: invert(1);
                        }
                    }
                </style>
                <img class="mx-auto h-10 w-10 logo" src="{{ url('/assets/img/logo_rizabalAsociados.png') }}"
                    alt="author avatar">
            </a>
            <button data-collapse-toggle="mobile-menu" type="button"
                class="md:hidden ml-3 text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg inline-flex items-center justify-center"
                aria-controls="mobile-menu-2" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clip-rule="evenodd"></path>
                </svg>
                <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd"></path>
                </svg>
            </button>
            <div class="hidden md:block w-full md:w-auto" id="mobile-menu">
                <ul class="flex-col md:flex-row flex md:space-x-8 mt-4 md:mt-0 md:text-sm md:font-medium">
                    <li>
                        <a href="https://ryaie.com/"
                            class="md:bg-transparent text-gray-950 dark:text-gray-100  dark:hover:text-white block pl-3 pr-4 py-2 md:text-blue-700 md:p-0 rounded focus:outline-none"
                            aria-current="page">Inicio</a>
                    </li>
                    <li>
                        <button id="dropdownNavbarLink" data-dropdown-toggle="dropdownNavbar"
                            class="text-gray-950 dark:text-gray-100  dark:hover:text-white border-b border-gray-100 md:hover:bg-transparent md:border-0 pl-3 pr-4 py-2 md:hover:text-blue-700 md:p-0 font-medium flex items-center justify-between w-full md:w-auto">Servicios
                            <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd"></path>
                            </svg></button>
                        <!-- Dropdown menu -->
                        <div id="dropdownNavbar"
                            class="hidden bg-white text-base z-10 list-none divide-y divide-gray-100 rounded shadow my-4 w-44">
                            <ul class="py-1" aria-labelledby="dropdownLargeButton">
                                <li>
                                    <a href="{{ url('admdesingestruct') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Diseño
                                        Estructural</a>
                                </li>
                                <li>
                                    <a href="{{ url('admdesofes') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Desarrollo de
                                        Software Estructural</a>
                                </li>
                                <li>
                                    <a href="{{ url('admlabplanos') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Elaboración de
                                        planos Estructurales</a>
                                </li>
                            </ul>
                            <div class="py-1">
                                <a href="{{ url('admelabmetra') }}"
                                    class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2">Elaboración de
                                    Metrados</a>
                            </div>
                        </div>
                    </li>
                    <li>
                        <a href="#"
                            class="text-gray-950 dark:text-gray-100  dark:hover:text-white border-b border-gray-100 md:hover:bg-transparent md:border-0 block pl-3 pr-4 py-2 md:hover:text-blue-700 md:p-0">Contactenos</a>
                    </li>
                    <li>
                        <button id="dropdownNavbarLink" data-dropdown-toggle="pruebaGratis"
                            class="bg-blue-500 rounded hover:bg-blue-600 text-gray-950 dark:text-gray-100  dark:hover:text-white border-b border-gray-100 md:hover:bg-transparent md:border-0 pl-3 pr-4 py-2 md:hover:text-blue-700 md:p-0 font-medium flex items-center justify-between w-full md:w-auto">Prueba
                            Gratis <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd"></path>
                            </svg></button>
                        <!-- Dropdown menu -->
                        <div id="pruebaGratis"
                            class="hidden bg-white text-base z-10 list-none divide-y divide-gray-100 rounded shadow my-4 w-44">
                            <ul class="py-1" aria-labelledby="dropdownLargeButton">
                                <li>
                                    <a href="{{ url('admPredim') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 text-center">Predim</a>
                                </li>
                                <li>
                                    <a href="{{ url('admarcotecho') }}"
                                        class="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 text-center">Techo
                                        Arco</a>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-6 lg:px-8">
            <div class="w-full relative flex flex-col items-center justify-center min-h-screen py-2 rounded-lg">
                <input type="hidden" name="previewblog" id="previewblog" value="{{ $blog->descripciondetall }}">
                <div class="px-4 bg-white rounded-b-lg dark:bg-gray-800">
                    <div
                        id="VistaPrevia"class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400">
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
            if (document.getElementById("VistaPrevia")) {
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
                    element: document.querySelector('#VistaPrevia'),
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
                    },
                    editable: false, // Establecer en false para que no sea editable
                });
            }
        })
    </script>
</body>

</html>
