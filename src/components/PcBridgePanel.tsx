import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { MidiDeviceOption, MidiEventPayload, RoomStatus } from '../types/midi';
import { midiService } from '../utils/midiService';
import {
  QrCode,
  Smartphone,
  Wifi,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Radio,
  ExternalLink,
  Cable,
  HelpCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface PcBridgePanelProps {
  roomId: string;
  roomStatus: RoomStatus | null;
  midiDevices: MidiDeviceOption[];
  selectedMidiId: string | null;
  onSelectMidi: (id: string) => void;
  onRefreshMidi: () => void;
  midiLog: MidiEventPayload[];
  onClearLog: () => void;
}

export const PcBridgePanel: React.FC<PcBridgePanelProps> = ({
  roomId,
  roomStatus,
  midiDevices,
  selectedMidiId,
  onSelectMidi,
  onRefreshMidi,
  midiLog,
  onClearLog,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'qr' | 'usb' | 'native_app'>('qr');
  const [serverConfig, setServerConfig] = useState<{ sharedUrl: string; devUrl: string } | null>(null);

  // Fetch server configuration to get the shared public URL
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setServerConfig(data))
      .catch(() => {
        // fallback
      });
  }, []);

  // Compute the phone URL: prioritize shared public URL over restricted dev URL
  const baseUrl = serverConfig?.sharedUrl || (typeof window !== 'undefined' ? window.location.origin.replace('ais-dev-', 'ais-pre-') : '');
  const phoneUrl = baseUrl ? `${baseUrl}/?room=${roomId}&role=phone` : '';

  useEffect(() => {
    if (phoneUrl) {
      QRCode.toDataURL(phoneUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      }).then((url) => {
        setQrDataUrl(url);
      }).catch(console.error);
    }
  }, [phoneUrl]);

  const copyUrlToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phoneUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isPhoneConnected = roomStatus?.phoneConnected ?? false;

  return (
    <div className="space-y-6">
      {/* Method Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setConnectionMode('qr')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            connectionMode === 'qr' ? 'bg-cyan-500 text-black shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Option 1 : Sans-fil (QR Code & Navigateur)</span>
        </button>

        <button
          type="button"
          onClick={() => setConnectionMode('usb')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            connectionMode === 'usb' ? 'bg-cyan-500 text-black shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Cable className="w-4 h-4" />
          <span>Option 2 : Câble USB Direct (Sans QR Code)</span>
        </button>

        <button
          type="button"
          onClick={() => setConnectionMode('native_app')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            connectionMode === 'native_app' ? 'bg-cyan-500 text-black shadow' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Option 3 : Apps Dédiées (Midi Commander / TouchOSC)</span>
        </button>
      </div>

      {/* Mode 1: QR Code & Web Connection */}
      {connectionMode === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: QR Code */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-slate-100">
                  Connexion Smartphone
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPhoneConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span className="text-xs font-mono text-slate-400">
                  {isPhoneConnected ? 'Connecté' : 'En attente'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code pour smartphone"
                    className="w-52 h-52 block"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
                    Génération du QR Code...
                  </div>
                )}
              </div>

              {/* Direct Link Copy Button */}
              <div className="w-full mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    Session PIN : <strong className="text-cyan-400">{roomId}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={copyUrlToClipboard}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copié !' : 'Copier l\'adresse'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800 select-all">
                  {phoneUrl || 'Chargement...'}
                </div>
              </div>
            </div>

            {/* Why QR code might fail box */}
            <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Le scan ne s'ouvre pas ou affiche une erreur ?</span>
              </div>
              <p className="leading-relaxed text-slate-300 text-[11px]">
                1. <strong>Connexion Google requise sur mobile :</strong> La page de développement Google Cloud nécessite d'être connecté au même compte Google (<em>portabledimitri@gmail.com</em>) dans le navigateur de votre smartphone (Chrome/Safari).
              </p>
              <p className="leading-relaxed text-slate-300 text-[11px]">
                2. <strong>Ou utilisez l'Option 2 par câble USB :</strong> Elle fonctionne immédiatement sans réseau, sans QR code et sans compte Google !
              </p>
            </div>
          </div>

          {/* Column 2: WebMIDI Ports & Console */}
          <div className="lg:col-span-7 space-y-6">
            {/* WebMIDI config */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-slate-100">
                    Sortie WebMIDI vers VirtualDJ
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onRefreshMidi}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualiser</span>
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  Périphérique MIDI de sortie (Windows / Mac) :
                </label>

                {midiDevices.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={selectedMidiId || ''}
                      onChange={(e) => onSelectMidi(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      {midiDevices.map((dev) => (
                        <option key={dev.id} value={dev.id}>
                          {dev.name} {dev.name.toLowerCase().includes('loopmidi') ? '★ (Recommandé pour VirtualDJ)' : ''}
                        </option>
                      ))}
                    </select>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">Sortie active : </span>
                        <span>
                          Chaque touche sur votre téléphone envoie de vrais signaux MIDI vers ce port. VirtualDJ les reçoit en direct !
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
                    <div>
                      <p className="font-bold">Aucun port MIDI virtuel détecté</p>
                      <p className="mt-1 text-slate-300">
                        Installez <strong>loopMIDI</strong> (100% gratuit) pour faire le pont vers VirtualDJ.
                      </p>
                      <a
                        href="https://www.tobias-erichsen.de/software/loopmidi.html"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 px-3 py-1 bg-amber-500 text-black font-bold rounded hover:bg-amber-400 transition-colors"
                      >
                        Télécharger loopMIDI (Gratuit)
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live MIDI Event Monitor */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-slate-100">
                    Moniteur MIDI en Direct
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {midiLog.length} messages
                  </span>
                  <button
                    type="button"
                    onClick={onClearLog}
                    className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                  >
                    Vider
                  </button>
                </div>
              </div>

              <div className="h-44 overflow-y-auto font-mono text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 no-scrollbar">
                {midiLog.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    En attente d'actions tactiles ou de commandes MIDI...
                  </div>
                ) : (
                  midiLog.map((ev, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-300 hover:bg-slate-900/60 p-1 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                          ev.type === 'note_on'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ev.type === 'note_off'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {ev.type.toUpperCase()}
                        </span>
                        <span className="text-slate-400 text-[11px]">CH {ev.channel}</span>
                        <span className="text-slate-200 font-semibold">{ev.actionName || `Ctrl ${ev.control}`}</span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                        <span className="font-mono text-cyan-300 tabular-nums">Val: {ev.value}</span>
                        {ev.vdjScript && (
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                            {ev.vdjScript}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Direct USB Cable (Zero QR code, 100% Reliable) */}
      {connectionMode === 'usb' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cable className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Connexion directe par Câble USB (Android)
              </h2>
              <p className="text-xs text-slate-400">
                La méthode la plus rapide et fiable : zéro réseau, zéro QR code, zéro latence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400">1. BRANCHER LE CÂBLE</span>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Reliez votre smartphone Android à votre PC avec un câble USB standard (le câble de chargeur de votre téléphone).
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400">2. SÉLECTIONNER "MIDI"</span>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Sur votre téléphone, faites glisser la barre de notification vers le bas &gt; appuyez sur <strong>"Recharge via USB"</strong> &gt; cochez <strong>"MIDI"</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400">3. VIRTUALDJ LE DÉTECTE</span>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Windows installe automatiquement le périphérique MIDI. Ouvrez VirtualDJ &gt; Paramètres &gt; Contrôleurs : votre téléphone apparaît dans la liste !
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Dedicated Native Mobile Applications */}
      {connectionMode === 'native_app' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Applications Dédiées depuis le Google Play Store & App Store
              </h2>
              <p className="text-xs text-slate-400">
                Installez une application native directement sur votre smartphone pour piloter VirtualDJ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* App 1: MIDI Commander */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-100">MIDI Commander</h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    100% Gratuit
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Application Android dédiée qui transforme l'écran en pads, curseurs et boutons MIDI personnalisables. Fonctionne en USB ou WiFi sans limite de temps.
                </p>
                <div className="mt-3 text-[11px] text-slate-300 space-y-1">
                  <div>✓ Disponible sur Google Play Store</div>
                  <div>✓ Compatible avec le mode USB MIDI Android</div>
                  <div>✓ Aucune limitation de session</div>
                </div>
              </div>
            </div>

            {/* App 2: VirtualDJ Remote */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-100">VirtualDJ Remote</h3>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Officiel VirtualDJ
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  L'application officielle d'Atomix Productions sur Android et iOS. Affiche les waveforms et se synchronise automatiquement en WiFi.
                </p>
                <div className="mt-3 text-[11px] text-amber-300/90 space-y-1">
                  <div>⚠ Limité à 10 min par session en version Free</div>
                  <div>✓ Idéal pour tester sans configuration</div>
                </div>
              </div>
            </div>

            {/* App 3: TouchOSC */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-100">TouchOSC</h3>
                  <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    Référence Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Le standard de l'industrie musicale pour iPhone, iPad et Android. Se connecte au PC avec l'utilitaire gratuit <em>TouchOSC Bridge</em>.
                </p>
                <div className="mt-3 text-[11px] text-slate-300 space-y-1">
                  <div>✓ Interface ultra fluide et réactive</div>
                  <div>✓ Mapping totalement libre</div>
                  <div>✓ Disponible sur iOS & Android</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
