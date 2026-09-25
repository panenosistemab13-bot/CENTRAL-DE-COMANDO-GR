import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Activity, 
  MapPin, 
  Box, 
  TrendingUp, 
  AlertCircle,
  Globe,
  Database,
  Layers,
  Cpu,
  Sliders,
  Compass,
  FileText,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  ClipboardPaste,
  User,
  Building2,
  DollarSign,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  Battery,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PremiumChart, PremiumDonutChart } from './charts';
import controleBg from '../assets/images/controle_3d_command_center_bg_1790322720426.jpg';

// Utility functions from original Controle (simplified for the overhauled UI)
const parsePlacasData = (text: string) => {
  if (!text) return [];
  const lines = text.split('\n').filter(Boolean);
  return lines.map((line, idx) => {
    const cols = line.split('\t');
    return {
      id: `placa_${idx}`,
      cavalo: cols[12] || cols[2] || 'S/ Placa',
      condutor: cols[19] || cols[1] || 'Motorista',
      destino: cols[10] || cols[6] || 'Destino',
      transportador: cols[11] || cols[0] || 'Transportadora',
      valorNf: cols[24] || cols[33] || '---'
    };
  }).filter(p => p.cavalo !== 'CAVALO');
};

interface StatusCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

const StatusCard = ({ title, value, subValue, icon: Icon, color, delay = 0 }: StatusCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, y: -5 }}
    className="relative group cursor-pointer"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-500" />
    <div className="relative bg-white/70 backdrop-blur-xl border border-stone-200 p-4 rounded-2xl shadow-xl overflow-hidden">
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20", color)} />
      
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2 rounded-xl border border-stone-200 shadow-inner", color.replace('bg-', 'text-'))}>
          <Icon size={20} className="drop-shadow-lg" />
        </div>
        <div className="flex flex-col items-end">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
      
      <div>
        <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] text-stone-500 uppercase mb-1">
          {title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-stone-900 tracking-tighter font-mono">
            {value}
          </span>
          {subValue && (
            <span className="text-[10px] font-bold text-emerald-600 font-mono">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

export default function ControleFuturistic({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<'gerador' | 'placas' | 'unidades'>('gerador');
  const [searchQuery, setSearchQuery] = useState('');
  const [pastedData, setPastedData] = useState('');
  
  const parsedPlacas = useMemo(() => parsePlacasData(pastedData), [pastedData]);

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-10 p-2.5">
      
      {/* 1. CINEMATIC 3D HERO SECTION (MATCHING INICIO) */}
      <section className="relative w-full h-[320px] rounded-[32px] overflow-hidden border border-stone-200 shadow-2xl group shrink-0">
        <img
          src={controleBg}
          alt="3D Controle Hero"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-transparent to-white/40" />

        <div className="relative h-full z-10 p-8 flex flex-col justify-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#9b1526] text-white text-[9px] font-black tracking-widest uppercase border border-red-500/30 shadow-[0_0_20px_rgba(155,21,38,0.3)]">
                Controle Tático v4.0
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/50 backdrop-blur-md border border-stone-200">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-stone-600 uppercase tracking-wider">
                  SLA Ativo: 99.8%
                </span>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-stone-900 tracking-tighter leading-[0.9] uppercase mb-4 drop-shadow-sm">
              Centro de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b1526] via-[#85111f] to-[#9b1526]">
                Monitoramento PGR
              </span>
            </h1>

            <p className="text-sm text-stone-600 max-w-md leading-relaxed font-medium mb-8 backdrop-blur-sm pr-4">
              Gerenciamento de risco de alto nível com integração em tempo real de frotas, iscas e telemetria tática.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('gerador')}
                className={cn(
                  "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2",
                  activeTab === 'gerador' ? "bg-[#9b1526] text-white" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                )}
              >
                <Sliders size={14} /> Gerador Pré-Alerta
              </button>
              <button
                onClick={() => setActiveTab('placas')}
                className={cn(
                  "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2",
                  activeTab === 'placas' ? "bg-[#9b1526] text-white" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                )}
              >
                <Truck size={14} /> Santa Luzia / MG
              </button>
              <button
                onClick={() => setActiveTab('unidades')}
                className={cn(
                  "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer active:scale-95 flex items-center gap-2",
                  activeTab === 'unidades' ? "bg-[#9b1526] text-white" : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                )}
              >
                <Compass size={14} /> Unidades / MT
              </button>
            </div>
          </motion.div>
        </div>

        {/* 3D Floating Elements (Decorative) */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 z-10">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 p-4 bg-white/80 backdrop-blur-xl border border-stone-200 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-[#9b1526]">
                <ShieldCheck size={16} />
              </div>
              <span className="text-[10px] font-black text-stone-900 uppercase tracking-wider">Protocolo Ativo</span>
            </div>
            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
              />
            </div>
            <div className="flex justify-between mt-1 text-[9px] font-mono text-stone-400">
              <span>Nível Segurança</span>
              <span>Max</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. GRID STATUS CARDS (MATCHING INICIO) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Veículos em Rota"
          value="28"
          subValue="On-time"
          icon={Truck}
          color="bg-blue-500"
          delay={0.1}
        />
        <StatusCard
          title="Alertas Críticos"
          value="02"
          subValue="Warning"
          icon={AlertCircle}
          color="bg-amber-500"
          delay={0.2}
        />
        <StatusCard
          title="Sistemas Ativos"
          value="100%"
          subValue="Live"
          icon={ShieldCheck}
          color="bg-emerald-500"
          delay={0.3}
        />
        <StatusCard
          title="Volume Tático"
          value="12.5k"
          subValue="PGR"
          icon={Layers}
          color="bg-[#9b1526]"
          delay={0.4}
        />
      </section>

      {/* 3. MAIN WORKSPACE AREA */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left Console: Forms / Importers */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white/70 backdrop-blur-xl border border-stone-200 rounded-[32px] p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-[#9b1526] shadow-inner">
                  {activeTab === 'gerador' && <Sliders size={20} />}
                  {activeTab === 'placas' && <Truck size={20} />}
                  {activeTab === 'unidades' && <Compass size={20} />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest font-mono">
                    {activeTab === 'gerador' ? 'Console Gerador PGR' : activeTab === 'placas' ? 'Importador Santa Luzia' : 'Receptor Unidade Cuiabá'}
                  </h3>
                  <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mt-1">
                    Processamento de dados em tempo real
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setPastedData('')}
                className="p-2.5 rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-600 transition-all cursor-pointer"
                title="Limpar Dados"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="relative group">
              <textarea
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                placeholder={activeTab === 'placas' ? "Cole aqui as linhas da planilha de Santa Luzia..." : "Cole aqui os dados para processamento..."}
                className="w-full h-48 bg-stone-50 border-2 border-stone-100 focus:border-[#9b1526]/30 rounded-2xl p-5 text-xs font-mono text-stone-900 outline-none transition-all shadow-inner placeholder:text-stone-300 resize-none"
              />
              <button
                onClick={async () => {
                  const text = await navigator.clipboard.readText();
                  if (text) setPastedData(text);
                }}
                className="absolute right-4 bottom-4 px-4 py-2 bg-white text-stone-600 border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-50 shadow-sm transition-all cursor-pointer"
              >
                <ClipboardPaste size={14} className="text-[#9b1526]" /> Colar Planilha
              </button>
            </div>

            {/* Results Grid */}
            <AnimatePresence>
              {parsedPlacas.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Viagens Identificadas ({parsedPlacas.length})</span>
                    <div className="flex items-center gap-2">
                       <button className="text-[10px] font-bold text-[#9b1526] hover:underline uppercase">Importar Todos</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto no-scrollbar pr-1">
                    {parsedPlacas.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm hover:border-[#9b1526]/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-3">
                           <div className="bg-stone-950 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-lg border border-stone-800 shadow-sm uppercase">
                              {item.cavalo}
                           </div>
                           <button className="p-1.5 rounded-lg bg-stone-50 text-stone-400 hover:text-[#9b1526] transition-colors">
                              <ArrowRight size={14} />
                           </button>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-stone-800">
                             <User size={12} className="text-stone-400" /> {item.condutor}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 font-medium">
                             <MapPin size={12} className="text-[#9b1526]/50" /> {item.destino}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                             <span className="text-[9px] font-mono text-stone-400 uppercase">{item.transportador}</span>
                             <span className="text-[10px] font-mono font-black text-emerald-600">{item.valorNf}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Dashboard: Metrics / Live Feed */}
        <div className="xl:col-span-4 space-y-4">
           {/* Telemetria Tática Box (Matching Inicio) */}
           <div className="bg-[#0a0a0a] rounded-[32px] p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-[300px]">
              <div className="absolute -right-10 -top-10 opacity-10 blur-xl">
                 <Zap size={180} className="text-white" />
              </div>
              
              <div className="relative z-10">
                 <h3 className="text-lg font-black text-white tracking-tighter uppercase leading-tight mb-2">Desempenho <br /> Operacional</h3>
                 <div className="w-12 h-1 bg-[#9b1526] rounded-full mb-6" />
                 
                 <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-[10px] font-black text-white/50 uppercase mb-1.5">
                        <span>Eficiência de Carga</span>
                        <span className="text-[#9b1526]">94.2%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '94.2%' }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-gradient-to-r from-[#9b1526] to-[#ff2a4b] shadow-[0_0_10px_#9b1526]" 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-black text-white/50 uppercase mb-1.5">
                        <span>Sincronização PGR</span>
                        <span className="text-emerald-400">Online</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                        />
                      </div>
                    </div>
                 </div>
              </div>

              <div className="mt-auto pt-6 relative z-10">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                  <div className="p-2 rounded-xl bg-[#dfb15b] text-[#2c1808] shadow-lg">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white/70 uppercase block leading-none mb-1">Capacidade Terminal</span>
                    <span className="text-sm font-black text-white font-mono leading-none">88.5% <span className="text-[9px] font-medium opacity-50 uppercase ml-1">Utilizado</span></span>
                  </div>
                </div>
              </div>
           </div>

           {/* Quick Actions Card */}
           <div className="bg-white border border-stone-200 rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
              <h4 className="text-[11px] font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                 <Settings size={14} className="text-[#9b1526]" /> Ações Rápidas
              </h4>
              <div className="grid grid-cols-2 gap-2">
                 <button className="flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-100 transition-all group active:scale-95 cursor-pointer">
                    <Layers size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-stone-600">Exportar TSV</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-100 transition-all group active:scale-95 cursor-pointer">
                    <Globe size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-stone-600">Mapa Global</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-100 transition-all group active:scale-95 cursor-pointer">
                    <Database size={18} className="text-[#dfb15b] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-stone-600">Histórico</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-100 transition-all group active:scale-95 cursor-pointer">
                    <Cpu size={18} className="text-[#9b1526] group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-black uppercase text-stone-600">IA Config</span>
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* 4. ACTIVITY TICKER & DATA FEED (MATCHING INICIO) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-stone-200 rounded-[28px] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-cyan-600" />
              <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.2em] font-mono">Live Activity Stream</h3>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[9px] font-mono text-cyan-600 uppercase font-bold">Syncing</span>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { id: '882B', type: 'ALERTA', status: 'Crítico', desc: 'Bateria Isca R100002195 abaixo de 15%', time: 'Agora', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
              { id: '129C', type: 'PGR', status: 'Gerado', desc: 'Pré-Alerta enviado para HUB Londrina', time: '2m ago', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { id: '458A', type: 'SISTEMA', status: 'Sync', desc: 'Banco de dados de Santa Luzia atualizado', time: '5m ago', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-stone-100 hover:border-stone-200 transition-colors cursor-pointer group"
              >
                <div className={cn("p-2 rounded-lg", item.bg, item.color)}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black text-stone-400 font-mono tracking-widest">{item.type} {item.id}</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md", item.bg, item.color)}>{item.status}</span>
                  </div>
                  <p className="text-xs font-bold text-stone-700 truncate">{item.desc}</p>
                </div>
                <span className="text-[9px] font-mono text-stone-400 shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Interactive 3D Chart Widget */}
        <div className="bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200 rounded-[28px] p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
           <div className="flex flex-col gap-1 mb-4">
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest">Alocação por Tecnologia</h4>
              <p className="text-[9px] text-stone-400 uppercase font-bold">Distribuição atual de rastreadores</p>
           </div>
           
           <div className="flex-1 flex items-center justify-center">
              <PremiumDonutChart
                data={[
                  { name: 'SASCAR', value: 45, color: '#9b1526' },
                  { name: 'SIGHRA', value: 25, color: '#06b6d4' },
                  { name: 'ONIXSAT', value: 30, color: '#dfb15b' }
                ]}
                height={150}
                centerLabel="Total"
                centerValue="150"
                showLegend={true}
                className="bg-transparent border-0 p-0 shadow-none w-full"
              />
           </div>
        </div>
      </section>
    </div>
  );
}
