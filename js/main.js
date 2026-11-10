import { Player } from './player.js';
import { initPlayerUi } from './player-ui.js';

function init() {
    const root = document.querySelector('[data-player]');
    const audio = root && root.querySelector('[data-player-audio]');
    const trackItems = Array.from(document.querySelectorAll('[data-track]'));

    if (!root || !audio || !trackItems.length || typeof audio.play !== 'function') {
        return; // Без плеера остаются нативные <audio controls> и ссылки на файлы.
    }

    const tracks = trackItems.map((item) => ({
        src: item.dataset.src,
        title: item.dataset.title
    }));

    const player = new Player(audio, tracks);
    initPlayerUi(player, root, trackItems);

    // Только теперь включаем кастомный плеер и скрываем нативные.
    document.documentElement.classList.add('js-player');
    root.hidden = false;
    trackItems.forEach((item) => {
        item.querySelector('[data-track-select]').hidden = false;
        // Нативные плееры удаляются, чтобы на странице остался один аудиодвижок.
        item.querySelectorAll('[data-track-native]').forEach((native) => native.remove());
    });
}

init();
