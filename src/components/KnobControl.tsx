import React, { useRef, useState, useEffect, useCallback } from 'react';

interface KnobControlProps {
  label: string;
  value: number; // 0 to 127
  min?: number;
  max?: number;
  defaultValue?: number;
  color?: 'cyan' | 'amber' | 'slate';
  onChange: (val: number) => void;
  onKill?: () => void;
  isKilled?: boolean;
}

export const KnobControl: React.FC<KnobControlProps> = ({
  label,
  value,
  min = 0,
  max = 127,
  defaultValue = 64,
  color = 'cyan',
  onChange,
  onKill,
  isKilled = false,
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValRef = useRef(value);
  const [activeDrag, setActiveDrag] = useState(false);

  // Map 0-127 to -135deg to +135deg rotation
  const normalized = (value - min) / (max - min);
  const degrees = -135 + normalized * 270;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startValRef.current = value;
    setActiveDrag(true);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = startYRef.current - e.clientY;
    const sensitivity = 0.8;
    const newVal = Math.max(min, Math.min(max, Math.round(startValRef.current + deltaY * sensitivity)));
    if (newVal !== value) {
      onChange(newVal);
    }
  }, [min, max, value, onChange]);

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setActiveDrag(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture already released
      }
    }
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  const themeColors = {
    cyan: {
      activeRing: 'border-cyan-400 shadow-cyan-500/20',
      pointer: 'bg-cyan-400',
      text: 'text-cyan-400',
      killActive: 'bg-cyan-500 text-black',
    },
    amber: {
      activeRing: 'border-amber-400 shadow-amber-500/20',
      pointer: 'bg-amber-400',
      text: 'text-amber-400',
      killActive: 'bg-amber-500 text-black',
    },
    slate: {
      activeRing: 'border-slate-300 shadow-white/10',
      pointer: 'bg-white',
      text: 'text-slate-200',
      killActive: 'bg-white text-black',
    },
  }[color];

  return (
    <div className="flex flex-col items-center select-none touch-none">
      <span className="text-[11px] font-semibold text-slate-400 tracking-wider mb-1 uppercase">
        {label}
      </span>

      <div
        ref={knobRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className={`relative w-12 h-12 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center transition-shadow ${
          activeDrag ? 'ring-2 ring-cyan-500/50' : ''
        }`}
        style={{
          background: 'radial-gradient(circle at 35% 35%, #334155, #0f172a)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.2)',
        }}
      >
        {/* Outer tick border */}
        <div className="absolute inset-0.5 rounded-full border border-slate-700/60 pointer-events-none" />

        {/* Rotary pointer */}
        <div
          className="absolute inset-0 rounded-full flex items-start justify-center pt-1 transition-transform pointer-events-none"
          style={{
            transform: `rotate(${degrees}deg)`,
            transition: activeDrag ? 'none' : 'transform 100ms ease-out',
          }}
        >
          <div className={`w-1 h-3 rounded-full ${isKilled ? 'bg-red-500' : themeColors.pointer}`} />
        </div>

        {/* Center cap */}
        <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 shadow-inner flex items-center justify-center pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* Value readout & Kill toggle */}
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] font-mono text-slate-300 tabular-nums">
          {isKilled ? 'KILL' : Math.round((value / 127) * 100)}%
        </span>
        {onKill && (
          <button
            type="button"
            onClick={onKill}
            title={`Couper ${label}`}
            className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold transition-colors ${
              isKilled
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            K
          </button>
        )}
      </div>
    </div>
  );
};
