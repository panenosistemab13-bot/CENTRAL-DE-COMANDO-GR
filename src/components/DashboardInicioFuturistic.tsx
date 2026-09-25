import React from 'react';
import { motion } from 'motion/react';
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
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PremiumChart, PremiumDonutChart } from './charts';
import dashboardBg from '../assets/images/dashboard_3d_logistics_bg_1790322086241.jpg';

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
    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#dfb15b]/20 to-transparent rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition duration-500" />
    <div className="relative bg-white border border-[#d6ccbe] p-4 rounded-2xl shadow-md overflow-hidden">
      {/* Decorative background glow */}
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20", color)} />
      
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2 rounded-xl border border-[#ded5c6] shadow-sm", color.replace('bg-', 'text-'))}>
          <Icon size={20} className="drop-shadow-sm" />
        </div>
        <div className="flex flex-col items-end">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
        </div>
      </div>
      
      <div>
        <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] text-stone-500 uppercase mb-1">
          {title}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-stone-900 tracking-tighter drop-shadow-sm font-mono">
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

export default function DashboardInicioFuturistic() {
  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-10">
      {/* 1. CINEMATIC 3D HERO SECTION */}
      <section className="relative w-full h-[380px] rounded-[32px] overflow-hidden border border-[#ded5c6] shadow-xl group shrink-0">
        <img
          src={dashboardBg}
          alt="3D Dashboard Hero"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/10 to-transparent" />

        <div className="relative h-full z-10 p-8 flex flex-col justify-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#9b1526] text-white text-[9px] font-black tracking-widest uppercase border border-red-900/30 shadow-md">
                Core Engine v4.0
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/40">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-stone-700 uppercase tracking-wider">
                  Live Terminal 01
                </span>
              </div>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-stone-900 tracking-tighter leading-[0.9] uppercase mb-4 drop-shadow-sm">
              Logística <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b1526] via-[#b32025] to-[#9b1526]">
                Omnipresente
              </span>
            </h1>

            <p className="text-sm text-stone-700 max-w-md leading-relaxed font-medium mb-8 backdrop-blur-sm pr-4">
              Gerenciamento tático de ativos com precisão milimétrica. Otimização de rotas via IA e monitoramento de segurança em tempo real para toda a malha 3 Corações.
            </p>

            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-[#9b1526] hover:bg-[#831220] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-xl cursor-pointer active:scale-95 border border-red-900/20">
                Lançar Nova Rota
              </button>
              <button className="px-6 py-3 bg-white/40 hover:bg-white/60 backdrop-blur-md text-stone-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-stone-200 cursor-pointer active:scale-95">
                Protocolos
              </button>
            </div>
          </motion.div>
        </div>

        {/* 3D Floating Elements (Decorative) */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6 z-10">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-48 p-4 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Globe size={16} />
              </div>
              <span className="text-[10px] font-black text-stone-800 uppercase tracking-wider">Cobertura Global</span>
            </div>
            <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "94%" }}
                transition={{ duration: 2 }}
                className="h-full bg-blue-500 shadow-sm" 
              />
            </div>
            <div className="flex justify-between mt-1 text-[9px] font-mono text-stone-500">
              <span>94% Eficiência</span>
              <span>Online</span>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-48 p-4 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl translate-x-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-[#dfb15b]">
                <Cpu size={16} />
              </div>
              <span className="text-[10px] font-black text-stone-800 uppercase tracking-wider">Processamento IA</span>
            </div>
            <div className="flex gap-1 h-8 items-end">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                  className="flex-1 bg-amber-500/30 rounded-t-sm"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. GRID STATUS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Veículos Ativos"
          value="42"
          subValue="+12%"
          icon={Truck}
          color="bg-blue-500"
          delay={0.1}
        />
        <StatusCard
          title="Entregas Hoje"
          value="156"
          subValue="98%"
          icon={Zap}
          color="bg-amber-500"
          delay={0.2}
        />
        <StatusCard
          title="Segurança Ativa"
          value="100%"
          subValue="Safe"
          icon={ShieldCheck}
          color="bg-emerald-500"
          delay={0.3}
        />
        <StatusCard
          title="Volume Mensal"
          value="8.4k"
          subValue="Ton"
          icon={Box}
          color="bg-[#9b1526]"
          delay={0.4}
        />
      </section>

      {/* 3. CORE ANALYTICS ROW */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Real-time Telemetry (3D Lines) */}
        <div className="xl:col-span-8 bg-white border border-[#ded5c6] rounded-[32px] p-6 shadow-lg flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Layers size={120} className="text-stone-900" />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest font-mono">Telemetria Tática</h3>
              <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mt-1">Fluxo de movimentação 24h</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#9b1526] shadow-sm" />
                <span className="text-[10px] font-mono text-stone-600">Entradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-sm" />
                <span className="text-[10px] font-mono text-stone-600">Saídas</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[220px] relative z-10">
            <PremiumChart
              type="bar"
              data={[
                { t: '02h', e: 10, s: 5 },
                { t: '06h', e: 25, s: 15 },
                { t: '10h', e: 45, s: 35 },
                { t: '14h', e: 60, s: 50 },
                { t: '18h', e: 85, s: 65 },
                { t: '22h', e: 40, s: 30 },
              ]}
              xKey="t"
              barKeys={[
                { key: 'e', name: 'Entradas', color: '#9b1526' },
                { key: 's', name: 'Saídas', color: '#06b6d4' }
              ]}
              height={220}
              className="bg-transparent border-0 p-0 shadow-none text-stone-600"
            />
          </div>
        </div>

        {/* Right: Asset Distribution (3D Donut) */}
        <div className="xl:col-span-4 bg-white border border-[#ded5c6] rounded-[32px] p-6 shadow-lg flex flex-col items-center justify-center relative overflow-hidden text-center">
          <div className="absolute -bottom-10 -left-10 p-8 opacity-5 blur-xl">
            <Database size={120} className="text-[#9b1526]" />
          </div>

          <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest font-mono mb-2 relative z-10">Alocação de Ativos</h3>
          <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-6 relative z-10">Distribuição da frota por região</p>
          
          <div className="w-full max-w-[220px] relative z-10">
            <PremiumDonutChart
              data={[
                { name: 'Sudeste', value: 45, color: '#9b1526' },
                { name: 'Sul', value: 25, color: '#dfb15b' },
                { name: 'Nordeste', value: 15, color: '#06b6d4' },
                { name: 'Centro-Oeste', value: 10, color: '#10b981' },
                { name: 'Norte', value: 5, color: '#6366f1' }
              ]}
              height={180}
              centerLabel="Total Frota"
              centerValue="580"
              showLegend={false}
              className="bg-transparent border-0 p-0 shadow-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full mt-6 relative z-10">
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[8px] font-mono text-stone-500 uppercase block mb-1">Sudeste</span>
              <span className="text-xs font-black text-stone-900 font-mono">45%</span>
            </div>
            <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[8px] font-mono text-stone-500 uppercase block mb-1">Sul</span>
              <span className="text-xs font-black text-stone-900 font-mono">25%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACTIVITY TICKER & DATA FEED */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-[#ded5c6] rounded-[28px] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-600" />
              <h3 className="text-[11px] font-black text-stone-900 uppercase tracking-[0.2em] font-mono">Live Activity Stream</h3>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[9px] font-mono text-blue-600 uppercase font-bold">Syncing</span>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { id: '458A', type: 'ROTA', status: 'Iniciada', desc: 'Veículo 084 > HUB Central > MARINGÁ', time: 'Agora', icon: MapPin, color: 'text-emerald-600' },
              { id: '129C', type: 'CARGA', status: 'Averbada', desc: 'Nota Fiscal #109432 > Café Gourmet', time: '2m ago', icon: Box, color: 'text-blue-600' },
              { id: '882B', type: 'ALERTA', status: 'Crítico', desc: 'Veículo 012 > Desvio de Rota Detectado', time: '5m ago', icon: AlertCircle, color: 'text-red-600' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-stone-100 transition-colors cursor-pointer group"
              >
                <div className={cn("p-2 rounded-lg bg-white shadow-sm", item.color)}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-black text-stone-400 font-mono tracking-widest">{item.type} {item.id}</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white border border-stone-200", item.color)}>{item.status}</span>
                  </div>
                  <p className="text-xs font-bold text-stone-800 truncate">{item.desc}</p>
                </div>
                <span className="text-[9px] font-mono text-stone-400 shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tactical Overview */}
        <div className="bg-gradient-to-br from-[#9b1526] to-[#831220] rounded-[28px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border border-red-900/20">
          <div className="absolute -right-8 -bottom-8 opacity-20">
            <Zap size={160} className="text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-black text-white tracking-tighter uppercase leading-tight mb-2">Desempenho <br /> Tático</h3>
            <div className="w-12 h-1 bg-white/30 rounded-full mb-6" />
            
            <div className="space-y-4 relative z-10">
              <div>
                <div className="flex justify-between text-[10px] font-black text-white/70 uppercase mb-1">
                  <span>Meta Diária</span>
                  <span>88%</span>
                </div>
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '88%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-white shadow-sm" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black text-white/70 uppercase mb-1">
                  <span>Pontualidade</span>
                  <span>94%</span>
                </div>
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="h-full bg-amber-400 shadow-sm" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 relative z-10">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <div className="p-2 rounded-xl bg-white text-[#9b1526] shadow-md">
                <TrendingUp size={16} />
              </div>
              <div>
                <span className="text-[10px] font-black text-white/80 uppercase block leading-none mb-1">Aumento de Escopo</span>
                <span className="text-sm font-black text-white font-mono leading-none">+24.5% <span className="text-[9px] font-medium opacity-60 uppercase ml-1">vs ontem</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
