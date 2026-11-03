// Tiny synthesized sounds (no audio files). Only play after a user action.
let ctx: AudioContext | null = null
let enabled = true
export const setSoundEnabled = (on: boolean) => { enabled = on }

function tone(freq: number, at: number, dur = 0.14, type: OscillatorType = 'triangle', vol = 0.12) {
  try {
    ctx = ctx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const t = ctx.currentTime + at
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = type; o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02)
  } catch { /* audio unavailable */ }
}

export const sound = {
  complete: () => enabled && [660, 990].forEach((f, i) => tone(f, i * 0.07)),
  undo: () => enabled && tone(420, 0, 0.12, 'sine', 0.08),
  levelUp: () => enabled && [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, i * 0.09, 0.22)),
  achievement: () => enabled && [784, 1175, 1568].forEach((f, i) => tone(f, i * 0.08, 0.2, 'sine')),
}
