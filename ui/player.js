/*
 * ESCIE UI — PLAYER
 *
 * Persistent media controls belong to the interface layer.
 * The player may reference existing ESCIE audio; it does not create meaning.
 * It never decides whether a record is public.
 */

const ESCIE_UI_PLAYER = {
  audio: null,
  current: null,
  playing: false,
  _audioBound: false,
  _playRequest: 0,
  mounted: false,
  ui: null,

  attach(audioElement) {
    this.audio = audioElement || null;
    this.mount();
    this.bindAudio();
    return this.audio;
  },

  mount() {
    if (this.mounted || typeof document === "undefined") return;
    const host = document.body;
    if (!host) return;

    const dock = document.createElement("aside");
    dock.id = "escie-player";
    dock.className = "escie-player";
    dock.hidden = true;
    dock.setAttribute("aria-label", "ESCIE player");
    dock.innerHTML =
      '<div class="escie-player-main">' +
        '<button type="button" class="escie-player-toggle" data-player-toggle aria-label="Play" aria-pressed="false">PLAY</button>' +
        '<div class="escie-player-track">' +
          '<span class="escie-player-label">SIGNAL</span>' +
          '<strong class="escie-player-title" data-player-title>NO TRANSMISSION LOADED</strong>' +
          '<input class="escie-player-progress" data-player-progress type="range" min="0" max="1000" value="0" step="1" aria-label="Playback position">' +
        '</div>' +
        '<button type="button" class="escie-player-close" data-player-close aria-label="Close player">×</button>' +
      '</div>';

    host.appendChild(dock);
    this.ui = {
      dock,
      toggle: dock.querySelector("[data-player-toggle]"),
      title: dock.querySelector("[data-player-title]"),
      progress: dock.querySelector("[data-player-progress]"),
      close: dock.querySelector("[data-player-close]")
    };

    this.ui.toggle.addEventListener("click", () => this.playing ? this.pause() : this.play());
    this.ui.close.addEventListener("click", () => this.hide());
    this.ui.progress.addEventListener("input", event => {
      if (!this.audio || !Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;
      this.audio.currentTime = (Number(event.target.value) / 1000) * this.audio.duration;
    });

    this.mounted = true;
  },

  bindAudio() {
    if (!this.audio || this._audioBound) return;
    this._audioBound = true;

    this.audio.addEventListener("play", () => this.sync(true));
    this.audio.addEventListener("pause", () => this.sync(false));
    this.audio.addEventListener("ended", () => this.sync(false));
    this.audio.addEventListener("timeupdate", () => this.syncProgress());
    this.audio.addEventListener("loadedmetadata", () => this.syncProgress());
  },

  load(source = {}) {
    const url = typeof source.url === "string" ? source.url.trim() : "";
    if (!url) return null;

    this.current = {
      id: source.id || null,
      title: source.title || null,
      url,
      sourceId: source.sourceId || null
    };

    if (this.audio) {
      if (this.audio.src !== url) {
        this.audio.src = url;
        this.audio.currentTime = 0;
      }
      this.audio.load();
    }

    this.show();
    this.sync(false);
    this.syncProgress();
    return this.current;
  },

  async play() {
    if (!this.audio || !this.current || !this.current.url) return false;
    const request = ++this._playRequest;

    try {
      await this.audio.play();
      if (request !== this._playRequest) return false;
      this.playing = true;
      this.sync(true);
      return true;
    } catch (error) {
      if (request === this._playRequest) {
        this.playing = false;
        this.sync(false);
      }
      return false;
    }
  },

  pause() {
    if (!this.audio) return false;
    this._playRequest += 1;
    this.audio.pause();
    this.playing = false;
    this.sync(false);
    return true;
  },

  show() {
    if (!this.ui) this.mount();
    if (this.ui && this.ui.dock) this.ui.dock.hidden = false;
  },

  hide() {
    this.pause();
    if (this.ui && this.ui.dock) this.ui.dock.hidden = true;
  },

  next(source = {}) {
    return this.load(source);
  },

  sync(isPlaying = this.playing) {
    this.playing = !!isPlaying;
    if (!this.ui) return;

    const title = this.current && this.current.title
      ? this.current.title
      : "NO TRANSMISSION LOADED";

    this.ui.title.textContent = title;
    this.ui.toggle.textContent = this.playing ? "PAUSE" : "PLAY";
    this.ui.toggle.setAttribute("aria-label", this.playing ? "Pause" : "Play");
    this.ui.toggle.setAttribute("aria-pressed", String(this.playing));
    this.ui.dock.classList.toggle("is-playing", this.playing);
  },

  syncProgress() {
    if (!this.ui || !this.audio || !Number.isFinite(this.audio.duration) || this.audio.duration <= 0) {
      if (this.ui && this.ui.progress) this.ui.progress.value = "0";
      return;
    }
    this.ui.progress.value = String(Math.round((this.audio.currentTime / this.audio.duration) * 1000));
  }
};

if (typeof window !== "undefined") window.ESCIE_UI_PLAYER = ESCIE_UI_PLAYER;
if (typeof module !== "undefined" && module.exports) module.exports = ESCIE_UI_PLAYER;
