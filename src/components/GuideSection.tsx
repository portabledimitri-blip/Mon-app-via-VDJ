import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Smartphone,
  Radio,
  HelpCircle,
  Download,
  ExternalLink,
  ShieldAlert,
  Cpu,
  Sparkles,
  Github,
  Globe,
  Wifi,
  Terminal,
  Zap,
  Cable
} from 'lucide-react';

export const GuideSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'github' | 'solution' | 'loopmidi' | 'usb' | 'vdj_remote'>('github');

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Hébergement GitHub & Solutions de Connexion Mobile
            </h2>
            <p className="text-xs text-slate-400">
              Comment héberger publiquement, supprimer le blocage du QR code et connecter votre smartphone
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              activeTab === 'github' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Héberger sur GitHub
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('usb')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'usb' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mode Câble USB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('solution')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'solution' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cette Web App
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loopmidi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'loopmidi' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tuto loopMIDI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vdj_remote')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'vdj_remote' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            VirtualDJ Remote
          </button>
        </div>
      </div>

      {/* Content depending on active tab */}
      <div className="mt-6">
        {/* TAB 1: GITHUB HOSTING (Answers the user's specific question!) */}
        {activeTab === 'github' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 leading-relaxed flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300 font-bold block text-sm mb-1">
                  Oui, héberger sur GitHub règle 100% du problème de scan du QR Code !
                </strong>
                Actuellement, l'adresse de prévisualisation Google Cloud bloque votre smartphone car elle exige d'être connecté à votre compte Google.
                Sur <strong>GitHub Pages</strong> ou <strong>Render/Vercel</strong>, l'URL est totalement publique : votre smartphone scanne le QR code et la platine DJ s'ouvre instantanément sans aucun mot de passe ni compte requis.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option A: GitHub Pages (P2P WebRTC) */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-slate-100 text-sm">
                    Option A : Hébergement GitHub Pages (100% Gratuit)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  GitHub Pages héberge gratuitement votre site sous l'adresse : <br />
                  <code className="text-cyan-400 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded mt-1 inline-block">
                    https://[votre-pseudo].github.io/mon-controleur-dj/
                  </code>
                </p>
                <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-900">
                  <div className="font-semibold text-slate-200">Comment le téléphone communique avec le PC ?</div>
                  <p className="text-slate-400 leading-relaxed">
                    Cette application intègre <strong>WebRTC (PeerJS)</strong>. Le téléphone et le PC établissent une connexion directe de navigateur à navigateur sans passer par un serveur payant !
                  </p>
                </div>
              </div>

              {/* Option B: Render.com ou Vercel (Full-Stack WebSocket) */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-slate-100 text-sm">
                    Option B : Render.com ou Vercel (Recommandé)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Vous connectez votre dépôt GitHub à <strong>Render.com</strong> ou <strong>Vercel</strong> (comptes gratuits).
                </p>
                <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-900">
                  <div className="font-semibold text-slate-200">Avantage :</div>
                  <p className="text-slate-400 leading-relaxed">
                    Render exécute le serveur <strong>WebSocket Node.js</strong> complet en temps réel. Le QR code pointe directement sur votre nom de domaine gratuit (ex: <code className="text-amber-300 font-mono">mon-dj.onrender.com</code>).
                  </p>
                </div>
              </div>
            </div>

            {/* Step-by-Step GitHub Deployment Guide */}
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Guide pas à pas pour déployer sur votre GitHub
              </h3>

              <ol className="list-decimal list-inside space-y-3 text-xs text-slate-300 leading-relaxed">
                <li>
                  <strong>Créez un dépôt GitHub :</strong> Rendez-vous sur <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">github.com/new</a> et créez un dépôt nommé par exemple <span className="font-mono text-cyan-300">mon-controleur-dj</span> (en mode Public).
                </li>
                <li>
                  <strong>Téléchargez le code :</strong> Exportez le code de ce projet et poussez-le sur votre nouveau dépôt GitHub :
                  <div className="bg-slate-900 p-2.5 rounded font-mono text-[11px] text-slate-300 mt-1.5 space-y-1 border border-slate-800">
                    <div>git init</div>
                    <div>git remote add origin https://github.com/[VOTRE-PSEUDO]/mon-controleur-dj.git</div>
                    <div>git add .</div>
                    <div>git commit -m "Controleur VirtualDJ pour smartphone"</div>
                    <div>git push -u origin main</div>
                  </div>
                </li>
                <li>
                  <strong>Activez GitHub Pages :</strong>
                  <p className="mt-1 text-slate-400">
                    Dans votre dépôt sur GitHub &gt; cliquez sur <strong>Settings</strong> &gt; menu <strong>Pages</strong> &gt; sous "Build and deployment", choisissez <strong>GitHub Actions</strong> (ou la branche main) pour publier le site en 1 minute.
                  </p>
                </li>
                <li>
                  <strong>Scannez depuis votre téléphone :</strong> Ouvrez votre nouvelle adresse sur le PC. Le QR code généré est désormais <strong>100% public</strong> et s'ouvre sur n'importe quel smartphone immédiatement !
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 2: USB DIRECT CABLE */}
        {activeTab === 'usb' && (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 leading-relaxed flex items-start gap-3">
              <Cable className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300 font-bold block text-sm mb-1">
                  La méthode la plus rapide sans aucun hébergement web :
                </strong>
                Si vous avez un smartphone Android, vous pouvez le brancher directement avec son câble de chargeur USB sur votre PC. Votre téléphone devient un contrôleur MIDI matériel direct sans aucun QR code !
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400">1. BRANCHER LE CÂBLE</span>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Reliez votre smartphone au PC via USB (le même câble que vous utilisez pour le recharger).
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400">2. MODE "MIDI"</span>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Sur le téléphone, faites glisser le volet de notifications vers le bas &gt; touchez "Options USB" &gt; sélectionnez <strong>MIDI</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400">3. VIRTUALDJ DIRECT</span>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  VirtualDJ reconnaît instantanément votre smartphone dans <em>Paramètres &gt; Contrôleurs</em>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THIS WEB APP */}
        {activeTab === 'solution' && (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 leading-relaxed flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-300 font-bold block text-sm mb-1">
                  Pourquoi le MIDI virtuel est idéal avec Virtual DJ Gratuit :
                </strong>
                Les contrôleurs physiques USB sont limités à 10 minutes d'essai dans VirtualDJ Free. 
                Mais un contrôleur virtuel connecté via <strong>loopMIDI</strong> est considéré comme un périphérique personnalisé sans limite de temps.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400">ÉTAPE 1</span>
                <h4 className="font-bold text-slate-200 text-sm mt-1">loopMIDI sur PC</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Téléchargez loopMIDI (1 Mo). Il crée un câble MIDI virtuel sur votre PC.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400">ÉTAPE 2</span>
                <h4 className="font-bold text-slate-200 text-sm mt-1">Mapping XML</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Dans l'onglet "Mapping XML", téléchargez le fichier et collez-le dans <span className="font-mono text-slate-200">Documents\VirtualDJ\Mappers\</span>.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400">ÉTAPE 3</span>
                <h4 className="font-bold text-slate-200 text-sm mt-1">Mixer sans limite</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Lancez VirtualDJ et pilotez vos platines A et B depuis votre smartphone.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOOPMIDI TUTORIAL */}
        {activeTab === 'loopmidi' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-200">
              Guide d'installation de loopMIDI (Windows) en 2 minutes
            </h3>
            <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed">
              <li>
                Téléchargez loopMIDI sur : <a href="https://www.tobias-erichsen.de/software/loopmidi.html" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">tobias-erichsen.de/software/loopmidi.html</a>
              </li>
              <li>Installez le fichier setup (cliquez sur "Next", aucun logiciel indésirable).</li>
              <li>Ouvrez <strong>loopMIDI</strong> depuis votre menu Démarrer.</li>
              <li>Dans la case "New port-name", laissez <strong>loopMIDI Port</strong>.</li>
              <li>Cliquez sur le bouton <strong>"+"</strong> : le port apparaît dans la liste.</li>
              <li>Laissez-le tourner en tâche de fond. VirtualDJ le détectera automatiquement !</li>
            </ol>
          </div>
        )}

        {/* TAB 5: VDJ REMOTE */}
        {activeTab === 'vdj_remote' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-200">
              L'application officielle VirtualDJ Remote
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Avantages
                </h4>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>Connexion automatique en WiFi avec votre PC.</li>
                  <li>Affichage des formes d'onde en temps réel.</li>
                  <li>Interface tactile officielle d'Atomix.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  Limite en version Gratuite
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dans VirtualDJ Home Free, VirtualDJ Remote ne fonctionne que <strong>10 minutes par session</strong>. C'est pourquoi la solution MIDI virtuel / Câble USB reste la plus recommandée.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
