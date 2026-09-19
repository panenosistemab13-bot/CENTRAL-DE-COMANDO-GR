import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock,
  Activity,
  Radio,
  Globe,
  MapPin,
  ShieldCheck,
  TrendingUp,
  AlertOctagon,
  Truck,
  Layers,
  Search,
  ClipboardCheck,
  Compass,
  Cpu,
  BarChart3,
  Users,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { Gauge3D } from './3d/Gauge3D';
import { StatusIndicator3D } from './3d/StatusIndicator3D';
import { BrazilMapHUD } from './BrazilMapHUD';
import { DestinoRankingHUD } from './DestinoRankingHUD';
import { StatusAnalyticsHUD } from './StatusAnalyticsHUD';
import { StatusDetailHUD } from './StatusDetailHUD';
import { UnidadeAnalyticsHUD } from './UnidadeAnalyticsHUD';

interface CityNode {
  name: string;
  state: string;
  x: number;
  y: number;
  region: string;
  altitude: string;
  linkStatus: 'active' | 'optimal' | 'warning';
  pings: number[];
}

export default function Dashboard() {
  const [presenceData, setPresenceData] = useState<any[]>([]);
  const [vehiclesInPatio, setVehiclesInPatio] = useState<number>(0);
  const [checklistAlerts, setChecklistAlerts] = useState<{expired: any[], soon: any[]}>({ expired: [], soon: [] });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [activeTab, setActiveTab] = useState<'overview' | 'satellite' | 'analytics'>('overview');
  const [selectedMapNode, setSelectedMapNode] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<CityNode | null>(null);

  // 11 real cities present in spreadsheet destinations
  const CITIES_LIST: CityNode[] = useMemo(() => [
    { name: 'Santa Luzia', state: 'MG', x: 62, y: 65, region: 'Sudeste', altitude: '725m', linkStatus: 'optimal', pings: [12, 14, 15, 11] },
    { name: 'Londrina', state: 'PR', x: 45, y: 78, region: 'Sul', altitude: '610m', linkStatus: 'active', pings: [24, 28, 26, 25] },
    { name: 'Gravataí', state: 'RS', x: 38, y: 92, region: 'Sul', altitude: '26m', linkStatus: 'active', pings: [35, 38, 36, 32] },
    { name: 'Gov. Celso Ramos', state: 'SC', x: 44, y: 86, region: 'Sul', altitude: '40m', linkStatus: 'optimal', pings: [31, 29, 32, 30] },
    { name: 'Pinhais', state: 'PR', x: 46, y: 81, region: 'Sul', altitude: '935m', linkStatus: 'active', pings: [28, 26, 27, 25] },
    { name: 'Cuiabá', state: 'MT', x: 28, y: 52, region: 'Centro-Oeste', altitude: '165m', linkStatus: 'warning', pings: [48, 55, 62, 51] },
    { name: 'Sumaré', state: 'SP', x: 54, y: 72, region: 'Sudeste', altitude: '583m', linkStatus: 'optimal', pings: [18, 16, 17, 19] },
    { name: 'Natal', state: 'RN', x: 92, y: 22, region: 'Nordeste', altitude: '30m', linkStatus: 'active', pings: [45, 42, 48, 44] },
    { name: 'Guarulhos', state: 'SP', x: 56, y: 74, region: 'Sudeste', altitude: '750m', linkStatus: 'optimal', pings: [14, 15, 13, 16] },
    { name: 'Viana', state: 'ES', x: 68, y: 62, region: 'Sudeste', altitude: '15m', linkStatus: 'active', pings: [22, 25, 24, 21] },
    { name: 'Salvador', state: 'BA', x: 78, y: 44, region: 'Nordeste', altitude: '8m', linkStatus: 'optimal', pings: [29, 31, 28, 30] }
  ], []);

  useEffect(() => {
    setSelectedNode(CITIES_LIST[0]);
  }, [CITIES_LIST]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Patio Data from RTDB
    const patioRef = ref(rtdb, 'patio/veiculos');
    const unsubscribePatio = onValue(patioRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const items = Object.values(data) as any[];
        setVehiclesInPatio(items.filter(item => item.estaNoPatio === 'Sim').length);
      } else {
        setVehiclesInPatio(0);
      }
    });

    // Presence Data from RTDB
    const escalasListRef = ref(rtdb, 'escalas');
    const unsubscribePresence = onValue(escalasListRef, (snapshot) => {
      const data = snapshot.val();
      const shifts = data ? Object.values(data) : [];
      
      const dataByDate: Record<string, number> = {};
      shifts.forEach((s: any) => {
        if (s.date && s.worked) {
          dataByDate[s.date] = (dataByDate[s.date] || 0) + 1;
        }
      });
      
      const sortedKeys = Object.keys(dataByDate).sort();
      const last10 = sortedKeys.slice(-10);
      
      const chartData = last10.map((dateKey) => {
         const parts = dateKey.split('-');
         const name = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dateKey;
         return { name, score: dataByDate[dateKey] };
      });
      
      setPresenceData(chartData.length ? chartData : []);
    });

    // Checklist Data Sync
    const checklistRef = ref(rtdb, 'checklist_veiculos');
    const unsubscribeChecklist = onValue(checklistRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setChecklistAlerts({ expired: [], soon: [] });
        return;
      }
      
      const items = Object.values(data) as any[];
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
      const expired: any[] = [];
      const soon: any[] = [];
      
      items.forEach(item => {
        if (!item.dataVencimento) return;
        try {
          const vencimento = parseISO(item.dataVencimento);
          if (isNaN(vencimento.getTime())) return;
          if (isBefore(vencimento, today)) {
            expired.push(item);
          } else if (isBefore(vencimento, nextWeek)) {
            soon.push(item);
          }
        } catch {
          // Ignore invalid dates
        }
      });
      
      setChecklistAlerts({ expired, soon });
    });

    return () => {
      unsubscribePatio();
      unsubscribePresence();
      unsubscribeChecklist();
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* TOP COMMAND BAR */}
      <GlassPanel3D className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4" variant="glow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="led-status led-status-blue" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400">
              PGR COMMAND CENTER 3D • CENTRAL OPERACIONAL DE RISCO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-white flex items-center gap-3">
            PAINEL GERAL DE MONITORAMENTO
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Gestão inteligente de pátios, frotas, checklists e rotas logísticas em tempo real.
          </p>
        </div>

        {/* Realtime Status Indicator & Time */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-bold">REDE SATELITAL</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="led-status led-status-green" /> 100% ONLINE
              </span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase font-bold">HORA UTC-3</span>
              <span className="text-white font-bold">{currentTime.toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </GlassPanel3D>

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Águia Geral & Frotas', icon: Activity },
          { id: 'satellite', label: 'Satélite & Mapeamento 3D', icon: Globe },
          { id: 'analytics', label: 'Analytics de Destinos & Unidades', icon: BarChart3 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer shrink-0",
                isActive
                  ? "bg-sky-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)] font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          
          {/* TOP METRICS CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard3D
              title="Veículos no Pátio"
              value={vehiclesInPatio}
              subtitle="Base Central Santa Luzia"
              icon={Truck}
              status="info"
              trend={{ value: "+3 hoje", isUp: true }}
            />
            <MetricCard3D
              title="Checklists Vencidos"
              value={checklistAlerts.expired.length}
              subtitle="Requer vistoria urgente"
              icon={AlertOctagon}
              status={checklistAlerts.expired.length > 0 ? "critical" : "normal"}
            />
            <MetricCard3D
              title="Próximos Vencimentos"
              value={checklistAlerts.soon.length}
              subtitle="Janela de 7 dias"
              icon={ClipboardCheck}
              status={checklistAlerts.soon.length > 0 ? "warning" : "normal"}
            />
            <MetricCard3D
              title="Efetivo Escala Ativa"
              value={presenceData.length > 0 ? presenceData[presenceData.length - 1].score : 0}
              subtitle="Operadores de Plantão"
              icon={Users}
              status="normal"
            />
          </div>

          {/* CENTRAL BRAZIL MAP HUD & RANKING */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BrazilMapHUD
                selectedMapNode={selectedMapNode}
                setSelectedMapNode={setSelectedMapNode}
                hoveredCity={hoveredCity}
                setHoveredCity={setHoveredCity}
                count={vehiclesInPatio}
              />
            </div>
            <div>
              <DestinoRankingHUD />
            </div>
          </div>

          {/* CHECKLIST FLEET STATUS SECTION */}
          <HUDPanel title="Status de Vistorias e Conformidade de Frota" badge="COMPLIANCE PGR">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Expired List */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="led-status led-status-red" />
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wide">
                    Vistorias Vencidas ({checklistAlerts.expired.length})
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {checklistAlerts.expired.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                      <p className="text-xs font-mono text-slate-500 uppercase">Nenhum veículo com vistoria vencida.</p>
                    </div>
                  ) : (
                    checklistAlerts.expired.map((alert, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-mono font-black text-white">{alert.cavalo}</h5>
                          <span className="text-[10px] font-sans text-rose-300">{alert.periferico}</span>
                        </div>
                        <StatusIndicator3D status="critical" label="VENCIDO" size="sm" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Soon to Expire List */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="led-status led-status-yellow" />
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                    A Vencer Próximos 7 Dias ({checklistAlerts.soon.length})
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {checklistAlerts.soon.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                      <p className="text-xs font-mono text-slate-500 uppercase">Nenhum veículo em alerta imediato.</p>
                    </div>
                  ) : (
                    checklistAlerts.soon.map((alert, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-mono font-black text-white">{alert.cavalo}</h5>
                          <span className="text-[10px] font-sans text-amber-300">{alert.periferico}</span>
                        </div>
                        <StatusIndicator3D status="warning" label="AGENDADO" size="sm" />
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </HUDPanel>

        </div>
      )}

      {/* TAB CONTENT 2: SATELLITE */}
      {activeTab === 'satellite' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassPanel3D className="p-5 min-h-[480px] flex flex-col justify-between" variant="glow">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Globe size={18} className="text-sky-400 animate-spin" style={{ animationDuration: '25s' }} />
                  <h3 className="text-sm font-mono font-black uppercase text-white tracking-wider">
                    REDE DE NÓS OPERACIONAIS & HUBs SATELITAIS
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-sky-400 border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 rounded-lg">
                  11 CIDADES CONECTADAS
                </span>
              </div>

              {/* Vector Map Pins Container */}
              <div className="relative flex-1 hud-grid-bg border border-slate-800/80 rounded-2xl min-h-[380px] p-6 flex items-center justify-center">
                {CITIES_LIST.map((city, idx) => {
                  const isSelected = selectedNode?.name === city.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedNode(city)}
                      style={{ left: `${city.x}%`, top: `${city.y}%` }}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 transition-all p-2 rounded-xl flex items-center gap-2 cursor-pointer border shadow-lg",
                        isSelected
                          ? "bg-sky-500 text-slate-950 border-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.6)] font-extrabold z-20 scale-110"
                          : "bg-slate-900/90 text-slate-300 border-slate-700 hover:border-sky-400 z-10"
                      )}
                    >
                      <MapPin size={14} className={isSelected ? "text-slate-950" : "text-sky-400"} />
                      <span className="text-[10px] font-mono uppercase font-bold">{city.name}</span>
                    </button>
                  );
                })}
              </div>
            </GlassPanel3D>
          </div>

          <div>
            {selectedNode && (
              <HUDPanel title={`Inspeção de Hub: ${selectedNode.name}`} badge={selectedNode.state}>
                <div className="flex flex-col gap-4 text-xs font-mono">
                  <div className="flex justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Região:</span>
                    <span className="text-white font-bold">{selectedNode.region}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Altitude:</span>
                    <span className="text-white font-bold">{selectedNode.altitude}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Status da Rede:</span>
                    <StatusIndicator3D status="normal" label="OPTIMAL" size="sm" />
                  </div>

                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mb-2 block">Latência e Pings Em Tempo Real</span>
                    <div className="flex gap-2 items-end h-16 bg-slate-950 p-2 border border-slate-800 rounded-xl">
                      {selectedNode.pings.map((p, i) => (
                        <div key={i} className="flex-1 bg-sky-500/30 rounded" style={{ height: `${(p / 70) * 100}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </HUDPanel>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          <UnidadeAnalyticsHUD />
          <StatusAnalyticsHUD />
          <StatusDetailHUD />
        </div>
      )}

    </div>
  );
}
