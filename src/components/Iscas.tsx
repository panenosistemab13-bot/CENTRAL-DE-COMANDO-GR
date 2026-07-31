import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  FileSpreadsheet, 
  Building2, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Search, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  ClipboardPaste, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  Sliders,
  Table as TableIcon,
  TrendingUp,
  Award,
  Layers,
  Filter,
  ArrowRight,
  Info,
  Play,
  Pause,
  Box,
  Volume2,
  VolumeX,
  Compass,
  Cpu,
  Radio,
  Activity,
  Globe2,
  Zap,
  Coffee,
  Monitor,
  Flame,
  Layers3,
  RefreshCw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import bgRusticCoffee from '../assets/images/light_coffee_rustic_bg_1785486820159.jpg';

const GUEST_USER_ID = 'guest_user';

export interface IscaItem {
  id: string;
  iscaNumber: string;
  status: string;
  destino: string;
  cavalo: string;
  nf: string;
  responsavel: string;
}

const STATUS_CATEGORIES = [
  'EXTRAVIADAS',
  'EM ROTA IDA',
  'EM ROTA VOLTA',
  'NO DESTINO',
  'EM PREPARAÇÃO',
  'POSSÍVEL EXTRAVIO',
  'NA GARANTIA',
  'EXPIROU A VALIDADE'
];

// Light Rustic Café Três Corações Color Palette
const CATEGORY_COLORS: Record<string, {
  main: string;
  glow: string;
  gradient: string;
  border: string;
  bgGlass: string;
  text: string;
  topCap: string;
}> = {
  'EXTRAVIADAS': {
    main: '#B32025', // Três Corações Red
    glow: 'rgba(179, 32, 37, 0.4)',
    gradient: 'from-[#B32025] via-[#8E1014] to-[#600A0D]',
    border: 'border-[#B32025]/50',
    bgGlass: 'bg-red-50/90',
    text: 'text-[#B32025]',
    topCap: '#E65358'
  },
  'EM ROTA IDA': {
    main: '#0284C7',
    glow: 'rgba(2, 132, 199, 0.4)',
    gradient: 'from-[#38BDF8] via-[#0284C7] to-[#0369A1]',
    border: 'border-sky-400/50',
    bgGlass: 'bg-sky-50/90',
    text: 'text-sky-700',
    topCap: '#7DD3FC'
  },
  'EM ROTA VOLTA': {
    main: '#D97706',
    glow: 'rgba(217, 119, 6, 0.4)',
    gradient: 'from-[#FBBF24] via-[#D97706] to-[#B45309]',
    border: 'border-amber-400/50',
    bgGlass: 'bg-amber-50/90',
    text: 'text-amber-800',
    topCap: '#FDE68A'
  },
  'NO DESTINO': {
    main: '#5C3621', // Dark Coffee Bean
    glow: 'rgba(92, 54, 33, 0.4)',
    gradient: 'from-[#8C5332] via-[#5C3621] to-[#3D2314]',
    border: 'border-[#8C5332]/50',
    bgGlass: 'bg-[#F5EBE0]/90',
    text: 'text-[#3D2314]',
    topCap: '#B87A57'
  },
  'EM PREPARAÇÃO': {
    main: '#D49B4B', // Roasted Gold
    glow: 'rgba(212, 155, 75, 0.4)',
    gradient: 'from-[#F3C785] via-[#D49B4B] to-[#9C6822]',
    border: 'border-[#D49B4B]/50',
    bgGlass: 'bg-amber-50/90',
    text: 'text-[#8A5714]',
    topCap: '#FDE2B8'
  },
  'POSSÍVEL EXTRAVIO': {
    main: '#EA580C',
    glow: 'rgba(234, 88, 12, 0.4)',
    gradient: 'from-[#FB923C] via-[#EA580C] to-[#C2410C]',
    border: 'border-orange-400/50',
    bgGlass: 'bg-orange-50/90',
    text: 'text-orange-800',
    topCap: '#FDBA74'
  },
  'NA GARANTIA': {
    main: '#16A34A',
    glow: 'rgba(22, 163, 74, 0.4)',
    gradient: 'from-[#4ADE80] via-[#16A34A] to-[#15803D]',
    border: 'border-emerald-400/50',
    bgGlass: 'bg-emerald-50/90',
    text: 'text-emerald-800',
    topCap: '#86EFAC'
  },
  'EXPIROU A VALIDADE': {
    main: '#78716C', // Warm Stone Gray
    glow: 'rgba(120, 113, 108, 0.4)',
    gradient: 'from-[#A8A29E] via-[#78716C] to-[#57534E]',
    border: 'border-stone-400/50',
    bgGlass: 'bg-stone-100/90',
    text: 'text-stone-700',
    topCap: '#D6D3D1'
  }
};

// Web Audio API Synthesizer with Coffee Cinema Soundscapes
const playSciFiSound = (type: 'slide' | 'hover' | 'action' | 'sparkle' | 'cinema') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'slide') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'hover') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.setValueAtTime(560, now + 0.03);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'action') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.06);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'sparkle') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.22);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'cinema') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.3);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
};

