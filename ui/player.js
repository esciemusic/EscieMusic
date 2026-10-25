/*
 * ESCIE UI — PLAYER
 *
 * Persistent media controls belong to the interface layer.
 * The player may reference existing ESCIE audio; it does not create meaning.
 */

const ESCIE_UI_PLAYER = {
  audio: null,
  current: null,
  playing: false,

  attach(audioElement) {
    this.audio = audioElement || null;
    return this.audio;
  },

  load(source = {}) {
    this.current = {
      id: source.id || null,
      title: source.title || null,
      url: source.url || null,
      sourceId: source.sourceId || null
    };

    if (this.audio && this.current.url) {
      this.audio.src = this.current.url;
    }

    return this.current;
  },

  async play() {
    if (!this.audio) return false;

    try {
      await this.audio.play();
      this.playing = true;
      return true;
    } catch (error) {
      this.playing = false;
      return false;
    }
  },

  pause() {
    if (!this.audio) return false;
    this.audio.pause();
    this.playing = false;
    return true;
  }
};

if (typeof window !== "undefined") window.ESCIE_UI_PLAYER = ESCIE_UI_PLAYER;
if (typeof module !== "undefined" && module.exports) module.exports = ESCIE_UI_PLAYER;
