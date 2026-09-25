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
    <div className="fixed inset-0 bg-[#ede6dc]/95 backdrop-blur-xl z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-4xl bg-white border border-[#d6ccbe] shadow-2xl rounded-[48px] p-6 sm:p-10 relative text-stone-900 flex flex-col max-h-[95vh] overflow-hidden"
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-[#fbf9f5] text-stone-400 hover:bg-[#9b1526] hover:text-white flex items-center justify-center transition-all shadow-sm z-20 cursor-pointer border border-[#d6ccbe]"
          title="Fechar"
        >
          <X size={20} />
        </button>

        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-stone-100 shrink-0 pr-12">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-[#9b1526] flex items-center justify-center border border-red-900/10 text-white shadow-xl shrink-0">
              <Settings size={28} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-stone-950 leading-none font-sans">
                Configuração Operacional
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-2 font-bold font-sans">
                Gerenciamento de visibilidade de módulos e ordem de navegação tática.
              </p>
            </div>
          </div>

          {/* Quick Counter Chips */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <Eye size={14} className="text-emerald-600" />
              {visibleCount} Ativos
            </span>
            <span className="px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
              <EyeOff size={14} className="text-red-600" />
              {hiddenCount} Restritos
            </span>
          </div>
        </div>

        {/* PRESET QUICK ACTIONS SUGGESTIONS */}
        <div className="mt-6 shrink-0 bg-[#fbf9f5] border border-[#d6ccbe] p-4 rounded-3xl">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9b1526] mb-3 block">
            ⚡ Presets de Configuração Rápida:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
            <button
              type="button"
              onClick={() => applyPreset('all_visible')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#9b1526] text-stone-800 hover:text-white border border-[#d6ccbe] font-black text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              🌟 Exibir Tudo
            </button>
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#9b1526] text-stone-800 hover:text-white border border-[#d6ccbe] font-black text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              🔒 Padrão Seguro
            </button>
            <button
              type="button"
              onClick={() => applyPreset('operational')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#9b1526] text-stone-800 hover:text-white border border-[#d6ccbe] font-black text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              🚛 Operacional
            </button>
            <button
              type="button"
              onClick={() => applyPreset('admin')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#9b1526] text-stone-800 hover:text-white border border-[#d6ccbe] font-black text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              👥 Gestão Adm
            </button>
            <button
              type="button"
              onClick={() => applyPreset('executive')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-[#9b1526] text-stone-800 hover:text-white border border-[#d6ccbe] font-black text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer text-center"
            >
              🌐 Executivo
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar módulos..."
              className="w-full bg-[#fbf9f5] border border-[#d6ccbe] rounded-2xl pl-11 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 font-bold focus:outline-none focus:border-[#9b1526] transition-colors shadow-inner"
            />
          </div>

          {/* Filter Tabs & Add Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-[#fbf9f5] p-1 rounded-2xl border border-[#d6ccbe] shadow-inner">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'all' 
                    ? "bg-white text-[#9b1526] shadow-sm" 
                    : "text-stone-500 hover:text-stone-900"
                )}
              >
                Tudo
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('visible')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'visible' 
                    ? "bg-emerald-600 text-white shadow-sm" 
                    : "text-stone-500 hover:text-stone-900"
                )}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('hidden')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                  filterTab === 'hidden' 
                    ? "bg-red-600 text-white shadow-sm" 
                    : "text-stone-500 hover:text-stone-900"
                )}
              >
                Restritos
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPageForm(!showAddPageForm)}
              className={cn(
                "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border shadow-sm transition-all cursor-pointer shrink-0",
                showAddPageForm 
                  ? "bg-stone-900 text-white border-stone-800"
                  : "bg-[#9b1526] hover:bg-[#831220] text-white border-red-800"
              )}
            >
              {showAddPageForm ? <X size={14} /> : <Plus size={14} />}
              {showAddPageForm ? "Fechar" : "Novo Módulo"}
            </button>
          </div>
        </div>

        {/* ADD NEW CUSTOM PAGE FORM */}
        <AnimatePresence>
          {showAddPageForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 shrink-0"
            >
              <form 
                onSubmit={handleAddNewPage}
                className="bg-[#fbf9f5] border border-[#d6ccbe] p-6 rounded-[32px] text-stone-900 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-[#9b1526] flex items-center gap-2">
                    <Sparkles size={16} />
                    Cadastrar Módulo Personalizado
                  </span>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-xl font-bold">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-500 block mb-1.5">
                      Nome do Módulo *
                    </label>
                    <input
                      type="text"
                      value={newPageLabel}
                      onChange={(e) => setNewPageLabel(e.target.value)}
                      placeholder="Ex: Auditoria PGR"
                      className="w-full bg-white border border-[#d6ccbe] rounded-xl px-4 py-2 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#9b1526]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-500 block mb-1.5">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={newPageCategory}
                      onChange={(e) => setNewPageCategory(e.target.value)}
                      placeholder="Ex: Operacional"
                      className="w-full bg-white border border-[#d6ccbe] rounded-xl px-4 py-2 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#9b1526]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-500 block mb-1.5">
                      Ícone Visual
                    </label>
                    <select
                      value={newPageIcon}
                      onChange={(e) => setNewPageIcon(e.target.value)}
                      className="w-full bg-white border border-[#d6ccbe] rounded-xl px-4 py-2 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#9b1526] cursor-pointer"
                    >
                      {Object.keys(ICON_MAP).map((iconKey) => (
                        <option key={iconKey} value={iconKey}>{iconKey}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newPageVisible}
                      onChange={(e) => setNewPageVisible(e.target.checked)}
                      className="w-5 h-5 accent-[#9b1526] rounded-lg"
                    />
                    <span className="text-xs font-bold text-stone-700">
                      Disponibilizar imediatamente no menu principal
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddPageForm(false)}
                      className="px-5 py-2 rounded-xl bg-white hover:bg-stone-100 text-xs font-black uppercase text-stone-500 transition-colors border border-[#d6ccbe]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-[#9b1526] text-white text-xs font-black uppercase transition-all shadow-md"
                    >
                      Salvar Módulo
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCROLLABLE LIST OF ALL PAGES */}
        <div className="mt-8 flex-1 overflow-y-auto pr-2 space-y-3 min-h-[16rem] custom-scrollbar">
          {filteredPages.length === 0 ? (
            <div className="p-12 text-center bg-[#fbf9f5] rounded-[32px] border border-dashed border-[#d6ccbe] text-stone-400">
              <p className="font-bold text-sm uppercase tracking-widest">Nenhum módulo localizado</p>
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
                    "p-4 rounded-[28px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm",
                    isVisible
                      ? "bg-white border-stone-200 hover:border-[#9b1526]/30"
                      : "bg-[#fbf9f5]/50 border-stone-100 opacity-60"
                  )}
                >
                  {/* Left Info */}
                  <div className="flex items-center gap-5 min-w-0 flex-1">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 shadow-sm transition-all",
                      isVisible
                        ? "bg-[#9b1526]/5 border-[#9b1526]/10 text-[#9b1526]"
                        : "bg-stone-100 border-stone-200 text-stone-400"
                    )}>
                      <IconComponent size={24} strokeWidth={2.5} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-black text-base text-stone-950 uppercase tracking-tight">
                          {page.label}
                        </span>
                        
                        {page.isCustom && (
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#9b1526] border border-red-100 text-[8px] font-black uppercase tracking-widest">
                            Personalizado
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                        {page.category} • {page.id}
                      </p>
                    </div>
                  </div>

                  {/* Middle / Reorder Sequence Controls */}
                  <div className="flex items-center gap-2 bg-[#fbf9f5] p-2 rounded-2xl border border-[#d6ccbe] shrink-0 self-start sm:self-center">
                    <div className="bg-white border border-[#d6ccbe] px-3 py-1.5 rounded-xl shadow-inner text-center min-w-[70px]">
                      <span className="text-[10px] font-black text-stone-950 font-mono">#{globalIndex + 1}</span>
                      {globalIndex < 9 && (
                        <span className="text-[7px] font-black text-[#9b1526] block leading-none mt-0.5">CTRL+{globalIndex + 1}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => movePageUp(page.id)}
                        disabled={isFirst}
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer border",
                          isFirst ? "opacity-20 pointer-events-none" : "bg-white text-stone-600 hover:bg-[#9b1526] hover:text-white border-[#d6ccbe]"
                        )}
                      >
                        <ChevronUp size={14} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePageDown(page.id)}
                        disabled={isLast}
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer border",
                          isLast ? "opacity-20 pointer-events-none" : "bg-white text-stone-600 hover:bg-[#9b1526] hover:text-white border-[#d6ccbe]"
                        )}
                      >
                        <ChevronDown size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  {/* Right Status & Toggle Button */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {page.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomPage(page.id)}
                        className="p-3 rounded-2xl text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remover módulo personalizado"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => togglePageVisibility(page.id)}
                      className={cn(
                        "px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 border transition-all shadow-md active:scale-95 cursor-pointer select-none min-w-[120px] justify-center",
                        isVisible
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-white text-stone-400 border-stone-200"
                      )}
                    >
                      {isVisible ? (
                        <>
                          <Eye size={16} />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} />
                          <span>Restrito</span>
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
        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={handleResetOrder}
            className="py-3 px-6 rounded-2xl bg-white hover:bg-stone-50 text-stone-500 font-black uppercase text-[10px] tracking-widest transition-all border border-[#d6ccbe] cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RotateCcw size={14} />
            Resetar Ordem Global
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial py-3 px-8 rounded-2xl bg-white hover:bg-stone-50 text-stone-500 font-black uppercase text-xs tracking-widest transition-colors border border-[#d6ccbe] cursor-pointer text-center"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="flex-1 sm:flex-initial py-4 px-10 rounded-[20px] bg-[#9b1526] hover:bg-[#831220] text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 border border-red-800"
            >
              <Check size={18} strokeWidth={3} />
              Aplicar Mudanças
            </button>
          </div>
        </div>

        {/* Success Toast Overlay */}
        <AnimatePresence>
          {saveSuccessToast && (
            <motion.div
              initial={{ opacity: 0, backdropBlur: 0 }}
              animate={{ opacity: 1, backdropBlur: '12px' }}
              exit={{ opacity: 0, backdropBlur: 0 }}
              className="absolute inset-0 bg-[#ede6dc]/80 backdrop-blur-md flex items-center justify-center z-50 p-10"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white border border-[#d6ccbe] rounded-[48px] p-10 text-center text-stone-900 shadow-2xl flex flex-col items-center gap-5 max-w-sm"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="font-black text-2xl uppercase tracking-tighter">Sincronizado!</h3>
                <p className="text-sm font-bold text-stone-500 leading-relaxed">
                  As configurações de visibilidade foram aplicadas em toda a malha operacional.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
