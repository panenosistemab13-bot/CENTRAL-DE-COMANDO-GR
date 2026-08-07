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
  HelpCircle
} from 'lucide-react';
import { 
  PageDefinition, 
  DEFAULT_PAGES, 
  ICON_MAP, 
  getAllAvailablePages, 
  getStoredCustomPages, 
  saveStoredCustomPages, 
  savePageVisibility 
} from '../data/pagesConfig';
import { cn } from '../lib/utils';

interface RestrictedPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisibility: Record<string, boolean>;
  onSave: (newVisibility: Record<string, boolean>, updatedPages: PageDefinition[]) => void;
}

function Screw({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
        className
      )}
    >
      <div className="w-2 h-[1px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
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
          updated[page.id] = ['slides', 'patio', 'controle'].includes(page.id);
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
    saveStoredCustomPages(updatedCustom);

    const updatedPages = [...pagesList, newPage];
    setPagesList(updatedPages);
    setVisibilityState(prev => ({
      ...prev,
      [cleanId]: newPageVisible
    }));

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
    saveStoredCustomPages(updatedCustom);

    setPagesList(prev => prev.filter(p => p.id !== pageId));
    setVisibilityState(prev => {
      const copy = { ...prev };
      delete copy[pageId];
      return copy;
    });
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
    savePageVisibility(visibilityState);
    onSave(visibilityState, pagesList);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="w-full max-w-3xl bg-gradient-to-br from-[#dfcbab] via-[#cbaf8c] to-[#ae926e] border-[5px] border-[#311f14] shadow-[0_25px_60px_rgba(0,0,0,0.9)] rounded-[2rem] p-4 sm:p-7 relative ring-4 ring-[#1c1109]/30 text-[#2D1A10] flex flex-col max-h-[90vh]"
      >
        {/* Corner Rivets */}
        <Screw className="absolute top-3.5 left-3.5" />
        <Screw className="absolute top-3.5 right-3.5" />
        <Screw className="absolute bottom-3.5 left-3.5" />
        <Screw className="absolute bottom-3.5 right-3.5" />

        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#311f14] text-[#fdefd1] hover:bg-[#800609] hover:text-white flex items-center justify-center transition-colors shadow-md z-20 cursor-pointer"
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#5c3e29]/30 shrink-0 pr-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#311f14] to-[#1a0f08] flex items-center justify-center border-2 border-[#bfa27a] text-[#fdefd1] shadow-lg shrink-0">
              <Settings size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-tight text-[#2D1A10] leading-none">
                Sugestão de Páginas Restritas
              </h2>
              <p className="text-[11px] sm:text-xs font-bold text-[#5c3e29] mt-1">
                Configure individualmente quais páginas ficarão <strong className="text-emerald-800">visíveis</strong> ou <strong className="text-[#800609]">ocultas</strong> no sistema.
              </p>
            </div>
          </div>

          {/* Quick Counter Chips */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-900/15 border border-emerald-800/30 text-emerald-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Eye size={12} className="text-emerald-700" />
              {visibleCount} Visíveis
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#800609]/15 border border-[#800609]/30 text-[#800609] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <EyeOff size={12} className="text-[#800609]" />
              {hiddenCount} Ocultas
            </span>
          </div>
        </div>

        {/* PRESET QUICK ACTIONS SUGGESTIONS */}
        <div className="mt-3 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5c3e29] mb-1.5 block">
            ⚡ Sugestões Rápidas de Configuração:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 w-full">
            <button
              type="button"
              onClick={() => applyPreset('all_visible')}
              className="py-1.5 px-2 rounded-xl bg-[#f7eedf] hover:bg-[#fff7eb] text-[#2D1A10] border border-[#311f14]/30 font-black text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              🌟 Exibir Todas
            </button>
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="py-1.5 px-2 rounded-xl bg-[#f7eedf] hover:bg-[#fff7eb] text-[#2D1A10] border border-[#311f14]/30 font-black text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              🔒 Padrão Seguro
            </button>
            <button
              type="button"
              onClick={() => applyPreset('operational')}
              className="py-1.5 px-2 rounded-xl bg-[#f7eedf] hover:bg-[#fff7eb] text-[#2D1A10] border border-[#311f14]/30 font-black text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              🚛 Operacional
            </button>
            <button
              type="button"
              onClick={() => applyPreset('admin')}
              className="py-1.5 px-2 rounded-xl bg-[#f7eedf] hover:bg-[#fff7eb] text-[#2D1A10] border border-[#311f14]/30 font-black text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              👥 Gestão / Adm
            </button>
            <button
              type="button"
              onClick={() => applyPreset('executive')}
              className="py-1.5 px-2 rounded-xl bg-[#f7eedf] hover:bg-[#fff7eb] text-[#2D1A10] border border-[#311f14]/30 font-black text-[10px] uppercase tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer text-center col-span-2 sm:col-span-1"
            >
              🌐 Executivo 4K
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c3e29]/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar páginas ou módulos..."
              className="w-full bg-[#fcf8f0] border border-[#5c3e29]/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2D1A10] placeholder-[#5c3e29]/60 font-semibold focus:outline-none focus:border-[#800609] transition-colors"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5c3e29]/70 hover:text-black"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Tabs & Add Button */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 bg-[#24160E]/10 p-0.5 rounded-xl border border-[#311f14]/20">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'all' 
                    ? "bg-[#311f14] text-[#fdefd1] shadow" 
                    : "text-[#3c2518] hover:bg-black/5"
                )}
              >
                Todas ({pagesList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('visible')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'visible' 
                    ? "bg-emerald-900 text-white shadow" 
                    : "text-[#3c2518] hover:bg-black/5"
                )}
              >
                Visíveis ({visibleCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('hidden')}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'hidden' 
                    ? "bg-[#800609] text-white shadow" 
                    : "text-[#3c2518] hover:bg-black/5"
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
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border shadow-sm transition-all cursor-pointer shrink-0",
                showAddPageForm 
                  ? "bg-[#800609] text-white border-[#800609]"
                  : "bg-[#311f14] hover:bg-[#4a2e1d] text-[#fdefd1] border-[#5c3e29]"
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
                className="bg-[#24160E] border-2 border-[#5c3e29] p-4 rounded-2xl text-[#fdefd1] shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#5c3e29]/50 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#e6c29b] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    Adicionar Nova Página ao Gerenciador de Restrições
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Cadastre uma nova página customizada
                  </span>
                </div>

                {formError && (
                  <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs px-3 py-1.5 rounded-lg font-bold">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#cca07d] block mb-1">
                      Nome da Página *
                    </label>
                    <input
                      type="text"
                      value={newPageLabel}
                      onChange={(e) => setNewPageLabel(e.target.value)}
                      placeholder="Ex: Auditoria PGR"
                      className="w-full bg-[#140b07] border border-[#5c3e29] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#cca07d] block mb-1">
                      Categoria / Subtítulo
                    </label>
                    <input
                      type="text"
                      value={newPageCategory}
                      onChange={(e) => setNewPageCategory(e.target.value)}
                      placeholder="Ex: Qualidade & Segurança"
                      className="w-full bg-[#140b07] border border-[#5c3e29] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#cca07d] block mb-1">
                      Ícone
                    </label>
                    <select
                      value={newPageIcon}
                      onChange={(e) => setNewPageIcon(e.target.value)}
                      className="w-full bg-[#140b07] border border-[#5c3e29] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold cursor-pointer"
                    >
                      {Object.keys(ICON_MAP).map((iconKey) => (
                        <option key={iconKey} value={iconKey} className="bg-[#140b07] text-white">
                          {iconKey}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#cca07d] block mb-1">
                    Descrição do Módulo
                  </label>
                  <input
                    type="text"
                    value={newPageDescription}
                    onChange={(e) => setNewPageDescription(e.target.value)}
                    placeholder="Breve descrição da função desta página..."
                    className="w-full bg-[#140b07] border border-[#5c3e29] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newPageVisible}
                      onChange={(e) => setNewPageVisible(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded"
                    />
                    <span className="text-xs font-bold text-[#fdefd1]">
                      Iniciar como <strong className={newPageVisible ? "text-emerald-400" : "text-amber-400"}>{newPageVisible ? "Visível no Menu" : "Oculta (Restrita)"}</strong>
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPageForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black uppercase tracking-wider text-zinc-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:brightness-110 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Salvar Nova Página
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCROLLABLE LIST OF ALL PAGES */}
        <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-2 min-h-[14rem] max-h-[42vh] custom-scrollbar">
          {filteredPages.length === 0 ? (
            <div className="p-8 text-center bg-[#f7eedf]/60 rounded-2xl border border-[#311f14]/20 text-[#5c3e29]">
              <p className="font-bold text-sm">Nenhuma página encontrada com os filtros atuais.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterTab('all'); }}
                className="mt-2 text-xs font-black uppercase text-[#800609] underline cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            filteredPages.map((page) => {
              const isVisible = Boolean(visibilityState[page.id]);
              const IconComponent = ICON_MAP[page.iconName] || ICON_MAP.Sliders;

              return (
                <div
                  key={page.id}
                  className={cn(
                    "p-3 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm",
                    isVisible
                      ? "bg-[#faf4ea] border-emerald-800/40 hover:border-emerald-800/80 shadow-[0_4px_12px_rgba(16,185,129,0.08)]"
                      : "bg-[#ebe0cb]/80 border-[#800609]/30 hover:border-[#800609]/60 opacity-85"
                  )}
                >
                  {/* Left Info */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border-2 shrink-0 shadow-md transition-all",
                      isVisible
                        ? "bg-emerald-950 border-emerald-600 text-emerald-400"
                        : "bg-[#311f14] border-[#800609]/60 text-[#800609]"
                    )}>
                      <IconComponent size={20} strokeWidth={2.2} />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif font-black text-sm text-[#2D1A10] uppercase tracking-wide">
                          {page.label}
                        </span>
                        
                        {page.badge && (
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border",
                            isVisible 
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-[#dfcbab] text-[#5c3e29] border-[#5c3e29]/30"
                          )}>
                            {page.badge}
                          </span>
                        )}

                        {page.isCustom && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-[#5c3e29] line-clamp-1 mt-0.5">
                        {page.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Status & Toggle Button */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Delete button if custom */}
                    {page.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomPage(page.id)}
                        className="p-2 rounded-xl text-red-700 hover:bg-red-200/60 transition-colors cursor-pointer"
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
                        "px-3.5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 transition-all shadow-md active:scale-95 cursor-pointer select-none",
                        isVisible
                          ? "bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500 shadow-[0_4px_10px_rgba(16,185,129,0.3)]"
                          : "bg-[#800609] hover:bg-[#a10d11] text-white border-[#b32025] shadow-[0_4px_10px_rgba(128,6,9,0.3)]"
                      )}
                    >
                      {isVisible ? (
                        <>
                          <Eye size={15} />
                          <span>Visível</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse ml-0.5" />
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
        <div className="mt-4 pt-3 border-t-2 border-[#5c3e29]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="py-2.5 px-3 rounded-xl bg-black/10 hover:bg-black/20 text-[#2D1A10] font-black uppercase text-[11px] tracking-wider transition-colors border border-[#311f14]/20 cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <RotateCcw size={13} />
              Restaurar Padrão
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-black/10 hover:bg-black/20 text-[#2D1A10] font-black uppercase text-xs tracking-wider transition-colors border border-[#311f14]/20 cursor-pointer text-center"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex-1 sm:flex-initial py-2.5 px-6 rounded-xl bg-gradient-to-b from-[#ca1a20] to-[#800609] hover:brightness-110 text-white font-black uppercase text-xs tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
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
              className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-50 p-6"
            >
              <div className="bg-[#24160E] border-2 border-emerald-500/80 rounded-2xl p-6 text-center text-[#fdefd1] shadow-2xl flex flex-col items-center gap-3 max-w-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                  <Check size={26} className="stroke-[3]" />
                </div>
                <h3 className="font-serif font-black text-lg text-emerald-300 uppercase">
                  Páginas Atualizadas!
                </h3>
                <p className="text-xs text-zinc-300">
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