// Coffee Bean Icon Component
function CoffeeBeanIcon({ className = "w-5 h-5", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill={`${color}15`} />
      <path d="M7 17C10.5 15.5 13.5 8.5 17 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7.5 7.5C9 9 10 11.5 10 13.5" stroke={color} strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

// Espresso Machine (Cafeteira) Symbol Component with Steam Animation
function EspressoMachineIcon({ className = "w-6 h-6", color = "#B32025" }: { className?: string; color?: string }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Animated Steam Loops */}
      <motion.div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none"
        initial={{ opacity: 0.3, y: 0 }}
        animate={{ opacity: [0.2, 0.8, 0.1], y: [-2, -8, -14] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="w-1 h-3 rounded-full bg-[#D49B4B] blur-[0.8px]" />
        <span className="w-1.5 h-4 rounded-full bg-[#FAF5EE] blur-[0.8px]" />
        <span className="w-1 h-3 rounded-full bg-[#D49B4B] blur-[0.8px]" />
      </motion.div>

      <svg viewBox="0 0 24 24" fill="none" className={className} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="4" rx="1.5" fill={`${color}20`} />
        <path d="M6 7V17C6 18.1 6.9 19 8 19H16C17.1 19 18 18.1 18 17V7" />
        <path d="M4 21H20" strokeWidth="2.5" />
        <path d="M9 11H15V14H9V11Z" fill={color} opacity="0.8" />
        <circle cx="12" cy="5" r="1" fill={color} />
      </svg>
    </div>
  );
}

// Light Coffee Particle Floating Canvas
function LightCoffeeParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      alpha: number;
    }> = [];

    const colors = ['#B32025', '#D49B4B', '#8C5332', '#0284C7', '#16A34A', '#5C3621'];

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        alpha: Math.random() * 0.45 + 0.15
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.0018;

      // Draw subtle warm latte rustic grid
      ctx.strokeStyle = 'rgba(140, 83, 50, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Floating coffee aroma particles
      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(angle) * 0.2;
        p.y += p.speedY + Math.cos(angle) * 0.2;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 opacity-75"
    />
  );
}

// 3D Animated Volumetric Cylinder Bar (Rustic Light Coffee Theme)
function Animated3DCylinderBar({ 
  label, 
  value, 
  maxValue, 
  colorConfig, 
  percentage, 
  santaLuziaVal 
}: { 
  label: string; 
  value: number; 
  maxValue: number; 
  colorConfig: typeof CATEGORY_COLORS['EXTRAVIADAS']; 
  percentage: number;
  santaLuziaVal: number;
  key?: string;
}) {
  const barHeightPct = Math.max(12, Math.min(100, (value / (maxValue || 1)) * 100));

  return (
    <div className="group relative flex flex-col items-center justify-end h-80 sm:h-96 w-full p-3 bg-white/95 rounded-2xl border-2 border-[#EADCC9] shadow-[0_10px_25px_rgba(92,54,33,0.08)] hover:border-[#B32025] hover:shadow-[0_15px_35px_rgba(179,32,37,0.18)] transition-all duration-300 backdrop-blur-md">
      
      {/* Value Badge */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute -top-4 z-10 px-3 py-1 rounded-full bg-[#3D2314] text-[#FAF5EE] border border-[#D49B4B] shadow-md flex items-center gap-1.5 backdrop-blur-md"
      >
        <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: colorConfig.main }} />
        <span className="text-sm font-mono font-black">{value}</span>
        <span className="text-xs font-mono font-bold text-[#D49B4B]">({percentage}%)</span>
      </motion.div>

      {/* 3D Cylinder Shaft */}
      <div className="relative w-full h-60 sm:h-72 flex items-end justify-center px-1 py-2">
        <div className="w-full max-w-[52px] sm:max-w-[62px] relative flex flex-col justify-end h-full">
          
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${barHeightPct}%` }}
            transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full relative rounded-b-2xl shadow-xl group-hover:scale-105 transition-transform duration-300"
            style={{
              background: `linear-gradient(180deg, ${colorConfig.main} 0%, rgba(61, 35, 20, 0.85) 100%)`,
              boxShadow: `0 10px 25px ${colorConfig.glow}`
            }}
          >
            {/* Top Ellipse Cap */}
            <div 
              className="absolute -top-3 left-0 w-full h-5 rounded-[50%] border-2 border-white/90 shadow-sm"
              style={{ 
                backgroundColor: colorConfig.topCap
              }}
            />

            {/* Specular Light Strip */}
            <div className="absolute top-0 left-2 w-1.5 h-full bg-white/40 rounded-full blur-[0.5px]" />
          </motion.div>

        </div>
      </div>

      {/* Label and Santa Luzia Indicator */}
      <div className="mt-3 text-center w-full">
        <p className="text-xs sm:text-sm font-mono font-black text-[#3D2314] uppercase tracking-tight truncate px-1" title={label}>
          {label}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-mono text-[#8C5332]">
          <span>SL/MG:</span>
          <span className="font-extrabold text-[#B32025] bg-[#FAF5EE] px-2 py-0.5 rounded border border-[#EADCC9]">{santaLuziaVal}</span>
        </div>
      </div>

    </div>
  );
}

// 3D Rotating Coffee Bean Donut Gauge Component
function Rotating3DCoffeeDonut({ 
  total, 
  categories 
}: { 
  total: number; 
  categories: Array<{ name: string; count: number; colorCfg: typeof CATEGORY_COLORS['EXTRAVIADAS'] }> 
}) {
  let accumulatedAngle = 0;
  const filtered = categories.filter(c => c.count > 0);

  return (
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
      
      {/* Soft Ambient Golden Coffee Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#B32025]/15 via-[#D49B4B]/20 to-[#0284C7]/15 blur-2xl animate-pulse" />

      {/* SVG Ring Layer */}
      <svg className="w-72 h-72 sm:w-80 sm:h-80 -rotate-90 drop-shadow-xl">
        {filtered.map((cat, idx) => {
          const slicePct = total > 0 ? cat.count / total : 0;
          const strokeDash = slicePct * 534; // 2 * PI * r (r=85)
          const strokeGap = 534 - strokeDash;
          const rotation = accumulatedAngle * 360;
          accumulatedAngle += slicePct;

          return (
            <motion.circle
              key={cat.name}
              cx="140"
              cy="140"
              r="85"
              fill="transparent"
              stroke={cat.colorCfg.main}
              strokeWidth="26"
              strokeDasharray={`${strokeDash} ${strokeGap}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              style={{
                transformOrigin: '140px 140px',
                transform: `rotate(${rotation}deg)`
              }}
              initial={{ strokeDasharray: `0 534` }}
              animate={{ strokeDasharray: `${strokeDash} ${strokeGap}` }}
              transition={{ duration: 1.2, delay: idx * 0.08, ease: 'easeOut' }}
              whileHover={{ strokeWidth: 32 }}
            />
          );
        })}
      </svg>

      {/* Central Light Rustic Core */}
      <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#FAF5EE] border-2 border-[#D49B4B] shadow-xl backdrop-blur-md flex flex-col items-center justify-center p-2">
        <EspressoMachineIcon className="w-6 h-6" color="#B32025" />
        <span className="text-[10px] sm:text-xs font-mono text-[#8C5332] tracking-widest uppercase font-black mt-1">Total Iscas</span>
        <motion.span 
          key={total}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl sm:text-4xl font-serif font-black text-[#3D2314] tracking-tight my-0.5"
        >
          {total}
        </motion.span>
        <span className="text-[10px] font-mono text-[#16A34A] flex items-center gap-1 font-bold">
          <Activity size={12} className="animate-spin text-[#B32025]" /> 100% Sincronizado
        </span>
      </div>

    </div>
  );
}

