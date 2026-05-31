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
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  useEffect(() => {
    const saved = localStorage.getItem('app_rotas_data');
    if (saved) {
      setRoutes(JSON.parse(saved));
    } else {
      setRoutes(DEFAULT_ROUTES);
    }
  }, []);

  const handleStartEdit = () => {
    setTempRoutes([...routes]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setRoutes(tempRoutes);
    localStorage.setItem('app_rotas_data', JSON.stringify(tempRoutes));
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
    <div className="min-h-screen bg-[#02040a] p-4 md:p-8 space-y-8 pb-32">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0b101c] border border-white/5 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-inner">
              <Navigation className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">ROTAS</h1>
              <div className="flex items-center gap-4 mt-1.5">
                <p className="text-indigo-400/70 font-mono text-xs font-bold uppercase tracking-widest">Rotas</p>
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                   <span className="text-[10px] font-black text-emerald-400 tracking-tighter uppercase">Sincronizado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
                <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center min-w-[100px]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Trechos</span>
                  <span className="text-xl font-black text-white">{currentData.length}</span>
                </div>
                <div className="px-5 py-3 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center min-w-[100px]">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Códigos</span>
                  <span className="text-xl font-black text-white">
                    {currentData.filter(r => r.idaCod).length + currentData.filter(r => r.voltaCod).length}
                  </span>
                </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-[#0b101c] border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Actions & Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-400 text-zinc-500">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="PESQUISAR ROTA, CIDADE OU CÓDIGO SM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#02040a]/80 border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-white placeholder-zinc-700 transition-all outline-none uppercase tracking-widest"
            />
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <button 
                onClick={handleStartEdit} 
                className="flex items-center gap-3 px-6 py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap active:scale-95"
              >
                <Edit2 size={16} /> Editar Configuração
              </button>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={addRow} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-black uppercase transition-all"
                >
                  <Plus size={16} /> Adicionar
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Save size={16} /> Salvar
                </button>
                <button 
                  onClick={handleCancel} 
                  className="p-4 bg-zinc-900 border border-white/10 text-white rounded-2xl hover:bg-zinc-800 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tactical UI View (Desktop Table) */}
        <div className="hidden md:block overflow-hidden rounded-3xl border border-white/5 bg-black/20">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="p-5 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest w-[35%]">Sentido Ida (Operação)</th>
                <th className="p-5 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest w-[10%]">Cod</th>
                <th className="p-5 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest w-[35%]">Sentido Volta (Retorno)</th>
                <th className="p-5 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest w-[10%]">Cod</th>
                {isEditing && <th className="p-5 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest w-[10%]">Acão</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {currentData.map((route, i) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`${route.idaCod}-${i}`} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-5">
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                           <MapPin size={14} className="text-emerald-500/50" />
                           <input 
                             value={route.ida} 
                             onChange={(e) => updateRow(i, 'ida', e.target.value)} 
                             className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-white font-bold focus:border-indigo-500/50 outline-none uppercase"
                             placeholder="ORIGEM X DESTINO"
                           />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ArrowRight size={14} className="text-emerald-500" />
                          </div>
                          <span className="text-xs font-black text-zinc-100 uppercase tracking-tight">{route.ida || '---'}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      {isEditing ? (
                        <input 
                          value={route.idaCod} 
                          onChange={(e) => updateRow(i, 'idaCod', e.target.value)} 
                          className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-[11px] text-amber-400 font-mono text-center focus:border-indigo-500/50 outline-none"
                          placeholder="0000"
                        />
                      ) : (
                        <div className="flex justify-center">
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg font-mono text-[11px] font-black">
                            {route.idaCod || '----'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                           <MapPin size={14} className="text-indigo-500/50" />
                           <input 
                             value={route.volta} 
                             onChange={(e) => updateRow(i, 'volta', e.target.value)} 
                             className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-white font-bold focus:border-indigo-500/50 outline-none uppercase"
                             placeholder="ORIGEM X DESTINO"
                           />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <ArrowRight size={14} className="text-indigo-500 rotate-180" />
                          </div>
                          <span className="text-xs font-black text-zinc-100 uppercase tracking-tight">{route.volta || '---'}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      {isEditing ? (
                        <input 
                          value={route.voltaCod} 
                          onChange={(e) => updateRow(i, 'voltaCod', e.target.value)} 
                          className="w-full bg-black/40 p-3 rounded-xl border border-white/5 text-[11px] text-amber-400 font-mono text-center focus:border-indigo-500/50 outline-none"
                          placeholder="0000"
                        />
                      ) : (
                        <div className="flex justify-center">
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg font-mono text-[11px] font-black">
                            {route.voltaCod || '----'}
                          </span>
                        </div>
                      )}
                    </td>
                    {isEditing && (
                      <td className="p-5">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => removeRow(i)} 
                            className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {currentData.length === 0 && (
            <div className="p-20 text-center bg-black/10">
              <Database className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Nenhuma rota encontrada para os filtros aplicados</p>
            </div>
          )}
        </div>

        {/* Mobile Tactical Card View */}
        <div className="md:hidden flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {currentData.map((route, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={i} 
                className="bg-[#02040a] border border-white/5 rounded-3xl p-5 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/20" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <Navigation size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rota #{i+1}</span>
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => removeRow(i)} 
                      className="p-3 bg-rose-500/5 text-rose-500 rounded-xl"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sentido Ida</span>
                      {isEditing ? (
                         <input 
                           value={route.idaCod} 
                           onChange={(e) => updateRow(i, 'idaCod', e.target.value)} 
                           className="w-20 bg-black p-1 text-[10px] text-amber-400 text-center border border-white/10 rounded uppercase"
                         />
                      ) : (
                         <span className="text-[10px] font-mono font-black text-amber-500">{route.idaCod || '----'}</span>
                      )}
                    </div>
                    {isEditing ? (
                      <input 
                        value={route.ida} 
                        onChange={(e) => updateRow(i, 'ida', e.target.value)} 
                        className="w-full bg-transparent text-xs text-white font-bold outline-none uppercase"
                      />
                    ) : (
                      <p className="text-xs font-black text-white uppercase leading-tight">{route.ida || '---'}</p>
                    )}
                  </div>

                  <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Sentido Volta</span>
                      {isEditing ? (
                         <input 
                           value={route.voltaCod} 
                           onChange={(e) => updateRow(i, 'voltaCod', e.target.value)} 
                           className="w-20 bg-black p-1 text-[10px] text-amber-400 text-center border border-white/10 rounded uppercase"
                         />
                      ) : (
                         <span className="text-[10px] font-mono font-black text-amber-500">{route.voltaCod || '----'}</span>
                      )}
                    </div>
                    {isEditing ? (
                      <input 
                        value={route.volta} 
                        onChange={(e) => updateRow(i, 'volta', e.target.value)} 
                        className="w-full bg-transparent text-xs text-white font-bold outline-none uppercase"
                      />
                    ) : (
                      <p className="text-xs font-black text-white uppercase leading-tight">{route.volta || '---'}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Destructive Action */}
        {isEditing && (
          <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
            <button 
              onClick={clearAll} 
              className="px-6 py-3 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Resetar Base de Dados de Rotas
            </button>
          </div>
        )}
      </div>

      {/* Floating Status Indicator */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 blur shadow-[0_0_10px_#10b981]" />
          <div className="w-2 h-2 rounded-full bg-emerald-400 relative z-10" />
        </div>
        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Sistema de Rastreio Ativo</span>
      </div>
    </div>
  );
}
