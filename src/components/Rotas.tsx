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
  Sparkles,
  Route as RouteIcon,
  Compass,
  Container,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { rtdb as db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import heroRotas from '../assets/images/hero_cinematic_rotas_1790216246671.jpg';

function TechCorner({ className }: { className?: string }) {
  return null;
}

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
      setTimeout(() => setCopiedCode(null), 1800);
    });
  };

  useEffect(() => {
    const rotasRef = ref(db, 'rotas_data');
    const unsubscribe = onValue(rotasRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data) && data.length > 0) {
        setRoutes(data);
      } else {
        const saved = localStorage.getItem('app_rotas_data');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              set(rotasRef, parsed);
              setRoutes(parsed);
              return;
            }
          } catch (e) {
            console.error('Erro ao ler dados locais de rotas:', e);
          }
        }
        set(rotasRef, DEFAULT_ROUTES);
        setRoutes(DEFAULT_ROUTES);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_rotas_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const isIdentical = JSON.stringify(parsed) === JSON.stringify(routes);
          if (!isIdentical && routes.length > 0) {
            setLegacyData(parsed);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [routes]);

  const handleStartEdit = () => {
    setTempRoutes(JSON.parse(JSON.stringify(routes)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempRoutes([]);
  };

  const handleSave = async () => {
    try {
      const rotasRef = ref(db, 'rotas_data');
      await set(rotasRef, tempRoutes);
      setRoutes(tempRoutes);
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao salvar rotas no Firebase:', err);
      alert('Erro ao salvar dados na nuvem.');
    }
  };

  const updateRow = (index: number, field: keyof RouteItem, value: string) => {
    const updated = [...tempRoutes];
    updated[index] = { ...updated[index], [field]: value.toUpperCase() };
    setTempRoutes(updated);
  };

  const addRow = () => {
    setTempRoutes([
      ...tempRoutes,
      { ida: '', idaCod: '', volta: '', voltaCod: '' }
    ]);
  };

  const removeRow = (index: number) => {
    const updated = tempRoutes.filter((_, i) => i !== index);
    setTempRoutes(updated);
  };

  const handleImportLegacy = async (mode: 'merge' | 'replace') => {
    if (!legacyData) return;
    try {
      const rotasRef = ref(db, 'rotas_data');
      let finalData: RouteItem[] = [];

      if (mode === 'replace') {
        finalData = legacyData;
      } else {
        finalData = [...routes];
        legacyData.forEach(item => {
          const exists = finalData.some(r => r.ida === item.ida && r.volta === item.volta);
          if (!exists) finalData.push(item);
        });
      }

      await set(rotasRef, finalData);
      localStorage.removeItem('app_rotas_data');
      setLegacyData(null);
      alert('Rotas sincronizadas com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Falha ao migrar rotas.');
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (hoveredIndex !== index) {
      setHoveredIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setHoveredIndex(null);
      return;
    }

    const currentList = isEditing ? [...tempRoutes] : [...routes];
    const itemToMove = currentList[draggedIndex];
    currentList.splice(draggedIndex, 1);
    currentList.splice(targetIndex, 0, itemToMove);

    if (isEditing) {
      setTempRoutes(currentList);
    } else {
      setRoutes(currentList);
      try {
        const rotasRef = ref(db, 'rotas_data');
        await set(rotasRef, currentList);
      } catch (err) {
        console.error('Falha ao reordenar rotas:', err);
      }
    }

    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(routes, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleManualImport = async (mode: 'replace' | 'merge') => {
    if (!backupText.trim()) return;
    try {
      const parsed = JSON.parse(backupText);
      if (!Array.isArray(parsed)) {
        throw new Error('O formato precisa ser uma lista de rotas');
      }

      const isValid = parsed.every(p => typeof p === 'object' && ('ida' in p || 'volta' in p));
      if (!isValid) {
        throw new Error('Campos de rotas inválidos');
      }

      const rotasRef = ref(db, 'rotas_data');
      let finalData: RouteItem[] = [];

      if (mode === 'replace') {
        finalData = parsed;
      } else {
        finalData = [...routes];
        parsed.forEach(item => {
          const exists = finalData.some(r => r.ida === item.ida && r.volta === item.volta);
          if (!exists) finalData.push(item);
        });
      }

      await set(rotasRef, finalData);
      setRoutes(finalData);
      setBackupStatus({ type: 'success', message: 'Rotas restauradas com sucesso na Nuvem!' });
      setBackupText('');
      setTimeout(() => {
        setIsBackupOpen(false);
        setBackupStatus({ type: '', message: '' });
      }, 1500);
    } catch (e: any) {
      setBackupStatus({ type: 'error', message: e.message || 'Código de backup inválido' });
    }
  };

  const safeRawData = isEditing ? tempRoutes : routes;
  const currentData = safeRawData.filter(
    (r) =>
      r.ida.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.volta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.idaCod.includes(searchTerm) ||
      r.voltaCod.includes(searchTerm)
  );

  return (
    <div className="w-full relative z-10 max-w-full mx-auto flex flex-col font-sans space-y-6 text-stone-900 cinema-container-2160p">
      
      {/* 1. TOP HEADER */}
      <div className="bg-[#fbf9f5] rounded-3xl p-5 border border-[#d6ccbe] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 border border-[#d6ccbe] cursor-pointer transition-all shrink-0 flex items-center justify-center shadow-xs"
              title="Voltar"
            >
              <ArrowRight size={18} className="rotate-180" />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white border border-[#d6ccbe] text-stone-600 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>// OPERACIONAL 3 CORAÇÕES</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 uppercase tracking-tight font-heading">
              Rotas & Trechos
            </h1>
            <p className="text-xs text-stone-500 font-sans">
              Central operacional de trajetos e monitoramento de rotogramas integrados.
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="flex flex-col space-y-6">
          
          {/* ========================================================================= */}
          {/* 1. TOP HERO ROW: 16:9 Photography Banner + Donut Gauge Card             */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 shrink-0">
            
            {/* Left Hero Box (Spans 3 Columns) */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden relative border border-[#dacfc2] shadow-sm bg-stone-900 min-h-[175px] flex flex-col justify-between p-4 sm:p-5 group">
              
              {/* Background 4K Photography */}
              <img
                src={heroRotas}
                alt="Central de Rotas"
                className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
              />

              {/* Vignette Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-transparent pointer-events-none" />

              {/* Top Row: Shield Badge + Headline Content */}
              <div className="relative z-10 flex items-start gap-4">
                
                {/* Emblem Badge 3D */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#831828] via-[#6d1320] to-[#450912] p-0.5 border border-red-400/40 shadow-lg shadow-red-950/50 flex items-center justify-center shrink-0">
                  <div className="w-full h-full bg-[#18080a]/90 rounded-[14px] flex items-center justify-center">
                    <ShieldCheck size={22} className="text-red-400 animate-pulse" />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black tracking-widest text-red-400 uppercase">
                      // MALHA LOGÍSTICA & ROTOGRAMAS
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight uppercase font-mono">
                    Central de Rotas & Trechos
                  </h2>
                  <p className="text-xs text-stone-300 font-medium line-clamp-1 opacity-90 mt-0.5">
                    Controle operacional de trajetos de Ida e Volta, códigos de Solicitação de Monitoramento (SM) integrados e sincronizados em tempo real via Nuvem.
                  </p>
                </div>
              </div>

              {/* Bottom Row: 4 Overlaid Status Pill Counters */}
              <div className="relative z-10 flex items-center gap-2 flex-wrap pt-3 border-t border-white/10">
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-white">
                  <Container size={14} className="text-stone-300" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-stone-400 uppercase font-mono font-bold">Total:</span>
                    <span className="text-xs font-mono font-black text-white">{routes.length}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-emerald-400/80 uppercase font-mono font-bold">Completas:</span>
                    <span className="text-xs font-mono font-black text-emerald-200">
                      {routes.filter(r => r.idaCod && r.voltaCod).length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/70 backdrop-blur-md border border-amber-500/30 text-amber-300">
                  <Clock size={14} className="text-amber-400" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-amber-400/80 uppercase font-mono font-bold">Parciais:</span>
                    <span className="text-xs font-mono font-black text-amber-200">
                      {routes.filter(r => (r.idaCod && !r.voltaCod) || (!r.idaCod && r.voltaCod)).length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/70 backdrop-blur-md border border-red-500/30 text-red-300">
                  <AlertTriangle size={14} className="text-red-400" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-red-400/80 uppercase font-mono font-bold">Sem Código:</span>
                    <span className="text-xs font-mono font-black text-red-200">
                      {routes.filter(r => !r.idaCod && !r.voltaCod).length}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Gauge Card (1 Column) - Donut Chart 3D */}
            <div className="lg:col-span-1 rounded-2xl bg-white/95 border border-[#dacfc2] p-4 flex flex-col items-center justify-between shadow-sm relative overflow-hidden">
              
              <div className="w-full flex items-center justify-between pb-1 border-b border-stone-100">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Sparkles size={12} className="text-[#831828]" />
                  ADESTRAMENTO SM
                </span>
                <span className="text-[9px] font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  REAL TIME
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 py-2 w-full">
                {/* 3D Donut SVG Ring */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-stone-200"
                      strokeWidth="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#831828] transition-all duration-1000 ease-out"
                      strokeDasharray={`${
                        routes.length > 0 
                          ? Math.round(((routes.filter(r => r.idaCod && r.voltaCod).length * 2 + routes.filter(r => (r.idaCod && !r.voltaCod) || (!r.idaCod && r.voltaCod)).length) / (routes.length * 2)) * 100) 
                          : 0
                      }, 100`}
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-stone-900 font-mono leading-none">
                      {routes.length > 0 
                        ? Math.round(((routes.filter(r => r.idaCod && r.voltaCod).length * 2 + routes.filter(r => (r.idaCod && !r.voltaCod) || (!r.idaCod && r.voltaCod)).length) / (routes.length * 2)) * 100) 
                        : 0}%
                    </span>
                    <span className="text-[7.5px] font-bold text-stone-500 uppercase tracking-tight mt-0.5">
                      Sincronizados
                    </span>
                  </div>
                </div>

                {/* Legend Breakdown */}
                <div className="flex flex-col gap-1 text-[10px] font-mono font-semibold text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Completas: <strong className="text-stone-900">{routes.filter(r => r.idaCod && r.voltaCod).length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Parciais: <strong className="text-stone-900">{routes.filter(r => (r.idaCod && !r.voltaCod) || (!r.idaCod && r.voltaCod)).length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Incompletas: <strong className="text-stone-900">{routes.filter(r => !r.idaCod && !r.voltaCod).length}</strong></span>
                  </div>
                </div>
              </div>

              <div className="w-full text-center text-[9px] font-mono text-stone-400 uppercase tracking-widest pt-1 border-t border-stone-100">
                Conformidade de Rotas Cadastradas
              </div>

            </div>

          </div>

          {/* Legacy Data Sync Banner */}
          {legacyData && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6 bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center text-center sm:text-left">
                <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl shrink-0 flex items-center justify-center">
                  <Database size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-amber-900 uppercase">Sincronização de Rotas Pendente</h4>
                  <p className="text-xs text-amber-800 mt-0.5 font-sans max-w-2xl leading-relaxed">
                    Detectamos <span className="font-bold text-amber-950">{legacyData.length} rotas locais</span> armazenadas neste navegador. Deseja importá-las para a Nuvem global?
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5 shrink-0 justify-center w-full md:w-auto">
                <button 
                  onClick={() => handleImportLegacy('merge')}
                  className="px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-mono font-bold uppercase rounded-xl border border-[#d6ccbe] transition-all cursor-pointer shadow-xs"
                >
                  Mesclar
                </button>
                <button 
                  onClick={() => handleImportLegacy('replace')}
                  className="px-4 py-2.5 bg-[#9b1526] hover:bg-[#831220] text-white text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer shadow-xs border border-red-700"
                >
                  Substituir
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('app_rotas_data');
                    setLegacyData(null);
                  }}
                  className="px-4 py-2.5 bg-stone-100 text-stone-600 hover:text-stone-900 rounded-xl border border-stone-300 text-xs font-mono font-bold uppercase cursor-pointer"
                >
                  Descartar
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= MAIN CONTENT CARD: HIGH RESOLUTION LIST ================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-[#d6ccbe] shadow-xs flex flex-col gap-4">
            
            {/* Actions & Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Pesquisar trecho, rota, cidade ou código SM..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#fbf9f5] border border-[#d6ccbe] focus:border-stone-500 rounded-2xl pl-11 pr-4 py-3 text-xs font-sans text-stone-900 placeholder-stone-400 transition-all outline-none shadow-xs"
                />
              </div>

              <div className="flex flex-wrap md:flex-nowrap gap-2.5 shrink-0">
                {!isEditing ? (
                  <>
                    <button 
                      onClick={handleStartEdit} 
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-[#9b1526] hover:bg-[#831220] text-white rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer shadow-xs border border-red-700 font-sans"
                    >
                      <Edit2 size={15} /> <span>Editar Rotas</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsBackupOpen(true);
                        setBackupStatus({ type: '', message: '' });
                        setBackupText('');
                      }} 
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-[#fbf9f5] hover:bg-stone-100 text-stone-700 border border-[#d6ccbe] rounded-2xl text-xs font-bold uppercase transition-all cursor-pointer shadow-xs font-sans"
                      title="Fazer Backup ou Restaurar Rotas"
                    >
                      <Database size={15} className="text-[#9b1526]" /> <span>Sincronizar Backup</span>
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      onClick={addRow} 
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-[#d6ccbe] rounded-2xl text-xs font-bold uppercase cursor-pointer shadow-xs font-sans"
                    >
                      <Plus size={15} /> <span>Adicionar Rota</span>
                    </button>
                    <button 
                      onClick={handleSave} 
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#9b1526] hover:bg-[#831220] text-white rounded-2xl text-xs font-bold uppercase cursor-pointer shadow-xs border border-red-700 font-sans"
                    >
                      <Save size={15} /> <span>Salvar Alterações</span>
                    </button>
                    <button 
                      onClick={handleCancel} 
                      className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-[#d6ccbe] rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
                      title="Cancelar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* List of Route Cards - High-density design */}
            <div className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout">
                {currentData.map((route) => {
                  const realIndex = safeRawData.indexOf(route);
                  if (realIndex === -1) return null;
                  
                  const hasIda = !!route.idaCod;
                  const hasVolta = !!route.voltaCod;
                  const progressPercent = (hasIda ? 50 : 0) + (hasVolta ? 50 : 0);
                  
                  return (
                    <motion.div 
                      layout
                      draggable={!isEditing}
                      onDragStart={(e: any) => handleDragStart(e, realIndex)}
                      onDragOver={(e: any) => handleDragOver(e, realIndex)}
                      onDragEnd={() => handleDragEnd()}
                      onDrop={(e: any) => handleDrop(e, realIndex)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      key={realIndex} 
                      className={cn(
                        "w-full bg-white hover:bg-stone-50/90 border border-[#dacfc2] hover:border-[#831828]/40 rounded-2xl p-3 sm:p-4 transition-all duration-200 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4 relative",
                        draggedIndex === realIndex ? "opacity-30 bg-stone-100" : "",
                        hoveredIndex === realIndex ? "border-2 border-dashed border-stone-400 bg-stone-50" : ""
                      )}
                    >
                      {/* Col 1: Grip & Title */}
                      <div className="flex items-center gap-3.5 w-full lg:w-1/3 min-w-[250px]">
                        {!isEditing ? (
                          <div 
                            className="text-stone-400 hover:text-[#9b1526] cursor-grab active:cursor-grabbing shrink-0 transition-colors" 
                            title="Arraste para reordenar"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical size={16} />
                          </div>
                        ) : (
                          <button 
                            onClick={() => removeRow(realIndex)} 
                            className="w-7 h-7 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all cursor-pointer shadow-md shrink-0 border border-rose-700"
                            title="Excluir rota"
                          >
                            <X size={13} className="stroke-[3]" />
                          </button>
                        )}

                        {/* Direction Icon Box */}
                        <div className="w-11 h-11 bg-red-50 border border-red-200 text-[#9b1526] rounded-xl flex items-center justify-center shrink-0 shadow-2xs">
                          <RouteIcon size={18} className="stroke-[2]" />
                        </div>

                        {/* Names Column */}
                        <div className="flex-grow min-w-0">
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 w-full">
                              <div className="flex items-center gap-1.5 bg-white border border-[#d6ccbe] rounded-lg px-2 py-1 shadow-2xs">
                                <span className="text-[8px] font-bold font-mono text-[#9b1526] uppercase">IDA:</span>
                                <input 
                                  value={route.ida} 
                                  onChange={(e) => updateRow(realIndex, 'ida', e.target.value)} 
                                  className="w-full bg-transparent text-xs text-stone-900 font-bold uppercase font-mono tracking-tight outline-none"
                                  placeholder="ORIGEM X DESTINO"
                                />
                              </div>
                              <div className="flex items-center gap-1.5 bg-white border border-[#d6ccbe] rounded-lg px-2 py-1 shadow-2xs">
                                <span className="text-[8px] font-bold font-mono text-stone-500 uppercase">VOLTA:</span>
                                <input 
                                  value={route.volta} 
                                  onChange={(e) => updateRow(realIndex, 'volta', e.target.value)} 
                                  className="w-full bg-transparent text-xs text-stone-700 font-mono tracking-tight outline-none"
                                  placeholder="DESTINO X ORIGEM"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide truncate">
                                {route.ida || '---'}
                              </span>
                              <span className="text-[10px] sm:text-xs font-semibold text-stone-500 uppercase tracking-normal truncate mt-0.5">
                                {route.volta || '---'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Col 2: SM Codes & Kopierer */}
                      <div className="flex items-center justify-between lg:justify-center gap-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-stone-100">
                        
                        {/* IDA Code */}
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex flex-col gap-0.5 bg-stone-50 border border-[#d6ccbe] p-1 rounded-lg">
                              <span className="text-[7.5px] font-mono font-bold uppercase text-[#9b1526] text-center">SM IDA</span>
                              <input 
                                value={route.idaCod} 
                                onChange={(e) => updateRow(realIndex, 'idaCod', e.target.value)} 
                                className="w-16 bg-white border border-[#d6ccbe] focus:border-stone-500 rounded px-1 py-0.5 text-xs text-[#9b1526] font-mono text-center outline-none shadow-2xs"
                                placeholder="----"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="flex flex-col items-center">
                                <span className="text-[7px] font-mono font-bold text-[#9b1526] uppercase">SM IDA</span>
                                <div className="bg-[#fbf9f5] border border-[#d6ccbe] text-[#9b1526] px-2.5 py-1 rounded-lg font-mono text-xs font-bold min-w-[65px] text-center shadow-2xs mt-0.5">
                                  {route.idaCod || '—'}
                                </div>
                              </div>
                              {route.idaCod && (
                                <button
                                  onClick={() => copyIndividualCode(route.idaCod, 'ida', realIndex)}
                                  className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs mt-3",
                                    copiedCode?.type === 'ida' && copiedCode?.index === realIndex
                                      ? "bg-[#9b1526] text-white border border-red-700"
                                      : "bg-white text-stone-600 hover:text-stone-900 border border-[#d6ccbe] hover:bg-stone-50"
                                  )}
                                  title="Copiar SM Ida"
                                >
                                  {copiedCode?.type === 'ida' && copiedCode?.index === realIndex ? (
                                    <Check size={11} className="stroke-[3]" />
                                  ) : (
                                    <Clipboard size={11} />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Connector Arrow */}
                        <ArrowRight size={14} className="text-stone-300 hidden sm:block shrink-0 animate-pulse" />

                        {/* VOLTA Code */}
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex flex-col gap-0.5 bg-stone-50 border border-[#d6ccbe] p-1 rounded-lg">
                              <span className="text-[7.5px] font-mono font-bold uppercase text-stone-500 text-center">SM VOLTA</span>
                              <input 
                                value={route.voltaCod} 
                                onChange={(e) => updateRow(realIndex, 'voltaCod', e.target.value)} 
                                className="w-16 bg-white border border-[#d6ccbe] focus:border-stone-500 rounded px-1 py-0.5 text-xs text-stone-800 font-mono text-center outline-none shadow-2xs"
                                placeholder="----"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="flex flex-col items-center">
                                <span className="text-[7px] font-mono font-bold text-stone-500 uppercase">SM VOLTA</span>
                                <div className="bg-[#fbf9f5] border border-stone-200 text-stone-800 px-2.5 py-1 rounded-lg font-mono text-xs font-bold min-w-[65px] text-center shadow-2xs mt-0.5">
                                  {route.voltaCod || '—'}
                                </div>
                              </div>
                              {route.voltaCod && (
                                <button
                                  onClick={() => copyIndividualCode(route.voltaCod, 'volta', realIndex)}
                                  className={cn(
                                    "w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs mt-3",
                                    copiedCode?.type === 'volta' && copiedCode?.index === realIndex
                                      ? "bg-[#9b1526] text-white border border-red-700"
                                      : "bg-white text-stone-600 hover:text-stone-900 border border-[#d6ccbe] hover:bg-stone-50"
                                  )}
                                  title="Copiar SM Volta"
                                >
                                  {copiedCode?.type === 'volta' && copiedCode?.index === realIndex ? (
                                    <Check size={11} className="stroke-[3]" />
                                  ) : (
                                    <Clipboard size={11} />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Col 3: Compliance Gauge / Progress */}
                      <div className="flex flex-col items-start gap-1 w-full lg:w-32 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-stone-100">
                        <div className="flex justify-between w-full text-[9px] font-mono font-bold uppercase text-stone-400">
                          <span>Adestramento</span>
                          <span className="text-stone-700">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200/60 shadow-inner">
                          <div 
                            style={{ width: `${progressPercent}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              progressPercent === 100 ? "bg-emerald-600" : progressPercent === 50 ? "bg-amber-500" : "bg-red-600"
                            )}
                          />
                        </div>
                      </div>

                      {/* Col 4: Operational Status Badge */}
                      <div className="flex items-center gap-1.5 w-full lg:w-auto justify-end shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-stone-100">
                        <span className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          progressPercent === 100 ? "bg-emerald-500" : progressPercent === 50 ? "bg-amber-500" : "bg-red-500"
                        )} />
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-stone-800">
                          {progressPercent === 100 ? 'Sincronizado' : progressPercent === 50 ? 'Parcial' : 'Sem Código'}
                        </span>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {currentData.length === 0 && (
                <div className="p-16 text-center bg-[#fbf9f5] rounded-3xl border border-dashed border-[#d6ccbe]">
                  <Database className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                  <p className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
                    Nenhuma rota encontrada para os filtros aplicados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* ================= BACKUP & SYNC MODAL ================= */}
      <AnimatePresence>
        {isBackupOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-[100] select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#d6ccbe] rounded-3xl w-full max-w-2xl overflow-hidden relative shadow-2xl p-6 md:p-8 text-stone-900 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-[#9b1526] border border-red-200 rounded-xl shadow-xs">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">Backup e Sincronização de Rotas</h3>
                    <p className="text-[10px] text-stone-500 font-mono uppercase tracking-wider">Exportação e Nuvem Realtime</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBackupOpen(false)}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 border border-[#d6ccbe] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6">
                {/* Export Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9b1526]" />
                    Exportar Rotas Atuais
                  </h4>
                  <p className="text-xs text-stone-500">
                    Copie a estrutura JSON para backup ou transferência entre dispositivos.
                  </p>
                  
                  <div className="relative">
                    <div className="bg-[#fbf9f5] pl-4 pr-32 py-3 rounded-2xl border border-[#d6ccbe] font-mono text-[11px] text-stone-800 overflow-x-auto whitespace-nowrap max-w-full shadow-xs">
                      {JSON.stringify(routes)}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 px-3.5 bg-[#9b1526] hover:bg-[#831220] text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer border border-red-700"
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} /> Copiado!
                        </>
                      ) : (
                        <>
                          <Clipboard size={12} /> Copiar Código
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9b1526]" />
                    Importar ou Restaurar Rotas
                  </h4>
                  <p className="text-xs text-stone-500">
                    Cole o código JSON de backup para sincronizar na Nuvem:
                  </p>

                  <textarea 
                    value={backupText}
                    onChange={(e) => {
                      setBackupText(e.target.value);
                      if (backupStatus.message) setBackupStatus({ type: '', message: '' });
                    }}
                    placeholder='Cole aqui seu código JSON... Ex: [{"ida": "ROTA A", "idaCod": "123", ...}]'
                    className="w-full h-24 bg-[#fbf9f5] border border-[#d6ccbe] focus:border-stone-500 rounded-2xl p-4 text-[11px] font-mono text-stone-900 placeholder-stone-400 outline-none resize-none shadow-xs"
                  />

                  {backupStatus.message && (
                    <div className={cn(
                      "p-3 rounded-xl text-xs font-bold border flex items-center gap-2",
                      backupStatus.type === 'success' 
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                        : "bg-rose-50 border-rose-300 text-rose-800"
                    )}>
                      {backupStatus.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                      {backupStatus.message}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => handleManualImport('merge')}
                      disabled={!backupText.trim()}
                      className={cn(
                        "px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-[#d6ccbe] cursor-pointer transition-all",
                        backupText.trim()
                          ? "bg-stone-100 hover:bg-stone-200 text-stone-800 shadow-xs"
                          : "bg-stone-50 text-stone-400 cursor-not-allowed border-stone-200"
                      )}
                    >
                      Mesclar com Base
                    </button>
                    <button
                      onClick={() => handleManualImport('replace')}
                      disabled={!backupText.trim()}
                      className={cn(
                        "px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl cursor-pointer transition-all",
                        backupText.trim()
                          ? "bg-[#9b1526] hover:bg-[#831220] text-white shadow-xs border border-red-700"
                          : "bg-stone-50 text-stone-400 cursor-not-allowed border border-stone-200"
                      )}
                    >
                      Sobrescrever Tudo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