export default function Iscas() {
  const [iscas, setIscas] = useState<IscaItem[]>([]);
  const [pasteContent, setPasteContent] = useState('');
  const [santaLuziaInput, setSantaLuziaInput] = useState('');
  const [santaLuziaList, setSantaLuziaList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('ALL');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [activeChartTab, setActiveChartTab] = useState<'3d-cylinders' | 'radar' | 'area'>('3d-cylinders');

  const slideDeckContainerRef = useRef<HTMLDivElement>(null);

  // Firebase Realtime Listener
  useEffect(() => {
    const iscasRef = ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2`);
    const unsubIscas = onValue(iscasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val
        }));
        setIscas(list);
      } else {
        const seed: Omit<IscaItem, 'id'>[] = [
          { iscaNumber: 'R100000555', status: 'EM ROTA IDA', destino: 'PINHAIS', cavalo: 'SBK-5A52', nf: '2938195', responsavel: 'WEBER' },
          { iscaNumber: 'R100000577', status: 'NO DESTINO', destino: 'RIO DE JANEIRO (RJ)', cavalo: 'SAR-8D82', nf: '2898921', responsavel: 'BGEF' },
          { iscaNumber: 'R100000617', status: 'EM PREPARAÇÃO', destino: 'VIANA', cavalo: 'SBK-5B52', nf: '5138918', responsavel: 'BGEF' },
          { iscaNumber: 'R100000673', status: 'POSSÍVEL EXTRAVIO', destino: 'RIO DE JANEIRO (RJ)', cavalo: 'SAR-7D82', nf: '2898920', responsavel: 'BGEF' },
          { iscaNumber: 'R100000679', status: 'EXTRAVIADAS', destino: 'BRASILIA', cavalo: 'SBK-5C82', nf: '2898916', responsavel: 'BGEF' },
          { iscaNumber: 'R100000698', status: 'NA GARANTIA', destino: 'BRASILIA', cavalo: 'SBK-5C22', nf: '2898917', responsavel: 'BGEF' },
          { iscaNumber: 'R100000712', status: 'EXPIROU A VALIDADE', destino: 'PINHAIS', cavalo: 'ABC-1234', nf: '2938199', responsavel: 'CARLOS' },
          { iscaNumber: 'R100000755', status: 'EM ROTA VOLTA', destino: 'SANTA LUZIA/MG', cavalo: 'XYZ-9876', nf: '2938200', responsavel: 'MARIO' }
        ];
        seed.forEach((item, idx) => {
          const id = (Date.now() + idx).toString();
          set(ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2/${id}`), { ...item, id });
        });
      }
    });

    const slRef = ref(rtdb, `users/${GUEST_USER_ID}/santa_luzia_numbers`);
    const unsubSL = onValue(slRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        setSantaLuziaList(data);
        setSantaLuziaInput(data.join(', '));
      } else {
        const defaultSl = ['R100000555', 'R100000617', 'R100000755'];
        setSantaLuziaList(defaultSl);
        setSantaLuziaInput(defaultSl.join(', '));
      }
    });

    return () => {
      unsubIscas();
      unsubSL();
    };
  }, []);

  // Slide Definitions
  const slides = [
    { id: 'slide1', title: '01. DASHBOARD DE GRÁFICOS 3D', icon: BarChart3 },
    { id: 'slide2', title: '02. CILINDROS VOLUMÉTRICOS EXPANDIDOS', icon: Box },
    { id: 'slide3', title: '03. MATRIZ GRÁFICA DE PRAÇAS', icon: Globe2 },
    { id: 'slide4', title: '04. IMPORTAR & SANTA LUZIA/MG', icon: Cpu },
    { id: 'slide5', title: '05. REGISTROS DE ISCAS EM TABELA', icon: TableIcon }
  ];

  // Auto Rotation Timer
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % slides.length;
        if (soundEnabled) playSciFiSound('slide');
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRotate, slides.length, soundEnabled]);

  // Keyboard Navigation & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlide(prev => {
          const next = Math.min(slides.length - 1, prev + 1);
          if (soundEnabled) playSciFiSound('slide');
          return next;
        });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide(prev => {
          const next = Math.max(0, prev - 1);
          if (soundEnabled) playSciFiSound('slide');
          return next;
        });
      } else if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, soundEnabled, isCinemaMode]);

  // Process pasted spreadsheet
  const handleProcessPaste = async () => {
    if (!pasteContent.trim()) {
      alert('Por favor, cole as informações da planilha antes de importar.');
      return;
    }

    const lines = pasteContent.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return;

    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(/\t|,/).map(h => h.trim());
    
    const iscaIdx = headers.findIndex(h => h.includes('isca') || h.includes('numero') || h.includes('rastreador'));
    const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('situacao') || h.includes('estado'));
    const destinoIdx = headers.findIndex(h => h.includes('destino') || h.includes('cidade') || h.includes('rota'));
    const cavaloIdx = headers.findIndex(h => h.includes('cavalo') || h.includes('placa') || h.includes('veiculo'));
    const nfIdx = headers.findIndex(h => h.includes('nf') || h.includes('nota') || h.includes('fatura'));
    const respIdx = headers.findIndex(h => h.includes('responsavel') || h.includes('motorista') || h.includes('nome'));

    const startIndex = (iscaIdx !== -1 || statusIdx !== -1 || destinoIdx !== -1) ? 1 : 0;
    const newItems: Record<string, any> = {};

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(/\t|,/).map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length === 0 || !cols[0]) continue;

      let iscaNumber = iscaIdx !== -1 && cols[iscaIdx] ? cols[iscaIdx] : (cols[0] || `R100000${Math.floor(100+Math.random()*900)}`);
      let rawStatus = statusIdx !== -1 && cols[statusIdx] ? cols[statusIdx].toUpperCase() : (cols[1] || 'EM PREPARAÇÃO');
      let destino = destinoIdx !== -1 && cols[destinoIdx] ? cols[destinoIdx].toUpperCase() : (cols[2] || 'DESTINO GERAL');
      let cavalo = cavaloIdx !== -1 && cols[cavaloIdx] ? cols[cavaloIdx].toUpperCase() : (cols[3] || 'PADRÃO');
      let nf = nfIdx !== -1 && cols[nfIdx] ? cols[nfIdx] : (cols[4] || '000000');
      let responsavel = respIdx !== -1 && cols[respIdx] ? cols[respIdx].toUpperCase() : (cols[5] || 'EQUIPE');

      let normalizedStatus = 'EM PREPARAÇÃO';
      const upperSt = rawStatus.toUpperCase();
      if (upperSt.includes('EXTRAVI') && upperSt.includes('POSSIB')) normalizedStatus = 'POSSÍVEL EXTRAVIO';
      else if (upperSt.includes('EXTRAVI')) normalizedStatus = 'EXTRAVIADAS';
      else if (upperSt.includes('IDA') || upperSt.includes('ROTA IDA')) normalizedStatus = 'EM ROTA IDA';
      else if (upperSt.includes('VOLTA') || upperSt.includes('ROTA VOLTA')) normalizedStatus = 'EM ROTA VOLTA';
      else if (upperSt.includes('DESTINO') || upperSt.includes('CHEGOU')) normalizedStatus = 'NO DESTINO';
      else if (upperSt.includes('GARANTIA')) normalizedStatus = 'NA GARANTIA';
      else if (upperSt.includes('VALIDADE') || upperSt.includes('VENCID') || upperSt.includes('EXPIROU')) normalizedStatus = 'EXPIROU A VALIDADE';
      else if (upperSt.includes('PREPAR')) normalizedStatus = 'EM PREPARAÇÃO';

      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      newItems[id] = {
        id,
        iscaNumber: iscaNumber.toUpperCase(),
        status: normalizedStatus,
        destino,
        cavalo,
        nf,
        responsavel
      };
    }

    if (Object.keys(newItems).length > 0) {
      try {
        await update(ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2`), newItems);
        if (soundEnabled) playSciFiSound('sparkle');
        alert(`✨ Sucesso! ${Object.keys(newItems).length} iscas importadas.`);
        setPasteContent('');
        setCurrentSlide(0);
      } catch (err) {
        console.error(err);
        alert('Erro ao sincronizar com o banco.');
      }
    } else {
      alert('Nenhum dado reconhecido.');
    }
  };

  // Save Santa Luzia/MG list
  const handleSaveSantaLuzia = async () => {
    const list = santaLuziaInput
      .split(/,|\n|\s+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);
    
    try {
      await set(ref(rtdb, `users/${GUEST_USER_ID}/santa_luzia_numbers`), list);
      setSantaLuziaList(list);
      if (soundEnabled) playSciFiSound('action');
      alert('🎯 Lista de Santa Luzia/MG atualizada!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar.');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Deseja excluir esta isca?')) return;
    try {
      await remove(ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2/${id}`));
    } catch (e) {
      console.error(e);
    }
  };

  // Computed metrics
  const filteredIscas = selectedDestinationFilter === 'ALL' 
    ? iscas 
    : iscas.filter(i => (i.destino || 'OUTROS') === selectedDestinationFilter);

  const totalCounts: Record<string, number> = {};
  STATUS_CATEGORIES.forEach(st => {
    totalCounts[st] = filteredIscas.filter(i => i.status === st).length;
  });

  const santaLuziaIscas = iscas.filter(i => santaLuziaList.includes(i.iscaNumber));
  const santaLuziaCounts: Record<string, number> = {};
  STATUS_CATEGORIES.forEach(st => {
    santaLuziaCounts[st] = santaLuziaIscas.filter(i => i.status === st).length;
  });

  const destinationsList = Array.from(new Set(iscas.map(i => i.destino || 'OUTROS'))).filter(Boolean);
  const destinationBreakdown = destinationsList.map(dest => {
    const destIscas = iscas.filter(i => (i.destino || 'OUTROS') === dest);
    const counts: Record<string, number> = {};
    STATUS_CATEGORIES.forEach(st => {
      counts[st] = destIscas.filter(i => i.status === st).length;
    });
    return {
      destination: dest,
      total: destIscas.length,
      counts
    };
  });

  const maxVal = Math.max(...Object.values(totalCounts), 1);

  // Radar chart data structure
  const radarChartData = STATUS_CATEGORIES.map(st => ({
    subject: st,
    Total: totalCounts[st] || 0,
    SantaLuzia: santaLuziaCounts[st] || 0
  }));

  // Recharts Bar Data
  const rechartsBarData = STATUS_CATEGORIES.map(st => ({
    name: st,
    Total: totalCounts[st] || 0,
    fill: CATEGORY_COLORS[st].main
  }));

  const navSlide = (newIndex: number) => {
    if (soundEnabled) playSciFiSound('slide');
    setCurrentSlide(newIndex);
  };

  const toggleCinema = () => {
    const nextMode = !isCinemaMode;
    setIsCinemaMode(nextMode);
    if (soundEnabled) playSciFiSound('cinema');
  };

  // Table search filter
  const tableFilteredIscas = iscas.filter(i => {
    const query = searchTerm.toLowerCase();
    return (
      i.iscaNumber.toLowerCase().includes(query) ||
      i.status.toLowerCase().includes(query) ||
      (i.destino || '').toLowerCase().includes(query) ||
      (i.cavalo || '').toLowerCase().includes(query) ||
      (i.nf || '').toLowerCase().includes(query) ||
      (i.responsavel || '').toLowerCase().includes(query)
    );
  });

  return (
    <div 
      ref={slideDeckContainerRef}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(250, 245, 238, 0.92), rgba(243, 232, 215, 0.95)), url(${bgRusticCoffee})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
      className={cn(
        "w-full max-w-full overflow-x-hidden min-h-screen text-[#3D2314] font-sans p-3 sm:p-5 md:p-6 flex flex-col justify-between relative select-none",
        isCinemaMode && "fixed inset-0 z-50 p-4 sm:p-8 bg-[#FAF5EE]"
      )}
    >
      {/* Particle Canvas */}
      <LightCoffeeParticleCanvas />

      {/* Rustic Header Bar - Light Café Três Corações Theme */}
      <header className="w-full max-w-7xl mx-auto z-10 bg-white/95 border-2 border-[#EADCC9] rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(92,54,33,0.08)] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-4 relative overflow-hidden">
        
        {/* Red & Gold Três Corações Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#B32025] via-[#D49B4B] to-[#0284C7]" />

        {/* Title & Brand */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B32025] via-[#D49B4B] to-[#8E1014] p-[1.5px] shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#FAF5EE] rounded-2xl flex items-center justify-center text-[#B32025]">
              <EspressoMachineIcon className="w-7 h-7" color="#B32025" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B32025]/10 text-[#B32025] font-mono text-xs uppercase font-black tracking-wider border border-[#B32025]/20 flex items-center gap-1">
                <CoffeeBeanIcon className="w-3.5 h-3.5" color="#B32025" /> Três Corações
              </span>
              <span className="text-xs text-[#8C5332] font-mono font-bold hidden sm:inline">• Painel de Iscas Gráfico</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-[#3D2314] tracking-tight uppercase truncate">
              Relatório Executivo de Iscas 3D
            </h1>
          </div>
        </div>

        {/* Slide Navigation & Presentation Controls */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          
          {/* Cinema 2050 PowerPoint Mode Button */}
          <button
            onClick={toggleCinema}
            className={cn(
              "px-4 py-2 rounded-xl border text-xs sm:text-sm font-mono font-black uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md",
              isCinemaMode
                ? "bg-gradient-to-r from-[#B32025] via-[#D49B4B] to-[#5C3621] text-white border-white animate-pulse"
                : "bg-gradient-to-r from-[#B32025] to-[#8E1014] hover:brightness-110 border-[#B32025] text-white"
            )}
          >
            <Monitor size={18} />
            <span>{isCinemaMode ? 'Sair do Cinema' : 'Cinema PowerPoint 3D'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-2.5 rounded-xl border transition-all cursor-pointer",
              soundEnabled 
                ? "bg-[#B32025]/10 border-[#B32025]/30 text-[#B32025]" 
                : "bg-[#FAF5EE] border-[#EADCC9] text-[#8C5332]"
            )}
            title="Sons de Transição"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Auto Play */}
          <button
            onClick={() => {
              setAutoRotate(!autoRotate);
              if (soundEnabled) playSciFiSound('action');
            }}
            className={cn(
              "px-3.5 py-2 rounded-xl border text-xs font-mono font-black uppercase flex items-center gap-2 transition-all cursor-pointer",
              autoRotate
                ? "bg-[#B32025] border-[#B32025] text-white shadow-md"
                : "bg-[#FAF5EE] border-[#EADCC9] text-[#3D2314] hover:bg-white"
            )}
          >
            {autoRotate ? <Pause size={15} /> : <Play size={15} />}
            <span>Auto</span>
          </button>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-1.5 bg-[#FAF5EE] p-1.5 rounded-xl border border-[#EADCC9]">
            <button
              onClick={() => navSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-2 rounded-lg hover:bg-white text-[#3D2314] disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1 px-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => navSlide(idx)}
                  className={cn(
                    "w-8 h-8 rounded-lg font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-center border",
                    currentSlide === idx
                      ? "bg-gradient-to-r from-[#B32025] to-[#8E1014] border-[#B32025] text-white shadow-md scale-105"
                      : "bg-white border-[#EADCC9] text-[#5C3621] hover:bg-[#FAF5EE]"
                  )}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => navSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-lg hover:bg-white text-[#3D2314] disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>

        </div>

      </header>

      {/* Main Slide Stage - Graph Centric 3D Experience */}
      <main className="w-full max-w-7xl mx-auto flex-1 relative z-10 flex items-center justify-center min-h-[620px]">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
              "w-full bg-white/95 border-2 border-[#EADCC9] rounded-3xl p-5 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(92,54,33,0.1)] backdrop-blur-2xl flex flex-col justify-between space-y-6 min-h-[600px]",
              isCinemaMode && "border-2 border-[#B32025] bg-[#FAF5EE]/98 shadow-[0_0_80px_rgba(179,32,37,0.25)]"
            )}
          >
            
            {/* SLIDE 1: 100% GRAPH DOCK & 3D CHARTS */}
            {currentSlide === 0 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EADCC9] pb-4 gap-3">
                  <div>
                    <span className="text-xs sm:text-sm font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-2">
                      <BarChart3 size={18} /> SLIDE 01 / 05 — VISUALIZAÇÃO GRÁFICA 3D
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#3D2314] uppercase mt-1 tracking-tight">
                      Dashboard Interativo de Gráficos
                    </h2>
                  </div>

                  {/* Chart Type Selector */}
                  <div className="flex items-center gap-2 bg-[#FAF5EE] p-1.5 rounded-2xl border border-[#EADCC9]">
                    <button
                      onClick={() => setActiveChartTab('3d-cylinders')}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border",
                        activeChartTab === '3d-cylinders'
                          ? "bg-[#B32025] text-white border-[#B32025] shadow-sm"
                          : "bg-white text-[#5C3621] border-[#EADCC9] hover:bg-[#FAF5EE]"
                      )}
                    >
                      <Box size={14} /> Cilindros 3D
                    </button>
                    <button
                      onClick={() => setActiveChartTab('radar')}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border",
                        activeChartTab === 'radar'
                          ? "bg-[#B32025] text-white border-[#B32025] shadow-sm"
                          : "bg-white text-[#5C3621] border-[#EADCC9] hover:bg-[#FAF5EE]"
                      )}
                    >
                      <Zap size={14} /> Teia Radar 3D
                    </button>
                    <button
                      onClick={() => setActiveChartTab('area')}
                      className={cn(
                        "px-3.5 py-1.5 rounded-xl text-xs font-mono font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border",
                        activeChartTab === 'area'
                          ? "bg-[#B32025] text-white border-[#B32025] shadow-sm"
                          : "bg-white text-[#5C3621] border-[#EADCC9] hover:bg-[#FAF5EE]"
                      )}
                    >
                      <BarChart3 size={14} /> Volume Recharts
                    </button>
                  </div>
                </div>

                {/* Filter Praça */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 max-w-full">
                  <span className="text-xs sm:text-sm font-mono text-[#8C5332] uppercase font-black mr-1 shrink-0 flex items-center gap-1.5">
                    <Filter size={14} /> Praça:
                  </span>
                  <button
                    onClick={() => setSelectedDestinationFilter('ALL')}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black uppercase transition-all cursor-pointer whitespace-nowrap border shrink-0",
                      selectedDestinationFilter === 'ALL'
                        ? "bg-gradient-to-r from-[#B32025] to-[#8E1014] border-[#B32025] text-white shadow-md"
                        : "bg-[#FAF5EE] border-[#EADCC9] text-[#5C3621] hover:bg-white"
                    )}
                  >
                    Todas ({iscas.length})
                  </button>
                  {destinationsList.map(dest => (
                    <button
                      key={dest}
                      onClick={() => setSelectedDestinationFilter(dest)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black uppercase transition-all cursor-pointer whitespace-nowrap border shrink-0",
                        selectedDestinationFilter === dest
                          ? "bg-gradient-to-r from-[#B32025] to-[#8E1014] border-[#B32025] text-white shadow-md"
                          : "bg-[#FAF5EE] border-[#EADCC9] text-[#5C3621] hover:bg-white"
                      )}
                    >
                      {dest} ({iscas.filter(i => (i.destino || 'OUTROS') === dest).length})
                    </button>
                  ))}
                </div>

                {/* Main Interactive Chart Display */}
                {activeChartTab === '3d-cylinders' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 my-2">
                    {STATUS_CATEGORIES.map(st => {
                      const val = totalCounts[st] || 0;
                      const slVal = santaLuziaCounts[st] || 0;
                      const pct = Math.round((val / (filteredIscas.length || 1)) * 100);
                      return (
                        <Animated3DCylinderBar
                          key={st}
                          label={st}
                          value={val}
                          maxValue={maxVal}
                          colorConfig={CATEGORY_COLORS[st]}
                          percentage={pct}
                          santaLuziaVal={slVal}
                        />
                      );
                    })}
                  </div>
                )}

                {activeChartTab === 'radar' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center my-2">
                    <div className="bg-[#FAF5EE] border-2 border-[#EADCC9] rounded-2xl p-4 sm:p-6 shadow-inner h-[380px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                          <PolarGrid stroke="#D49B4B" strokeDasharray="3 3" />
                          <PolarAngleAxis dataKey="subject" stroke="#3D2314" tick={{ fill: '#3D2314', fontSize: 11, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, maxVal]} stroke="#8C5332" />
                          <Radar name="Total Iscas" dataKey="Total" stroke="#B32025" fill="#B32025" fillOpacity={0.6} />
                          <Radar name="Santa Luzia/MG" dataKey="SantaLuzia" stroke="#0284C7" fill="#0284C7" fillOpacity={0.4} />
                          <Tooltip contentStyle={{ backgroundColor: '#FAF5EE', borderColor: '#EADCC9', borderRadius: '12px', color: '#3D2314', fontWeight: 'bold' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-[#FAF5EE] border-2 border-[#EADCC9] rounded-2xl p-6 space-y-4 shadow-inner flex flex-col justify-center">
                      <h3 className="text-base font-serif font-black text-[#3D2314] uppercase flex items-center gap-2">
                        <CoffeeBeanIcon className="w-5 h-5" color="#B32025" /> Análise Radar de Status
                      </h3>
                      <p className="text-xs font-mono text-[#8C5332]">
                        A matriz radar compara a volumetria total cadastrada com o sub-escopo monitorado na unidade de Santa Luzia/MG.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#EADCC9]">
                          <span className="text-xs font-mono font-bold text-[#3D2314]">Total de Iscas Filtradas:</span>
                          <span className="text-sm font-mono font-black text-[#B32025]">{filteredIscas.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#EADCC9]">
                          <span className="text-xs font-mono font-bold text-[#3D2314]">Iscas em Santa Luzia / MG:</span>
                          <span className="text-sm font-mono font-black text-[#0284C7]">{santaLuziaIscas.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeChartTab === 'area' && (
                  <div className="bg-[#FAF5EE] border-2 border-[#EADCC9] rounded-2xl p-4 sm:p-6 shadow-inner h-[380px] my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rechartsBarData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <XAxis dataKey="name" stroke="#3D2314" tick={{ fill: '#3D2314', fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis stroke="#3D2314" tick={{ fill: '#3D2314', fontSize: 10 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#FAF5EE', borderColor: '#EADCC9', borderRadius: '12px', color: '#3D2314', fontWeight: 'bold' }} />
                        <Bar dataKey="Total" radius={[10, 10, 0, 0]}>
                          {rechartsBarData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Donut & KPI Cards Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  
                  <div className="bg-[#FAF5EE] border-2 border-[#EADCC9] rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 shadow-sm">
                    <h3 className="text-sm font-mono font-black text-[#3D2314] uppercase tracking-wider flex items-center gap-2">
                      <PieChartIcon size={16} className="text-[#B32025]" /> Distribuição Circular Proporcional
                    </h3>
                    <Rotating3DCoffeeDonut
                      total={filteredIscas.length}
                      categories={STATUS_CATEGORIES.map(st => ({
                        name: st,
                        count: totalCounts[st] || 0,
                        colorCfg: CATEGORY_COLORS[st]
                      }))}
                    />
                  </div>

                  <div className="bg-[#FAF5EE] border-2 border-[#EADCC9] rounded-2xl p-6 space-y-3 shadow-sm">
                    <h3 className="text-sm font-mono font-black text-[#3D2314] uppercase tracking-wider mb-3">
                      Indicadores de Desempenho
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white border border-[#EADCC9] rounded-2xl">
                        <span className="text-[10px] font-mono uppercase text-[#8C5332] font-black">Em Trânsito Normal</span>
                        <div className="text-2xl font-serif font-black text-[#16A34A] mt-1">
                          {(totalCounts['EM ROTA IDA'] || 0) + (totalCounts['EM ROTA VOLTA'] || 0) + (totalCounts['NO DESTINO'] || 0)}
                        </div>
                      </div>
                      <div className="p-3.5 bg-white border border-[#EADCC9] rounded-2xl">
                        <span className="text-[10px] font-mono uppercase text-[#8C5332] font-black">Alertas / Extravios</span>
                        <div className="text-2xl font-serif font-black text-[#B32025] mt-1">
                          {(totalCounts['EXTRAVIADAS'] || 0) + (totalCounts['POSSÍVEL EXTRAVIO'] || 0)}
                        </div>
                      </div>
                      <div className="p-3.5 bg-white border border-[#EADCC9] rounded-2xl">
                        <span className="text-[10px] font-mono uppercase text-[#8C5332] font-black">Em Preparação</span>
                        <div className="text-2xl font-serif font-black text-[#D49B4B] mt-1">
                          {totalCounts['EM PREPARAÇÃO'] || 0}
                        </div>
                      </div>
                      <div className="p-3.5 bg-white border border-[#EADCC9] rounded-2xl">
                        <span className="text-[10px] font-mono uppercase text-[#8C5332] font-black">Na Garantia / Outros</span>
                        <div className="text-2xl font-serif font-black text-[#0284C7] mt-1">
                          {(totalCounts['NA GARANTIA'] || 0) + (totalCounts['EXPIROU A VALIDADE'] || 0)}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SLIDE 2: VOLUMETRIC BAR CYLINDERS FULL EXPANDED */}
            {currentSlide === 1 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                <div className="flex items-center justify-between border-b border-[#EADCC9] pb-4">
                  <div>
                    <span className="text-xs sm:text-sm font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-2">
                      <Box size={18} /> SLIDE 02 / 05 — CILINDROS VOLUMÉTRICOS 3D
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#3D2314] uppercase mt-1 tracking-tight">
                      Gráficos Tridimensionais Expandidos
                    </h2>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-[#FAF5EE] border border-[#EADCC9] text-xs font-mono text-[#8C5332] font-black">
                    8 Categorias
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 my-2">
                  {STATUS_CATEGORIES.map(st => {
                    const val = totalCounts[st] || 0;
                    const slVal = santaLuziaCounts[st] || 0;
                    const pct = Math.round((val / (filteredIscas.length || 1)) * 100);
                    return (
                      <Animated3DCylinderBar
                        key={st}
                        label={st}
                        value={val}
                        maxValue={maxVal}
                        colorConfig={CATEGORY_COLORS[st]}
                        percentage={pct}
                        santaLuziaVal={slVal}
                      />
                    );
                  })}
                </div>

                <p className="text-xs sm:text-sm font-mono text-[#8C5332] text-center font-bold flex items-center justify-center gap-1.5">
                  <CoffeeBeanIcon className="w-4 h-4" color="#B32025" /> Perspectiva volumétrica 3D com iluminação especular e indicador duplo Santa Luzia/MG.
                </p>

              </div>
            )}

            {/* SLIDE 3: GEOGRAPHIC MATRIX */}
            {currentSlide === 2 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                <div className="flex items-center justify-between border-b border-[#EADCC9] pb-4">
                  <div>
                    <span className="text-xs sm:text-sm font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-2">
                      <Globe2 size={18} /> SLIDE 03 / 05 — MATRIZ GEOGRÁFICA
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#3D2314] uppercase mt-1 tracking-tight">
                      Distribuição de Iscas por Praça & Rota
                    </h2>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-[#FAF5EE] border border-[#EADCC9] text-xs font-mono text-[#8C5332] font-black">
                    {destinationsList.length} Praças Ativas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto max-h-[420px] pr-2">
                  {destinationBreakdown.map((dest) => (
                    <div 
                      key={dest.destination}
                      className="bg-[#FAF5EE] border-2 border-[#EADCC9] rounded-2xl p-5 shadow-sm space-y-3 hover:border-[#B32025] transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-[#EADCC9] pb-3">
                        <span className="font-serif font-black text-base text-[#3D2314] uppercase tracking-tight flex items-center gap-2">
                          <MapPin size={16} className="text-[#B32025]" /> {dest.destination}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-[#B32025]/10 text-[#B32025] font-mono text-xs font-black border border-[#B32025]/30">
                          {dest.total} iscas
                        </span>
                      </div>

                      <div className="space-y-2">
                        {STATUS_CATEGORIES.map(st => {
                          const val = dest.counts[st] || 0;
                          if (val === 0) return null;
                          const cfg = CATEGORY_COLORS[st];
                          return (
                            <div key={st} className="flex items-center justify-between text-xs sm:text-sm font-mono">
                              <span className="text-[#3D2314] flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.main }} />
                                {st}
                              </span>
                              <span className="font-black text-[#3D2314] px-2.5 py-0.5 rounded-lg bg-white border border-[#EADCC9]">
                                {val}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* SLIDE 4: IMPORT & SANTA LUZIA/MG */}
            {currentSlide === 3 && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                <div className="flex items-center justify-between border-b border-[#EADCC9] pb-4">
                  <div>
                    <span className="text-xs sm:text-sm font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-2">
                      <Cpu size={18} /> SLIDE 04 / 05 — IMPORTAR & SANTA LUZIA/MG
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#3D2314] uppercase mt-1 tracking-tight">
                      Importação de Planilha & Santa Luzia/MG
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Paste Spreadsheet Dock */}
                  <div className="bg-[#FAF5EE] border-2 border-[#EADCC9] rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-serif font-black text-base text-[#3D2314] uppercase flex items-center gap-2">
                      <FileSpreadsheet className="text-[#B32025]" size={20} /> Colar Células da Planilha
                    </h3>
                    <p className="text-xs font-mono text-[#8C5332]">
                      Copie do Excel (colunas ISCA, STATUS, DESTINO, CAVALO, NF, RESPONSÁVEL).
                    </p>
                    <textarea
                      rows={6}
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      placeholder="Cole aqui as linhas copiadas da planilha..."
                      className="w-full bg-white border border-[#EADCC9] rounded-xl p-4 text-xs sm:text-sm font-mono text-[#3D2314] placeholder:text-[#A89888] focus:outline-none focus:border-[#B32025]"
                    />
                    <button
                      onClick={handleProcessPaste}
                      className="w-full py-3.5 bg-gradient-to-r from-[#B32025] to-[#8E1014] hover:brightness-110 text-white font-serif font-black uppercase text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      <Sparkles size={18} /> Importar & Sincronizar Iscas
                    </button>
                  </div>

                  {/* Santa Luzia List Dock */}
                  <div className="bg-[#FAF5EE] border-2 border-[#EADCC9] rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-serif font-black text-base text-[#3D2314] uppercase flex items-center gap-2">
                      <Building2 className="text-[#0284C7]" size={20} /> Iscas de Santa Luzia / MG
                    </h3>
                    <p className="text-xs font-mono text-[#8C5332]">
                      Números de iscas de Santa Luzia (separados por vírgula ou espaço).
                    </p>
                    <textarea
                      rows={6}
                      value={santaLuziaInput}
                      onChange={(e) => setSantaLuziaInput(e.target.value)}
                      placeholder="Ex: R100000555, R100000617, R100000755..."
                      className="w-full bg-white border border-[#EADCC9] rounded-xl p-4 text-xs sm:text-sm font-mono text-[#3D2314] placeholder:text-[#A89888] focus:outline-none focus:border-[#0284C7]"
                    />
                    <button
                      onClick={handleSaveSantaLuzia}
                      className="w-full py-3.5 bg-[#0284C7] text-white font-serif font-black uppercase text-sm rounded-xl hover:bg-[#0369a1] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      <Save size={18} /> Salvar Lista de Santa Luzia
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* SLIDE 5: DATABASE TABLE */}
            {currentSlide === 4 && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EADCC9] pb-3 gap-2">
                  <div>
                    <span className="text-xs sm:text-sm font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-2">
                      <TableIcon size={18} /> SLIDE 05 / 05 — TABELA DE REGISTROS
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3D2314] uppercase mt-0.5 tracking-tight">
                      Base de Dados ({iscas.length})
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C5332]" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar isca, cavalo, NF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#EADCC9] text-xs font-mono text-[#3D2314] focus:outline-none focus:border-[#B32025] w-48 sm:w-64"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-[#EADCC9] rounded-2xl max-h-[380px]">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#FAF5EE] text-[#3D2314] border-b border-[#EADCC9]">
                        <th className="p-3 font-black">Nº ISCA</th>
                        <th className="p-3 font-black">STATUS</th>
                        <th className="p-3 font-black">DESTINO</th>
                        <th className="p-3 font-black">CAVALO</th>
                        <th className="p-3 font-black">NF</th>
                        <th className="p-3 font-black">RESPONSÁVEL</th>
                        <th className="p-3 font-black text-right">AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EADCC9]">
                      {tableFilteredIscas.map((item) => {
                        const cfg = CATEGORY_COLORS[item.status] || CATEGORY_COLORS['EM PREPARAÇÃO'];
                        return (
                          <tr key={item.id} className="hover:bg-[#FAF5EE]/80 transition-colors">
                            <td className="p-3 font-bold text-[#3D2314]">{item.iscaNumber}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white" style={{ backgroundColor: cfg.main }}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 text-[#5C3621]">{item.destino || '—'}</td>
                            <td className="p-3 text-[#5C3621]">{item.cavalo || '—'}</td>
                            <td className="p-3 text-[#5C3621]">{item.nf || '—'}</td>
                            <td className="p-3 text-[#5C3621]">{item.responsavel || '—'}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {tableFilteredIscas.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#8C5332] font-mono text-xs">
                            Nenhum registro encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* Slide Footer Info */}
            <footer className="pt-3 border-t border-[#EADCC9] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#8C5332]">
              <div className="flex items-center gap-2">
                <CoffeeBeanIcon className="w-4 h-4" color="#B32025" />
                <span>Café Três Corações S.A. — Sistema de Rastreio 3D</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Slide {currentSlide + 1} de {slides.length}</span>
                <span>•</span>
                <span className="text-[#B32025] font-bold">Use as setas ← → do teclado</span>
              </div>
            </footer>

          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  );
}
