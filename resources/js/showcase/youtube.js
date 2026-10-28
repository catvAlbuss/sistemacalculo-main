let apiPromise;

function loadYouTubeAPI() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
        const previous = window.onYouTubeIframeAPIReady;
        const script = document.createElement('script');
        const timeout = setTimeout(() => fail(), 20000);
        const fail = () => {
            clearTimeout(timeout);
            script.remove();
            apiPromise = null;
            reject(new Error('YouTube no está disponible.'));
        };
        window.onYouTubeIframeAPIReady = () => {
            clearTimeout(timeout);
            try { previous?.(); } finally { resolve(window.YT); }
        };
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = fail;
        document.head.append(script);
    });
    return apiPromise;
}

export function initYouTubeVideos(root = document) {
    root.querySelectorAll('[data-youtube]').forEach(container => {
        if (container.dataset.youtubeInitialized) return;
        container.dataset.youtubeInitialized = 'true';
        const iframe = container.querySelector('[data-youtube-frame]');
        const error = container.querySelector('[data-youtube-error]');
        const hero = container.hasAttribute('data-youtube-hero');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const saveData = navigator.connection?.saveData === true;
        let player, connecting = false, ready = false, visible = false, userPaused = false;
        const resume = () => {
            if (ready && hero && visible && !document.hidden && !reducedMotion.matches && !saveData && !userPaused) player.playVideo();
        };
        const connect = async () => {
            if (connecting || player) return;
            connecting = true;
            try {
                const YT = await loadYouTubeAPI();
                // Attach to the existing native embed; do not reload or replace it.
                player = new YT.Player(iframe, {
                    events: {
                        onReady: event => {
                            player = event.target; ready = true;
                            if (hero) event.target.mute();
                            if (!visible || document.hidden) player.pauseVideo();
                            else resume();
                        },
                        onStateChange: event => {
                            if (hero && event.data === 2 && visible && !document.hidden) userPaused = true;
                            if (event.data === 1) { userPaused = false; error.hidden = true; }
                        },
                        onError: () => { error.hidden = false; },
                    },
                });
            } catch {
                // Native iframe controls still work if the optional API is blocked.
            } finally { connecting = false; }
        };
        new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            if (visible) { connect(); resume(); }
            else if (ready) player.pauseVideo();
        }, {threshold: 0.25}).observe(container);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && ready) player.pauseVideo();
            else resume();
        });
        reducedMotion.addEventListener('change', () => { if (reducedMotion.matches && ready) player.pauseVideo(); });
    });
}
