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
  queue: [],
  queueIndex: -1,
  autoAdvance: true,
  mounted: false,
  ui: null,
  lastFocusedBeforeShow: null,

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
    dock.hidden = false;
    dock.setAttribute("aria-label", "ESCIE player");
    dock.innerHTML =
      '<div class="escie-player-main">' +
        '<button type="button" class="escie-player-step" data-player-prev aria-label="Previous transmission">PREV</button>' +
        '<button type="button" class="escie-player-toggle" data-player-toggle aria-label="Play" aria-pressed="false">PLAY</button>' +
        '<div class="escie-player-track">' +
          '<span class="escie-player-label">TRANSMISSION PLAYER</span>' +
          '<strong class="escie-player-title" data-player-title>NO TRANSMISSION LOADED</strong>' +
          '<span class="escie-player-time" data-player-time aria-live="off">0:00 / 0:00</span>' +
          '<input class="escie-player-progress" data-player-progress type="range" min="0" max="1000" value="0" step="1" aria-label="Playback position">' +
        '</div>' +
        '<button type="button" class="escie-player-step" data-player-next aria-label="Next transmission">NEXT</button>' +
        '<button type="button" class="escie-player-close" data-player-close aria-label="Close player">×</button>' +
      '</div>';

    host.appendChild(dock);
    this.ui = {
      dock,
      toggle: dock.querySelector("[data-player-toggle]"),
      previous: dock.querySelector("[data-player-prev]"),
      next: dock.querySelector("[data-player-next]"),
      title: dock.querySelector("[data-player-title]"),
      progress: dock.querySelector("[data-player-progress]"),
      time: dock.querySelector("[data-player-time]"),
      close: dock.querySelector("[data-player-close]")
    };

    this.ui.toggle.addEventListener("click", () => this.playing ? this.pause() : this.play());
    this.ui.previous.addEventListener("click", () => this.previous());
    this.ui.next.addEventListener("click", () => this.next());
    this.ui.close.addEventListener("click", () => this.hide());
    this.ui.progress.addEventListener("input", event => {
      if (!this.audio || !Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return;
      this.audio.currentTime = (Number(event.target.value) / 1000) * this.audio.duration;
    });

    this._keyHandler = event => {
      if (!this.ui || this.ui.dock.hidden || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (!this.current) return;
      if (event.code === "Space") {
        event.preventDefault();
        this.playing ? this.pause() : this.play();
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        this.seekBy(-5);
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        this.seekBy(5);
      }
    };
    document.addEventListener("keydown", this._keyHandler);

    this.mounted = true;
  },

  bindAudio() {
    if (!this.audio || this._audioBound) return;
    this._audioBound = true;

    this.audio.addEventListener("play", () => this.sync(true));
    this.audio.addEventListener("pause", () => this.sync(false));
    this.audio.addEventListener("ended", () => {
      this.sync(false);
      if (this.autoAdvance) this.advance();
    });
    this.audio.addEventListener("error", () => {
      this.playing = false;
      this.sync(false);
    });
    this.audio.addEventListener("timeupdate", () => this.syncProgress());
    this.audio.addEventListener("loadedmetadata", () => this.syncProgress());
  },

  load(source = {}) {
    const url = typeof source.url === "string" ? source.url.trim() : "";
    if (!url) return null;

    const mediaAPI = typeof window !== "undefined" ? window.ESCIE_MEDIA : null;
    const safe = mediaAPI && typeof mediaAPI.safeURL === "function"
      ? mediaAPI.safeURL(url)
      : (() => {
          try {
            const parsed = new URL(url, window.location.href);
            return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
          } catch (error) {
            return null;
          }
        })();
    if (!safe) return null;

    this.current = {
      id: source.id || null,
      title: source.title || null,
      url: safe.href,
      sourceId: source.sourceId || null
    };

    const queueIndex = this.queue.findIndex(item => item.url === url && (!source.id || item.id === source.id));
    if (queueIndex >= 0) this.queueIndex = queueIndex;

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

  seekBy(seconds = 0) {
    if (!this.audio || !Number.isFinite(this.audio.duration) || this.audio.duration <= 0) return false;
    const next = Math.max(0, Math.min(this.audio.duration, this.audio.currentTime + Number(seconds || 0)));
    this.audio.currentTime = next;
    this.syncProgress();
    return true;
  },

  show() {
    if (!this.ui) this.mount();
    if (this.ui && this.ui.dock) {
      if (this.ui.dock.hidden && typeof document !== "undefined") {
        const active = document.activeElement;
        this.lastFocusedBeforeShow = active && active !== document.body ? active : null;
      }
      this.ui.dock.hidden = false;
      if (typeof document !== "undefined" && document.body) {
        document.body.classList.add("player-visible");
      }
    }
  },

  hide() {
    this.pause();
    const restore = this.lastFocusedBeforeShow;
    if (this.ui && this.ui.dock) this.ui.dock.hidden = true;
    if (typeof document !== "undefined" && document.body) {
      document.body.classList.remove("player-visible");
    }
    this.lastFocusedBeforeShow = null;
    if (restore && typeof restore.focus === "function" && document.contains(restore)) {
      try { restore.focus(); } catch (error) {}
    }
  },

  setQueue(items = [], options = {}) {
    this.queue = Array.isArray(items)
      ? items.filter(item => item && typeof item.url === "string" && item.url.trim())
        .map(item => ({
          id: item.id || null,
          title: item.title || null,
          url: item.url.trim(),
          sourceId: item.sourceId || item.id || null
        }))
      : [];
    this.autoAdvance = options.autoAdvance !== false;
    this.queueIndex = -1;
    return this.queue.slice();
  },

  enqueue(source = {}) {
    if (!source || typeof source.url !== "string" || !source.url.trim()) return false;
    this.queue.push({
      id: source.id || null,
      title: source.title || null,
      url: source.url.trim(),
      sourceId: source.sourceId || source.id || null
    });
    return true;
  },

  advance() {
    if (!this.queue.length) return null;
    const nextIndex = this.queueIndex + 1;
    if (nextIndex >= this.queue.length) return null;
    this.queueIndex = nextIndex;
    const loaded = this.load(this.queue[this.queueIndex]);
    if (loaded) this.play();
    return loaded;
  },

  previous() {
    if (!this.queue.length) return null;
    const previousIndex = this.queueIndex - 1;
    if (previousIndex < 0) {
      if (this.audio && this.audio.currentTime > 3) {
        this.audio.currentTime = 0;
        return this.current;
      }
      return null;
    }
    this.queueIndex = previousIndex;
    const loaded = this.load(this.queue[this.queueIndex]);
    if (loaded) this.play();
    return loaded;
  },

  next(source = {}) {
    if (source && source.url) {
      const index = this.queue.findIndex(item => item.id && source.id && item.id === source.id);
      if (index >= 0) this.queueIndex = index;
      return this.load(source);
    }
    return this.advance();
  },

  sync(isPlaying = this.playing) {
    this.playing = !!isPlaying;
    if (!this.ui) return;

    const title = this.current && this.current.title
      ? this.current.title
      : "NO TRANSMISSION LOADED";

    this.ui.title.textContent = title;
    this.ui.toggle.textContent = this.playing ? "PAUSE" : (this.current ? "PLAY" : "WAIT");
    this.ui.toggle.setAttribute("aria-label", this.playing ? "Pause" : "Play");
    this.ui.toggle.setAttribute("aria-pressed", String(this.playing));
    this.ui.toggle.disabled = !this.current;
    this.ui.dock.classList.toggle("is-playing", this.playing);
    const hasQueue = this.queue.length > 0;
    this.ui.dock.dataset.ready = String(!!(this.current && this.current.url));
    if (this.ui.previous) this.ui.previous.disabled = !hasQueue || this.queueIndex <= 0;
    if (this.ui.next) this.ui.next.disabled = !hasQueue || this.queueIndex >= this.queue.length - 1;
  },

  syncProgress() {
    if (!this.ui || !this.audio || !Number.isFinite(this.audio.duration) || this.audio.duration <= 0) {
      if (this.ui && this.ui.progress) this.ui.progress.value = "0";
      return;
    }
    const ratio = Math.max(0, Math.min(1, this.audio.currentTime / this.audio.duration));
    this.ui.progress.value = String(Math.round(ratio * 1000));
    if (this.ui.time) {
      const format = seconds => {
        const total = Math.max(0, Math.floor(Number(seconds) || 0));
        const minutes = Math.floor(total / 60);
        const secs = String(total % 60).padStart(2, "0");
        return minutes + ":" + secs;
      };
      this.ui.time.textContent = format(this.audio.currentTime) + " / " + format(this.audio.duration);
    }
  }
};

if (typeof window !== "undefined") window.ESCIE_UI_PLAYER = ESCIE_UI_PLAYER;
if (typeof module !== "undefined" && module.exports) module.exports = ESCIE_UI_PLAYER;
