import React from 'react';
import { Smartphone, Radio, Sliders, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeSection: 'controller' | 'bridge' | 'mapper' | 'guide';
  onNavigate: (section: 'controller' | 'bridge' | 'mapper' | 'guide') => void;
  onOpenQuickPair: () => void;
  isPhoneConnected: boolean;
  isMobileRole?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  onOpenQuickPair,
  isPhoneConnected,
  isMobileRole = false,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('controller');
        }}
        className="text-base sm:text-lg font-extrabold tracking-tight text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2 hover:text-cyan-400 transition-colors"
      >
        <span className="text-cyan-400">VDJ</span>
        <span>Mobile Studio</span>
      </a>

      {/* Zone 2: Navigation Links (single-line, clean text hover) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          type="button"
          onClick={() => onNavigate('controller')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'controller' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Contrôleur Tactile
        </button>

        <button
          type="button"
          onClick={() => onNavigate('bridge')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'bridge' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Pont Sans-Fil & MIDI
        </button>

        <button
          type="button"
          onClick={() => onNavigate('mapper')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'mapper' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Mapping XML
        </button>

        <button
          type="button"
          onClick={() => onNavigate('guide')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'guide' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Héberger sur GitHub & Guide
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {!isMobileRole && (
          <button
            type="button"
            onClick={onOpenQuickPair}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              isPhoneConnected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isPhoneConnected ? 'Téléphone Relié' : 'Connecter Smartphone'}</span>
          </button>
        )}

        {isMobileRole && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Mode Téléphone</span>
          </div>
        )}
      </div>
    </header>
  );
};
