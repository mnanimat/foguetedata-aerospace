import React, { useState, useEffect } from 'react';
import { 
  RocketryTeam, 
  SponsorCompany, 
  CompetitionItem, 
  AerospaceCurriculum, 
  ForumThread, 
  ForumReply, 
  loadHubDataFromStorage, 
  saveHubDataToStorage, 
  HubStoragePayload 
} from '../data/rocketryHubData';
import { CloudflareSyncHeader } from './hub/CloudflareSyncHeader';
import { TeamsSection } from './hub/TeamsSection';
import { SponsorsSection } from './hub/SponsorsSection';
import { CompetitionsSection } from './hub/CompetitionsSection';
import { ForumSection } from './hub/ForumSection';
import { CurriculaSection } from './hub/CurriculaSection';
import { Users, Building2, Trophy, MessageSquare, FileText, Cloud, Check } from 'lucide-react';

export const AerospaceHubCloudflare: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'teams' | 'sponsors' | 'competitions' | 'forum' | 'curricula'
  >('teams');

  const [hubData, setHubData] = useState<HubStoragePayload>(() => loadHubDataFromStorage());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    saveHubDataToStorage(hubData);
  }, [hubData]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleSaveTeam = (team: RocketryTeam) => {
    setHubData((prev) => {
      const exists = prev.teams.some((t) => t.id === team.id);
      const newTeams = exists
        ? prev.teams.map((t) => (t.id === team.id ? team : t))
        : [team, ...prev.teams];
      return { ...prev, teams: newTeams };
    });
    showNotification(`Equipe "${team.name}" atualizada e salva no Cloudflare Pages!`);
  };

  const handleSaveSponsor = (sponsor: SponsorCompany) => {
    setHubData((prev) => {
      const exists = prev.sponsors.some((s) => s.id === sponsor.id);
      const newSponsors = exists
        ? prev.sponsors.map((s) => (s.id === sponsor.id ? sponsor : s))
        : [sponsor, ...prev.sponsors];
      return { ...prev, sponsors: newSponsors };
    });
    showNotification(`Empresa "${sponsor.companyName}" salva no Cloudflare Pages!`);
  };

  const handleSaveCompetition = (comp: CompetitionItem) => {
    setHubData((prev) => {
      const exists = prev.competitions.some((c) => c.id === comp.id);
      const newComps = exists
        ? prev.competitions.map((c) => (c.id === comp.id ? comp : c))
        : [comp, ...prev.competitions];
      return { ...prev, competitions: newComps };
    });
    showNotification(`Competição "${comp.name}" registrada com sucesso!`);
  };

  const handleSaveCurriculum = (cv: AerospaceCurriculum) => {
    setHubData((prev) => {
      const exists = prev.curricula.some((c) => c.id === cv.id);
      const newCvs = exists
        ? prev.curricula.map((c) => (c.id === cv.id ? cv : c))
        : [cv, ...prev.curricula];
      return { ...prev, curricula: newCvs };
    });
    showNotification(`Currículo de "${cv.fullName}" atualizado no Cloudflare Pages!`);
  };

  const handleSaveThread = (thread: ForumThread) => {
    setHubData((prev) => ({
      ...prev,
      threads: [thread, ...prev.threads]
    }));
    showNotification(`Tópico "${thread.title}" publicado no fórum!`);
  };

  const handleAddReply = (threadId: string, reply: ForumReply) => {
    setHubData((prev) => ({
      ...prev,
      threads: prev.threads.map((th) => {
        if (th.id === threadId) {
          return {
            ...th,
            replies: [...(th.replies || []), reply]
          };
        }
        return th;
      })
    }));
    showNotification('Resposta registrada no fórum!');
  };

  const handleLikeThread = (threadId: string) => {
    setHubData((prev) => ({
      ...prev,
      threads: prev.threads.map((th) => {
        if (th.id === threadId) {
          return { ...th, likesCount: th.likesCount + 1 };
        }
        return th;
      })
    }));
  };

  const handleForceSync = () => {
    saveHubDataToStorage(hubData);
    showNotification('Banco de dados KV/D1 do Cloudflare Pages sincronizado com sucesso!');
  };

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(hubData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `foguetedata_cloudflare_pages_backup_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Backup JSON baixado!');
  };

  return (
    <div className="space-y-6">
      {/* Cloudflare Banner Header */}
      <CloudflareSyncHeader
        syncState={hubData.syncState}
        onForceSync={handleForceSync}
        onExportJson={handleExportJson}
      />

      {/* Main Sub-Navigation Bar */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 no-scrollbar font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('teams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'teams'
              ? 'bg-[#111827] text-red-400 border-t-2 border-x border-red-500 border-b-transparent'
              : 'text-slate-400 hover:text-white bg-slate-950/40 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-red-500" />
          Equipes de Foguetemodelismo ({hubData.teams.length})
        </button>

        <button
          onClick={() => setActiveSubTab('sponsors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'sponsors'
              ? 'bg-[#111827] text-emerald-400 border-t-2 border-x border-emerald-500 border-b-transparent'
              : 'text-slate-400 hover:text-white bg-slate-950/40 border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          Empresas Patrocinadoras ({hubData.sponsors.length})
        </button>

        <button
          onClick={() => setActiveSubTab('competitions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'competitions'
              ? 'bg-[#111827] text-amber-400 border-t-2 border-x border-amber-500 border-b-transparent'
              : 'text-slate-400 hover:text-white bg-slate-950/40 border border-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          Competições ({hubData.competitions.length})
        </button>

        <button
          onClick={() => setActiveSubTab('forum')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'forum'
              ? 'bg-[#111827] text-cyan-400 border-t-2 border-x border-cyan-500 border-b-transparent'
              : 'text-slate-400 hover:text-white bg-slate-950/40 border border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          Fórum Aeroespacial ({hubData.threads.length})
        </button>

        <button
          onClick={() => setActiveSubTab('curricula')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'curricula'
              ? 'bg-[#111827] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-slate-400 hover:text-white bg-slate-950/40 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          Currículos ({hubData.curricula.length})
        </button>
      </div>

      {/* Active Sub-Tab View */}
      {activeSubTab === 'teams' && (
        <TeamsSection teams={hubData.teams} onSaveTeam={handleSaveTeam} />
      )}

      {activeSubTab === 'sponsors' && (
        <SponsorsSection sponsors={hubData.sponsors} onSaveSponsor={handleSaveSponsor} />
      )}

      {activeSubTab === 'competitions' && (
        <CompetitionsSection
          competitions={hubData.competitions}
          onSaveCompetition={handleSaveCompetition}
        />
      )}

      {activeSubTab === 'forum' && (
        <ForumSection
          threads={hubData.threads}
          onSaveThread={handleSaveThread}
          onAddReply={handleAddReply}
          onLikeThread={handleLikeThread}
        />
      )}

      {activeSubTab === 'curricula' && (
        <CurriculaSection
          curricula={hubData.curricula}
          onSaveCurriculum={handleSaveCurriculum}
        />
      )}

      {/* Floating Sync Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-orange-600 text-white font-mono text-xs px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 border border-orange-400 animate-bounce">
          <Check className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
