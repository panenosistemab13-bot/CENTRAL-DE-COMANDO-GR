import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Search, 
  Route, 
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
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { rtdb as db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { FilterPanel3D } from './3d/FilterPanel3D';
import { Modal3D } from './3d/Modal3D';

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

  const [copiedCode, setCopiedCode] = useState<{ type: string; index: number } | null>(null);

  const copyIndividualCode = (code: string, type: string, index: number) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode({ type, index });
      setTimeout(() => setCopiedCode(null), 1500);
    });
  };

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

  const handleStartEditing = () => {
    setTempRoutes([...routes]);
    setIsEditing(true);
  };

  const handleSaveEditing = async () => {
    setRoutes(tempRoutes);
    await set(ref(db, 'app_rotas_data'), tempRoutes);
    setIsEditing(false);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  const handleAddRoute = () => {
    setTempRoutes([...tempRoutes, { ida: '', idaCod: '', volta: '', voltaCod: '' }]);
  };

  const handleDeleteRoute = (index: number) => {
    const next = [...tempRoutes];
    next.splice(index, 1);
    setTempRoutes(next);
  };

  const activeRoutesList = isEditing ? tempRoutes : routes;

  const filteredRoutes = activeRoutesList.filter(item => {
    const query = searchTerm.toLowerCase();
    return (
      item.ida.toLowerCase().includes(query) ||
      item.idaCod.toLowerCase().includes(query) ||
      item.volta.toLowerCase().includes(query) ||
      item.voltaCod.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER BAR */}
      <GlassPanel3D className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" variant="glow">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="led-status led-status-blue" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400">
                PGR COMMAND CENTER 3D • MÓDULO LOGÍSTICO
              </span>
            </div>
            <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Route size={24} className="text-sky-400" />
              CÓDIGOS E ROTAS OPERACIONAIS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleAddRoute}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> ADICIONAR ROTA
              </button>
              <button
                onClick={handleCancelEditing}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold uppercase transition-all cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={handleSaveEditing}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Save size={14} /> SALVAR ALTERAÇÕES
              </button>
            </>
          ) : (
            <button
              onClick={handleStartEditing}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit2 size={14} /> EDITAR ROTAS
            </button>
          )}
        </div>
      </GlassPanel3D>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard3D
          title="Total de Rotas Mapeadas"
          value={routes.length}
          subtitle="Base Operacional Ativa"
          icon={Route}
          status="info"
        />
        <MetricCard3D
          title="Códigos de Ida Ativos"
          value={routes.filter(r => Boolean(r.idaCod)).length}
          subtitle="Trajetos Diretos"
          icon={Navigation}
          status="normal"
        />
        <MetricCard3D
          title="Códigos de Volta Ativos"
          value={routes.filter(r => Boolean(r.voltaCod)).length}
          subtitle="Retornos Mapeados"
          icon={Globe}
          status="warning"
        />
      </div>

      {/* FILTER PANEL */}
      <FilterPanel3D
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar rota ou código (ex: 4069, Rio de Janeiro)..."
      />

      {/* ROUTES TABLE */}
      <HUDPanel title={`Tabela de Rotas e Códigos Logísticos (${filteredRoutes.length})`} badge="RTDB SYNC">
        <div className="overflow-x-auto no-scrollbar w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-500/20 bg-slate-900/90 text-[10px] font-mono font-black uppercase tracking-wider text-sky-400">
                <th className="py-3 px-4">Rota de Ida</th>
                <th className="py-3 px-4">Código Ida</th>
                <th className="py-3 px-4">Rota de Volta</th>
                <th className="py-3 px-4">Código Volta</th>
                {isEditing && <th className="py-3 px-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono text-slate-200">
              {filteredRoutes.map((route, idx) => (
                <tr key={idx} className="hover:bg-sky-500/10 transition-colors">
                  
                  {/* IDA NAME */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={route.ida}
                        onChange={(e) => {
                          const next = [...tempRoutes];
                          next[idx].ida = e.target.value.toUpperCase();
                          setTempRoutes(next);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono uppercase text-xs"
                      />
                    ) : (
                      <span className="font-bold text-white uppercase">{route.ida}</span>
                    )}
                  </td>

                  {/* IDA CODE */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={route.idaCod}
                        onChange={(e) => {
                          const next = [...tempRoutes];
                          next[idx].idaCod = e.target.value;
                          setTempRoutes(next);
                        }}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sky-400 font-mono font-bold text-xs"
                      />
                    ) : (
                      <button
                        onClick={() => copyIndividualCode(route.idaCod, 'ida', idx)}
                        disabled={!route.idaCod}
                        className={cn(
                          "px-2.5 py-1 rounded-md border font-mono font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5",
                          route.idaCod
                            ? "bg-sky-500/15 border-sky-500/30 text-sky-400 hover:bg-sky-500/30"
                            : "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed"
                        )}
                      >
                        {route.idaCod || 'SEM CÓDIGO'}
                        {copiedCode?.type === 'ida' && copiedCode.index === idx && (
                          <Check size={12} className="text-emerald-400" />
                        )}
                      </button>
                    )}
                  </td>

                  {/* VOLTA NAME */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={route.volta}
                        onChange={(e) => {
                          const next = [...tempRoutes];
                          next[idx].volta = e.target.value.toUpperCase();
                          setTempRoutes(next);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono uppercase text-xs"
                      />
                    ) : (
                      <span className="font-bold text-slate-300 uppercase">{route.volta}</span>
                    )}
                  </td>

                  {/* VOLTA CODE */}
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={route.voltaCod}
                        onChange={(e) => {
                          const next = [...tempRoutes];
                          next[idx].voltaCod = e.target.value;
                          setTempRoutes(next);
                        }}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-amber-400 font-mono font-bold text-xs"
                      />
                    ) : (
                      <button
                        onClick={() => copyIndividualCode(route.voltaCod, 'volta', idx)}
                        disabled={!route.voltaCod}
                        className={cn(
                          "px-2.5 py-1 rounded-md border font-mono font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5",
                          route.voltaCod
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
                            : "bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed"
                        )}
                      >
                        {route.voltaCod || 'SEM CÓDIGO'}
                        {copiedCode?.type === 'volta' && copiedCode.index === idx && (
                          <Check size={12} className="text-emerald-400" />
                        )}
                      </button>
                    )}
                  </td>

                  {/* EDIT ACTIONS */}
                  {isEditing && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRoute(idx)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-400 transition-colors cursor-pointer border border-rose-500/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HUDPanel>

    </div>
  );
}
