<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Vista Previa') }}
        </h2>
    </x-slot>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.1/dist/flowbite.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/flowbite@3.1.1/dist/flowbite.min.js"></script>

    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-6 lg:px-8">
            <div
                id="VistaPrevia"class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400">
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

        const informacionBlog1 = {
            "type": "doc",
            "content": [{
                    "type": "paragraph",
                    "attrs": {
                        "textAlign": "left"
                    }
                },
                {
                    "type": "image",
                    "attrs": {
                        "src": "https://m.media-amazon.com/images/S/pv-target-images/16627900db04b76fae3b64266ca161511422059cd24062fb5d900971003a0b70._SX1080_FMjpg_.jpg",
                        "alt": null,
                        "title": null
                    }
                },
                {
                    "type": "paragraph",
                    "attrs": {
                        "textAlign": "left"
                    },
                    "content": [{
                            "type": "text",
                            "text": "La Empresa R&A es una emprea munti nacional"
                        },
                        {
                            "type": "text",
                            "marks": [{
                                "type": "bold"
                            }],
                            "text": "open-source library of UI components"
                        },
                        {
                            "type": "text",
                            "text": " based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more."
                        }
                    ]
                },
                {
                    "type": "paragraph",
                    "attrs": {
                        "textAlign": "left"
                    },
                    "content": [{
                        "type": "text",
                        "text": "It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on."
                    }]
                },
                {
                    "type": "paragraph",
                    "attrs": {
                        "textAlign": "left"
                    },
                    "content": [{
                        "type": "text",
                        "text": "Here is an example of a button component:"
                    }]
                },
                {
                    "type": "paragraph",
                    "attrs": {
                        "textAlign": "left"
                    },
                    "content": [{
                        "type": "text",
                        "marks": [{
                            "type": "code"
                        }],
                        "text": "<button type=\"button\" class=\"text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800\">Default</button>"
                    }]
                },
                {
                    "type": "paragraph",
                    "attrs": {
                        "textAlign": "left"
                    },
                    "content": [{
                            "type": "text",
                            "text": "Learn more about all components from the "
                        },
                        {
                            "type": "text",
                            "marks": [{
                                "type": "link",
                                "attrs": {
                                    "href": "https://flowbite.com/docs/getting-started/introduction/",
                                    "target": "_blank",
                                    "rel": "noopener noreferrer nofollow",
                                    "class": null
                                }
                            }],
                            "text": "Flowbite Docs"
                        },
                        {
                            "type": "text",
                            "text": "."
                        }
                    ]
                }
            ]
        };

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
                    editable: false,  // Establecer en false para que no sea editable
                });
            }
        })
    </script>
</x-app-layout>
