/**
 * Ядро плеера: один HTMLAudioElement, список треков и состояния.
 * Работает без знания о DOM-разметке; уведомляет подписчиков через EventTarget.
 *
 * События: "statechange", "trackchange", "timeupdate", "durationchange".
 * Состояния: idle, loading, playing, paused, ended, error.
 */

const ERROR_MESSAGES = {
    1: 'Playback was interrupted.',
    2: 'Network error while loading the track.',
    3: 'The track could not be decoded.',
    4: 'The track could not be found or is not supported.'
};

export class Player extends EventTarget {
    /**
     * @param {HTMLAudioElement} audio  Единственный аудиоэлемент страницы.
     * @param {{src: string, title: string}[]} tracks
     */
    constructor(audio, tracks) {
        super();
        this.audio = audio;
        this.tracks = tracks;
        this.index = -1;
        this.state = 'idle';
        this.errorMessage = '';
        this.#bindAudioEvents();
    }

    get currentTrack() {
        return this.tracks[this.index] || null;
    }

    get currentTime() {
        return this.audio.currentTime || 0;
    }

    get duration() {
        return Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
    }

    /** Загружает трек (без запуска воспроизведения). */
    load(index) {
        if (index < 0 || index >= this.tracks.length) {
            return;
        }
        this.audio.pause();
        this.index = index;
        this.errorMessage = '';
        this.audio.preload = 'metadata';
        this.audio.src = this.tracks[index].src;
        this.audio.load();
        this.#setState('loading');
        this.dispatchEvent(new Event('trackchange'));
        this.dispatchEvent(new Event('durationchange'));
        this.dispatchEvent(new Event('timeupdate'));
    }

    /** Выбирает трек и запускает его (вызывается по действию пользователя). */
    playTrack(index) {
        if (index !== this.index || this.state === 'error') {
            this.load(index);
        }
        return this.play();
    }

    play() {
        if (this.index === -1) {
            this.load(0);
        }
        if (this.state === 'ended') {
            this.audio.currentTime = 0;
        }
        const result = this.audio.play();
        if (result && typeof result.catch === 'function') {
            return result.catch((error) => {
                // AbortError возникает при быстрой смене трека — это не ошибка.
                if (error && error.name === 'AbortError') {
                    return;
                }
                this.#fail(error && error.name === 'NotAllowedError'
                    ? 'The browser blocked playback. Press play again.'
                    : 'The track could not be played.');
            });
        }
        return Promise.resolve();
    }

    pause() {
        this.audio.pause();
    }

    toggle() {
        if (this.state === 'playing') {
            this.pause();
            return Promise.resolve();
        }
        return this.state === 'error' ? this.playTrack(this.index) : this.play();
    }

    next() {
        const wasPlaying = !this.audio.paused;
        const index = (this.index + 1) % this.tracks.length;
        this.load(index);
        if (wasPlaying) {
            this.play();
        }
    }

    prev() {
        // Как в большинстве плееров: сначала возврат к началу, затем к предыдущему.
        if (this.currentTime > 3) {
            this.seek(0);
            return;
        }
        const wasPlaying = !this.audio.paused;
        const index = (this.index - 1 + this.tracks.length) % this.tracks.length;
        this.load(index);
        if (wasPlaying) {
            this.play();
        }
    }

    seek(seconds) {
        if (this.index === -1 || !this.duration) {
            return;
        }
        this.audio.currentTime = Math.min(Math.max(seconds, 0), this.duration);
        this.dispatchEvent(new Event('timeupdate'));
    }

    #setState(state) {
        if (this.state === state) {
            return;
        }
        this.state = state;
        this.dispatchEvent(new Event('statechange'));
    }

    #fail(message) {
        this.errorMessage = message;
        this.audio.pause();
        this.#setState('error');
    }

    #bindAudioEvents() {
        const audio = this.audio;

        audio.addEventListener('loadstart', () => {
            if (this.index !== -1) {
                this.#setState('loading');
            }
        });
        audio.addEventListener('waiting', () => this.#setState('loading'));
        const settle = () => {
            if (this.state === 'loading' && audio.paused) {
                this.#setState('paused');
            }
        };
        audio.addEventListener('loadedmetadata', settle);
        audio.addEventListener('canplay', settle);
        audio.addEventListener('playing', () => this.#setState('playing'));
        audio.addEventListener('pause', () => {
            if (this.state !== 'error' && !audio.ended && this.index !== -1) {
                this.#setState('paused');
            }
        });
        audio.addEventListener('ended', () => this.#setState('ended'));
        audio.addEventListener('timeupdate', () => this.dispatchEvent(new Event('timeupdate')));
        audio.addEventListener('durationchange', () => this.dispatchEvent(new Event('durationchange')));
        audio.addEventListener('error', () => {
            if (this.index === -1) {
                return;
            }
            const code = audio.error ? audio.error.code : 0;
            this.#fail(ERROR_MESSAGES[code] || 'The track could not be loaded.');
        });
    }
}
