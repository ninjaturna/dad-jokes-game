// Sound effects are base64-encoded or loaded from /public/sounds/
// We use the Web Audio API for instant, zero-latency playback.
// Drop MP3/OGG files into /public/sounds/ with these names:
//   rimshot.mp3, elimination.mp3, winner_fanfare.mp3, tick.mp3
//
// If a file isn't present the function silently no-ops.

import type { SoundTrigger } from '../types/game'

const cache: Map<SoundTrigger, AudioBuffer> = new Map()
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

async function load(sound: SoundTrigger): Promise<AudioBuffer | null> {
  if (cache.has(sound)) return cache.get(sound)!
  try {
    const res = await fetch(`/sounds/${sound}.mp3`)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const decoded = await getCtx().decodeAudioData(buf)
    cache.set(sound, decoded)
    return decoded
  } catch {
    return null
  }
}

// Preload all sounds (call once on app mount)
export async function preloadSounds() {
  const sounds: SoundTrigger[] = ['rimshot', 'elimination', 'winner_fanfare', 'tick']
  await Promise.allSettled(sounds.map(load))
}

export async function playSound(sound: SoundTrigger) {
  try {
    const buf = await load(sound)
    if (!buf) return
    const ac = getCtx()
    // Resume context if suspended (browser autoplay policy)
    if (ac.state === 'suspended') await ac.resume()
    const source = ac.createBufferSource()
    source.buffer = buf
    source.connect(ac.destination)
    source.start(0)
  } catch {
    // silently ignore — sounds are enhancement only
  }
}
