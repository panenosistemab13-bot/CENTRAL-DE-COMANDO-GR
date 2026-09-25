import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw, 
  X, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  Layers,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  PageDefinition, 
  DEFAULT_PAGES, 
  ICON_MAP, 
  getAllAvailablePages, 
  getStoredCustomPages, 
  saveStoredCustomPages, 
  savePageVisibility,
  saveStoredPageOrder,
  resetPageOrderToDefault,
  saveFullPageConfigToFirebase
} from '../data/pagesConfig';
import { cn } from '../lib/utils';

interface RestrictedPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisibility: Record<string, boolean>;
  onSave: (newVisibility: Record<string, boolean>, updatedPages: PageDefinition[]) => void;
}

function TechCorner({ className }: { className?: string }) {
  return (
    <div className={cn("w-3.5 h-3.5 pointer-events-none select-none z-20", className)}>
      <div className="w-full h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
      <div className="w-[2px] h-full bg-gradient-to-b from-red-500 to-transparent" />
    </div>
  );
}

export default function RestrictedPagesModal({
  isOpen,
  onClose,
  currentVisibility,
  onSave
}: RestrictedPagesModalProps) {
  const [pagesList, setPagesList] = useState<PageDefinition[]>(() => getAllAvailablePages());
  const [visibilityState, setVisibilityState] = useState<Record<string, boolean>>(() => ({ ...currentVisibility }));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'visible' | 'hidden' | 'custom'>('all');
  const [showAddPageForm, setShowAddPageForm] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // New Custom Page Form State
  const [newPageLabel, setNewPageLabel] = useState('');
  const [newPageId, setNewPageId] = useState('');
  const [newPageCategory, setNewPageCategory] = useState('Gerais');
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('Sliders');
  const [newPageVisible, setNewPageVisible] = useState(true);
  const [formError, setFormError] = useState('');

  // Sync state if modal opens with new visibility
  React.useEffect(() => {
    if (isOpen) {
      const all = getAllAvailablePages();
      setPagesList(all);
      setVisibilityState({ ...currentVisibility });
      setSearchQuery('');
      setFilterTab('all');
      setShowAddPageForm(false);
      setFormError('');
    }
  }, [isOpen, currentVisibility]);

  const togglePageVisibility = (pageId: string) => {
    setVisibilityState(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  // Presets
  const applyPreset = (preset: 'all_visible' | 'default' | 'operational' | 'admin' | 'executive') => {
    const updated: Record<string, boolean> = {};

    pagesList.forEach(page => {
      switch (preset) {
        case 'all_visible':
          updated[page.id] = true;
          break;
        case 'default':
          updated[page.id] = page.isDefaultVisible;
          break;
        case 'operational':
          updated[page.id] = ['patio', 'checklist', 'controle', 'averbacao', 'sm_creator'].includes(page.id);
          break;
        case 'admin':
          updated[page.id] = ['presence', 'averbacao', 'sm_creator', 'rotas'].includes(page.id);
          break;
        case 'executive':
          updated[page.id] = ['patio', 'controle', 'escala'].includes(page.id);
          break;
      }
    });

    setVisibilityState(updated);
  };

  // Handle Add New Page
  const handleAddNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = (newPageId || newPageLabel)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '_');

    if (!cleanId) {
      setFormError('Informe um nome ou identificador para a página.');
      return;
    }

    if (pagesList.some(p => p.id === cleanId)) {
      setFormError('Já existe uma página com este identificador.');
      return;
    }

    const newPage: PageDefinition = {
      id: cleanId,
      label: newPageLabel.trim(),
      buttonLabel: newPageCategory.trim() || 'Módulo',
      category: newPageCategory.trim() || 'Gerais',
      description: newPageDescription.trim() || 'Módulo personalizado adicionado ao sistema.',
      iconName: newPageIcon,
      isDefaultVisible: newPageVisible,
      isRestrictedByDefault: !newPageVisible,
      isCustom: true,
      badge: 'Personalizado'
    };

    const updatedCustom = [...getStoredCustomPages(), newPage];
    const updatedPages = [...pagesList, newPage];
    const newVis = {
      ...visibilityState,
      [cleanId]: newPageVisible
    };

    setPagesList(updatedPages);
    setVisibilityState(newVis);

    saveFullPageConfigToFirebase(newVis, updatedCustom, updatedPages.map(p => p.id));

    // Reset Form
    setNewPageLabel('');
    setNewPageId('');
    setNewPageCategory('Gerais');
    setNewPageDescription('');
    setNewPageIcon('Sliders');
    setNewPageVisible(true);
    setShowAddPageForm(false);
    setFormError('');
  };

  // Handle Delete Custom Page
  const handleDeleteCustomPage = (pageId: string) => {
    const updatedCustom = getStoredCustomPages().filter(p => p.id !== pageId);
    const updatedPages = pagesList.filter(p => p.id !== pageId);
    const updatedVis = { ...visibilityState };
    delete updatedVis[pageId];

    setPagesList(updatedPages);
    setVisibilityState(updatedVis);

    saveFullPageConfigToFirebase(updatedVis, updatedCustom, updatedPages.map(p => p.id));
  };

  // Page Sequence Reordering Handlers
  const movePageUp = (pageId: string) => {
    setPagesList(prev => {
      const idx = prev.findIndex(p => p.id === pageId);
      if (idx <= 0) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  const movePageDown = (pageId: string) => {
    setPagesList(prev => {
      const idx = prev.findIndex(p => p.id === pageId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  const movePageToPosition = (pageId: string, targetIndex: number) => {
    setPagesList(prev => {
      const currentIndex = prev.findIndex(p => p.id === pageId);
      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= prev.length || currentIndex === targetIndex) {
        return prev;
      }
      const copy = [...prev];
      const [moved] = copy.splice(currentIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  const handleResetOrder = () => {
    resetPageOrderToDefault();
    const defaultPages = getAllAvailablePages();
    setPagesList(defaultPages);
    saveFullPageConfigToFirebase(visibilityState, getStoredCustomPages(), defaultPages.map(p => p.id));
  };

  // Counts
  const visibleCount = useMemo(() => {
    return pagesList.filter(p => visibilityState[p.id]).length;
  }, [pagesList, visibilityState]);

  const hiddenCount = pagesList.length - visibleCount;

  // Filtered list
  const filteredPages = useMemo(() => {
    return pagesList.filter(page => {
      const isVis = Boolean(visibilityState[page.id]);
      
      if (filterTab === 'visible' && !isVis) return false;
      if (filterTab === 'hidden' && isVis) return false;
      if (filterTab === 'custom' && !page.isCustom) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLabel = page.label.toLowerCase().includes(q);
        const matchCat = page.category.toLowerCase().includes(q);
        const matchDesc = page.description.toLowerCase().includes(q);
        const matchId = page.id.toLowerCase().includes(q);
        return matchLabel || matchCat || matchDesc || matchId;
      }

      return true;
    });
  }, [pagesList, visibilityState, filterTab, searchQuery]);

  const handleSaveAndApply = () => {
    const pageOrder = pagesList.map(p => p.id);
    const customPages = getStoredCustomPages();
    saveFullPageConfigToFirebase(visibilityState, customPages, pageOrder);
    onSave(visibilityState, pagesList);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="w-full max-w-3xl glass-card-3d bg-slate-950/95 border border-white/20 shadow-2xl rounded-3xl p-4 sm:p-7 relative text-white flex flex-col max-h-[90vh] backdrop-blur-2xl font-mono"
      >
        {/* Tech Corner Brackets */}
        <TechCorner className="absolute top-3.5 left-3.5" />
        <TechCorner className="absolute top-3.5 right-3.5 rotate-90" />
        <TechCorner className="absolute bottom-3.5 left-3.5 -rotate-90" />
        <TechCorner className="absolute bottom-3.5 right-3.5 rotate-180" />

        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-md z-20 cursor-pointer border border-white/10"
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0 pr-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/15 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
              <Settings size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight text-white leading-none">
                Sugestão de Páginas Restritas
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-mono">
                Configure individualmente quais páginas ficarão <strong className="text-emerald-400">visíveis</strong> ou <strong className="text-red-400">ocultas</strong> no sistema.
              </p>
            </div>
          </div>

          {/* Quick Counter Chips */}
          <div className="flex items-center gap-2 self-start sm:self-center font-mono">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Eye size={12} className="text-emerald-400" />
              {visibleCount} Visíveis
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(255,42,75,0.2)]">
              <EyeOff size={12} className="text-red-400" />
              {hiddenCount} Ocultas
            </span>
          </div>
        </div>

        {/* PRESET QUICK ACTIONS SUGGESTIONS */}
        <div className="mt-3 shrink-0">
          <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-cyan-400 mb-1.5 block">
            ⚡ Sugestões Rápidas de Configuração:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 w-full font-mono">
            <button
              type="button"
              onClick={() => applyPreset('all_visible')}
              className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center hover:border-cyan-400"
            >
              🌟 Exibir Todas
            </button>
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center hover:border-cyan-400"
            >
              🔒 Padrão Seguro
            </button>
            <button
              type="button"
              onClick={() => applyPreset('operational')}
              className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center hover:border-cyan-400"
            >
              🚛 Operacional
            </button>
            <button
              type="button"
              onClick={() => applyPreset('admin')}
              className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center hover:border-cyan-400"
            >
              👥 Gestão / Adm
            </button>
            <button
              type="button"
              onClick={() => applyPreset('executive')}
              className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center col-span-2 sm:col-span-1 hover:border-cyan-400"
            >
              🌐 Executivo 4K
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 font-mono">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar páginas ou módulos..."
              className="w-full bg-slate-900 border border-white/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Tabs & Add Button */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto no-scrollbar font-mono">
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'all' 
                    ? "bg-cyan-500 text-slate-950 font-black shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                Todas ({pagesList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('visible')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'visible' 
                    ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                Visíveis ({visibleCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('hidden')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'hidden' 
                    ? "bg-red-500 text-white font-black shadow-[0_0_8px_rgba(255,42,75,0.6)]" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                Ocultas ({hiddenCount})
              </button>
            </div>

            {/* Add Custom Page Button */}
            <button
              type="button"
              onClick={() => setShowAddPageForm(!showAddPageForm)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border shadow-sm transition-all cursor-pointer shrink-0",
                showAddPageForm 
                  ? "bg-red-500/20 text-red-300 border-red-500/50"
                  : "bg-white/5 hover:bg-white/10 text-white border-white/15"
              )}
            >
              {showAddPageForm ? <X size={12} /> : <Plus size={12} />}
              {showAddPageForm ? "Fechar" : "+ Nova Página"}
            </button>
          </div>
        </div>

        {/* ADD NEW CUSTOM PAGE EXPANDABLE FORM */}
        <AnimatePresence>
          {showAddPageForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3 shrink-0"
            >
              <form 
                onSubmit={handleAddNewPage}
                className="bg-slate-900 border border-white/15 p-4 rounded-2xl text-white shadow-xl space-y-3 font-mono"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-400" />
                    Adicionar Nova Página ao Gerenciador de Restrições
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Cadastre uma nova página customizada
                  </span>
                </div>

                {formError && (
                  <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs px-3 py-1.5 rounded-lg font-bold font-mono">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Nome da Página *
                    </label>
                    <input
                      type="text"
                      value={newPageLabel}
                      onChange={(e) => setNewPageLabel(e.target.value)}
                      placeholder="Ex: Auditoria PGR"
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Categoria / Subtítulo
                    </label>
                    <input
                      type="text"
                      value={newPageCategory}
                      onChange={(e) => setNewPageCategory(e.target.value)}
                      placeholder="Ex: Qualidade & Segurança"
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      Ícone
                    </label>
                    <select
                      value={newPageIcon}
                      onChange={(e) => setNewPageIcon(e.target.value)}
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
                    >
                      {Object.keys(ICON_MAP).map((iconKey) => (
                        <option key={iconKey} value={iconKey} className="bg-slate-950 text-white">
                          {iconKey}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Descrição do Módulo
                  </label>
                  <input
                    type="text"
                    value={newPageDescription}
                    onChange={(e) => setNewPageDescription(e.target.value)}
                    placeholder="Breve descrição da função desta página..."
                    className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 font-mono">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newPageVisible}
                      onChange={(e) => setNewPageVisible(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 rounded"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      Iniciar como <strong className={newPageVisible ? "text-emerald-400" : "text-red-400"}>{newPageVisible ? "Visível no Menu" : "Oculta (Restrita)"}</strong>
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPageForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff2a4b] to-[#b32025] hover:brightness-110 text-xs font-mono font-black uppercase tracking-wider text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Salvar Nova Página
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEQUENCE INFO BAR */}
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono shrink-0">
          <span className="flex items-center gap-1.5 text-[11px]">
            <ArrowUpDown size={14} className="text-cyan-400 shrink-0" />
            <span><strong>Sequência das Páginas & Atalhos:</strong> A ordem numérica define a navegação rápida por teclado (<kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/20 text-cyan-300 font-mono text-[10px]">Ctrl + 1</kbd> até <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-white/20 text-cyan-300 font-mono text-[10px]">Ctrl + 9</kbd>). Use as setas (▲/▼) para reordenar.</span>
          </span>
          <button
            type="button"
            onClick={handleResetOrder}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/15 font-mono font-bold text-[10px] uppercase tracking-wide transition-all shadow-xs cursor-pointer shrink-0"
            title="Restaurar a ordem original das páginas"
          >
            Restaurar Ordem Original
          </button>
        </div>

        {/* SCROLLABLE LIST OF ALL PAGES */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-2 min-h-[14rem] max-h-[42vh] custom-scrollbar font-mono">
          {filteredPages.length === 0 ? (
            <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10 text-slate-400">
              <p className="font-bold text-sm">Nenhuma página encontrada com os filtros atuais.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterTab('all'); }}
                className="mt-2 text-xs font-black uppercase text-cyan-400 underline cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            filteredPages.map((page) => {
              const isVisible = Boolean(visibilityState[page.id]);
              const IconComponent = ICON_MAP[page.iconName] || ICON_MAP.Sliders;
              const globalIndex = pagesList.findIndex(p => p.id === page.id);
              const isFirst = globalIndex === 0;
              const isLast = globalIndex === pagesList.length - 1;

              return (
                <div
                  key={page.id}
                  className={cn(
                    "p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md",
                    isVisible
                      ? "bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_4px_12px_rgba(16,185,129,0.1)]"
                      : "bg-slate-900/40 border-white/10 hover:border-white/20 opacity-70"
                  )}
                >
                  {/* Left Info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 shadow-md transition-all",
                      isVisible
                        ? "bg-emerald-950 border-emerald-500/60 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-slate-950 border-white/15 text-slate-500"
                    )}>
                      <IconComponent size={20} strokeWidth={2.2} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-sm text-white uppercase tracking-wide">
                          {page.label}
                        </span>
                        
                        {page.badge && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border",
                            isVisible 
                              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                              : "bg-white/5 text-slate-400 border-white/10"
                          )}>
                            {page.badge}
                          </span>
                        )}

                        {page.isCustom && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-slate-400 line-clamp-1 mt-0.5 font-mono">
                        {page.description}
                      </p>
                    </div>
                  </div>

                  {/* Middle / Reorder Sequence Controls */}
                  <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-xl border border-white/10 shrink-0 self-start sm:self-center font-mono">
                    <div className="flex flex-col items-center">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[10px] font-black border border-white/15 shrink-0" title={`Posição #${globalIndex + 1} na sequência`}>
                        #{globalIndex + 1}
                      </span>
                      {globalIndex < 9 && (
                        <span className="text-[8.5px] font-mono font-bold text-red-400 leading-tight mt-0.5">
                          Ctrl+{globalIndex + 1}
                        </span>
                      )}
                    </div>

                    <select
                      value={globalIndex}
                      onChange={(e) => movePageToPosition(page.id, Number(e.target.value))}
                      className="bg-slate-950 text-white text-[10px] font-bold rounded-lg px-1.5 py-1 border border-white/20 focus:outline-none focus:border-cyan-400 cursor-pointer font-mono"
                      title="Alterar posição na sequência"
                    >
                      {pagesList.map((_, idx) => (
                        <option key={idx} value={idx}>
                          {idx + 1}ª Pos
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => movePageUp(page.id)}
                      disabled={isFirst}
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer border shadow-xs",
                        isFirst
                          ? "bg-white/5 text-slate-600 border-transparent cursor-not-allowed opacity-40"
                          : "bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white border-white/15 active:scale-90"
                      )}
                      title="Mover para cima (anterior)"
                    >
                      <ChevronUp size={16} className="stroke-[3]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => movePageDown(page.id)}
                      disabled={isLast}
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer border shadow-xs",
                        isLast
                          ? "bg-white/5 text-slate-600 border-transparent cursor-not-allowed opacity-40"
                          : "bg-white/10 hover:bg-cyan-500 hover:text-slate-950 text-white border-white/15 active:scale-90"
                      )}
                      title="Mover para baixo (próxima)"
                    >
                      <ChevronDown size={16} className="stroke-[3]" />
                    </button>
                  </div>

                  {/* Right Status & Toggle Button */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Delete button if custom */}
                    {page.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomPage(page.id)}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Excluir página personalizada"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    {/* Big Interactive Toggle Switch Button */}
                    <button
                      type="button"
                      onClick={() => togglePageVisibility(page.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 border transition-all shadow-md active:scale-95 cursor-pointer select-none",
                        isVisible
                          ? "bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                          : "bg-red-950/80 hover:bg-red-900 text-red-300 border-red-500/50 shadow-[0_0_12px_rgba(255,42,75,0.3)]"
                      )}
                    >
                      {isVisible ? (
                        <>
                          <Eye size={15} />
                          <span>Visível</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                        </>
                      ) : (
                        <>
                          <EyeOff size={15} />
                          <span>Oculta</span>
                          <span className="w-2 h-2 rounded-full bg-red-400 ml-0.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 font-mono">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono font-bold uppercase text-[11px] tracking-wider transition-colors border border-white/15 cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <RotateCcw size={13} />
              Restaurar Padrão
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono font-bold uppercase text-xs tracking-wider transition-colors border border-white/15 cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#ff2a4b] to-[#b32025] hover:brightness-110 text-white font-mono font-black uppercase text-xs tracking-wider shadow-[0_0_15px_rgba(255,42,75,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-red-500/40"
            >
              <Check size={16} className="stroke-[3]" />
              Salvar & Aplicar
            </button>
          </div>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {saveSuccessToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-3xl flex items-center justify-center z-50 p-6"
            >
              <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl p-6 text-center text-white shadow-2xl flex flex-col items-center gap-3 max-w-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <Check size={26} className="stroke-[3]" />
                </div>
                <h3 className="font-heading font-black text-lg text-emerald-400 uppercase">
                  Páginas Atualizadas!
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  As configurações de visibilidade das páginas foram aplicadas com sucesso.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
