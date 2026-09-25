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
import rainyBg from '../assets/images/rainy_morning_logistics_premium_1790324816019.jpg';

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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8 }}
    className="relative group cursor-pointer"
  >
    <div className="absolute -inset-1 bg-gradient-to-br from-[#9b1526]/5 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition duration-700" />
    <div className="relative bg-[#fbf9f5]/80 backdrop-blur-3xl border border-white p-6 rounded-[32px] shadow-[0_15px_45px_-12px_rgba(155,21,38,0.06)] overflow-hidden transition-all duration-500 group-hover:shadow-[0_30px_60px_-15px_rgba(155,21,38,0.12)]">
      {/* Subtle animated red glow on hover */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#9b1526]/5 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between mb-5">
        <div className={cn("p-3.5 rounded-[20px] bg-white border border-[#9b1526]/10 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", color.replace('bg-', 'text-'))}>
          <Icon size={24} className="drop-shadow-sm" />
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#fbf9f5] border border-stone-100 shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest font-mono">Real-time</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-[10px] font-black tracking-[0.3em] text-stone-400 uppercase mb-2 font-mono">
          {title}
        </h3>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black text-stone-900 tracking-tighter font-sans leading-none">
            {value}
          </span>
          {subValue && (
            <span className="text-[10px] font-black text-emerald-600 font-mono bg-emerald-50/50 px-2 py-0.5 rounded-lg border border-emerald-100/50 shadow-sm">
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
    <div className="w-full h-full flex flex-col gap-8 overflow-y-auto no-scrollbar pb-16 px-1">
      {/* 1. CINEMATIC PREMIUM HERO SECTION - High Fidelity Photographic Layer */}
      <section className="relative w-full h-[460px] rounded-[48px] overflow-hidden border border-white shadow-[0_40px_80px_-20px_rgba(155,21,38,0.1)] group shrink-0">
        <img
          src={rainyBg}
          alt="Rainy Morning Logistics"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
        />
        
        {/* Advanced Layered Gradients for Sophisticated Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf9f5]/95 via-[#fbf9f5]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf9f5]/90 via-[#fbf9f5]/30 to-transparent" />
        
        {/* Soft Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50" />

        <div className="relative h-full z-10 p-12 flex flex-col justify-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-5 mb-8">
              <span className="px-5 py-2 rounded-full bg-[#9b1526] text-white text-[10px] font-black tracking-[0.3em] uppercase border border-white/20 shadow-[0_10px_25px_rgba(155,21,38,0.3)]">
                OPERACIONAL V4.0
              </span>
              <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/50 backdrop-blur-2xl border border-white/60 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#dfb15b] animate-pulse shadow-[0_0_12px_#dfb15b]" />
                <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest font-mono">
                  AMANHECER CHUVOSO
                </span>
              </div>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black text-stone-950 tracking-tighter leading-[0.8] uppercase mb-8 drop-shadow-sm italic">
              Logística <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b1526] via-[#d63447] to-[#9b1526] not-italic">
                Exclusiva
              </span>
            </h1>

            <p className="text-lg text-stone-800 max-w-lg leading-relaxed font-bold mb-12 opacity-80 border-l-4 border-[#9b1526]/30 pl-6">
              Gerenciamento de alta fidelidade para a malha 3 Corações. Monitoramento tático sob condições climáticas adversas com máxima precisão.
            </p>

            <div className="flex items-center gap-6">
              <button className="px-10 py-5 bg-[#9b1526] hover:bg-[#831220] text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-[0_20px_45px_rgba(155,21,38,0.3)] hover:shadow-[0_25px_55px_rgba(155,21,38,0.4)] cursor-pointer active:scale-95 border border-white/20 group">
                LANÇAR ROTA <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
              </button>
              <button className="px-10 py-5 bg-white/40 hover:bg-white/70 backdrop-blur-3xl text-stone-950 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] transition-all border border-white shadow-sm cursor-pointer active:scale-95">
                VER DASHBOARD
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Floating Interactive Badge (Replaced 3D with Premium Glassmorphism) */}
        <div className="absolute bottom-12 right-12 hidden lg:block z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="p-6 bg-white/30 backdrop-blur-3xl border border-white/40 rounded-[32px] shadow-2xl flex items-center gap-6 ring-1 ring-white/20"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#9b1526] flex items-center justify-center text-[#dfb15b] shadow-xl">
              <ShieldCheck size={32} />
            </div>
            <div>
              <span className="text-[10px] font-black text-[#9b1526] uppercase tracking-[0.2em] block mb-1">PROTOCOLO SEGURANÇA</span>
              <span className="text-xl font-black text-stone-900 font-mono tracking-tighter">ATIVO • 100%</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CORE STATUS GRID - More vivid and intuitive */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatusCard
          title="Frota Operacional"
          value="42"
          subValue="+12%"
          icon={Truck}
          color="bg-[#9b1526]"
          delay={0.1}
        />
        <StatusCard
          title="Produtividade"
          value="156"
          subValue="98%"
          icon={Zap}
          color="bg-[#dfb15b]"
          delay={0.2}
        />
        <StatusCard
          title="Integridade"
          value="100%"
          subValue="STÁVEL"
          icon={ShieldCheck}
          color="bg-emerald-600"
          delay={0.3}
        />
        <StatusCard
          title="Volume Carga"
          value="8.4k"
          subValue="TON"
          icon={Box}
          color="bg-[#9b1526]"
          delay={0.4}
        />
      </section>

      {/* 3. CORE ANALYTICS ROW - Vivid Red Accents */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left: Tactical Analytics (Bar Charts) */}
        <div className="xl:col-span-8 bg-[#fbf9f5]/50 backdrop-blur-xl border border-white rounded-[48px] p-10 shadow-[0_20px_50px_rgba(155,21,38,0.03)] flex flex-col relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 p-10 opacity-[0.02] rotate-12 group-hover:opacity-[0.05] transition-opacity duration-1000">
            <BarChart3 size={240} className="text-[#9b1526]" />
          </div>
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-[2px] bg-[#9b1526]" />
                <h3 className="text-[14px] font-black text-stone-950 uppercase tracking-[0.3em]">Métricas Táticas</h3>
              </div>
              <p className="text-[11px] text-stone-500 uppercase font-bold tracking-widest pl-13">Fluxo de movimentação regional</p>
            </div>
            <div className="flex items-center gap-8 bg-white/40 px-6 py-3 rounded-2xl border border-white shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#9b1526] shadow-[0_0_12px_#9b1526]" />
                <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Ativos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-stone-300 shadow-[0_0_12px_rgba(0,0,0,0.1)]" />
                <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Média</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] relative z-10">
            <PremiumChart
              type="bar"
              data={[
                { t: 'SEG', e: 45, s: 30 },
                { t: 'TER', e: 55, s: 42 },
                { t: 'QUA', e: 72, s: 58 },
                { t: 'QUI', e: 98, s: 76 },
                { t: 'SEX', e: 85, s: 64 },
                { t: 'SAB', e: 35, s: 20 },
              ]}
              xKey="t"
              barKeys={[
                { key: 'e', name: 'Entradas', color: '#9b1526' },
                { key: 's', name: 'Saídas', color: '#78716c' }
              ]}
              height={300}
              className="bg-transparent border-0 p-0 shadow-none"
            />
          </div>
        </div>

        {/* Right: Asset Distribution */}
        <div className="xl:col-span-4 bg-[#fbf9f5]/50 backdrop-blur-xl border border-white rounded-[48px] p-10 shadow-[0_20px_50px_rgba(155,21,38,0.03)] flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute -bottom-16 -left-16 p-10 opacity-[0.03] blur-3xl group-hover:opacity-[0.06] transition-opacity duration-1000">
            <Database size={200} className="text-[#9b1526]" />
          </div>

          <h3 className="text-[14px] font-black text-stone-950 uppercase tracking-[0.3em] mb-3 relative z-10">Alocação Frota</h3>
          <p className="text-[11px] text-stone-500 uppercase font-bold tracking-widest mb-12 relative z-10">Capacidade por Regional</p>
          
          <div className="w-full max-w-[260px] relative z-10">
            <PremiumDonutChart
              data={[
                { name: 'MATRIZ', value: 50, color: '#9b1526' },
                { name: 'FILIAIS', value: 30, color: '#dfb15b' },
                { name: 'EXTERNOS', value: 20, color: '#78716c' }
              ]}
              height={220}
              centerLabel="VÉICULOS"
              centerValue="580"
              showLegend={false}
              className="bg-transparent border-0 p-0 shadow-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 w-full mt-12 relative z-10">
            <div className="p-4 rounded-2xl bg-white/40 border border-white flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#9b1526]" />
                <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Matriz Principal</span>
              </div>
              <span className="text-xs font-black text-[#9b1526] font-mono">290 UND.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACTIVITY TICKER - Refined and Elegant */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-[#fbf9f5]/50 backdrop-blur-xl border border-white rounded-[48px] p-10 shadow-[0_20px_50px_rgba(155,21,38,0.03)]">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#9b1526] flex items-center justify-center text-white shadow-lg border border-white/20">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-[13px] font-black text-stone-950 uppercase tracking-[0.2em]">Fluxo Operacional</h3>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Monitoramento Contínuo</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#fbf9f5] border border-stone-200 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-[#9b1526] animate-pulse" />
              <span className="text-[9px] font-black text-stone-600 uppercase tracking-widest font-mono">Live Sync</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { id: 'SM-9023', status: 'SAÍDA', desc: 'VEÍCULO 04 > HUB SÃO PAULO > MATRIZ', time: 'AGORA', icon: Truck, color: 'text-[#9b1526]', bg: 'bg-[#9b1526]/5' },
              { id: 'SM-8841', status: 'ENTRADA', desc: 'VEÍCULO 12 > MATRIZ > DISTRIBUIÇÃO', time: '12M AGO', icon: MapPin, color: 'text-stone-900', bg: 'bg-stone-100' },
              { id: 'AV-4421', status: 'AVERBADO', desc: 'CARGA #4023 > CAFÉ GOURMET ESPRESSO', time: '45M AGO', icon: Box, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-6 p-5 rounded-[28px] bg-white/40 border border-white hover:bg-white/80 transition-all cursor-pointer group shadow-sm hover:shadow-xl"
              >
                <div className={cn("p-4 rounded-2xl bg-white shadow-md border border-stone-100 transition-transform group-hover:scale-110 group-hover:rotate-6", item.color)}>
                  <item.icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-1.5">
                    <span className="text-[10px] font-black text-stone-400 font-mono tracking-widest uppercase">{item.id}</span>
                    <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border shadow-sm", item.color, item.bg.replace('/5', '/10').replace('50', '100'))}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[14px] font-black text-stone-950 truncate tracking-tight uppercase">{item.desc}</p>
                </div>
                <div className="text-[10px] font-black text-stone-500 font-mono tracking-widest bg-[#fbf9f5] px-4 py-2 rounded-full border border-stone-100 shadow-inner group-hover:bg-[#9b1526] group-hover:text-white transition-colors">
                  {item.time}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tactical Performance Card - Vivid Red */}
        <div className="bg-gradient-to-br from-[#9b1526] via-[#b31c2d] to-[#831220] rounded-[48px] p-12 shadow-[0_30px_70px_-15px_rgba(155,21,38,0.4)] relative overflow-hidden flex flex-col justify-between border border-white/20 group">
          <div className="absolute -right-16 -bottom-16 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-1000">
            <Zap size={280} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-6">Eficiência <br /> Regional</h3>
            <div className="w-20 h-1.5 bg-white/40 rounded-full mb-12 shadow-sm" />
            
            <div className="space-y-10">
              <div>
                <div className="flex justify-between text-[11px] font-black text-white/80 uppercase tracking-[0.3em] mb-4">
                  <span>CAPACIDADE ATUAL</span>
                  <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">94%</span>
                </div>
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-white/60 to-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)]" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-black text-white/80 uppercase tracking-[0.3em] mb-4">
                  <span>PONTUALIDADE</span>
                  <span className="text-[#dfb15b] font-mono bg-white/10 px-2 py-0.5 rounded">98%</span>
                </div>
                <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    transition={{ duration: 2.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-[#dfb15b]/60 to-[#dfb15b] rounded-full shadow-[0_0_20px_rgba(223,177,91,0.6)]" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-5 p-5 rounded-[32px] bg-white/15 backdrop-blur-3xl border border-white/20 shadow-2xl transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-white text-[#9b1526] shadow-xl flex items-center justify-center">
                <TrendingUp size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black text-white/70 uppercase block mb-1.5 tracking-[0.2em]">Crescimento Real</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-white font-mono leading-none">+24.5%</span>
                  <span className="text-[9px] font-black bg-[#dfb15b] px-3 py-1 rounded-full text-stone-900 shadow-sm border border-white/20">LIVE</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

