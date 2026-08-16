import React, { useState } from 'react';
import { ForumThread, ForumReply } from '../../data/rocketryHubData';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  ThumbsUp, 
  Send, 
  FolderDown, 
  ExternalLink, 
  Sparkles, 
  User as UserIcon, 
  CornerDownRight 
} from 'lucide-react';

interface ForumSectionProps {
  threads: ForumThread[];
  onSaveThread: (thread: ForumThread) => void;
  onAddReply: (threadId: string, reply: ForumReply) => void;
  onLikeThread: (threadId: string) => void;
}

export const ForumSection: React.FC<ForumSectionProps> = ({
  threads,
  onSaveThread,
  onAddReply,
  onLikeThread
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeReplyThreadId, setActiveReplyThreadId] = useState<string | null>(null);

  // New Post Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'propulsao' | 'eletronica' | 'aerodinamica' | 'regulamentacao' | 'patrocinios' | 'geral'>('propulsao');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('');
  const [newAuthorTeam, setNewAuthorTeam] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDriveUrl, setNewDriveUrl] = useState('');

  // Reply Form
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyRole, setReplyRole] = useState('');
  const [replyContent, setReplyContent] = useState('');

  const filteredThreads = threads.filter((th) => {
    const matchesCat = selectedCategory === 'all' || th.category === selectedCategory;
    const matchesSearch =
      th.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newAuthorName.trim()) return;

    const catLabels: Record<string, string> = {
      propulsao: 'Propulsão & Motores',
      eletronica: 'Aviônica & Sensores',
      aerodinamica: 'Aerodinâmica & Recuperação',
      regulamentacao: 'Regulamentação & Segurança',
      patrocinios: 'Apoio & Patrocínios',
      geral: 'Geral & Projetos'
    };

    const thread: ForumThread = {
      id: `th-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      categoryLabel: catLabels[newCategory] || 'Geral',
      authorName: newAuthorName.trim(),
      authorRole: newAuthorRole.trim() || 'Pesquisador / Foguetemodelista',
      authorTeam: newAuthorTeam.trim() || undefined,
      content: newContent.trim(),
      driveAttachmentUrl: newDriveUrl.trim() || undefined,
      createdAt: new Date().toLocaleString('pt-BR'),
      likesCount: 1,
      replies: []
    };

    onSaveThread(thread);
    setShowModal(false);
    setNewTitle('');
    setNewContent('');
    setNewDriveUrl('');
  };

  const handleSendReply = (threadId: string) => {
    if (!replyContent.trim() || !replyAuthor.trim()) return;

    const rep: ForumReply = {
      id: `rep-${Date.now()}`,
      authorName: replyAuthor.trim(),
      authorRole: replyRole.trim() || 'Membro da Comunidade',
      content: replyContent.trim(),
      createdAt: new Date().toLocaleString('pt-BR')
    };

    onAddReply(threadId, rep);
    setReplyContent('');
    setActiveReplyThreadId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            Fórum Aeroespacial de Foguetemodelismo
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Espaço de discussões técnicas, tira-dúvidas de projetos, regulamentações, parcerias e compartilhamento de materiais no Google Drive.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg shadow transition cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Tópico no Fórum
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'all'
                ? 'bg-cyan-600 border-cyan-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({threads.length})
          </button>
          <button
            onClick={() => setSelectedCategory('propulsao')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'propulsao'
                ? 'bg-red-600 border-red-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Propulsão
          </button>
          <button
            onClick={() => setSelectedCategory('eletronica')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'eletronica'
                ? 'bg-blue-600 border-blue-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Aviônica
          </button>
          <button
            onClick={() => setSelectedCategory('aerodinamica')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'aerodinamica'
                ? 'bg-amber-600 border-amber-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Aerodinâmica
          </button>
          <button
            onClick={() => setSelectedCategory('patrocinios')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedCategory === 'patrocinios'
                ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Patrocínios
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar mensagens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* Forum Threads List */}
      <div className="space-y-4">
        {filteredThreads.map((th) => (
          <div
            key={th.id}
            className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-xl transition space-y-3"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono font-bold">
                  {th.categoryLabel}
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-1">
                  {th.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Por <strong className="text-slate-200">{th.authorName}</strong> ({th.authorRole}
                  {th.authorTeam ? ` • ${th.authorTeam}` : ''}) —{' '}
                  <span className="text-slate-500">{th.createdAt}</span>
                </p>
              </div>

              <button
                onClick={() => onLikeThread(th.id)}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-xs font-mono text-cyan-300 font-bold transition active:scale-95 shrink-0"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                {th.likesCount}
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line bg-black/40 p-3 rounded-lg border border-slate-800/80">
              {th.content}
            </p>

            {th.driveAttachmentUrl && (
              <a
                href={th.driveAttachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded text-xs font-mono transition"
              >
                <FolderDown className="w-3.5 h-3.5 text-amber-400" />
                Anexo / Planilha no Google Drive <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>
            )}

            {/* Replies List */}
            {th.replies && th.replies.length > 0 && (
              <div className="pl-4 border-l-2 border-cyan-500/30 space-y-2 pt-2">
                <h4 className="text-[11px] font-mono font-bold text-slate-400">
                  Respostas ({th.replies.length}):
                </h4>
                {th.replies.map((rep) => (
                  <div key={rep.id} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between items-center font-mono text-[11px]">
                      <span className="font-bold text-slate-200">{rep.authorName} <span className="text-slate-400 font-normal">({rep.authorRole})</span></span>
                      <span className="text-slate-500 text-[10px]">{rep.createdAt}</span>
                    </div>
                    <p className="text-slate-300 font-sans">{rep.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input Trigger */}
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs font-mono">
              <button
                onClick={() => setActiveReplyThreadId(activeReplyThreadId === th.id ? null : th.id)}
                className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                Responder ao Tópico
              </button>
            </div>

            {/* Active Reply Form Box */}
            {activeReplyThreadId === th.id && (
              <div className="bg-black/60 p-3 rounded-lg border border-cyan-500/40 space-y-2 text-xs font-sans animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Seu Nome *"
                    value={replyAuthor}
                    onChange={(e) => setReplyAuthor(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Sua Função / Equipe"
                    value={replyRole}
                    onChange={(e) => setReplyRole(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Escreva sua resposta técnica..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReplyThreadId(null)}
                    className="bg-slate-800 text-slate-300 px-3 py-1 rounded font-mono text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendReply(th.id)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1 rounded font-mono text-xs font-bold"
                  >
                    Enviar Resposta
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL: New Forum Topic */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#111827] border border-cyan-500/40 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl text-slate-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Novo Tópico de Discussão no Fórum
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-mono font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Categoria *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono"
                  >
                    <option value="propulsao">Propulsão & Motores</option>
                    <option value="eletronica">Aviônica & Sensores</option>
                    <option value="aerodinamica">Aerodinâmica & Recuperação</option>
                    <option value="regulamentacao">Regulamentação & Segurança</option>
                    <option value="patrocinios">Apoio & Patrocínios</option>
                    <option value="geral">Geral & Projetos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Título do Tópico *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Razão de expansão para KNSB em 1km"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-mono mb-1 font-bold">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Mendes"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Sua Função
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Diretor de Propulsão"
                    value={newAuthorRole}
                    onChange={(e) => setNewAuthorRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">
                    Sua Equipe
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Minerva Rockets"
                    value={newAuthorTeam}
                    onChange={(e) => setNewAuthorTeam(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1 font-bold">
                  Conteúdo da Mensagem *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escreva os detalhes da sua dúvida, cálculo ou projeto..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">
                  Link Google Drive com Planilha ou Anexo (opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={newDriveUrl}
                  onChange={(e) => setNewDriveUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs px-4 py-2 rounded font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs px-5 py-2 rounded font-bold shadow"
                >
                  Publicar Tópico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
