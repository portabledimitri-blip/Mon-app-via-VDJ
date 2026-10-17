import React, { useState } from 'react';
import { ControllerGlobalState, DeckState, MidiEventPayload } from '../types/midi';
import { KnobControl } from './KnobControl';
import { JogWheel } from './JogWheel';
import { FaderControl } from './FaderControl';
import { audioSynth } from '../utils/audioSynth';
import { Play, Pause, Disc3, RefreshCw, Zap, Volume2, Sliders, Music, Radio } from 'lucide-react';

interface DjControllerProps {
  state: ControllerGlobalState;
  onStateChange: (updater: (prev: ControllerGlobalState) => ControllerGlobalState) => void;
  onSendMidi: (payload: {
    type: 'note_on' | 'note_off' | 'cc';
    channel: number;
    control: number;
    value: number;
    actionName: string;
    vdjScript: string;
    deck?: 1 | 2;
  }) => void;
  isMobileView?: boolean;
}

export const DjController: React.FC<DjControllerProps> = ({
  state,
  onStateChange,
  onSendMidi,
  isMobileView = false,
}) => {
  // Mobile tab focus: 'split' | 'deck1' | 'deck2' | 'mixer'
  const [mobileTab, setMobileTab] = useState<'split' | 'deck1' | 'deck2' | 'mixer'>('split');

  const triggerHaptic = (ms = 15) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch { /* ignore */ }
    }
  };

  // Deck 1 & 2 Play / Pause handler
  const handleTogglePlay = (deck: 1 | 2) => {
    triggerHaptic(20);
    audioSynth.playClick(deck === 1 ? 900 : 750);
    const key = deck === 1 ? 'deck1' : 'deck2';
    const isNowPlaying = !state[key].isPlaying;

    onStateChange((prev) => ({
      ...prev,
      [key]: { ...prev[key], isPlaying: isNowPlaying },
    }));

    onSendMidi({
      type: isNowPlaying ? 'note_on' : 'note_off',
      channel: deck,
      control: 60,
      value: isNowPlaying ? 127 : 0,
      actionName: `Deck ${deck} Play/Pause`,
      vdjScript: `deck ${deck} play_pause`,
      deck,
    });
  };

  // Cue button handler
  const handleCue = (deck: 1 | 2) => {
    triggerHaptic(25);
    audioSynth.playClick(600, 0.08);
    const key = deck === 1 ? 'deck1' : 'deck2';

    onStateChange((prev) => ({
      ...prev,
      [key]: { ...prev[key], isCueing: true, isPlaying: false },
    }));

    onSendMidi({
      type: 'note_on',
      channel: deck,
      control: 61,
      value: 127,
      actionName: `Deck ${deck} Cue`,
      vdjScript: `deck ${deck} cue`,
      deck,
    });

    setTimeout(() => {
      onStateChange((prev) => ({
        ...prev,
        [key]: { ...prev[key], isCueing: false },
      }));
      onSendMidi({
        type: 'note_off',
        channel: deck,
        control: 61,
        value: 0,
        actionName: `Deck ${deck} Cue Release`,
        vdjScript: `deck ${deck} cue`,
        deck,
      });
    }, 150);
  };

  // Sync button handler
  const handleSync = (deck: 1 | 2) => {
    triggerHaptic(20);
    audioSynth.playClick(1200);
    const key = deck === 1 ? 'deck1' : 'deck2';
    const targetKey = deck === 1 ? 'deck2' : 'deck1';

    onStateChange((prev) => ({
      ...prev,
      [key]: { ...prev[key], isSynced: true, bpm: prev[targetKey].bpm },
    }));

    onSendMidi({
      type: 'note_on',
      channel: deck,
      control: 62,
      value: 127,
      actionName: `Deck ${deck} Sync`,
      vdjScript: `deck ${deck} sync`,
      deck,
    });
  };

  // Hot Cue trigger handler
  const handleHotCue = (deck: 1 | 2, cueIdx: number) => {
    triggerHaptic(18);
    audioSynth.playCueHit(deck, cueIdx);
    const key = deck === 1 ? 'deck1' : 'deck2';

    onStateChange((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        hotCues: { ...prev[key].hotCues, [cueIdx]: true },
      },
    }));

    onSendMidi({
      type: 'note_on',
      channel: deck,
      control: 64 + (cueIdx - 1),
      value: 127,
      actionName: `Deck ${deck} Hot Cue ${cueIdx}`,
      vdjScript: `deck ${deck} hot_cue ${cueIdx}`,
      deck,
    });
  };

  // Loop trigger handler
  const handleLoop = (deck: 1 | 2, type: 'in' | 'out' | 'auto' | 'half' | 'double') => {
    triggerHaptic(15);
    audioSynth.playClick(1000);
    const key = deck === 1 ? 'deck1' : 'deck2';

    let control = 72;
    let vdjScript = `deck ${deck} loop 4`;
    let actionName = `Deck ${deck} Auto Loop`;

    if (type === 'in') {
      control = 70;
      vdjScript = `deck ${deck} loop_in`;
      actionName = `Deck ${deck} Loop In`;
    } else if (type === 'out') {
      control = 71;
      vdjScript = `deck ${deck} loop_out`;
      actionName = `Deck ${deck} Loop Out`;
    } else if (type === 'half') {
      control = 73;
      vdjScript = `deck ${deck} loop_half`;
      actionName = `Deck ${deck} Loop /2`;
    } else if (type === 'double') {
      control = 74;
      vdjScript = `deck ${deck} loop_double`;
      actionName = `Deck ${deck} Loop 2x`;
    }

    onStateChange((prev) => {
      const curSize = prev[key].loopSize;
      let newSize = curSize;
      if (type === 'half') newSize = Math.max(1, curSize / 2);
      if (type === 'double') newSize = Math.min(32, curSize * 2);
      return {
        ...prev,
        [key]: {
          ...prev[key],
          loopActive: type === 'auto' ? !prev[key].loopActive : true,
          loopSize: newSize,
        },
      };
    });

    onSendMidi({
      type: 'note_on',
      channel: deck,
      control,
      value: 127,
      actionName,
      vdjScript,
      deck,
    });
  };

  // Jog Wheel scratch event
  const handleScratch = (deck: 1 | 2, delta: number) => {
    const ccVal = Math.max(0, Math.min(127, Math.round(64 + delta * 2)));
    onSendMidi({
      type: 'cc',
      channel: deck,
      control: 7,
      value: ccVal,
      actionName: `Deck ${deck} Jog Scratch`,
      vdjScript: `deck ${deck} jog`,
      deck,
    });
  };

  const handleJogTouch = (deck: 1 | 2, isTouching: boolean) => {
    onSendMidi({
      type: isTouching ? 'note_on' : 'note_off',
      channel: deck,
      control: 75,
      value: isTouching ? 127 : 0,
      actionName: `Deck ${deck} Jog Platter Touch`,
      vdjScript: `deck ${deck} touchwheel_touch`,
      deck,
    });
  };

  // Sampler pad click
  const handleSampler = (name: 'kick' | 'snare' | 'hihat' | 'clap') => {
    triggerHaptic(20);
    audioSynth.playSample(name);
    const pads: Record<string, number> = { kick: 36, snare: 38, hihat: 42, clap: 39 };
    onSendMidi({
      type: 'note_on',
      channel: 3,
      control: pads[name],
      value: 127,
      actionName: `Sampler Pad ${name.toUpperCase()}`,
      vdjScript: `sampler_pad "${name}"`,
    });
  };

  // Render Single Deck (Deck 1 or Deck 2)
  const renderDeck = (deck: 1 | 2) => {
    const deckState = deck === 1 ? state.deck1 : state.deck2;
    const color = deck === 1 ? 'cyan' : 'amber';
    const accentText = deck === 1 ? 'text-cyan-400' : 'text-amber-400';
    const accentBorder = deck === 1 ? 'border-cyan-500/40' : 'border-amber-500/40';

    return (
      <div className={`flex flex-col bg-slate-900/90 rounded-2xl border ${accentBorder} p-3.5 shadow-xl relative overflow-hidden`}>
        {/* Deck Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-base font-black tracking-wider ${accentText}`}>
              PLATINE {deck === 1 ? 'A' : 'B'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              CH {deck}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSync(deck)}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 active:scale-95 transition-all"
            >
              SYNC
            </button>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-slate-200 tabular-nums">
                {deckState.bpm.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono ml-1">BPM</span>
            </div>
          </div>
        </div>

        {/* Center Platter & Jog */}
        <div className="my-2 flex justify-center">
          <JogWheel
            deck={deck}
            isPlaying={deckState.isPlaying}
            bpm={deckState.bpm}
            color={color}
            onScratch={(delta) => handleScratch(deck, delta)}
            onTouchChange={(isTouching) => handleJogTouch(deck, isTouching)}
            onPitchBend={(dir) => {
              triggerHaptic(15);
              const delta = dir === 'up' ? 2 : -2;
              onStateChange((prev) => {
                const key = deck === 1 ? 'deck1' : 'deck2';
                return {
                  ...prev,
                  [key]: { ...prev[key], bpm: Math.max(60, Math.min(180, prev[key].bpm + delta)) },
                };
              });
            }}
          />
        </div>

        {/* Hot Cues Pads (1, 2, 3, 4) */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 px-0.5">
            <span className="uppercase font-bold tracking-wider">Hot Cues</span>
            <span>CH {deck} · 64-67</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((idx) => {
              const active = deckState.hotCues[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onPointerDown={() => handleHotCue(deck, idx)}
                  className={`h-12 rounded-lg font-mono font-bold text-sm flex flex-col items-center justify-center border transition-all active:scale-95 ${
                    active
                      ? (deck === 1 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20' : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20')
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{idx}</span>
                  <span className="text-[9px] text-slate-400">CUE</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto Loop Controls */}
        <div className="mt-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span className="uppercase font-bold tracking-wider">Boucle / Loop</span>
            <span className="text-slate-300 font-bold">{deckState.loopSize} Tps</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handleLoop(deck, 'half')}
              className="py-1 text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 active:scale-95"
            >
              /2
            </button>
            <button
              type="button"
              onClick={() => handleLoop(deck, 'auto')}
              className={`py-1 text-xs font-mono font-bold rounded border active:scale-95 transition-colors ${
                deckState.loopActive
                  ? (deck === 1 ? 'bg-cyan-500 text-black border-cyan-400 font-black' : 'bg-amber-500 text-black border-amber-400 font-black')
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              LOOP
            </button>
            <button
              type="button"
              onClick={() => handleLoop(deck, 'double')}
              className="py-1 text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 active:scale-95"
            >
              2x
            </button>
            <button
              type="button"
              onClick={() => handleLoop(deck, 'in')}
              className="py-1 text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700 active:scale-95"
            >
              IN/OUT
            </button>
          </div>
        </div>

        {/* Big Tactile Transport Buttons: CUE and PLAY/PAUSE */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          {/* CUE Button */}
          <button
            type="button"
            onPointerDown={() => handleCue(deck)}
            className={`h-16 rounded-xl font-bold text-lg font-mono flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
              deckState.isCueing
                ? 'bg-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/30'
                : 'bg-slate-800/90 text-amber-400 border-amber-500/50 hover:bg-slate-800'
            }`}
          >
            <Disc3 className="w-6 h-6" />
            <span>CUE</span>
          </button>

          {/* PLAY / PAUSE Button */}
          <button
            type="button"
            onPointerDown={() => handleTogglePlay(deck)}
            className={`h-16 rounded-xl font-bold text-lg font-mono flex items-center justify-center gap-2 border-2 transition-all active:scale-95 ${
              deckState.isPlaying
                ? (deck === 1 ? 'bg-cyan-500 text-black border-cyan-300 shadow-lg shadow-cyan-500/40 ring-4 ring-cyan-500/30' : 'bg-emerald-500 text-black border-emerald-300 shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/30')
                : 'bg-slate-800/90 text-emerald-400 border-emerald-500/50 hover:bg-slate-800'
            }`}
          >
            {deckState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            <span>{deckState.isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
        </div>
      </div>
    );
  };

  // Render Mixer Section (Center)
  const renderMixer = () => {
    return (
      <div className="flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
        {/* Mixer Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2 text-slate-300">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold tracking-wider uppercase">Table de Mixage</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">MIDI CH 3</span>
        </div>

        {/* 3-Band EQ Columns: Deck 1 vs Deck 2 */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800">
          {/* Deck 1 EQ */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-cyan-400 uppercase">CH 1 EQ</span>
            <KnobControl
              label="Gain"
              value={state.deck1.gain}
              color="cyan"
              onChange={(val) => {
                onStateChange(prev => ({ ...prev, deck1: { ...prev.deck1, gain: val } }));
                onSendMidi({ type: 'cc', channel: 1, control: 2, value: val, actionName: 'Deck 1 Gain', vdjScript: 'deck 1 gain', deck: 1 });
              }}
            />
            <KnobControl
              label="High"
              value={state.deck1.killHigh ? 0 : state.deck1.eqHigh}
              color="cyan"
              isKilled={state.deck1.killHigh}
              onKill={() => onStateChange(prev => ({ ...prev, deck1: { ...prev.deck1, killHigh: !prev.deck1.killHigh } }))}
              onChange={(val) => {
                onStateChange(prev => ({ ...prev, deck1: { ...prev.deck1, eqHigh: val, killHigh: false } }));
                onSendMidi({ type: 'cc', channel: 1, control: 3, value: val, actionName: 'Deck 1 EQ High', vdjScript: 'deck 1 eq_high', deck: 1 });
              }}
            />
            <KnobControl
              label="Mid"
              value={state.deck1.killMid ? 0 : state.deck1.eqMid}
              color="cyan"
              isKilled={state.deck1.killMid}
              onKill={() => onStateChange(prev => ({ ...prev, deck1: { ...prev.deck1, killMid: !prev.deck1.killMid } }))}
              onChange={(val) => {
                onStateChange(prev => ({ ...prev, deck1: { ...prev.deck1, eqMid: val, killMid: false } }));
                onSendMidi({ type: 'cc', channel: 1, control: 4, value: val, actionName: 'Deck 1 EQ Mid', vdjScript: 'deck 1 eq_mid', deck: 1 });
              }}
            />
            <KnobControl
              label="Low"
              value={state.deck1.killLow ? 0 : state.deck1.eqLow}
              color="cyan"
              isKilled={state.deck1.killLow}
              onKill={() => onStateChange(prev => ({ ...prev, deck1: { ...prev.deck1, killLow: !prev.deck1.killLow } }))}
              onChange={(val) => {
                onStateChange(prev => ({ ...prev, deck1: { ...prev.deck1, eqLow: val, killLow: false } }));
                onSendMidi({ type: 'cc', channel: 1, control: 5, value: val, actionName: 'Deck 1 EQ Low', vdjScript: 'deck 1 eq_low', deck: 1 });
              }}
            />
          </div>

          {/* Deck 2 EQ */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase">CH 2 EQ</span>
            <KnobControl
              label="Gain"
              value={state.deck2.gain}
              color="amber"
              onChange={(val) => {
                onStateChange(prev => ({ ...prev, deck2: { ...prev.deck2, gain: val } }));
                onSendMidi({ type: 'cc', channel: 2, control: 2, value: val, actionName: 'Deck 2 Gain', vdjScript: 'deck 2 gain', deck: 2 });
              }}
            />
            <KnobControl
              label="High"
              value={state.deck2.killHigh ? 0 : state.deck2.eqHigh}
              color="amber"
              isKilled={state.deck2.killHigh}
              onKill={() => onStateChange(prev => ({ ...prev, deck2: { ...prev.deck2, killHigh: !prev.deck2.killHigh } }))}
              onChange={(val) => {
                onStateChange(prev => ({ ...prev, deck2: { ...prev.deck2, eqHigh: val, killHigh: false } }));
                onSendMidi({ type: 'cc', channel: 2, control: 3, value: val, actionName: 'Deck 2 EQ High', vdjScript: 'deck 2 eq_high', deck: 2 });
              }}
            />
            <KnobControl
              label="Mid"
              value={state.deck2.killMid ? 0 : state.deck2.eqMid}
              color="amber"
              isKilled={state.deck2.killMid}
              onKill={() => onStateChange(prev => ({ ...prev, deck2: { ...prev.deck2, killMid: !prev.deck2.killMid } }))}
              onChange={(val) => {
                onStateChange(prev => ({ ...prev, deck2: { ...prev.deck2, eqMid: val, killMid: false } }));
                onSendMidi({ type: 'cc', channel: 2, control: 4, value: val, actionName: 'Deck 2 EQ Mid', vdjScript: 'deck 2 eq_mid', deck: 2 });
              }}
            />
            <KnobControl
              label="Low"
              value={state.deck2.killLow ? 0 : state.deck2.eqLow}
              color="amber"
              isKilled={state.deck2.killLow}
              onKill={() => onStateChange(prev => ({ ...prev, deck2: { ...prev.deck2, killLow: !prev.deck2.killLow } }))}
              onChange={(val) => {
                onStateChange(prev => ({ ...prev, deck2: { ...prev.deck2, eqLow: val, killLow: false } }));
                onSendMidi({ type: 'cc', channel: 2, control: 5, value: val, actionName: 'Deck 2 EQ Low', vdjScript: 'deck 2 eq_low', deck: 2 });
              }}
            />
          </div>
        </div>

        {/* Volume Faders CH1 & CH2 */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-800">
          <FaderControl
            label="Vol A"
            value={state.deck1.volume}
            color="cyan"
            onChange={(val) => {
              onStateChange(prev => ({ ...prev, deck1: { ...prev.deck1, volume: val } }));
              onSendMidi({ type: 'cc', channel: 1, control: 1, value: val, actionName: 'Deck 1 Volume', vdjScript: 'deck 1 volume', deck: 1 });
            }}
          />
          <FaderControl
            label="Vol B"
            value={state.deck2.volume}
            color="amber"
            onChange={(val) => {
              onStateChange(prev => ({ ...prev, deck2: { ...prev.deck2, volume: val } }));
              onSendMidi({ type: 'cc', channel: 2, control: 1, value: val, actionName: 'Deck 2 Volume', vdjScript: 'deck 2 volume', deck: 2 });
            }}
          />
        </div>

        {/* Crossfader */}
        <div className="pt-4">
          <FaderControl
            label="Crossfader"
            orientation="horizontal"
            value={state.crossfader}
            centerDetent={true}
            onChange={(val) => {
              onStateChange(prev => ({ ...prev, crossfader: val }));
              onSendMidi({ type: 'cc', channel: 3, control: 10, value: val, actionName: 'Crossfader', vdjScript: 'crossfader' });
            }}
          />
        </div>

        {/* Sampler Trigger Matrix */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
            <span className="uppercase font-bold tracking-wider">Sampler Rapide</span>
            <span>Web Audio + MIDI</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['kick', 'snare', 'hihat', 'clap'] as const).map(sample => (
              <button
                key={sample}
                type="button"
                onPointerDown={() => handleSampler(sample)}
                className="py-2 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold text-slate-200 uppercase hover:bg-slate-700 active:bg-cyan-500 active:text-black transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Mobile view tab bar switcher (only on small screens) */}
      <div className="lg:hidden flex items-center justify-between bg-slate-900 border border-slate-800 p-1 rounded-xl mb-3">
        <button
          type="button"
          onClick={() => setMobileTab('split')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'split' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Vue Complète
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('deck1')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'deck1' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Platine A
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('mixer')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'mixer' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Mixer
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('deck2')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mobileTab === 'deck2' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Platine B
        </button>
      </div>

      {/* Desktop view (Always 3 columns) or Mobile focused view */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-4">
          {renderDeck(1)}
        </div>
        <div className="lg:col-span-4">
          {renderMixer()}
        </div>
        <div className="lg:col-span-4">
          {renderDeck(2)}
        </div>
      </div>

      {/* Mobile responsive view based on selected tab */}
      <div className="lg:hidden space-y-4">
        {mobileTab === 'split' && (
          <div className="space-y-4">
            {renderDeck(1)}
            {renderMixer()}
            {renderDeck(2)}
          </div>
        )}
        {mobileTab === 'deck1' && renderDeck(1)}
        {mobileTab === 'mixer' && renderMixer()}
        {mobileTab === 'deck2' && renderDeck(2)}
      </div>
    </div>
  );
};
