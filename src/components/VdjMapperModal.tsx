import React, { useState } from 'react';
import { generateVdjMapperXml, downloadXmlFile } from '../utils/vdjXmlGenerator';
import { FileCode, Download, Copy, Check, Folder, HelpCircle, CheckCircle2 } from 'lucide-react';

interface VdjMapperModalProps {
  defaultDeviceName?: string;
}

export const VdjMapperModal: React.FC<VdjMapperModalProps> = ({
  defaultDeviceName = 'loopMIDI Port',
}) => {
  const [deviceName, setDeviceName] = useState(defaultDeviceName);
  const [copied, setCopied] = useState(false);

  const xmlContent = generateVdjMapperXml(deviceName);

  const handleDownload = () => {
    downloadXmlFile(`${deviceName}.xml`, xmlContent);
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Fichier de Mappage VirtualDJ (.XML)
            </h2>
            <p className="text-xs text-slate-400">
              Assigne automatiquement chaque bouton et fader du téléphone dans VirtualDJ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié !' : 'Copier XML'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg transition-colors shadow-md shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger ({deviceName}.xml)</span>
          </button>
        </div>
      </div>

      {/* Device Name input */}
      <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block">
              Nom du Périphérique MIDI dans VirtualDJ :
            </label>
            <p className="text-[11px] text-slate-400">
              Doit correspondre exactement au nom créé dans loopMIDI (généralement "loopMIDI Port")
            </p>
          </div>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-1.5 rounded-lg text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none w-full sm:w-64"
          />
        </div>
      </div>

      {/* 3 Step Installation Guide */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center mb-2">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">Télécharger le fichier</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cliquez sur le bouton ci-dessus pour télécharger <span className="text-slate-200 font-mono">{deviceName}.xml</span> sur votre PC.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center mb-2">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">Copier dans VirtualDJ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Placez ce fichier dans votre dossier utilisateur :
            </p>
            <code className="text-[11px] text-amber-300 font-mono block mt-1 bg-slate-900 p-1.5 rounded border border-slate-800 break-all">
              Documents\VirtualDJ\Mappers\
            </code>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center mb-2">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">Activer dans VirtualDJ</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ouvrez VirtualDJ &gt; Engrenage (Paramètres) &gt; <span className="text-slate-200 font-semibold">Contrôleurs</span> &gt; Sélectionnez <span className="font-mono text-cyan-400">{deviceName}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* XML Code Preview */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
          <span>Aperçu des instructions VDJScript générées :</span>
          <span>Format standard VirtualDJ 8 / 2024</span>
        </div>
        <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-200/90 h-52 overflow-y-auto no-scrollbar">
          {xmlContent}
        </pre>
      </div>
    </div>
  );
};
