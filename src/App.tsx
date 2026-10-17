import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ControllerGlobalState, MidiDeviceOption, MidiEventPayload, RoomStatus } from './types/midi';
import { Header } from './components/Header';
import { DjController } from './components/DjController';
import { PcBridgePanel } from './components/PcBridgePanel';
import { VdjMapperModal } from './components/VdjMapperModal';
import { GuideSection } from './components/GuideSection';
import { midiService } from './utils/midiService';
import { Smartphone, Radio, Download, BookOpen, Sliders, CheckCircle2, Zap, ArrowRight, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';

const INITIAL_STATE: ControllerGlobalState = {
  crossfader: 64, // Center
  masterVolume: 100,
  headphonesMix: 64,
  deck1: {
    isPlaying: false,
    isCueing: false,
    isSynced: false,
    bpm: 124.0,
    pitch: 0,
    volume: 100,
    gain: 64,
    eqHigh: 64,
    eqMid: 64,
    eqLow: 64,
    killLow: false,
    killMid: false,
    killHigh: false,
    hotCues: {},
    loopActive: false,
    loopSize: 4,
    activeFx: {},
    jogAngle: 0,
  },
  deck2: {
    isPlaying: false,
    isCueing: false,
    isSynced: false,
    bpm: 126.0,
    pitch: 0,
    volume: 100,
    gain: 64,
    eqHigh: 64,
    eqMid: 64,
    eqLow: 64,
    killLow: false,
    killMid: false,
    killHigh: false,
    hotCues: {},
    loopActive: false,
    loopSize: 4,
    activeFx: {},
    jogAngle: 0,
  },
};

export default function App() {
  const [activeSection, setActiveSection] = useState<'controller' | 'bridge' | 'mapper' | 'guide'>('controller');
  const [djState, setDjState] = useState<ControllerGlobalState>(INITIAL_STATE);
  const [midiDevices, setMidiDevices] = useState<MidiDeviceOption[]>([]);
  const [selectedMidiId, setSelectedMidiId] = useState<string | null>(null);
  const [midiLog, setMidiLog] = useState<MidiEventPayload[]>([]);
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);

  // Parse URL query params for roomId and role
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const r = params.get('room');
      if (r) return r;
    }
    // Generate clean 6-character room PIN
    return `VDJ-${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const [role, setRole] = useState<'pc' | 'phone'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'phone') return 'phone';
    }
    // If screen width is small (mobile device portrait), default to phone mode
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return 'phone';
    }
    return 'pc';
  });

  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebMIDI on mount
  const refreshMidiDevices = useCallback(async () => {
    const devices = await midiService.initMidi();
    setMidiDevices(devices);
    setSelectedMidiId(midiService.getSelectedOutputId());
  }, []);

  useEffect(() => {
    refreshMidiDevices();
  }, [refreshMidiDevices]);

  // Subscribe to local MIDI events to populate the log
  useEffect(() => {
    const unsub = midiService.onMidiSent((ev) => {
      setMidiLog((prev) => [ev, ...prev.slice(0, 49)]);
    });
    return unsub;
  }, []);

  // Initialize WebSocket connection for phone <-> PC sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          // Join the room with our role
          socket?.send(JSON.stringify({
            type: 'join',
            roomId,
            role,
          }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'room_status') {
              setRoomStatus(data);
            } else if (data.type === 'midi_event') {
              // Received MIDI action from peer (e.g. phone -> PC)
              const payload = data.payload as MidiEventPayload;
              // If we are on PC, forward to WebMIDI (loopMIDI)!
              if (role === 'pc') {
                if (payload.type === 'note_on') {
                  midiService.sendNoteOn(payload.channel, payload.control, payload.value, payload.actionName, payload.vdjScript);
                } else if (payload.type === 'note_off') {
                  midiService.sendNoteOff(payload.channel, payload.control, payload.actionName, payload.vdjScript);
                } else if (payload.type === 'cc') {
                  midiService.sendCC(payload.channel, payload.control, payload.value, payload.actionName, payload.vdjScript);
                }
              }
              // Also update local DJ state if state updates were attached
              if (data.stateUpdate) {
                setDjState(prev => ({
                  ...prev,
                  ...data.stateUpdate,
                }));
              }
            }
          } catch {
            // Ignore
          }
        };

        socket.onclose = () => {
          reconnectTimer = setTimeout(connect, 2000);
        };
      } catch {
        // Fallback
      }
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) socket.close();
    };
  }, [roomId, role]);

  // Transmit MIDI action: either locally or broadcast to PC via WebSocket or HTTP fallback
  const handleSendMidi = (item: {
    type: 'note_on' | 'note_off' | 'cc';
    channel: number;
    control: number;
    value: number;
    actionName: string;
    vdjScript: string;
    deck?: 1 | 2;
  }) => {
    // 1. Send locally via WebMIDI if available
    let payload: MidiEventPayload;
    if (item.type === 'note_on') {
      payload = midiService.sendNoteOn(item.channel, item.control, item.value, item.actionName, item.vdjScript);
    } else if (item.type === 'note_off') {
      payload = midiService.sendNoteOff(item.channel, item.control, item.actionName, item.vdjScript);
    } else {
      payload = midiService.sendCC(item.channel, item.control, item.value, item.actionName, item.vdjScript);
    }

    // 2. Broadcast via WebSocket if available, otherwise fallback to HTTP POST
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'midi_event',
        roomId,
        payload,
      }));
    } else {
      fetch(`/api/rooms/${roomId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      }).catch(() => {});
    }
  };

  // HTTP Polling fallback on PC so it never misses events even if WebSocket drops
  useEffect(() => {
    if (role !== 'pc') return;
    let lastSeenId = 0;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/events?since=${lastSeenId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          data.events.forEach((evt: { id: number; payload: MidiEventPayload }) => {
            lastSeenId = Math.max(lastSeenId, evt.id);
            const p = evt.payload;
            if (p) {
              if (p.type === 'note_on') {
                midiService.sendNoteOn(p.channel, p.control, p.value, p.actionName, p.vdjScript);
              } else if (p.type === 'note_off') {
                midiService.sendNoteOff(p.channel, p.control, p.actionName, p.vdjScript);
              } else if (p.type === 'cc') {
                midiService.sendCC(p.channel, p.control, p.value, p.actionName, p.vdjScript);
              }
            }
          });
        }
      } catch {
        // ignore
      }
    }, 500);

    return () => clearInterval(interval);
  }, [role, roomId]);

  const isPhoneConnected = roomStatus?.phoneConnected ?? false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Clean Header */}
      <Header
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onOpenQuickPair={() => setActiveSection('bridge')}
        isPhoneConnected={isPhoneConnected}
        isMobileRole={role === 'phone'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Editorial Value Strip / Quick Guide Kicker */}
        {role === 'pc' && activeSection === 'controller' && (
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>SOLUTIONS VIRTUAL DJ GRATUIT & SMARTPHONE</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight">
                Utilisez votre téléphone comme contrôleur MIDI sans limitation de temps
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Connectez votre smartphone en WiFi via le QR code, routez le signal vers <strong className="text-slate-200">loopMIDI</strong> sur ce PC, et profitez d'une platine DJ tactile complète dans VirtualDJ.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSection('bridge')}
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Afficher le QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('mapper')}
                className="px-3.5 py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Mapping XML VirtualDJ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('guide')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              >
                Guide loopMIDI
              </button>
            </div>
          </div>
        )}

        {/* Section 1: DJ Tactile Controller */}
        {activeSection === 'controller' && (
          <div className="space-y-4">
            <DjController
              state={djState}
              onStateChange={setDjState}
              onSendMidi={handleSendMidi}
              isMobileView={role === 'phone'}
            />
          </div>
        )}

        {/* Section 2: Wireless PC Bridge & WebMIDI */}
        {activeSection === 'bridge' && (
          <div className="space-y-4">
            <PcBridgePanel
              roomId={roomId}
              roomStatus={roomStatus}
              midiDevices={midiDevices}
              selectedMidiId={selectedMidiId}
              onSelectMidi={(id) => {
                midiService.selectOutput(id);
                setSelectedMidiId(id);
              }}
              onRefreshMidi={refreshMidiDevices}
              midiLog={midiLog}
              onClearLog={() => setMidiLog([])}
            />
          </div>
        )}

        {/* Section 3: VirtualDJ XML Mapper Generator */}
        {activeSection === 'mapper' && (
          <div className="space-y-4">
            <VdjMapperModal
              defaultDeviceName={
                midiDevices.find(d => d.name.toLowerCase().includes('loopmidi'))?.name || 'loopMIDI Port'
              }
            />
          </div>
        )}

        {/* Section 4: Comprehensive Guide & FAQs */}
        {activeSection === 'guide' && (
          <div className="space-y-4">
            <GuideSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          VirtualDJ Mobile MIDI Studio · Compatible VirtualDJ 8 / 2024 Home Free, loopMIDI & WebMIDI
        </p>
      </footer>
    </div>
  );
}
