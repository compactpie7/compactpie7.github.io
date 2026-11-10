/**
 * Привязка Player к DOM: кнопки, прогресс, время, статус, список треков.
 * Весь текст выводится через textContent.
 */

function formatTime(totalSeconds) {
    const seconds = Math.max(0, Math.floor(totalSeconds || 0));
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

const STATUS_TEXT = {
    idle: '',
    loading: 'Loading…',
    playing: 'Playing',
    paused: 'Paused',
    ended: 'Finished'
};

export function initPlayerUi(player, root, trackItems) {
    const toggle = root.querySelector('[data-player-toggle]');
    const prev = root.querySelector('[data-player-prev]');
    const next = root.querySelector('[data-player-next]');
    const seek = root.querySelector('[data-player-seek]');
    const title = root.querySelector('[data-player-title]');
    const current = root.querySelector('[data-player-current]');
    const duration = root.querySelector('[data-player-duration]');
    const status = root.querySelector('[data-player-status]');

    let isSeeking = false;

    function renderState() {
        const state = player.state;
        root.dataset.state = state;
        toggle.setAttribute('aria-label', state === 'playing' ? 'Pause' : 'Play');
        status.textContent = state === 'error' ? player.errorMessage : STATUS_TEXT[state] || '';

        trackItems.forEach((item, index) => {
            const button = item.querySelector('[data-track-select]');
            const isCurrent = index === player.index;
            item.classList.toggle('is-current', isCurrent);
            button.textContent = isCurrent && state === 'playing' ? 'Pause' : 'Play';
            button.setAttribute('aria-label',
                `${button.textContent} ${item.dataset.title}`);
        });
    }

    function renderTrack() {
        const track = player.currentTrack;
        title.textContent = track ? track.title : 'Select a track';
    }

    function renderTime() {
        const total = player.duration;
        seek.max = String(Math.floor(total));
        seek.disabled = !total;
        if (!isSeeking) {
            seek.value = String(Math.floor(player.currentTime));
        }
        current.textContent = formatTime(player.currentTime);
        duration.textContent = formatTime(total);
        seek.setAttribute('aria-valuetext',
            `${formatTime(player.currentTime)} of ${formatTime(total)}`);
    }

    toggle.addEventListener('click', () => player.toggle());
    prev.addEventListener('click', () => player.prev());
    next.addEventListener('click', () => player.next());

    // Ползунок: нативный range — работает с клавиатурой и касанием.
    seek.addEventListener('input', () => {
        isSeeking = true;
        current.textContent = formatTime(Number(seek.value));
    });
    seek.addEventListener('change', () => {
        player.seek(Number(seek.value));
        isSeeking = false;
    });

    // Кнопки Play у каждого трека в списке.
    trackItems.forEach((item, index) => {
        item.querySelector('[data-track-select]').addEventListener('click', () => {
            if (index === player.index && player.state === 'playing') {
                player.pause();
            } else {
                player.playTrack(index);
            }
        });
    });

    player.addEventListener('statechange', renderState);
    player.addEventListener('trackchange', renderTrack);
    player.addEventListener('timeupdate', renderTime);
    player.addEventListener('durationchange', renderTime);

    renderState();
    renderTrack();
    renderTime();
}
