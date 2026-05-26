// /**
//  * Synthesizes and plays a modern, elegant double-tone notification chime
//  * using the built-in HTML5 Web Audio API. This works offline, instantly,
//  * and doesn't require downloading any large external media files.
//  */
// export function playNotificationSound() {
//   try {
//     const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
//     if (!AudioContextClass) return

//     const ctx = new AudioContextClass()
//     const now = ctx.currentTime

//     // Create a master volume controller
//     const masterGain = ctx.createGain()
//     masterGain.connect(ctx.destination)

//     // Sleek volume envelope: quick fade-in, smooth exponential fade-out
//     masterGain.gain.setValueAtTime(0, now)
//     masterGain.gain.linearRampToValueAtTime(0.35, now + 0.03) // quick attack
//     masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5) // smooth decay

//     // Chime tone 1: High note (Sine wave)
//     const osc1 = ctx.createOscillator()
//     osc1.type = 'sine'
//     osc1.frequency.setValueAtTime(880, now) // A5
//     osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.15)
//     osc1.connect(masterGain)

//     // Chime tone 2: Deep harmony note (softly delayed)
//     const osc2 = ctx.createOscillator()
//     osc2.type = 'sine'
//     osc2.frequency.setValueAtTime(554.37, now + 0.06) // C#5 (Creates a bright major third harmony)
//     osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.22) // E5
//     osc2.connect(masterGain)

//     // Start and stop oscillators
//     osc1.start(now)
//     osc1.stop(now + 0.5)
    
//     osc2.start(now + 0.06)
//     osc2.stop(now + 0.5)
//   } catch (err) {
//     console.warn('[Sound] Failed to play notification chime:', err)
//   }
// }
