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
const coffeeBg = "/src/assets/images/coffee_rustic_bg_1780760486326.png";

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
    <div className="min-h-screen bg-[#170e0a] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] p-4 md:p-8 space-y-8 pb-32 text-[#e6d5c3]">
      {/* Dynamic Earthy Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#2b180d] border-4 border-[#4a2e1d] p-6 lg:p-8 shadow-2xl relative">
        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#c79165]/30 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#c79165]/30 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#c79165]/30 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#c79165]/30 pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-2/3">
            {/* Studio Composition Image Frame */}
            <div className="relative w-full md:w-56 h-40 shrink-0 rounded-2xl overflow-hidden border-2 border-[#c79165] shadow-lg group">
              <img 
                src={coffeeBg} 
                alt="Edição Rústica Sofisticada" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2b180d]/85 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#fdfaf5] uppercase">Composição Macro</span>
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#fdfaf5] tracking-tight leading-tight">
                Edição Rústica Sofisticada
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1">
                <span className="font-mono text-xs text-[#c79165] font-black uppercase tracking-widest">
                  CAFÉ EM GRÃOS SELECIONADOS
                </span>
                <span className="text-zinc-500">•</span>
                <span className="font-serif italic text-xs text-[#e6d5c3]">
                  Composição de Estúdio "3corações"
                </span>
              </div>
              <p className="text-xs text-[#e2d4c9] leading-relaxed max-w-xl font-medium">
                Cata de texturas artesanais de café: juta, papel kraft, cobre polido, gotejador de cobre, caneca de cerâmica rústica, folhas de café frescas e o selo de cera vermelho-escura.
              </p>
            </div>
          </div>

          {/* Metrics styled like paper tag tickets hanging */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-end">
            <div className="px-5 py-4 bg-[#fdfaf5] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border-2 border-[#7a4b31]/40 rounded-2xl shadow-md min-w-[120px] text-center relative rotate-[-1.5deg]">
              {/* String hanging effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#c0a892] rounded" />
              <span className="text-[9px] font-black text-[#7a4b31] uppercase tracking-widest block mb-1">TRECHOS</span>
              <span className="text-3xl font-serif font-black text-[#3e2516]">{currentData.length}</span>
            </div>
            
            <div className="px-5 py-4 bg-[#fdfaf5] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border-2 border-[#7a4b31]/40 rounded-2xl shadow-md min-w-[120px] text-center relative rotate-[1.5deg]">
              {/* String hanging effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#c0a892] rounded" />
              <span className="text-[9px] font-black text-[#7a4b31] uppercase tracking-widest block mb-1">CÓDIGOS</span>
              <span className="text-3xl font-serif font-black text-[#3e2516]">
                {currentData.filter(r => r.idaCod).length + currentData.filter(r => r.voltaCod).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card - Styled as a premium rustic board sheet */}
      <div className="bg-[#fdfaf5] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border-4 border-[#2b180d] rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden text-[#2b180d]">
        
        {/* Actions & Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#7a4b31]">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="PESQUISAR ROTA, CIDADE OU CÓDIGO SM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#fcf8f2] border-2 border-[#c0a892] focus:border-[#7a4b31] focus:ring-4 focus:ring-[#7a4b31]/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-black text-[#2b180d] placeholder-[#8c7a6b] transition-all outline-none uppercase tracking-widest font-mono"
            />
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <button 
                onClick={handleStartEdit} 
                className="flex items-center gap-3 px-6 py-4 bg-[#7a4b31] hover:bg-[#5c3722] text-[#fdfaf5] border-2 border-[#4e311b] rounded-2xl text-xs font-black uppercase transition-all whitespace-nowrap active:scale-95 shadow-md shadow-[#2b180d]/10"
              >
                <Edit2 size={16} /> Editar Configuração
              </button>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={addRow} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#5c3722] hover:bg-[#3e2516] text-[#fdfaf5] border-2 border-[#2b180d] rounded-2xl text-xs font-black uppercase transition-all"
                >
                  <Plus size={16} /> Adicionar
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7a4b31] to-[#a05a35] hover:from-[#5c3722] hover:to-[#7a4b31] text-[#fdfaf5] border-2 border-[#4e311b] rounded-2xl text-xs font-black uppercase transition-all shadow-lg shadow-[#7a4b31]/20"
                >
                  <Save size={16} /> Salvar
                </button>
                <button 
                  onClick={handleCancel} 
                  className="p-4 bg-[#e6d5c3] hover:bg-[#d8c4af] text-[#7a4b31] border-2 border-[#c0a892] rounded-2xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tactical UI View (Desktop Table) */}
        <div className="hidden md:block overflow-hidden rounded-3xl border-2 border-[#c0a892] bg-[#fcf8f2] shadow-inner">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-[#7a4b31] to-[#5c3722] text-[#fdfaf5] border-b-2 border-[#2b180d]">
                <th className="p-5 text-left text-[11px] font-bold uppercase tracking-widest font-serif w-[35%]">Sentido Ida (Operação)</th>
                <th className="p-5 text-center text-[11px] font-bold uppercase tracking-widest font-serif w-[10%]">Cod</th>
                <th className="p-5 text-left text-[11px] font-bold uppercase tracking-widest font-serif w-[35%]">Sentido Volta (Retorno)</th>
                <th className="p-5 text-center text-[11px] font-bold uppercase tracking-widest font-serif w-[10%]">Cod</th>
                {isEditing && <th className="p-5 text-center text-[11px] font-bold uppercase tracking-widest font-serif w-[10%]">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c0a892]/45">
              <AnimatePresence mode="popLayout">
                {currentData.map((route, i) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`${route.idaCod}-${i}`} 
                    className="group hover:bg-[#f3ebd3] transition-colors"
                  >
                    <td className="p-5">
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                           <MapPin size={14} className="text-[#7a4b31]" />
                           <input 
                             value={route.ida} 
                             onChange={(e) => updateRow(i, 'ida', e.target.value)} 
                             className="w-full bg-[#fdfaf5] p-3 rounded-xl border-2 border-[#c0a892] text-xs text-[#2b180d] font-bold focus:border-[#7a4b31] outline-none uppercase"
                             placeholder="ORIGEM X DESTINO"
                           />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#7a4b31]/10 rounded-lg">
                            <ArrowRight size={14} className="text-[#7a4b31]" />
                          </div>
                          <span className="text-xs font-black text-[#2b180d] uppercase tracking-tight font-serif">{route.ida || '---'}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      {isEditing ? (
                        <input 
                          value={route.idaCod} 
                          onChange={(e) => updateRow(i, 'idaCod', e.target.value)} 
                          className="w-full bg-[#fdfaf5] p-3 rounded-xl border-2 border-[#c0a892] text-[11px] text-[#7a4b31] font-mono text-center focus:border-[#7a4b31] outline-none font-bold"
                          placeholder="0000"
                        />
                      ) : (
                        <div className="flex justify-center">
                          <span className="bg-[#d2c2b2] text-[#4a3623] border-2 border-[#c0a892] px-3 py-1.5 rounded-lg font-mono text-[11px] font-black shadow-sm">
                            {route.idaCod || '----'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      {isEditing ? (
                        <div className="flex items-center gap-3">
                           <MapPin size={14} className="text-[#a05a35]" />
                           <input 
                             value={route.volta} 
                             onChange={(e) => updateRow(i, 'volta', e.target.value)} 
                             className="w-full bg-[#fdfaf5] p-3 rounded-xl border-2 border-[#c0a892] text-xs text-[#2b180d] font-bold focus:border-[#a05a35] outline-none uppercase"
                             placeholder="ORIGEM X DESTINO"
                           />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#a05a35]/10 rounded-lg">
                            <ArrowRight size={14} className="text-[#a05a35] rotate-180" />
                          </div>
                          <span className="text-xs font-black text-[#2b180d] uppercase tracking-tight font-serif">{route.volta || '---'}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      {isEditing ? (
                        <input 
                          value={route.voltaCod} 
                          onChange={(e) => updateRow(i, 'voltaCod', e.target.value)} 
                          className="w-full bg-[#fdfaf5] p-3 rounded-xl border-2 border-[#c0a892] text-[11px] text-[#7a4b31] font-mono text-center focus:border-[#7a4b31] outline-none font-bold"
                          placeholder="0000"
                        />
                      ) : (
                        <div className="flex justify-center">
                          <span className="bg-[#d2c2b2] text-[#4a3623] border-2 border-[#c0a892] px-3 py-1.5 rounded-lg font-mono text-[11px] font-black shadow-sm">
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
                            className="p-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition-all border border-red-200"
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
            <div className="p-20 text-center bg-[#fdfaf5]">
              <Database className="w-12 h-12 text-[#c0a892] mx-auto mb-4" />
              <p className="text-xs font-black text-[#8c7a6b] uppercase tracking-widest">Nenhuma rota encontrada para os filtros aplicados</p>
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
                className="bg-[#fcf8f2] border-2 border-[#c0a892] rounded-3xl p-5 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#7a4b31]" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#7a4b31]/10 rounded-xl flex items-center justify-center">
                      <Navigation size={14} className="text-[#7a4b31]" />
                    </div>
                    <span className="text-[10px] font-black text-[#7a4b31] uppercase tracking-widest">Rota #{i+1}</span>
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => removeRow(i)} 
                      className="p-3 bg-red-100 text-red-700 rounded-xl"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-[#fdfaf5] p-4 rounded-2xl border-2 border-[#c0a892]/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black text-[#7a4b31] uppercase tracking-widest">Sentido Ida</span>
                      {isEditing ? (
                         <input 
                           value={route.idaCod} 
                           onChange={(e) => updateRow(i, 'idaCod', e.target.value)} 
                           className="w-20 bg-[#fdfaf5] p-1 text-[10px] text-[#7a4b31] text-center border-2 border-[#c0a892] rounded uppercase font-bold"
                         />
                      ) : (
                         <span className="text-[11px] font-mono font-black text-[#4a3623] bg-[#d2c2b2] border border-[#c0a892] px-2 py-0.5 rounded-md">{route.idaCod || '----'}</span>
                      )}
                    </div>
                    {isEditing ? (
                      <input 
                        value={route.ida} 
                        onChange={(e) => updateRow(i, 'ida', e.target.value)} 
                        className="w-full bg-transparent text-xs text-[#2b180d] font-bold outline-none uppercase font-serif"
                      />
                    ) : (
                      <p className="text-xs font-black text-[#2b180d] uppercase leading-tight font-serif">{route.ida || '---'}</p>
                    )}
                  </div>

                  <div className="bg-[#fdfaf5] p-4 rounded-2xl border-2 border-[#c0a892]/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black text-[#a05a35] uppercase tracking-widest">Sentido Volta</span>
                      {isEditing ? (
                         <input 
                           value={route.voltaCod} 
                           onChange={(e) => updateRow(i, 'voltaCod', e.target.value)} 
                           className="w-20 bg-[#fdfaf5] p-1 text-[10px] text-[#7a4b31] text-center border-2 border-[#c0a892] rounded uppercase font-bold"
                         />
                      ) : (
                         <span className="text-[11px] font-mono font-black text-[#4a3623] bg-[#d2c2b2] border border-[#c0a892] px-2 py-0.5 rounded-md">{route.voltaCod || '----'}</span>
                      )}
                    </div>
                    {isEditing ? (
                      <input 
                        value={route.volta} 
                        onChange={(e) => updateRow(i, 'volta', e.target.value)} 
                        className="w-full bg-transparent text-xs text-[#2b180d] font-bold outline-none uppercase font-serif"
                      />
                    ) : (
                      <p className="text-xs font-black text-[#2b180d] uppercase leading-tight font-serif">{route.volta || '---'}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Destructive Action */}
        {isEditing && (
          <div className="mt-8 pt-8 border-t-2 border-[#c0a892]/40 flex justify-center">
            <button 
              onClick={clearAll} 
              className="px-6 py-3 bg-red-100 text-red-800 hover:bg-red-200 border-2 border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
            >
              Resetar Base de Dados de Rotas
            </button>
          </div>
        )}
      </div>

      {/* Floating Status Indicator - Styled as an extraction badge */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-[#2b180d]/90 backdrop-blur-xl border-2 border-[#7a4b31]/40 px-6 py-3 rounded-full shadow-2xl z-50">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500 blur shadow-[0_0_10px_#f59e0b]" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 relative z-10" />
        </div>
        <span className="text-[10px] font-black text-[#fdfaf5] uppercase tracking-widest font-mono">Torra e Rastreio Ativo</span>
      </div>
    </div>
  );
}
