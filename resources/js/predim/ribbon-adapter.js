/**
 * Ribbon UI Adapter for adm_predim_view.js
 * Connects the new ribbon interface with the original JavaScript
 */

document.addEventListener("DOMContentLoaded", function () {
    console.log("Ribbon Adapter: Initializing...");

    // ==================== TOOL SELECTION ====================
    // The original JS doesn't have a central selectedTool variable,
    // each tool class checks the canvas events directly.
    // We need to dispatch events that the original JS can understand

    const toolButtons = document.querySelectorAll('.tool[data-tool]');
    let currentTool = null;

    toolButtons.forEach(button => {
        button.addEventListener('click', function () {
            currentTool = this.dataset.tool;
            console.log(`Ribbon Adapter: Tool selected - ${currentTool}`);

            // Remove active class from all tools
            toolButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tool
            this.classList.add('active');

            // Store in window for compatibility
            window.selectedTool = currentTool;

            // Dispatch custom event for any listeners
            window.dispatchEvent(new CustomEvent('toolSelected', {
                detail: { tool: currentTool }
            }));
        });
    });

    // ==================== BRUSH WIDTH ====================
    // Original JS expects: #grosorline a[data-brush-width]
    // New ribbon has: #grosorline button[data-brush-width]

    const brushWidthButtons = document.querySelectorAll("#grosorline button[data-brush-width]");
    brushWidthButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const newWidth = parseInt(button.dataset.brushWidth, 10);

            // Set global variable for compatibility
            if (typeof window.setBrushWidth === 'function') {
                window.setBrushWidth(newWidth);
            }

            console.log(`Ribbon Adapter: Brush width set to ${newWidth}`);

            // Visual feedback
            brushWidthButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // ==================== FONT SIZE ====================
    // Original JS expects: #grosorletter a[data-font-size]
    // New ribbon has: #grosorletter button[data-font-size]

    const fontSizeButtons = document.querySelectorAll("#grosorletter button[data-font-size]");
    fontSizeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const newSize = button.dataset.fontSize;

            // Set global variable for compatibility
            if (typeof window.setFontSize === 'function') {
                window.setFontSize(newSize);
            }

            console.log(`Ribbon Adapter: Font size set to ${newSize}`);

            // Visual feedback
            fontSizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // ==================== COLOR SELECTION ====================
    // Colors should already work since they use [data-color]
    // But let's ensure they trigger the right events

    const colorButtons = document.querySelectorAll('.predim-color-btn[data-color]');
    colorButtons.forEach(button => {
        button.addEventListener('click', function () {
            const color = this.dataset.color;
            console.log(`Ribbon Adapter: Color selected - ${color}`);

            // The original JS handles this via querySelectorAll("[data-color]")
            // So it should work, but we'll add visual feedback
            colorButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Set window variable for debugging
            window.selectedColor = color;
        });
    });

    // ==================== CANVAS RESIZE FIX ====================
    // Ensure canvas resizes properly when PDF loads

    const canvasContainer = document.querySelector('.predim-canvas-container');
    if (canvasContainer) {
        // Create resize observer to log when canvas changes
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                console.log('Ribbon Adapter: Canvas container resized:', entry.contentRect);
            }
        });
        resizeObserver.observe(canvasContainer);
    }

    // ==================== DARK MODE TOGGLE ====================
    // Add dark mode functionality

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // Check for saved preference
        const currentTheme = localStorage.getItem('predim-theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);

        darkModeToggle.addEventListener('click', function () {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('predim-theme', newTheme);

            console.log(`Ribbon Adapter: Theme changed to ${newTheme}`);
        });
    }

    // ==================== EXPOSE GLOBALS FOR DEBUGGING ====================
    window.ribbonAdapter = {
        getCurrentTool: () => currentTool,
        setTool: (tool) => {
            const button = document.querySelector(`.tool[data-tool="${tool}"]`);
            if (button) button.click();
        }
    };

    console.log("Ribbon Adapter: Initialized successfully");
});
