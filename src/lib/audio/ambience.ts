"use client";

import { subscribeFrame, type TimeState } from "@/lib/journey/store";

/**
 * Procedural soundscape: no audio files, so nothing to download until the
 * visitor opts in. The same time state that drives the picture drives the mix:
 *   today      → wind, birds
 *   the reign  → running water, soft distant drum
 *   time moving fast → a low rumble
 *   epilogue   → a slow two-note drone
 */
export class Ambience {
  /**
   * Told whether the browser is actually letting the context run. It stays
   * suspended until the visitor has clicked, tapped or typed, however early
   * the mix was switched on.
   */
  onRunningChange?: (running: boolean) => void;

  private ctx: AudioContext;
  private master: GainNode;
  private wind: GainNode;
  private water: GainNode;
  private rumble: GainNode;
  private pad: GainNode;
  private windFilter: BiquadFilterNode;
  private unsub: () => void;
  private nextBird = 0;
  private nextDrum = 0;
  private state = { modern: 1, ancient: 0, indoor: 0, finale: 0 };

  constructor() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    const ctx = this.ctx;
    ctx.addEventListener("statechange", () => this.onRunningChange?.(ctx.state === "running"));
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    const noise = this.noiseBuffer();

    // Wind: brown-ish noise through a wandering low-pass.
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = noise;
    windSrc.loop = true;
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.value = 420;
    this.wind = ctx.createGain();
    this.wind.gain.value = 0;
    windSrc.connect(this.windFilter).connect(this.wind).connect(this.master);
    windSrc.start();

    // Water: band-passed noise with a slow ripple.
    const waterSrc = ctx.createBufferSource();
    waterSrc.buffer = noise;
    waterSrc.loop = true;
    waterSrc.playbackRate.value = 1.7;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1400;
    bp.Q.value = 0.7;
    this.water = ctx.createGain();
    this.water.gain.value = 0;
    const ripple = ctx.createOscillator();
    ripple.frequency.value = 0.35;
    const rippleDepth = ctx.createGain();
    rippleDepth.gain.value = 500;
    ripple.connect(rippleDepth).connect(bp.frequency);
    ripple.start();
    waterSrc.connect(bp).connect(this.water).connect(this.master);
    waterSrc.start();

    // Rumble: two low sines, gain follows the speed of time.
    this.rumble = ctx.createGain();
    this.rumble.gain.value = 0;
    for (const f of [38, 55]) {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      o.connect(this.rumble);
      o.start();
    }
    const rumbleLp = ctx.createBiquadFilter();
    rumbleLp.type = "lowpass";
    rumbleLp.frequency.value = 120;
    this.rumble.connect(rumbleLp).connect(this.master);

    // Epilogue drone.
    this.pad = ctx.createGain();
    this.pad.gain.value = 0;
    for (const f of [110, 164.81, 110.4]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(this.pad);
      o.start();
    }
    this.pad.connect(this.master);

    this.unsub = subscribeFrame((s) => this.update(s));
  }

  private noiseBuffer() {
    const len = this.ctx.sampleRate * 4;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.035 * white) / 1.035;
      d[i] = last * 3.2 + white * 0.06;
    }
    return buf;
  }

  private chirp(t: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const base = 2600 + Math.random() * 1600;
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.4), t + 0.07);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.025, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.14);
  }

  private drum(t: number) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(95, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.5);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 1.2);
  }

  private update(s: TimeState) {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const indoor = s.chapter === "frescoes" || s.chapter === "mirror" ? 1 : 0;
    const finale = s.chapter === "finale" ? 1 : 0;
    const k = 0.05;
    const st = this.state;
    st.ancient += (s.evidence - st.ancient) * k;
    st.modern = 1 - st.ancient;
    st.indoor += (indoor - st.indoor) * k;
    st.finale += (finale - st.finale) * k;
    const outside = 1 - st.indoor * 0.8;
    const ramp = (g: GainNode, v: number) => g.gain.setTargetAtTime(v, now, 0.25);
    ramp(this.wind, (0.12 + st.modern * 0.18) * outside * (1 - st.finale * 0.7));
    this.windFilter.frequency.setTargetAtTime(300 + st.modern * 350 + Math.sin(now * 0.2) * 120, now, 0.5);
    ramp(this.water, st.ancient * 0.12 * outside * (1 - st.finale));
    ramp(this.rumble, Math.min(0.22, Math.abs(s.speed) * 0.025));
    ramp(this.pad, st.finale * 0.035);

    if (st.modern > 0.4 && st.indoor < 0.5 && st.finale < 0.5 && now > this.nextBird) {
      this.chirp(now + 0.02);
      if (Math.random() > 0.5) this.chirp(now + 0.18);
      this.nextBird = now + 1.5 + Math.random() * 4;
    }
    if (st.ancient > 0.6 && st.indoor < 0.5 && now > this.nextDrum) {
      this.drum(now + 0.02);
      this.nextDrum = now + 3.2 + Math.random() * 2.5;
    }
  }

  get running() {
    return this.ctx.state === "running";
  }

  /**
   * Switching on is only a request: a browser that has seen no interaction yet
   * leaves `resume()` pending indefinitely, so it is never awaited — the fade
   * is scheduled anyway and plays from the moment the context is released.
   */
  setEnabled(on: boolean) {
    this.master.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.4);
    if (on && this.ctx.state !== "running") void this.ctx.resume().catch(() => {});
  }

  destroy() {
    this.unsub();
    void this.ctx.close();
  }
}
