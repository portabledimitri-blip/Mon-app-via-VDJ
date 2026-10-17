import React, { useRef, useState, useEffect } from 'react';
import { audioSynth } from '../utils/audioSynth';

interface JogWheelProps {
  deck: 1 | 2;
  isPlaying: boolean;
  bpm: number;
  color: 'cyan' | 'amber';
  onScratch: (delta: number) => void;
  onTouchChange: (isTouching: boolean) => void;
  onPitchBend: (direction: 'up' | 'down') => void;
}

export const JogWheel: React.FC<JogWheelProps> = ({
  deck,
  isPlaying,
  bpm,
  color,
  onScratch,
  onTouchChange,
  onPitchBend,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [isTouching, setIsTouching] = useState(false);
  const prevAngleRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Spin automatically when playing and not touching
  useEffect(() => {
    if (isPlaying && !isTouching) {
      let lastTime = performance.now();
      const step = (time: number) => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;
        // ~33.3 RPM base at 120 bpm
        const rps = (bpm / 120) * (33.3 / 60);
        setAngle((prev) => (prev + rps * 360 * dt) % 360);
        animFrameRef.current = requestAnimationFrame(step);
      };
      animFrameRef.current = requestAnimationFrame(step);
      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }
  }, [isPlaying, isTouching, bpm]);

  const getAngleFromEvent = (e: React.PointerEvent) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    let rad = Math.atan2(dy, dx);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsTouching(true);
    onTouchChange(true);
    prevAngleRef.current = getAngleFromEvent(e);
    if ('vibrate' in navigator) {
      try { navigator.vibrate(10); } catch { /* ignore */ }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isTouching || prevAngleRef.current === null) return;
    const currentAngle = getAngleFromEvent(e);
    let delta = currentAngle - prevAngleRef.current;

    // Handle 0/360 wrap around
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (Math.abs(delta) > 0.5) {
      setAngle((prev) => (prev + delta + 360) % 360);
      prevAngleRef.current = currentAngle;
      audioSynth.playScratch(delta);
      onScratch(delta);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isTouching) {
      setIsTouching(false);
      onTouchChange(false);
      prevAngleRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // already released
      }
    }
  };

  const accentBorder = color === 'cyan' ? 'border-cyan-500/50' : 'border-amber-500/50';
  const glowRing = color === 'cyan' ? 'ring-cyan-500/30' : 'ring-amber-500/30';
  const markerColor = color === 'cyan' ? 'bg-cyan-400' : 'bg-amber-400';

  return (
    <div className="flex flex-col items-center">
      {/* Platter & Jog Wheel */}
      <div
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-full cursor-grab active:cursor-grabbing vinyl-grooves border-4 ${accentBorder} flex items-center justify-center select-none touch-none transition-shadow ${
          isTouching ? `ring-4 ${glowRing}` : ''
        }`}
      >
        {/* Outer Strobe Dots */}
        <div className="absolute inset-1 rounded-full border border-dashed border-slate-700/60 pointer-events-none" />

        {/* Rotating needle / scratch marker */}
        <div
          className="absolute inset-0 rounded-full flex items-start justify-center pt-2 pointer-events-none"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className={`w-1.5 h-6 rounded-full ${markerColor} shadow-md shadow-black`} />
        </div>

        {/* Center Platter Display */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center z-10 pointer-events-none">
          <span className={`text-base sm:text-lg font-black tracking-wider ${color === 'cyan' ? 'text-cyan-400' : 'text-amber-400'}`}>
            DECK {deck === 1 ? 'A' : 'B'}
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-slate-400 tabular-nums">
            {bpm.toFixed(1)} BPM
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? (color === 'cyan' ? 'bg-cyan-400' : 'bg-amber-400') : 'bg-slate-600'}`} />
            <span className="text-[9px] font-mono text-slate-500 uppercase">
              {isPlaying ? 'PLAY' : 'STOP'}
            </span>
          </div>
        </div>
      </div>

      {/* Pitch Bend Buttons (- / +) */}
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onPointerDown={() => onPitchBend('down')}
          className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300 rounded hover:bg-slate-800 active:scale-95 transition-transform"
        >
          - BEND
        </button>
        <button
          type="button"
          onPointerDown={() => onPitchBend('up')}
          className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300 rounded hover:bg-slate-800 active:scale-95 transition-transform"
        >
          + BEND
        </button>
      </div>
    </div>
  );
};
