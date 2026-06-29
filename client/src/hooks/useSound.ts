import { useCallback, useEffect, useRef, useState } from 'react';

type SoundName =
  'correct' | 'wrong' | 'countdown' | 'gameStart' | 'win' | 'click' | 'tension' | 'fanfare';

const SOUND_FILES: Record<SoundName, string> = {
  correct: '/sounds/correctAnswer.mp3',
  wrong: '/sounds/wrongAnswer.mp3',
  countdown: '/sounds/countdown.mp3',
  gameStart: '/sounds/gameStart.mp3',
  win: '/sounds/win.mp3',
  click: '/sounds/click.mp3',
  tension: '/sounds/tension.mp3',
  fanfare: '/sounds/fanfare.mp3',
};

type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth';

interface SynthConfig {
  freq: number;
  duration: number;
  type: WaveType;
  volume: number;
  sweep?: number;
}

const SYNTH_PRESETS: Record<SoundName, SynthConfig> = {
  correct: { freq: 660, duration: 0.15, type: 'sine', volume: 0.3, sweep: 880 },
  wrong: { freq: 200, duration: 0.3, type: 'sawtooth', volume: 0.25, sweep: 100 },
  countdown: { freq: 440, duration: 0.1, type: 'triangle', volume: 0.3 },
  gameStart: { freq: 330, duration: 0.4, type: 'sine', volume: 0.35, sweep: 660 },
  win: { freq: 523, duration: 0.6, type: 'sine', volume: 0.35, sweep: 1046 },
  click: { freq: 800, duration: 0.05, type: 'sine', volume: 0.15 },
  tension: { freq: 880, duration: 0.12, type: 'square', volume: 0.2 },
  fanfare: { freq: 523, duration: 0.15, type: 'triangle', volume: 0.3 },
};

function playSynth(config: SynthConfig): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.freq, ctx.currentTime);
    if (config.sweep) {
      oscillator.frequency.linearRampToValueAtTime(config.sweep, ctx.currentTime + config.duration);
    }

    gainNode.gain.setValueAtTime(config.volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
    setTimeout(() => void ctx.close(), (config.duration + 0.1) * 1000);
  } catch {
    // silent
  }
}

function playFanfareSequence(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const notes = [
      { freq: 523.25, time: 0, dur: 0.15 },
      { freq: 659.25, time: 0.15, dur: 0.15 },
      { freq: 783.99, time: 0.3, dur: 0.15 },
      { freq: 1046.5, time: 0.45, dur: 0.5 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      gain.gain.setValueAtTime(0.3, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    });

    setTimeout(() => void ctx.close(), 1500);
  } catch {
    // silent
  }
}

function playTensionBeep(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);

    setTimeout(() => void ctx.close(), 300);
  } catch {
    // silent
  }
}

export function useSound(enabled = true) {
  const [muted, setMuted] = useState(false);
  const cache = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});
  const useSynth = useRef(false);

  useEffect(() => {
    return () => {
      Object.values(cache.current).forEach((a) => a?.pause());
    };
  }, []);

  const play = useCallback(
    (name: SoundName, volume = 0.6) => {
      if (!enabled || muted) return;

      if (name === 'fanfare') {
        if (useSynth.current) {
          playFanfareSequence();
        } else {
          try {
            let audio = cache.current[name];
            if (!audio) {
              audio = new Audio(SOUND_FILES[name]);
              cache.current[name] = audio;
            }
            audio.currentTime = 0;
            audio.volume = volume;
            void audio.play().catch(() => {
              useSynth.current = true;
              playFanfareSequence();
            });
          } catch {
            playFanfareSequence();
          }
        }
        return;
      }

      if (name === 'tension') {
        if (useSynth.current) {
          playTensionBeep();
        } else {
          try {
            let audio = cache.current[name];
            if (!audio) {
              audio = new Audio(SOUND_FILES[name]);
              cache.current[name] = audio;
            }
            audio.currentTime = 0;
            audio.volume = volume;
            void audio.play().catch(() => {
              useSynth.current = true;
              playTensionBeep();
            });
          } catch {
            playTensionBeep();
          }
        }
        return;
      }

      if (useSynth.current) {
        playSynth(SYNTH_PRESETS[name]);
        return;
      }

      try {
        let audio = cache.current[name];
        if (!audio) {
          audio = new Audio(SOUND_FILES[name]);
          cache.current[name] = audio;
        }
        audio.currentTime = 0;
        audio.volume = volume;
        void audio.play().catch(() => {
          useSynth.current = true;
          playSynth(SYNTH_PRESETS[name]);
        });
      } catch {
        playSynth(SYNTH_PRESETS[name]);
      }
    },
    [enabled, muted],
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return { play, muted, toggleMute };
}
