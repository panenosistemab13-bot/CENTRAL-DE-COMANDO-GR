import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Search, 
  ArrowRightLeft, 
  MapPin, 
  Navigation,
  Globe,
  Settings2,
  Database,
  ArrowRight,
  ShieldCheck,
  Activity,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Clipboard,
  Check,
  Upload,
  Download,
  AlertTriangle,
  LayoutGrid,
  CloudLightning,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { rtdb as db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

interface RouteItem {
  ida: string;
  idaCod: string;
  volta: string;
  voltaCod: string;
}

const DEFAULT_ROUTES: RouteItem[] = [
  { ida: 'SANTA LUZIA-MG X RIO DE JANEIRO-RJ', idaCod: '4069', volta: 'RIO DE JANEIRO-RJ X SANTA LUZIA-MG', voltaCod: '4079' },
  { ida: 'SANTA LUZIA-MG X GUARULHOS-SP', idaCod: '4070', volta: 'GUARULHOS-SP X SANTA LUZIA-MG', voltaCod: '3971/4076' },
  { ida: 'SANTA LUZIA-MG X MONTES CLAROS-MG', idaCod: '', volta: 'MONTES CLAROS-MG X SANTA LUZIA-MG', voltaCod: '4081' },
  { ida: 'SANTA LUZIA-MG X VIANA-ES', idaCod: '', volta: 'VIANA-ES X SANTA LUZIA-MG', voltaCod: '3985' },
  { ida: 'SANTA LUZIA-MG X BRASILIA-DF', idaCod: '4071', volta: 'BRASILIA-DF X SANTA LUZIA-MG', voltaCod: '4077' },
  { ida: 'SANTA LUZIA-MG X SUMARE-SP', idaCod: '', volta: 'SUMARE-SP X SANTA LUZIA-MG', voltaCod: '3994' },
  { ida: 'SANTA LUZIA-MG X PINHAIS-PR', idaCod: '', volta: 'PINHAIS-PR X SANTA LUZIA-MG', voltaCod: '4080' },
  { ida: 'SANTA LUZIA-MG X LONDRINA-PR', idaCod: '4027', volta: 'LONDRINA-PR X SANTA LUZIA-MG', voltaCod: '3975/4078/4091' },
  { ida: 'SANTA LUZIA-MG X NATAL-RN', idaCod: '4015', volta: 'NATAL-RN X SANTA LUZIA-MG', voltaCod: '3969/3970/4075' },
  { ida: 'SANTA LUZIA-MG X GOV. CELSO RAMOS-SC', idaCod: '', volta: 'GOV. CELSO RAMOS-SC X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X SALVADOR-BA', idaCod: '', volta: 'SALVADOR-BA X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X EUSEBIO-CE', idaCod: '', volta: 'EUSEBIO-CE X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X GRAVATAI-RS', idaCod: '', volta: 'GRAVATAI-RS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CAMPO GRANDE-MT', idaCod: '', volta: 'CAMPO GRANDE-MS X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X CUIABA-MT', idaCod: '', volta: 'CUIABA-MT X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X ARIQUEMES', idaCod: '', volta: 'ARIQUEMES-RO X SANTA LUZIA-MG', voltaCod: '' },
  { ida: 'SANTA LUZIA-MG X VESPASIANO-MG', idaCod: '', volta: 'VESPASIANO-MG X SANTA LUZIA-MG', voltaCod: '3989/3990' },
];

export default function Rotas({ onBack }: { onBack?: () => void }) {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempRoutes, setTempRoutes] = useState<RouteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // States for backup and migration
  const [legacyData, setLegacyData] = useState<RouteItem[] | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupText, setBackupText] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<{ type: 'ida' | 'volta' | 'idaName' | 'voltaName'; index: number } | null>(null);

  const copyIndividualCode = (code: string, type: 'ida' | 'volta' | 'idaName' | 'voltaName', index: number) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode({ type, index });
      setTimeout(() => setCopiedCode(null), 1500);
    });
  };

  // Check for legacy localstorage on load
  useEffect(() => {
    const localSaved = localStorage.getItem('app_rotas_data');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLegacyData(parsed);
        }
      } catch (e) {
        console.warn("Legacy localstorage parse error in Rotas:", e);
      }
    }
  }, []);

  useEffect(() => {
    const rotasRef = ref(db, 'app_rotas_data');
    const unsubscribe = onValue(rotasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoutes(data);
      } else {
        setRoutes(DEFAULT_ROUTES);
        set(rotasRef, DEFAULT_ROUTES);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDragStart = (e: React.DragEvent, realIndex: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(realIndex);
  };

  const handleDragOver = (e: React.DragEvent, realIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === realIndex) return;
    setHoveredIndex(realIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetRealIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetRealIndex) {
      setDraggedIndex(null);
      setHoveredIndex(null);
      return;
    }

    const list = isEditing ? [...tempRoutes] : [...routes];
    const [draggedItem] = list.splice(draggedIndex, 1);
    list.splice(targetRealIndex, 0, draggedItem);

    if (isEditing) {
      setTempRoutes(list);
    } else {
      setRoutes(list);
      set(ref(db, 'app_rotas_data'), list);
    }
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleImportLegacy = (mode: 'merge' | 'replace') => {
    if (!legacyData) return;
    
    let updated: RouteItem[] = [];
    if (mode === 'replace') {
      updated = [...legacyData];
    } else {
      const existingSignatures = new Set(
        routes.map(r => `${(r.ida || '').toLowerCase()}|${(r.volta || '').toLowerCase()}`)
      );
      
      const uniqueLegacy = legacyData.filter(r => {
        const sig = `${(r.ida || '').toLowerCase()}|${(r.volta || '').toLowerCase()}`;
        return !existingSignatures.has(sig);
      });
      
      updated = [...routes, ...uniqueLegacy];
    }
    
    set(ref(db, 'app_rotas_data'), updated).then(() => {
      setRoutes(updated);
      localStorage.removeItem('app_rotas_data');
      setLegacyData(null);
    }).catch(err => {
      console.error(err);
    });
  };

  const handleManualImport = (mode: 'merge' | 'replace') => {
    try {
      const parsed = JSON.parse(backupText);
      if (!Array.isArray(parsed)) {
        setBackupStatus({ type: 'error', message: 'Formato inválido: O backup deve ser um array de rotas!' });
        return;
      }
      
      const cleaned: RouteItem[] = parsed.map(item => ({
        ida: String(item.ida || ''),
        idaCod: String(item.idaCod || ''),
        volta: String(item.volta || ''),
        voltaCod: String(item.voltaCod || ''),
      }));

      let updated: RouteItem[] = [];
      if (mode === 'replace') {
        updated = cleaned;
      } else {
        const existingSignatures = new Set(
          routes.map(r => `${(r.ida || '').toLowerCase()}|${(r.volta || '').toLowerCase()}`)
        );
        
        const uniquePasted = cleaned.filter(r => {
          const sig = `${(r.ida || '').toLowerCase()}|${(r.volta || '').toLowerCase()}`;
          return !existingSignatures.has(sig);
        });
        
        updated = [...routes, ...uniquePasted];
      }

      set(ref(db, 'app_rotas_data'), updated).then(() => {
        setRoutes(updated);
        setBackupStatus({ type: 'success', message: `${cleaned.length} rotas importadas e sincronizadas com a Nuvem!` });
        setTimeout(() => {
          setIsBackupOpen(false);
          setBackupText('');
          setBackupStatus({ type: '', message: '' });
        }, 1500);
      }).catch(err => {
        console.error(err);
        setBackupStatus({ type: 'error', message: 'Erro ao salvar no banco.' });
      });
    } catch (e) {
      setBackupStatus({ type: 'error', message: 'Código de backup inválido! Verifique a sintaxe JSON.' });
    }
  };

  const copyToClipboard = () => {
    const jsonStr = JSON.stringify(routes, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleStartEdit = () => {
    setTempRoutes([...routes]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setRoutes(tempRoutes);
    set(ref(db, 'app_rotas_data'), tempRoutes);
    setIsEditing(false);
  };

  const updateRow = (index: number, field: keyof RouteItem, value: string) => {
    const newRoutes = [...tempRoutes];
    newRoutes[index] = { ...newRoutes[index], [field]: value };
    setTempRoutes(newRoutes);
  };

  const addRow = () => {
    setTempRoutes([{ ida: '', idaCod: '', volta: '', voltaCod: '' }, ...tempRoutes]);
  };

  const removeRow = (index: number) => {
    setTempRoutes(tempRoutes.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if(confirm('Limpar todas as rotas permanentemente?')) {
        setTempRoutes([]);
    }
  };

  const rawData = isEditing ? tempRoutes : routes;
  const safeRawData = Array.isArray(rawData) ? rawData : [];
  
  const currentData = safeRawData.filter(r => 
    (r?.ida || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r?.idaCod || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.volta || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.voltaCod || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/30 p-4 md:p-8 space-y-6 md:space-y-8 pb-32 text-slate-800 font-sans">
      {onBack && (
        <button 
          onClick={onBack}
          className="md:hidden flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-slate-100 py-3.5 rounded-2xl font-bold text-xs transition-all border border-slate-900 shadow-md cursor-pointer mb-4"
        >
          <LayoutGrid size={16} className="text-blue-500" />
          <span>Voltar ao Menu Inicial</span>
        </button>
      )}

      {/* Sophisticated Corporate Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 lg:p-8 shadow-xl border border-slate-800/80">
        {/* Subtle geometric pattern lines for logistical feel */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-2/3">
            {/* Logistic Icon Box instead of raw rustic image */}
            <div className="relative w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Navigation size={36} className="text-white stroke-[1.5] animate-pulse" />
              <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-slate-300">Live</span>
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 font-mono text-[9px] text-blue-300 font-bold uppercase tracking-wider">
                  Módulo de Rotas & Linhas
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 font-mono text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
                  Sincronizado na Nuvem
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
                Painel de Controle de Trechos
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-medium">
                Cadastre, organize e copie com agilidade os códigos de solicitações de monitoramento (SM) para as viagens da Três Corações Alimentos. Sincronia instantânea e multiplataforma.
              </p>
            </div>
          </div>

          {/* Metrics styled with ultra modern glassmorphism */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-end">
            <div className="px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl min-w-[130px] text-center">
              <span className="text-[9px] font-bold text-blue-300 uppercase tracking-widest block mb-1">TOTAL TRECHOS</span>
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{currentData.length}</span>
            </div>
            
            <div className="px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl min-w-[130px] text-center">
              <span className="text-[9px] font-bold text-rose-300 uppercase tracking-widest block mb-1">CÓDIGOS ATIVOS</span>
              <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {currentData.filter(r => r.idaCod).length + currentData.filter(r => r.voltaCod).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy Data Sync Banner (Sleek professional notification) */}
      {legacyData && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-5 items-center text-center md:text-left">
            <div className="p-4 bg-amber-500 text-white rounded-2xl shrink-0 shadow-sm flex items-center justify-center">
              <Database size={22} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-900 uppercase tracking-wide">Dados Locais Encontrados (Vercel Legacy)</h4>
              <p className="text-xs text-amber-800 mt-1 font-medium max-w-2xl leading-relaxed">
                Identificamos <span className="font-extrabold">{legacyData.length} rotas</span> salvas no histórico local deste navegador. Deseja importá-las para a Nuvem global para sincronizar com todos os computadores?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 justify-center w-full md:w-auto">
            <button 
              onClick={() => handleImportLegacy('merge')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-900"
            >
              Mesclar com Nuvem
            </button>
            <button 
              onClick={() => handleImportLegacy('replace')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Substituir Nuvem
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('app_rotas_data');
                setLegacyData(null);
              }}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content Card - Ultra sophisticated board */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden">
        
        {/* Actions & Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 focus-within:text-blue-500">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquisar rota, cidade ou código SM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-slate-800 placeholder-slate-400 transition-all outline-none uppercase tracking-wider font-mono"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2">
            {!isEditing ? (
              <>
                <button 
                  onClick={handleStartEdit} 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <Edit2 size={15} /> Editar Rotas
                </button>
                <button 
                  onClick={() => {
                    setIsBackupOpen(true);
                    setBackupStatus({ type: '', message: '' });
                    setBackupText('');
                  }} 
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer shadow-sm"
                  title="Fazer Backup ou Restaurar Rotas"
                >
                  <Database size={15} /> Backup / Nuvem
                </button>
              </>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={addRow} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={15} /> Adicionar
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <Save size={15} /> Salvar Alterações
                </button>
                <button 
                  onClick={handleCancel} 
                  className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl transition-all cursor-pointer shadow-sm"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Premium Routes Layout - Clean side-by-side structures */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {currentData.map((route) => {
              const realIndex = safeRawData.indexOf(route);
              if (realIndex === -1) return null;
              return (
                <motion.div 
                  layout
                  draggable={!isEditing}
                  onDragStart={(e) => handleDragStart(e, realIndex)}
                  onDragOver={(e) => handleDragOver(e, realIndex)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, realIndex)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={`${route.idaCod}-${route.voltaCod}-${realIndex}`} 
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch rounded-[2rem] transition-all relative",
                    draggedIndex === realIndex ? "opacity-30 bg-slate-100" : "",
                    hoveredIndex === realIndex ? "border-2 border-dashed border-blue-500/50 bg-blue-50/20" : ""
                  )}
                >
                  {/* CARD LEFT: IDA (STRICTLY BLUE SCHEME) */}
                  <div className="flex items-center gap-4 bg-white hover:bg-slate-50/50 border border-slate-100 border-l-4 border-l-blue-600 rounded-[2rem] p-3 pr-5 shadow-sm hover:shadow-md transition-all group/card relative w-full">
                    {/* Six Dots Drag Handle */}
                    {!isEditing && (
                      <div 
                        className="pl-2 pr-1 text-slate-300 hover:text-blue-600 cursor-grab active:cursor-grabbing shrink-0 transition-colors" 
                        title="Arraste para reordenar"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={16} className="stroke-[2.5]" />
                      </div>
                    )}
                    
                    {/* Blue button with right arrow (→) */}
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10 transition-transform duration-300 hover:scale-105">
                      <ArrowRight size={16} className="stroke-[3]" />
                    </div>

                    {/* Route Name Column */}
                    <div className="flex-1 min-w-0 pr-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-blue-500 shrink-0" />
                          <input 
                            value={route.ida} 
                            onChange={(e) => updateRow(realIndex, 'ida', e.target.value)} 
                            className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none uppercase shadow-sm font-mono tracking-tight"
                            placeholder="Trecho Ida (Ex: ORIGEM-UF X DESTINO-UF)"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-blue-500 tracking-wider uppercase font-mono">Rota de Ida</span>
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide break-words">
                              {route.ida || '---'}
                            </span>
                          </div>
                          {route.ida && (
                            <button
                              onClick={() => copyIndividualCode(route.ida, 'idaName', realIndex)}
                              className={cn(
                                "w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover/card:opacity-100 focus:opacity-100 shrink-0",
                                copiedCode?.type === 'idaName' && copiedCode?.index === realIndex
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 shadow-sm"
                              )}
                              title="Copiar nome da Rota (Ida)"
                            >
                              {copiedCode?.type === 'idaName' && copiedCode?.index === realIndex ? (
                                <Check size={11} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Code Badge & Copy Code Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold uppercase text-blue-600 tracking-wider">Código</span>
                          <input 
                            value={route.idaCod} 
                            onChange={(e) => updateRow(realIndex, 'idaCod', e.target.value)} 
                            className="w-20 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono text-center focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none font-bold shadow-sm"
                            placeholder="----"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="bg-blue-50 text-blue-700 border border-blue-100/50 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold shadow-sm min-w-[70px] text-center">
                            {route.idaCod || '—'}
                          </div>
                          {route.idaCod && (
                            <button
                              onClick={() => copyIndividualCode(route.idaCod, 'ida', realIndex)}
                              className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 cursor-pointer shadow-sm",
                                copiedCode?.type === 'ida' && copiedCode?.index === realIndex
                                  ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                                  : "bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50"
                              )}
                              title="Copiar Código Ida"
                            >
                              {copiedCode?.type === 'ida' && copiedCode?.index === realIndex ? (
                                <Check size={12} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Remove button inside card, visible only if editing */}
                    {isEditing && (
                      <button 
                        onClick={() => removeRow(realIndex)} 
                        className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-full transition-all cursor-pointer shadow-sm z-10"
                        title="Excluir trecho"
                      >
                        <X size={10} className="stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* CARD RIGHT: VOLTA (STRICTLY RED SCHEME) */}
                  <div className="flex items-center gap-4 bg-white hover:bg-slate-50/50 border border-slate-100 border-l-4 border-l-rose-600 rounded-[2rem] p-3 pr-5 shadow-sm hover:shadow-md transition-all group/card relative w-full">
                    {/* Rose button with left arrow (←) */}
                    <div className="w-10 h-10 bg-gradient-to-tr from-rose-600 to-red-600 text-white rounded-full flex items-center justify-center shrink-0 shadow-md shadow-rose-500/10 transition-transform duration-300 hover:scale-105 ml-1">
                      <ArrowRight size={16} className="stroke-[3] rotate-180" />
                    </div>

                    {/* Route Name Column */}
                    <div className="flex-1 min-w-0 pr-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <input 
                            value={route.volta} 
                            onChange={(e) => updateRow(realIndex, 'volta', e.target.value)} 
                            className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold focus:border-rose-500 focus:ring-4 focus:ring-rose-100 outline-none uppercase shadow-sm font-mono tracking-tight"
                            placeholder="Trecho Volta (Ex: ORIGEM-UF X DESTINO-UF)"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-rose-500 tracking-wider uppercase font-mono">Rota de Volta</span>
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide break-words">
                              {route.volta || '---'}
                            </span>
                          </div>
                          {route.volta && (
                            <button
                              onClick={() => copyIndividualCode(route.volta, 'voltaName', realIndex)}
                              className={cn(
                                "w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover/card:opacity-100 focus:opacity-100 shrink-0",
                                copiedCode?.type === 'voltaName' && copiedCode?.index === realIndex
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 shadow-sm"
                              )}
                              title="Copiar nome da Rota (Volta)"
                            >
                              {copiedCode?.type === 'voltaName' && copiedCode?.index === realIndex ? (
                                <Check size={11} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Code Badge & Copy Code Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold uppercase text-rose-600 tracking-wider">Código</span>
                          <input 
                            value={route.voltaCod} 
                            onChange={(e) => updateRow(realIndex, 'voltaCod', e.target.value)} 
                            className="w-20 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono text-center focus:border-rose-500 focus:ring-4 focus:ring-rose-100 outline-none font-bold shadow-sm"
                            placeholder="----"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="bg-rose-50 text-rose-700 border border-rose-100/50 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold shadow-sm min-w-[70px] text-center">
                            {route.voltaCod || '—'}
                          </div>
                          {route.voltaCod && (
                            <button
                              onClick={() => copyIndividualCode(route.voltaCod, 'volta', realIndex)}
                              className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 cursor-pointer shadow-sm",
                                copiedCode?.type === 'volta' && copiedCode?.index === realIndex
                                  ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                                  : "bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50"
                              )}
                              title="Copiar Código Volta"
                            >
                              {copiedCode?.type === 'volta' && copiedCode?.index === realIndex ? (
                                <Check size={12} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={12} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {currentData.length === 0 && (
            <div className="p-20 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
              <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Nenhum trecho ou código encontrado</p>
            </div>
          )}
        </div>

        {/* Destructive Reset Action */}
        {isEditing && (
          <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
            <button 
              onClick={clearAll} 
              className="px-6 py-3.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            >
              Resetar Todas as Rotas para o Padrão
            </button>
          </div>
        )}
      </div>

      {/* Backup and Sync Modal Overlay */}
      <AnimatePresence>
        {isBackupOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-2xl overflow-hidden relative shadow-2xl p-6 md:p-8 text-slate-800 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 text-white rounded-2xl">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 leading-tight">Backup & Nuvem</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Migração Unificada de Dados</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBackupOpen(false)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-all border border-slate-200 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6">
                
                {/* Export Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    Exportar Base de Rotas
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Copie a string JSON abaixo para transferir facilmente todas as rotas configuradas para outra instalação do sistema em outro computador.
                  </p>
                  
                  <div className="relative">
                    <div className="bg-slate-50 pl-4 pr-32 py-3 rounded-2xl border border-slate-200 font-mono text-[10px] font-semibold overflow-x-auto whitespace-nowrap text-slate-500 max-w-full">
                      {JSON.stringify(routes)}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check size={11} className="text-emerald-400 stroke-[3]" /> Copiado
                        </>
                      ) : (
                        <>
                          <Clipboard size={11} /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Importar Base de Backup
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Insira a string JSON de backup para atualizar e sincronizar com o Realtime Database instantaneamente:
                  </p>

                  <textarea 
                    value={backupText}
                    onChange={(e) => {
                      setBackupText(e.target.value);
                      if (backupStatus.message) setBackupStatus({ type: '', message: '' });
                    }}
                    placeholder='Cole o JSON aqui... Ex: [{"ida": "ROTA A", "idaCod": "123", "volta": "ROTA B", "voltaCod": "456"}]'
                    className="w-full h-24 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl p-4 text-[10px] font-mono font-semibold text-slate-700 placeholder-slate-400 outline-none shadow-sm resize-none"
                  />

                  {/* Inline Status Message */}
                  {backupStatus.message && (
                    <div className={cn(
                      "p-3.5 rounded-2xl text-xs font-semibold border flex items-center gap-2.5",
                      backupStatus.type === 'success' 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    )}>
                      {backupStatus.type === 'success' ? <Check size={14} className="stroke-[2.5]" /> : <AlertTriangle size={14} />}
                      {backupStatus.message}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => handleManualImport('merge')}
                      disabled={!backupText.trim()}
                      className={cn(
                        "px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-all",
                        backupText.trim()
                          ? "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                          : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                      )}
                    >
                      Mesclar com Nuvem
                    </button>
                    <button
                      onClick={() => handleManualImport('replace')}
                      disabled={!backupText.trim()}
                      className={cn(
                        "px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer transition-all",
                        backupText.trim()
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                      )}
                    >
                      Sobrescrever Tudo
                    </button>
                  </div>
                </div>

              </div>

              {/* Info Tip footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex items-start gap-3">
                <span className="text-xs">💡</span>
                <p className="text-[10px] text-slate-500 font-medium leading-normal">
                  Todas as alterações salvas são atualizadas em tempo real na nuvem do Google Firebase. Os dados salvos localmente no computador também são automaticamente compatibilizados e sincronizados.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Status Indicator */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2.5 bg-slate-900/95 backdrop-blur-md border border-white/10 px-5 py-3 rounded-full shadow-lg z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 blur-sm shadow-[0_0_8px_#10b981]" />
          <div className="w-2 h-2 rounded-full bg-emerald-500 relative z-10" />
        </div>
        <span className="text-[9px] font-bold text-white uppercase tracking-wider font-mono">Sincronia Ativa</span>
      </div>
    </div>
  );
}
