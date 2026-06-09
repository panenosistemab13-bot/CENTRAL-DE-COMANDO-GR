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
  GripVertical
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

          <div className="flex gap-2">
            {!isEditing ? (
              <button 
                onClick={handleStartEdit} 
                className="flex items-center gap-3 px-6 py-4 bg-[#B32025] hover:brightness-110 text-white border-2 border-[#3A2414]/25 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer shadow-sm"
              >
                <Edit2 size={16} /> Editar Configuração
              </button>
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
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#B32025]/10 rounded-lg">
                              <ArrowRight size={14} className="text-[#B32025]" />
                            </div>
                            <span className="text-xs font-black text-[#3A2414] uppercase tracking-tight">{route.ida || '---'}</span>
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
                          <div className="flex justify-center">
                            <span className="bg-[#3A2414]/5 text-[#3A2414] border border-[#3A2414]/15 px-3 py-1.5 rounded-lg font-mono text-[11px] font-black shadow-sm">
                              {route.idaCod || '----'}
                            </span>
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
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#B32025]/10 rounded-lg">
                              <ArrowRight size={14} className="text-[#B32025] rotate-180" />
                            </div>
                            <span className="text-xs font-black text-[#3A2414] uppercase tracking-tight">{route.volta || '---'}</span>
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
                          <div className="flex justify-center">
                            <span className="bg-[#3A2414]/5 text-[#3A2414] border border-[#3A2414]/15 px-3 py-1.5 rounded-lg font-mono text-[11px] font-black shadow-sm">
                              {route.voltaCod || '----'}
                            </span>
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
                           <span className="text-[11px] font-mono font-black text-[#3A2414] bg-[#3A2414]/5 border border-[#3A2414]/15 px-2 py-0.5 rounded-md">{route.idaCod || '----'}</span>
                        )}
                      </div>
                      {isEditing ? (
                        <input 
                          value={route.ida} 
                          onChange={(e) => updateRow(realIndex, 'ida', e.target.value)} 
                          className="w-full bg-transparent text-xs text-[#2b180d] font-bold outline-none uppercase"
                        />
                      ) : (
                        <p className="text-xs font-black text-[#3A2414] uppercase leading-tight">{route.ida || '---'}</p>
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
                           <span className="text-[11px] font-mono font-black text-[#3A2414] bg-[#3A2414]/5 border border-[#3A2414]/15 px-2 py-0.5 rounded-md">{route.voltaCod || '----'}</span>
                        )}
                      </div>
                      {isEditing ? (
                        <input 
                          value={route.volta} 
                          onChange={(e) => updateRow(realIndex, 'volta', e.target.value)} 
                          className="w-full bg-transparent text-xs text-[#2b180d] font-bold outline-none uppercase"
                        />
                      ) : (
                        <p className="text-xs font-black text-[#3A2414] uppercase leading-tight">{route.volta || '---'}</p>
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
