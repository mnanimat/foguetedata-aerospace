import React, { useState, useEffect } from 'react';
import { ActiveTab, User } from './types';
import { Navbar } from './components/Navbar';
import { OfflineCacheBanner } from './components/OfflineCacheBanner';
import { FlightSimulator } from './components/FlightSimulator';
import { TelemetryPanel } from './components/TelemetryPanel';
import { SubsystemsDetail } from './components/SubsystemsDetail';
import { ManualBarAeb } from './components/ManualBarAeb';
import { TeamManagement } from './components/TeamManagement';
import { User3DModelStudio } from './components/User3DModelStudio';
import { CadRepository } from './components/CadRepository';
import { SatellitePayloadStudio } from './components/SatellitePayloadStudio';
import { LegalAndReferences } from './components/LegalAndReferences';
import { AuthModal } from './components/AuthModal';
import { InteractiveWalkthrough } from './components/InteractiveWalkthrough';
import { FallingRocketryRain } from './components/FallingRocketryRain';
import { RocketAudioPlayer } from './components/RocketAudioPlayer';
import { EXTERNAL_LINKS } from './data/knowledgeData';
import { ExternalLink, Layers, Box, Sparkles, Heart, Mail } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { getStoredUserSession, saveStoredUserSession } from './utils/offlineCache';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('trajectory');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  // Authenticated User State with localStorage persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUserSession());

  useEffect(() => {
    saveStoredUserSession(currentUser);
  }, [currentUser]);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-300 flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
        
        {/* Top Main Navbar with embedded header controls */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onLogout={() => setCurrentUser(null)}
          onStartWalkthrough={() => setIsWalkthroughOpen(true)}
        />

        {/* Persistent Offline Cache Status Banner */}
        <OfflineCacheBanner />

        {/* Main Page Body Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 lg:px-6 py-5 space-y-6">
          
          {/* Tab 1: Trajectory & Aerodynamic Simulation */}
          {activeTab === 'trajectory' && <FlightSimulator />}

          {/* Tab 2: Live Telemetry Station */}
          {activeTab === 'telemetry' && <TelemetryPanel />}

          {/* Tab 3: Subsystems & Electronics Assembly Bench */}
          {activeTab === 'subsystems' && <SubsystemsDetail />}

          {/* Tab 4: Satellite & Payload Designer */}
          {activeTab === 'satellite' && (
            <SatellitePayloadStudio
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthOpen(true)}
              onLoadPayloadToSimulator={(payloadMass) => {
                try {
                  const saved = localStorage.getItem('foguetedata_flight_params_v1');
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    parsed.massInitial = Math.round((parsed.massFinal + 0.35 + payloadMass) * 100) / 100;
                    localStorage.setItem('foguetedata_flight_params_v1', JSON.stringify(parsed));
                  }
                } catch {}
                setActiveTab('trajectory');
              }}
            />
          )}

          {/* Tab 4: Manual BAR-AEB & Dedicated Author Space */}
          {activeTab === 'manual_bar_aeb' && (
            <ManualBarAeb
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthOpen(true)}
            />
          )}

          {/* Tab 5: Team Management & Media Links */}
          {activeTab === 'team' && (
            <TeamManagement
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthOpen(true)}
            />
          )}

          {/* Tab 6: Community 3D Models Studio (Move/Rotate/Scale) */}
          {activeTab === 'community' && (
            <User3DModelStudio
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthOpen(true)}
              onStartWalkthrough={() => setIsWalkthroughOpen(true)}
            />
          )}

          {/* Tab 7: CAD Models, Electronic Diagrams & Google Drive License Repository */}
          {activeTab === 'cad_repository' && (
            <CadRepository
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthOpen(true)}
            />
          )}

          {/* Tab 8: Legal Terms, MIT License & References */}
          {activeTab === 'legal' && <LegalAndReferences />}
        </main>

        {/* Interactive Walkthrough Tour */}
        <InteractiveWalkthrough
          isOpen={isWalkthroughOpen}
          onClose={() => setIsWalkthroughOpen(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* Auth / Login Modal */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={(usr) => setCurrentUser(usr)}
        />

        {/* High Density Compact Footer */}
        <footer className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 bg-[#05070A] dark:bg-[#05070A] light:bg-slate-100 text-slate-500 dark:text-slate-500 light:text-slate-600 py-3 px-4 text-[10px] font-mono mt-8 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 text-center md:text-left">
              <span className="font-bold text-slate-300 dark:text-slate-300 light:text-slate-800">© 2026 FogueteData Aerospace</span>
              <span className="text-slate-700 dark:text-slate-700 light:text-slate-300">|</span>
              <span>Desenvolvedor: <strong className="text-slate-300 dark:text-slate-300 light:text-slate-800">Micael Nildo Oliveira Souza com auxílio de Inteligência Artificial (IA)</strong></span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:micaelnildo@mnanimat.xyz"
                className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-emerald-400 transition"
                title="Contato e Sugestões de Melhoria"
              >
                <Mail className="w-3 h-3 text-emerald-400" />
                micaelnildo@mnanimat.xyz
              </a>

              <a
                href={EXTERNAL_LINKS.mnanimat3d}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-blue-400 transition"
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                MNAnimat3D
              </a>

              <a
                href={EXTERNAL_LINKS.cadMnanimat}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-emerald-400 transition"
              >
                <Box className="w-3 h-3 text-emerald-400" />
                cad.mnanimat.xyz
              </a>

              <button
                onClick={() => setActiveTab('legal')}
                className="hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-900 transition text-slate-400 dark:text-slate-400 light:text-slate-600"
              >
                Licença MIT & Termos Legais
              </button>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
