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
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import coffeeBg from '../assets/images/coffee_rustic_bg_1780760486326.png';
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

export default function Rotas() {
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

  const moveRoute = (route: RouteItem, direction: 'up' | 'down') => {
    const list = isEditing ? [...tempRoutes] : [...routes];
    const index = list.indexOf(route);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < list.length) {
      // Swap
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      if (isEditing) {
        setTempRoutes(list);
      } else {
        setRoutes(list);
        set(ref(db, 'app_rotas_data'), list);
      }
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8f1e5] via-[#eddaba] to-[#e4cbab] p-4 md:p-8 space-y-8 pb-32 text-[#3A2414]">
      {/* Dynamic Earthy Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#ebd8bf] to-[#d6bc99] border-4 border-[#3A2414] p-6 lg:p-8 shadow-md">
        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-2/3">
            {/* Studio Composition Image Frame */}
            <div className="relative w-full md:w-56 h-40 shrink-0 rounded-2xl overflow-hidden border-2 border-[#3A2414] shadow-md group">
              <img 
                src={coffeeBg} 
                alt="Edição Rústica Sofisticada" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3A2414]/30 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B32025] animate-pulse" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-white uppercase">Composição Macro</span>
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-serif font-black text-[#3A2414] tracking-tight leading-tight">
                Edição Rústica Sofisticada
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                <span className="font-mono text-xs text-[#B32025] font-black uppercase tracking-widest">
                  CAFÉ EM GRÃOS SELECIONADOS
                </span>
                <span className="text-[#3A2414]/30">•</span>
                <span className="font-serif italic text-xs text-[#3A2414]/80">
                  Composição de Estúdio "3corações"
                </span>
              </div>
              <p className="text-xs text-[#3A2414]/80 leading-relaxed max-w-xl font-medium">
                Cata de texturas artesanais de café: juta, papel kraft, cobre polido, gotejador de cobre, caneca de cerâmica rústica, folhas de café frescas e o selo de cera vermelho-escura.
              </p>
            </div>
          </div>

          {/* Metrics styled like paper tag tickets hanging */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-end">
            <div className="px-5 py-4 bg-[#fdfcf9] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border-2 border-[#3A2414]/25 rounded-2xl shadow-sm min-w-[120px] text-center relative rotate-[-1.5deg]">
              {/* String hanging effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#3A2414]/25 rounded" />
              <span className="text-[9px] font-black text-[#B32025] uppercase tracking-widest block mb-1">TRECHOS</span>
              <span className="text-3xl font-serif font-black text-[#3A2414]">{currentData.length}</span>
            </div>
            
            <div className="px-5 py-4 bg-[#fdfcf9] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border-2 border-[#3A2414]/25 rounded-2xl shadow-sm min-w-[120px] text-center relative rotate-[1.5deg]">
              {/* String hanging effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#3A2414]/25 rounded" />
              <span className="text-[9px] font-black text-[#B32025] uppercase tracking-widest block mb-1">CÓDIGOS</span>
              <span className="text-3xl font-serif font-black text-[#3A2414]">
                {currentData.filter(r => r.idaCod).length + currentData.filter(r => r.voltaCod).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legacy Data Sync Banner */}
      {legacyData && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/90 backdrop-blur-sm border-4 border-[#3A2414] rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] relative overflow-hidden"
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-5 items-center text-center md:text-left">
            <div className="p-4 bg-[#B32025] text-white rounded-2xl shrink-0 shadow-md flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h4 className="font-serif font-black text-lg text-[#3A2414] uppercase tracking-tight">Sincronização de Rotas do Computador Corporativo</h4>
              <p className="text-xs text-[#3A2414]/90 mt-1 font-medium max-w-2xl leading-relaxed">
                Detectamos <span className="font-black text-[#B32025]">{legacyData.length} rotas antigas</span> salvas localmente neste navegador (antigo backup do Vercel). Deseja sincronizá-las e subir para a Nuvem de forma global para funcionar em todos os dispositivos?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 justify-center w-full md:w-auto">
            <button 
              onClick={() => handleImportLegacy('merge')}
              className="px-5 py-3.5 bg-[#3A2414] hover:bg-[#3A2414]/90 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm cursor-pointer border border-[#3A2414]"
            >
              Mesclar com Nuvem
            </button>
            <button 
              onClick={() => handleImportLegacy('replace')}
              className="px-5 py-3.5 bg-[#B32025] hover:brightness-110 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm cursor-pointer border-2 border-[#3A2414]/20"
            >
              Substituir Nuvem
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('app_rotas_data');
                setLegacyData(null);
              }}
              className="px-5 py-3.5 bg-white hover:bg-stone-50 text-stone-700 border-2 border-[#3A2414]/15 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content Card - Styled as a premium rustic board sheet */}
      <div className="bg-[#fdfcf9]/85 backdrop-blur-md bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border-4 border-[#3A2414] rounded-[2.5rem] p-6 md:p-8 shadow-md relative overflow-hidden text-[#3A2414]">
        
        {/* Actions & Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#B32025]">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="PESQUISAR ROTA, CIDADE OU CÓDIGO SM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-[#3A2414]/15 focus:border-[#B32025] rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-[#3A2414] placeholder-stone-400 transition-all outline-none uppercase tracking-widest font-mono shadow-sm"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2">
            {!isEditing ? (
              <>
                <button 
                  onClick={handleStartEdit} 
                  className="flex items-center gap-3 px-6 py-4 bg-[#B32025] hover:brightness-110 text-white border-2 border-[#3A2414]/25 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer shadow-sm"
                >
                  <Edit2 size={16} /> Editar Configuração
                </button>
                <button 
                  onClick={() => {
                    setIsBackupOpen(true);
                    setBackupStatus({ type: '', message: '' });
                    setBackupText('');
                  }} 
                  className="flex items-center gap-3 px-6 py-4 bg-[#3A2414] hover:brightness-110 text-[#fbdba5] border-2 border-[#3A2414]/25 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer shadow-sm"
                  title="Fazer Backup ou Restaurar Rotas"
                >
                  <Database size={16} /> Sincronizar Backup
                </button>
              </>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={addRow} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#3A2414] hover:brightness-110 text-white border-2 border-[#3A2414]/20 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={16} /> Adicionar
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-[#B32025] hover:brightness-110 text-white border-2 border-[#3A2414]/25 rounded-2xl text-xs font-black uppercase transition-all cursor-pointer shadow-sm"
                >
                  <Save size={16} /> Salvar
                </button>
                <button 
                  onClick={handleCancel} 
                  className="p-4 bg-white hover:bg-stone-50 text-[#3A2414] border-2 border-[#3A2414]/15 rounded-2xl transition-all cursor-pointer shadow-sm"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tactical UI View (Desktop Table) */}
        <div className="hidden md:block overflow-hidden rounded-3xl border-2 border-[#3A2414]/15 bg-white shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#3A2414] text-white border-b-2 border-[#3A2414]">
                <th className="p-5 text-center text-[11px] font-bold uppercase tracking-widest font-serif w-[8%]">Mover</th>
                <th className="p-5 text-left text-[11px] font-bold uppercase tracking-widest font-serif w-[32%]">Sentido Ida (Operação)</th>
                <th className="p-5 text-center text-[11px] font-bold uppercase tracking-widest font-serif w-[10%]">Cod</th>
                <th className="p-5 text-left text-[11px] font-bold uppercase tracking-widest font-serif w-[32%]">Sentido Volta (Retorno)</th>
                <th className="p-5 text-center text-[11px] font-bold uppercase tracking-widest font-serif w-[10%]">Cod</th>
                {isEditing && <th className="p-5 text-center text-[11px] font-bold uppercase tracking-widest font-serif w-[8%]">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2414]/10">
              <AnimatePresence mode="popLayout">
                {currentData.map((route) => {
                  const realIndex = safeRawData.indexOf(route);
                  if (realIndex === -1) return null;
                  return (
                    <motion.tr 
                      layout
                      draggable
                      onDragStart={(e) => handleDragStart(e, realIndex)}
                      onDragOver={(e) => handleDragOver(e, realIndex)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, realIndex)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={`${route.idaCod}-${route.voltaCod}-${realIndex}`} 
                      className={cn(
                        "group hover:bg-[#3A2414]/5 transition-colors cursor-grab active:cursor-grabbing",
                        draggedIndex === realIndex ? "opacity-30 bg-[#3A2414]/10" : "",
                        hoveredIndex === realIndex ? "border-t-2 border-b-2 border-dashed border-[#B32025]/50 bg-[#B32025]/5" : ""
                      )}
                    >
                      <td className="p-5">
                        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          <div className="p-1 px-1.5 text-[#3A2414]/40 group-hover:text-[#B32025] transition-colors cursor-grab active:cursor-grabbing" title="Arraste para reordenar">
                            <GripVertical size={16} />
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        {isEditing ? (
                          <div className="flex items-center gap-3">
                             <MapPin size={14} className="text-[#B32025]" />
                             <input 
                               value={route.ida} 
                               onChange={(e) => updateRow(realIndex, 'ida', e.target.value)} 
                               className="w-full bg-white p-3 rounded-xl border border-[#3A2414]/15 text-xs text-[#3A2414] font-bold focus:border-[#B32025] outline-none uppercase shadow-sm"
                               placeholder="ORIGEM X DESTINO"
                             />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#B32025]/10 rounded-lg">
                                <ArrowRight size={14} className="text-[#B32025]" />
                              </div>
                              <span className="text-xs font-black text-[#3A2414] uppercase tracking-tight">{route.ida || '---'}</span>
                            </div>
                            {route.ida && (
                              <button
                                onClick={() => copyIndividualCode(route.ida, 'idaName', realIndex)}
                                className={cn(
                                  "p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100",
                                  copiedCode?.type === 'idaName' && copiedCode?.index === realIndex
                                    ? "bg-green-50 border-green-200 text-green-600 opacity-100"
                                    : "bg-white border-[#3A2414]/15 text-[#3A2414]/60 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                                )}
                                title="Copiar nome da rota (Ida)"
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
                      </td>
                      <td className="p-5">
                        {isEditing ? (
                          <input 
                            value={route.idaCod} 
                            onChange={(e) => updateRow(realIndex, 'idaCod', e.target.value)} 
                            className="w-full bg-white p-3 rounded-xl border border-[#3A2414]/15 text-[11px] text-[#312c27] font-mono text-center focus:border-[#B32025] outline-none font-bold shadow-sm"
                            placeholder="0000"
                          />
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="bg-[#3A2414]/5 text-[#3A2414] border border-[#3A2414]/15 px-3 py-1.5 rounded-lg font-mono text-[11px] font-black shadow-sm">
                              {route.idaCod || '----'}
                            </span>
                            {route.idaCod && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyIndividualCode(route.idaCod, 'ida', realIndex);
                                }}
                                className={cn(
                                  "p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0",
                                  copiedCode?.type === 'ida' && copiedCode?.index === realIndex
                                    ? "bg-green-50 border-green-200 text-green-600"
                                    : "bg-white border-[#3A2414]/15 text-[#3A2414]/60 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                                )}
                                title="Copiar código Ida"
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
                      </td>
                      <td className="p-5">
                        {isEditing ? (
                          <div className="flex items-center gap-3">
                             <MapPin size={14} className="text-[#B32025]" />
                             <input 
                               value={route.volta} 
                               onChange={(e) => updateRow(realIndex, 'volta', e.target.value)} 
                               className="w-full bg-white p-3 rounded-xl border border-[#3A2414]/15 text-xs text-[#3A2414] font-bold focus:border-[#B32025] outline-none uppercase shadow-sm"
                               placeholder="ORIGEM X DESTINO"
                             />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#B32025]/10 rounded-lg">
                                <ArrowRight size={14} className="text-[#B32025] rotate-180" />
                              </div>
                              <span className="text-xs font-black text-[#3A2414] uppercase tracking-tight">{route.volta || '---'}</span>
                            </div>
                            {route.volta && (
                              <button
                                onClick={() => copyIndividualCode(route.volta, 'voltaName', realIndex)}
                                className={cn(
                                  "p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100",
                                  copiedCode?.type === 'voltaName' && copiedCode?.index === realIndex
                                    ? "bg-green-50 border-green-200 text-green-600 opacity-100"
                                    : "bg-white border-[#3A2414]/15 text-[#3A2414]/60 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                                )}
                                title="Copiar nome da rota (Volta)"
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
                      </td>
                      <td className="p-5">
                        {isEditing ? (
                          <input 
                            value={route.voltaCod} 
                            onChange={(e) => updateRow(realIndex, 'voltaCod', e.target.value)} 
                            className="w-full bg-white p-3 rounded-xl border border-[#3A2414]/15 text-[11px] text-[#312c27] font-mono text-center focus:border-[#B32025] outline-none font-bold shadow-sm"
                            placeholder="0000"
                          />
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="bg-[#3A2414]/5 text-[#3A2414] border border-[#3A2414]/15 px-3 py-1.5 rounded-lg font-mono text-[11px] font-black shadow-sm">
                              {route.voltaCod || '----'}
                            </span>
                            {route.voltaCod && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyIndividualCode(route.voltaCod, 'volta', realIndex);
                                }}
                                className={cn(
                                  "p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0",
                                  copiedCode?.type === 'volta' && copiedCode?.index === realIndex
                                    ? "bg-green-50 border-green-200 text-green-600"
                                    : "bg-white border-[#3A2414]/15 text-[#3A2414]/60 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                                )}
                                title="Copiar código Volta"
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
                      </td>
                      {isEditing && (
                        <td className="p-5">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => removeRow(realIndex)} 
                              className="p-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-all border border-red-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {currentData.length === 0 && (
            <div className="p-20 text-center bg-white">
              <Database className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Nenhuma rota encontrada para os filtros aplicados</p>
            </div>
          )}
        </div>

        {/* Mobile Tactical Card View */}
        <div className="md:hidden flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {currentData.map((route) => {
              const realIndex = safeRawData.indexOf(route);
              if (realIndex === -1) return null;
              return (
                <motion.div 
                  layout
                  draggable
                  onDragStart={(e) => handleDragStart(e, realIndex)}
                  onDragOver={(e) => handleDragOver(e, realIndex)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, realIndex)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={`${route.idaCod}-${route.voltaCod}-${realIndex}`} 
                  className={cn(
                    "bg-[#fdfcf9] border rounded-3xl p-5 relative overflow-hidden shadow-sm transition-all cursor-grab active:cursor-grabbing",
                    draggedIndex === realIndex ? "opacity-30 bg-[#3A2414]/10 border-[#3A2414]/25" : "border-[#3A2414]/15",
                    hoveredIndex === realIndex ? "border-2 border-dashed border-[#B32025]/50 bg-[#B32025]/5" : ""
                  )}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#B32025]" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#B32025]/10 rounded-xl flex items-center justify-center">
                        <Navigation size={14} className="text-[#B32025]" />
                      </div>
                      <span className="text-[10px] font-black text-[#3A2414] uppercase tracking-widest">Rota #{realIndex + 1}</span>
                    </div>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="p-2 text-[#3A2414]/40 hover:text-[#B32025] transition-colors cursor-grab active:cursor-grabbing" title="Arraste para reordenar">
                        <GripVertical size={16} />
                      </div>

                      {isEditing && (
                        <button 
                          onClick={() => removeRow(realIndex)} 
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl cursor-pointer border border-red-200 transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-[#3A2414]/10 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-[#B32025] uppercase tracking-widest">Sentido Ida</span>
                        {isEditing ? (
                           <input 
                             value={route.idaCod} 
                             onChange={(e) => updateRow(realIndex, 'idaCod', e.target.value)} 
                             className="w-20 bg-white p-1 text-[10px] text-[#312c27] text-center border border-[#3A2414]/15 rounded uppercase font-bold focus:border-[#B32025] outline-none"
                           />
                        ) : (
                           <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                             <span className="text-[11px] font-mono font-black text-[#3A2414] bg-[#3A2414]/5 border border-[#3A2414]/15 px-2 py-0.5 rounded-md">{route.idaCod || '----'}</span>
                             {route.idaCod && (
                               <button
                                 onClick={() => copyIndividualCode(route.idaCod, 'ida', realIndex)}
                                 className={cn(
                                   "p-1 rounded-md border transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0",
                                   copiedCode?.type === 'ida' && copiedCode?.index === realIndex
                                     ? "bg-green-50 border-green-200 text-green-600"
                                     : "bg-white border-[#3A2414]/15 text-[#3A2414]/60 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                                 )}
                                 title="Copiar código Ida"
                               >
                                 {copiedCode?.type === 'ida' && copiedCode?.index === realIndex ? (
                                   <Check size={10} className="stroke-[3]" />
                                 ) : (
                                   <Clipboard size={10} />
                                 )}
                               </button>
                             )}
                           </div>
                        )}
                      </div>
                      {isEditing ? (
                        <input 
                          value={route.ida} 
                          onChange={(e) => updateRow(realIndex, 'ida', e.target.value)} 
                          className="w-full bg-transparent text-xs text-[#2b180d] font-bold outline-none uppercase"
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                          <p className="text-xs font-black text-[#3A2414] uppercase leading-tight">{route.ida || '---'}</p>
                          {route.ida && (
                            <button
                              onClick={() => copyIndividualCode(route.ida, 'idaName', realIndex)}
                              className={cn(
                                "p-1 rounded-md border transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0",
                                copiedCode?.type === 'idaName' && copiedCode?.index === realIndex
                                  ? "bg-green-50 border-green-200 text-green-600"
                                  : "bg-white border-[#3A2414]/15 text-[#3A2414]/60 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                              )}
                              title="Copiar nome Ida"
                            >
                              {copiedCode?.type === 'idaName' && copiedCode?.index === realIndex ? (
                                <Check size={10} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={10} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#3A2414]/10 shadow-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-[#B32025] uppercase tracking-widest">Sentido Volta</span>
                        {isEditing ? (
                           <input 
                             value={route.voltaCod} 
                             onChange={(e) => updateRow(realIndex, 'voltaCod', e.target.value)} 
                             className="w-20 bg-white p-1 text-[10px] text-[#312c27] text-center border border-[#3A2414]/15 rounded uppercase font-bold focus:border-[#B32025] outline-none"
                           />
                        ) : (
                           <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                             <span className="text-[11px] font-mono font-black text-[#3A2414] bg-[#3A2414]/5 border border-[#3A2414]/15 px-2 py-0.5 rounded-md">{route.voltaCod || '----'}</span>
                             {route.voltaCod && (
                               <button
                                 onClick={() => copyIndividualCode(route.voltaCod, 'volta', realIndex)}
                                 className={cn(
                                   "p-1 rounded-md border transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0",
                                   copiedCode?.type === 'volta' && copiedCode?.index === realIndex
                                     ? "bg-green-50 border-green-200 text-green-600"
                                     : "bg-white border-[#3A2414]/15 text-[#3A2414]/60 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                                 )}
                                 title="Copiar código Volta"
                               >
                                 {copiedCode?.type === 'volta' && copiedCode?.index === realIndex ? (
                                   <Check size={10} className="stroke-[3]" />
                                 ) : (
                                   <Clipboard size={10} />
                                 )}
                               </button>
                             )}
                           </div>
                        )}
                      </div>
                      {isEditing ? (
                        <input 
                          value={route.volta} 
                          onChange={(e) => updateRow(realIndex, 'volta', e.target.value)} 
                          className="w-full bg-transparent text-xs text-[#2b180d] font-bold outline-none uppercase"
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                          <p className="text-xs font-black text-[#3A2414] uppercase leading-tight">{route.volta || '---'}</p>
                          {route.volta && (
                            <button
                              onClick={() => copyIndividualCode(route.volta, 'voltaName', realIndex)}
                              className={cn(
                                "p-1 rounded-md border transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0",
                                copiedCode?.type === 'voltaName' && copiedCode?.index === realIndex
                                  ? "bg-green-50 border-green-200 text-green-600"
                                  : "bg-white border-[#3A2414]/15 text-[#3A2414]/60 hover:text-[#B32025] hover:border-[#B32025]/30 hover:bg-[#B32025]/5"
                              )}
                              title="Copiar nome Volta"
                            >
                              {copiedCode?.type === 'voltaName' && copiedCode?.index === realIndex ? (
                                <Check size={10} className="stroke-[3]" />
                              ) : (
                                <Clipboard size={10} />
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
        </div>

        {/* Destructive Action */}
        {isEditing && (
          <div className="mt-8 pt-8 border-t-2 border-[#3A2414]/10 flex justify-center">
            <button 
              onClick={clearAll} 
              className="px-6 py-3 bg-red-50 text-red-800 hover:bg-red-100 border-2 border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            >
              Resetar Base de Dados de Rotas
            </button>
          </div>
        )}
      </div>

      {/* Backup and Sync Modal Overlay */}
      <AnimatePresence>
        {isBackupOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] select-none">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#fdfcf9] border-4 border-[#3A2414] rounded-[2.5rem] w-full max-w-2xl bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] overflow-hidden relative shadow-2xl p-6 md:p-8 text-[#3A2414] max-h-[90vh] overflow-y-auto"
            >
              {/* Decorative corner accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3A2414]/20 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3A2414]/20 pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-[#3A2414]/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#3A2414] text-[#fdefd1] rounded-xl">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-xl text-[#3A2414] leading-tight">Backup e Sincronização</h3>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider font-mono">Migração de Dados e Nuvem</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBackupOpen(false)}
                  className="p-2 bg-stone-100 hover:bg-stone-200 text-[#3A2414] rounded-full transition-all border border-[#3A2414]/10 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-6">
                
                {/* Export Section */}
                <div className="space-y-3">
                  <h4 className="font-serif font-black text-sm text-[#3A2414] uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B32025]" />
                    Exportar Rotas Atuais
                  </h4>
                  <p className="text-xs text-[#3A2414]/80 font-medium">
                    Copie o código abaixo no seu computador com internet ou Vercel para carregar e transferir suas rotas editadas para outro dispositivo ou navegador.
                  </p>
                  
                  <div className="relative">
                    <div className="bg-[#3A2414]/5 pl-4 pr-32 py-3 rounded-2xl border border-[#3A2414]/15 font-mono text-[11px] font-bold overflow-x-auto whitespace-nowrap text-[#3A2414]/80 max-w-full">
                      {JSON.stringify(routes)}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 px-3.5 bg-[#3A2414] hover:bg-[#3A2414]/95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-green-300" /> Copiado!
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
                <div className="space-y-3 pt-4 border-t border-[#3A2414]/10">
                  <h4 className="font-serif font-black text-sm text-[#3A2414] uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    Importar ou Restaurar Rotas
                  </h4>
                  <p className="text-xs text-[#3A2414]/80 font-medium">
                    Cole o código de backup copiado de outro dispositivo no campo abaixo para restaurá-lo diretamente na nuvem:
                  </p>

                  <textarea 
                    value={backupText}
                    onChange={(e) => {
                      setBackupText(e.target.value);
                      if (backupStatus.message) setBackupStatus({ type: '', message: '' });
                    }}
                    placeholder='Cole aqui seu código JSON de backup... Ex: [{"ida": "ROTA A", "idaCod": "123", ...}]'
                    className="w-full h-24 bg-white border-2 border-[#3A2414]/15 focus:border-[#B32025] rounded-2xl p-4 text-[11px] font-mono font-bold text-[#3A2414] placeholder-stone-400 outline-none shadow-sm resize-none"
                  />

                  {/* Inline Status Message */}
                  {backupStatus.message && (
                    <div className={cn(
                      "p-4 rounded-xl text-xs font-bold border flex items-center gap-3",
                      backupStatus.type === 'success' 
                        ? "bg-green-50 border-green-200 text-green-800" 
                        : "bg-red-50 border-red-200 text-red-800"
                    )}>
                      {backupStatus.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                      {backupStatus.message}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => handleManualImport('merge')}
                      disabled={!backupText.trim()}
                      className={cn(
                        "px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-[#3A2414] cursor-pointer transition-all",
                        backupText.trim()
                          ? "bg-[#3A2414] hover:brightness-110 text-white"
                          : "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                      )}
                    >
                      Mesclar com Base
                    </button>
                    <button
                      onClick={() => handleManualImport('replace')}
                      disabled={!backupText.trim()}
                      className={cn(
                        "px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border-2 border-[#3A2414]/20 cursor-pointer transition-all",
                        backupText.trim()
                          ? "bg-[#B32025] hover:brightness-110 text-white"
                          : "bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed"
                      )}
                    >
                      Sobrescrever Tudo
                    </button>
                  </div>
                </div>

              </div>

              {/* Info Tip footer */}
              <div className="mt-8 pt-4 border-t-2 border-[#3A2414]/10 bg-[#3A2414]/5 p-4 rounded-2xl flex items-start gap-3">
                <span className="text-xs">💡</span>
                <p className="text-[10px] text-stone-600 font-medium leading-normal">
                  Ao atualizar e sincronizar do site Vercel, o banco de dados Realtime Database unificado é alimentado na nuvem. Suas alterações estarão seguras e prontas para uso em celulares, tablets ou qualquer outro dispositivo instantaneamente.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Status Indicator - Styled as an extraction badge */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-[#3A2414]/90 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full shadow-lg z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-[#B32025] blur shadow-[0_0_10px_#B32025]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#B32025] relative z-10" />
        </div>
        <span className="text-[10px] font-black text-white uppercase tracking-widest font-mono">Torra e Rastreio Ativo</span>
      </div>
    </div>
  );
}
