import React from 'react';

interface FaderControlProps {
  label: string;
  value: number; // 0 to 127
  min?: number;
  max?: number;
  orientation?: 'vertical' | 'horizontal';
  color?: 'cyan' | 'amber' | 'slate';
  centerDetent?: boolean;
  onChange: (val: number) => void;
  className?: string;
}

export const FaderControl: React.FC<FaderControlProps> = ({
  label,
  value,
  min = 0,
  max = 127,
  orientation = 'vertical',
  color = 'slate',
  centerDetent = false,
  onChange,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onChange(val);
  };

  const handleDoubleClick = () => {
    if (centerDetent) {
      onChange(Math.round((max - min) / 2));
    }
  };

  const percentage = Math.round(((value - min) / (max - min)) * 100);

  if (orientation === 'horizontal') {
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1 px-1">
          <span className="font-bold text-cyan-400">CH 1</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            {label}
          </span>
          <span className="font-bold text-amber-400">CH 2</span>
        </div>

        <div className="relative w-full flex items-center h-12 px-2 bg-slate-900/90 rounded-lg border border-slate-800">
          {/* Center detent mark */}
          <div className="absolute left-1/2 top-2 bottom-2 w-0.5 bg-slate-600/70 -translate-x-1/2 pointer-events-none" />

          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleChange}
            onDoubleClick={handleDoubleClick}
            className="w-full h-2 rounded bg-slate-950 appearance-none cursor-grab active:cursor-grabbing dj-crossfader"
          />
        </div>
      </div>
    );
  }

  // Vertical Fader
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">
        {label}
      </span>

      <div className="relative h-44 w-12 flex flex-col items-center justify-center bg-slate-900/90 rounded-lg border border-slate-800 p-2">
        {/* dB or scale ticks */}
        <div className="absolute right-1.5 top-3 bottom-3 flex flex-col justify-between text-[8px] font-mono text-slate-600 pointer-events-none">
          <span>+6</span>
          <span>0</span>
          <span>-6</span>
          <span>-12</span>
          <span>-∞</span>
        </div>

        {/* Center line for pitch */}
        {centerDetent && (
          <div className="absolute top-1/2 left-2 right-4 h-0.5 bg-slate-600/60 -translate-y-1/2 pointer-events-none" />
        )}

        {/* Rotated range input for clean vertical touch */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onDoubleClick={handleDoubleClick}
          className="w-36 -rotate-90 origin-center dj-fader cursor-grab active:cursor-grabbing"
        />
      </div>

      <span className="text-[10px] font-mono text-slate-400 tabular-nums mt-1">
        {centerDetent ? `${value - 64 > 0 ? '+' : ''}${value - 64}` : `${percentage}%`}
      </span>
    </div>
  );
};
