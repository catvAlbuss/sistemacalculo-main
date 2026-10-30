import '../css/showcase.css';
import '../css/homepage.css';
import '../css/program-presentation.css';
import { initYouTubeVideos } from './showcase/youtube.js';

export function initShowcase(root = document) {
    initYouTubeVideos(root);
    const saveData = navigator.connection?.saveData === true;
    root.querySelectorAll('[data-media]').forEach(container => {
        const video = container.querySelector('video');
        if (!video) return;
        const button = container.querySelector('[data-video-toggle]');
        const label = container.querySelector('[data-video-label]');
        const error = container.querySelector('[data-video-error]');
        let loaded = false, userPaused = false, visible = false;
        const sources = [...video.querySelectorAll('source')];
        const matching = sources.filter(item => item.media && window.matchMedia(item.media).matches);
        const candidates = matching.length ? matching : sources.filter(item => !item.media);
        let sourceIndex = 0;
        const ambient = video.hasAttribute('data-ambient');
        const load = () => {
            if (loaded) return;
            const source = candidates[sourceIndex];
            video.src = source.dataset.src;
            if (source.dataset.poster) video.poster = source.dataset.poster;
            loaded = true;
            video.load();
        };
        const play = async (retry = false) => {
            if (retry) { loaded = false; sourceIndex = 0; }
            video.hidden = false;
            load(); error.hidden = true;
            try { await video.play(); } catch { label.textContent = 'Reproducir video'; }
        };
        const update = () => {
            const playing = !video.paused;
            container.dataset.playing = String(playing);
            label.textContent = playing ? 'Pausar video' : 'Reproducir video';
            button.setAttribute('aria-label', label.textContent);
            button.setAttribute('aria-pressed', String(playing));
        };
        button.addEventListener('click', () => {
            if (video.paused || video.error) { userPaused = false; play(Boolean(video.error)); }
            else { userPaused = true; video.pause(); }
        });
        video.addEventListener('play', update);
        video.addEventListener('pause', update);
        video.addEventListener('ended', update);
        video.addEventListener('error', () => {
            if (sourceIndex + 1 < candidates.length) { sourceIndex++; loaded = false; play(); }
            else { video.pause(); video.hidden = true; error.hidden = false; update(); }
        });
        container.querySelector('[data-video-retry]')?.addEventListener('click', () => { userPaused = false; play(true); });
        const observer = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            if (!visible) video.pause();
            else if (ambient && !userPaused && !saveData && !document.hidden) play();
        }, {threshold: 0.25});
        observer.observe(video);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) video.pause();
            else if (visible && ambient && !userPaused && !saveData) play();
        });
        update();
    });
    root.querySelectorAll('[data-catalog]').forEach(catalog => {
        const cards = [...catalog.querySelectorAll('[data-product]')];
        const search = catalog.querySelector('[data-product-search]');
        const filters = [...catalog.querySelectorAll('[data-filter]')];
        let category = 'all';
        const filter = () => {
            const text = search.value.trim().toLocaleLowerCase();
            let count = 0;
            cards.forEach(card => {
                card.hidden = !(category === 'all' || category === card.dataset.category) || !card.dataset.search.includes(text);
                if (!card.hidden) count++;
            });
            catalog.querySelector('[data-result-count]').textContent = `${count} ${count === 1 ? 'programa' : 'programas'}`;
            catalog.querySelector('[data-empty]').hidden = count !== 0;
        };
        search.addEventListener('input', filter);
        filters.forEach(button => button.addEventListener('click', () => {
            category = button.dataset.filter;
            filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
            filter();
        }));
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initShowcase());
else initShowcase();
