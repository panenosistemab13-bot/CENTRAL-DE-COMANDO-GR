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
  Layers3,
  Globe2,
  Zap,
  Sparkle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { motion, AnimatePresence } from 'motion/react';

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

// Refined Light Warm Beige & Café Três Corações Color Palette
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
    main: '#B32025',
    glow: 'rgba(179, 32, 37, 0.35)',
    gradient: 'from-[#dc2626] via-[#b91c1c] to-[#991b1b]',
    border: 'border-[#B32025]/40',
    bgGlass: 'bg-red-50',
    text: 'text-[#B32025]',
    topCap: '#ef4444'
  },
  'EM ROTA IDA': {
    main: '#0284C7',
    glow: 'rgba(2, 132, 199, 0.35)',
    gradient: 'from-[#38bdf8] via-[#0284c7] to-[#0369a1]',
    border: 'border-sky-300',
    bgGlass: 'bg-sky-50',
    text: 'text-sky-700',
    topCap: '#7dd3fc'
  },
  'EM ROTA VOLTA': {
    main: '#EA580C',
    glow: 'rgba(234, 88, 12, 0.35)',
    gradient: 'from-[#fb923c] via-[#ea580c] to-[#c2410c]',
    border: 'border-orange-300',
    bgGlass: 'bg-orange-50',
    text: 'text-orange-700',
    topCap: '#fdba74'
  },
  'NO DESTINO': {
    main: '#8C6239',
    glow: 'rgba(140, 98, 57, 0.35)',
    gradient: 'from-[#b08968] via-[#8c6239] to-[#634222]',
    border: 'border-[#b08968]/40',
    bgGlass: 'bg-[#f5ece1]',
    text: 'text-[#634222]',
    topCap: '#d4b490'
  },
  'EM PREPARAÇÃO': {
    main: '#D97706',
    glow: 'rgba(217, 119, 6, 0.35)',
    gradient: 'from-[#fcd34d] via-[#d97706] to-[#b45309]',
    border: 'border-amber-300',
    bgGlass: 'bg-amber-50',
    text: 'text-amber-800',
    topCap: '#fef08a'
  },
  'POSSÍVEL EXTRAVIO': {
    main: '#C2410C',
    glow: 'rgba(194, 65, 12, 0.35)',
    gradient: 'from-[#f97316] via-[#c2410c] to-[#9a3412]',
    border: 'border-orange-400',
    bgGlass: 'bg-orange-100',
    text: 'text-orange-800',
    topCap: '#ffedd5'
  },
  'NA GARANTIA': {
    main: '#059669',
    glow: 'rgba(5, 150, 105, 0.35)',
    gradient: 'from-[#34d399] via-[#059669] to-[#047857]',
    border: 'border-emerald-300',
    bgGlass: 'bg-emerald-50',
    text: 'text-emerald-800',
    topCap: '#a7f3d0'
  },
  'EXPIROU A VALIDADE': {
    main: '#6B7280',
    glow: 'rgba(107, 114, 128, 0.35)',
    gradient: 'from-[#9ca3af] via-[#6b7280] to-[#4b5563]',
    border: 'border-gray-300',
    bgGlass: 'bg-gray-100',
    text: 'text-gray-700',
    topCap: '#e5e7eb'
  }
};

// Web Audio API Synthesizer
const playSciFiSound = (type: 'slide' | 'hover' | 'action' | 'sparkle') => {
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
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'hover') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(550, now + 0.03);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'action') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'sparkle') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.2);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
};

// Warm Beige Light Canvas Particle Background
function ParticleCanvas() {
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

    const colors = ['#B32025', '#C28E38', '#0284C7', '#8C6239', '#D97706'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.4 + 0.15
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.0015;

      // Draw subtle warm beige geometric grid lines
      ctx.strokeStyle = 'rgba(180, 160, 135, 0.15)';
      ctx.lineWidth = 1;
      const gridSize = 55;
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

      // Floating particles
      particles.forEach((p) => {
        p.x += p.speedX + Math.sin(angle) * 0.15;
        p.y += p.speedY + Math.cos(angle) * 0.15;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
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
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
}

// Custom 3D Animated Bar Cylinder Component (Light Warm Beige Theme)
function ThreeDBarCylinder({ 
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
  const barHeightPct = Math.max(10, Math.min(100, (value / (maxValue || 1)) * 100));

  return (
    <div className="group relative flex flex-col items-center justify-end h-60 w-full p-2 bg-[#FAF7F2] rounded-2xl border border-[#E5DCD0] shadow-sm hover:border-[#B32025]/50 hover:shadow-md transition-all duration-300">
      
      {/* Value Badge */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute -top-3 z-10 px-2.5 py-0.5 rounded-full bg-[#2C1E16] text-[#FAF7F2] border border-[#C29B72]/40 shadow-sm flex items-center gap-1 backdrop-blur-md"
      >
        <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: colorConfig.main }} />
        <span className="text-xs font-mono font-black">{value}</span>
        <span className="text-[10px] font-mono text-[#D4B490]">({percentage}%)</span>
      </motion.div>

      {/* 3D Cylinder Shaft */}
      <div className="relative w-full h-40 flex items-end justify-center px-1 py-1">
        <div className="w-full max-w-[44px] relative flex flex-col justify-end h-full">
          
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${barHeightPct}%` }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full relative rounded-b-xl shadow-md group-hover:scale-105 transition-transform duration-300"
            style={{
              background: `linear-gradient(180deg, ${colorConfig.main} 0%, rgba(60, 40, 25, 0.8) 100%)`,
              boxShadow: `0 8px 20px ${colorConfig.glow}`
            }}
          >
            {/* Top Ellipse Cap */}
            <div 
              className="absolute -top-2 left-0 w-full h-3.5 rounded-[50%] border border-white/60 shadow-sm"
              style={{ 
                backgroundColor: colorConfig.topCap
              }}
            />

            {/* Specular Light Strip */}
            <div className="absolute top-0 left-1.5 w-1 h-full bg-white/30 rounded-full blur-[0.5px]" />
          </motion.div>

        </div>
      </div>

      {/* Label and Santa Luzia Indicator */}
      <div className="mt-2 text-center w-full">
        <p className="text-[10px] font-mono font-black text-[#2C1E16] uppercase tracking-tight truncate px-1" title={label}>
          {label}
        </p>
        <div className="flex items-center justify-center gap-1 mt-0.5 text-[10px] font-mono text-[#8C6239]">
          <span>SL/MG:</span>
          <span className="font-bold text-[#B32025]">{santaLuziaVal}</span>
        </div>
      </div>

    </div>
  );
}

// Custom 3D Animated Donut Gauge (Light Warm Beige Theme)
function ThreeDGlowingDonut({ 
  total, 
  categories 
}: { 
  total: number; 
  categories: Array<{ name: string; count: number; colorCfg: typeof CATEGORY_COLORS['EXTRAVIADAS'] }> 
}) {
  let accumulatedAngle = 0;
  const filtered = categories.filter(c => c.count > 0);

  return (
    <div className="relative w-56 h-56 flex items-center justify-center">
      
      {/* Soft Ambient Aura */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#B32025]/10 via-[#C28E38]/10 to-[#0284C7]/10 blur-xl animate-pulse" />

      {/* SVG Ring Layer */}
      <svg className="w-56 h-56 -rotate-90 drop-shadow-md">
        {filtered.map((cat, idx) => {
          const slicePct = total > 0 ? cat.count / total : 0;
          const strokeDash = slicePct * 408; // 2 * PI * r (r=65)
          const strokeGap = 408 - strokeDash;
          const rotation = accumulatedAngle * 360;
          accumulatedAngle += slicePct;

          return (
            <motion.circle
              key={cat.name}
              cx="112"
              cy="112"
              r="65"
              fill="transparent"
              stroke={cat.colorCfg.main}
              strokeWidth="18"
              strokeDasharray={`${strokeDash} ${strokeGap}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              style={{
                transformOrigin: '112px 112px',
                transform: `rotate(${rotation}deg)`
              }}
              initial={{ strokeDasharray: `0 408` }}
              animate={{ strokeDasharray: `${strokeDash} ${strokeGap}` }}
              transition={{ duration: 1.2, delay: idx * 0.08, ease: 'easeOut' }}
              whileHover={{ strokeWidth: 24 }}
            />
          );
        })}
      </svg>

      {/* Central Glass Core */}
      <div className="absolute w-28 h-28 rounded-full bg-[#FAF7F2] border border-[#E5DCD0] shadow-md backdrop-blur-md flex flex-col items-center justify-center">
        <span className="text-[9px] font-mono text-[#8C6239] tracking-widest uppercase font-extrabold">Total Iscas</span>
        <motion.span 
          key={total}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-serif font-black text-[#2C1E16] tracking-tight my-0.5"
        >
          {total}
        </motion.span>
        <span className="text-[9px] font-mono text-[#059669] flex items-center gap-1 font-bold">
          <Activity size={9} className="animate-spin text-[#B32025]" /> 100% Sincronizado
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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
    { id: 'slide1', title: '01. PAINEL PRINCIPAL & KPIS', icon: Zap },
    { id: 'slide2', title: '02. CILINDROS VOLUMÉTRICOS', icon: Box },
    { id: 'slide3', title: '03. MATRIZ GEOGRÁFICA', icon: Globe2 },
    { id: 'slide4', title: '04. IMPORTAR & SANTA LUZIA', icon: Cpu },
    { id: 'slide5', title: '05. TABELA DE REGISTROS', icon: TableIcon }
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

  // Keyboard Navigation
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, soundEnabled]);

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

  const clearAllIscas = async () => {
    if (!confirm('Deseja redefinir os dados das iscas?')) return;
    try {
      await remove(ref(rtdb, `users/${GUEST_USER_ID}/iscas_v2`));
      setIscas([]);
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

  const navSlide = (newIndex: number) => {
    if (soundEnabled) playSciFiSound('slide');
    setCurrentSlide(newIndex);
  };

  return (
    <div 
      ref={slideDeckContainerRef}
      className={cn(
        "w-full max-w-full overflow-x-hidden min-h-screen bg-[#F5F0E6] text-[#2C1E16] font-sans p-3 sm:p-5 md:p-6 flex flex-col justify-between relative select-none",
        isFullscreen && "fixed inset-0 z-50 p-4 bg-[#F5F0E6]"
      )}
    >
      {/* Particle Canvas */}
      <ParticleCanvas />

      {/* Header Bar - Light Warm Beige Theme */}
      <header className="w-full max-w-7xl mx-auto z-10 bg-[#FAF7F2]/95 border border-[#E2D7C3] rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3 mb-4 relative overflow-hidden">
        
        {/* Red & Gold Accent Top Bar */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#B32025] via-[#C28E38] to-[#0284C7]" />

        {/* Title & Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B32025] to-[#800609] p-[1px] shadow-sm flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#FAF7F2] rounded-xl flex items-center justify-center text-[#B32025]">
              <Presentation size={20} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#B32025]/10 text-[#B32025] font-mono text-[10px] uppercase font-black tracking-wider border border-[#B32025]/20">
                Apresentação Executiva
              </span>
              <span className="text-xs text-[#8C6239] font-mono font-bold hidden sm:inline">• Três Corações</span>
            </div>
            <h1 className="text-base sm:text-xl font-serif font-black text-[#2C1E16] tracking-tight uppercase truncate">
              Relatório Executivo — Iscas & Rastreio
            </h1>
          </div>
        </div>

        {/* Slide Navigation Controls */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-2 rounded-xl border transition-all cursor-pointer",
              soundEnabled 
                ? "bg-[#B32025]/10 border-[#B32025]/30 text-[#B32025]" 
                : "bg-[#EFE8DC] border-[#DCD1BC] text-[#8C7462]"
            )}
            title="Sons de Transição"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Auto Play */}
          <button
            onClick={() => {
              setAutoRotate(!autoRotate);
              if (soundEnabled) playSciFiSound('action');
            }}
            className={cn(
              "px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer",
              autoRotate
                ? "bg-[#B32025] border-[#B32025] text-white shadow-sm"
                : "bg-[#EFE8DC] border-[#DCD1BC] text-[#3B291A] hover:bg-[#E2D7C3]"
            )}
          >
            {autoRotate ? <Pause size={13} /> : <Play size={13} />}
            <span>Auto</span>
          </button>

          {/* Slide Buttons */}
          <div className="flex items-center gap-1 bg-[#EFE8DC] p-1 rounded-xl border border-[#DCD1BC]">
            <button
              onClick={() => navSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-1.5 rounded-lg hover:bg-white/60 text-[#3B291A] disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1 px-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => navSlide(idx)}
                  className={cn(
                    "w-7 h-7 rounded-lg font-mono text-xs font-black transition-all cursor-pointer flex items-center justify-center border",
                    currentSlide === idx
                      ? "bg-gradient-to-r from-[#B32025] to-[#800609] border-[#B32025] text-white shadow-sm scale-105"
                      : "bg-[#FAF7F2] border-[#DCD1BC] text-[#5C4738] hover:bg-white"
                  )}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => navSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-1.5 rounded-lg hover:bg-white/60 text-[#3B291A] disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              if (soundEnabled) playSciFiSound('action');
            }}
            className="p-2 rounded-xl bg-[#EFE8DC] border border-[#DCD1BC] text-[#3B291A] hover:bg-[#E2D7C3] transition-all cursor-pointer"
            title="Tela Cheia"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

        </div>

      </header>

      {/* Main Slide Deck Stage - Guaranteed No Horizontal Overflow */}
      <main className="w-full max-w-7xl mx-auto flex-1 relative z-10 flex items-center justify-center min-h-[560px]">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_10px_35px_rgba(74,53,37,0.06)] flex flex-col justify-between space-y-5 min-h-[540px]"
          >
            
            {/* SLIDE 1: HOLO COMMAND & KPIS */}
            {currentSlide === 0 && (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5DCD0] pb-3 gap-2">
                  <div>
                    <span className="text-xs font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-1.5">
                      <Zap size={14} /> SLIDE 01 / 05 — PAINEL PRINCIPAL
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-[#2C1E16] uppercase mt-0.5 tracking-tight">
                      Visão Geral & Indicadores Chave
                    </h2>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-[#EFE8DC] border border-[#DCD1BC] text-xs font-mono text-[#5C4738] flex items-center gap-2 self-start sm:self-auto">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B32025] animate-ping" />
                    Base Cadastrada: <span className="font-bold text-[#2C1E16]">{iscas.length} iscas</span>
                  </div>
                </div>

                {/* Filter Praça */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  <span className="text-xs font-mono text-[#8C6239] uppercase font-bold mr-1 shrink-0 flex items-center gap-1">
                    <Filter size={12} /> Praça:
                  </span>
                  <button
                    onClick={() => setSelectedDestinationFilter('ALL')}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap border shrink-0",
                      selectedDestinationFilter === 'ALL'
                        ? "bg-gradient-to-r from-[#B32025] to-[#800609] border-[#B32025] text-white shadow-sm"
                        : "bg-[#EFE8DC] border-[#DCD1BC] text-[#5C4738] hover:bg-[#E2D7C3]"
                    )}
                  >
                    Todas ({iscas.length})
                  </button>
                  {destinationsList.map(dest => (
                    <button
                      key={dest}
                      onClick={() => setSelectedDestinationFilter(dest)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap border shrink-0",
                        selectedDestinationFilter === dest
                          ? "bg-gradient-to-r from-[#B32025] to-[#800609] border-[#B32025] text-white shadow-sm"
                          : "bg-[#EFE8DC] border-[#DCD1BC] text-[#5C4738] hover:bg-[#E2D7C3]"
                      )}
                    >
                      {dest} ({iscas.filter(i => (i.destino || 'OUTROS') === dest).length})
                    </button>
                  ))}
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  
                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 shadow-sm hover:border-[#C29B72] transition-all">
                    <div className="text-[10px] font-mono uppercase font-black text-[#8C6239] flex items-center gap-1.5">
                      <Compass size={12} /> Total do Escopo
                    </div>
                    <div className="text-3xl font-serif font-black text-[#2C1E16] mt-1">
                      {filteredIscas.length}
                    </div>
                    <p className="text-[10px] font-mono text-[#8C7462] mt-1">Iscas em monitoramento</p>
                  </div>

                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 shadow-sm hover:border-[#C28E38] transition-all">
                    <div className="text-[10px] font-mono uppercase font-black text-[#C28E38] flex items-center gap-1.5">
                      <Building2 size={12} /> Santa Luzia / MG
                    </div>
                    <div className="text-3xl font-serif font-black text-[#C28E38] mt-1">
                      {santaLuziaIscas.length}
                    </div>
                    <p className="text-[10px] font-mono text-[#8C7462] mt-1">Unidade operacional principal</p>
                  </div>

                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 shadow-sm hover:border-[#B32025] transition-all">
                    <div className="text-[10px] font-mono uppercase font-black text-[#B32025] flex items-center gap-1.5">
                      <AlertTriangle size={12} /> Alertas de Extravio
                    </div>
                    <div className="text-3xl font-serif font-black text-[#B32025] mt-1">
                      {(totalCounts['EXTRAVIADAS'] || 0) + (totalCounts['POSSÍVEL EXTRAVIO'] || 0)}
                    </div>
                    <p className="text-[10px] font-mono text-[#8C7462] mt-1">Requerem atenção operacional</p>
                  </div>

                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 shadow-sm hover:border-emerald-500 transition-all">
                    <div className="text-[10px] font-mono uppercase font-black text-emerald-700 flex items-center gap-1.5">
                      <ShieldCheck size={12} /> Trânsito Normal
                    </div>
                    <div className="text-3xl font-serif font-black text-emerald-600 mt-1">
                      {(totalCounts['EM ROTA IDA'] || 0) + (totalCounts['EM ROTA VOLTA'] || 0) + (totalCounts['NO DESTINO'] || 0)}
                    </div>
                    <p className="text-[10px] font-mono text-[#8C7462] mt-1">Rota e logística regular</p>
                  </div>

                </div>

                {/* Donut Gauge & Category Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
                  
                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 shadow-sm">
                    <h3 className="text-xs font-mono font-black text-[#2C1E16] uppercase tracking-wider">
                      Composição Proporcional por Anel
                    </h3>
                    <ThreeDGlowingDonut
                      total={filteredIscas.length}
                      categories={STATUS_CATEGORIES.map(st => ({
                        name: st,
                        count: totalCounts[st] || 0,
                        colorCfg: CATEGORY_COLORS[st]
                      }))}
                    />
                  </div>

                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 space-y-2 shadow-sm">
                    <h3 className="text-xs font-mono font-black text-[#2C1E16] uppercase tracking-wider mb-2">
                      Resumo por Categoria
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_CATEGORIES.map(st => {
                        const cfg = CATEGORY_COLORS[st];
                        const count = totalCounts[st] || 0;
                        return (
                          <div key={st} className="p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DCD0] flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#3B291A] truncate max-w-[110px]" title={st}>
                              {st}
                            </span>
                            <span className="text-xs font-mono font-black px-2 py-0.5 rounded text-white" style={{ backgroundColor: cfg.main }}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SLIDE 2: VOLUMETRIC BAR CYLINDERS */}
            {currentSlide === 1 && (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                
                <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-3">
                  <div>
                    <span className="text-xs font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-1.5">
                      <Box size={14} /> SLIDE 02 / 05 — CILINDROS VOLUMÉTRICOS
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-[#2C1E16] uppercase mt-0.5 tracking-tight">
                      Gráficos Tridimensionais por Categoria
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-[#EFE8DC] border border-[#DCD1BC] text-xs font-mono text-[#5C4738]">
                    8 Categorias
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {STATUS_CATEGORIES.map(st => {
                    const val = totalCounts[st] || 0;
                    const slVal = santaLuziaCounts[st] || 0;
                    const pct = Math.round((val / (filteredIscas.length || 1)) * 100);
                    return (
                      <ThreeDBarCylinder
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

                <p className="text-xs font-mono text-[#8C6239] text-center">
                  * Topo tridimensional com perspetiva e indicador de volumetria.
                </p>

              </div>
            )}

            {/* SLIDE 3: GEOGRAPHIC MATRIX */}
            {currentSlide === 2 && (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                
                <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-3">
                  <div>
                    <span className="text-xs font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-1.5">
                      <Globe2 size={14} /> SLIDE 03 / 05 — MATRIZ GEOGRÁFICA
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-[#2C1E16] uppercase mt-0.5 tracking-tight">
                      Distribuição de Iscas por Praça & Rota
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-[#EFE8DC] border border-[#DCD1BC] text-xs font-mono text-[#5C4738]">
                    {destinationsList.length} Praças
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[380px] pr-1">
                  {destinationBreakdown.map((dest) => (
                    <div 
                      key={dest.destination}
                      className="bg-white border border-[#E5DCD0] rounded-2xl p-4 shadow-sm space-y-2.5 hover:border-[#C29B72] transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-2">
                        <span className="font-serif font-black text-sm text-[#2C1E16] uppercase tracking-tight">
                          {dest.destination}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#B32025]/10 text-[#B32025] font-mono text-xs font-bold border border-[#B32025]/30">
                          {dest.total} iscas
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {STATUS_CATEGORIES.map(st => {
                          const val = dest.counts[st] || 0;
                          if (val === 0) return null;
                          const cfg = CATEGORY_COLORS[st];
                          return (
                            <div key={st} className="flex items-center justify-between text-xs font-mono">
                              <span className="text-[#3B291A] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.main }} />
                                {st}
                              </span>
                              <span className="font-black text-[#2C1E16] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DCD0]">
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

            {/* SLIDE 4: DATA DOCK & SANTA LUZIA */}
            {currentSlide === 3 && (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                
                <div className="flex items-center justify-between border-b border-[#E5DCD0] pb-3">
                  <div>
                    <span className="text-xs font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-1.5">
                      <Cpu size={14} /> SLIDE 04 / 05 — IMPORTAR & SANTA LUZIA
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-black text-[#2C1E16] uppercase mt-0.5 tracking-tight">
                      Importação de Planilha & Santa Luzia/MG
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  
                  {/* Paste Spreadsheet Dock */}
                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 space-y-3 shadow-sm">
                    <h3 className="font-serif font-black text-sm text-[#2C1E16] uppercase flex items-center gap-2">
                      <FileSpreadsheet className="text-[#B32025]" size={16} /> Colar Células da Planilha
                    </h3>
                    <p className="text-[11px] font-mono text-[#8C7462]">
                      Copie do Excel (colunas ISCA, STATUS, DESTINO, CAVALO, NF, RESPONSÁVEL).
                    </p>
                    <textarea
                      rows={5}
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      placeholder="Cole aqui as linhas copiadas da planilha..."
                      className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl p-3 text-xs font-mono text-[#2C1E16] placeholder:text-[#A89888] focus:outline-none focus:border-[#B32025]"
                    />
                    <button
                      onClick={handleProcessPaste}
                      className="w-full py-2.5 bg-gradient-to-r from-[#B32025] to-[#800609] hover:brightness-110 text-white font-serif font-black uppercase text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles size={15} /> Importar & Atualizar Dados
                    </button>
                  </div>

                  {/* Santa Luzia List Dock */}
                  <div className="bg-white border border-[#E5DCD0] rounded-2xl p-4 space-y-3 shadow-sm">
                    <h3 className="font-serif font-black text-sm text-[#2C1E16] uppercase flex items-center gap-2">
                      <Building2 className="text-[#0284C7]" size={16} /> Iscas de Santa Luzia / MG
                    </h3>
                    <p className="text-[11px] font-mono text-[#8C7462]">
                      Números de iscas de Santa Luzia (separados por vírgula ou espaço).
                    </p>
                    <textarea
                      rows={5}
                      value={santaLuziaInput}
                      onChange={(e) => setSantaLuziaInput(e.target.value)}
                      placeholder="Ex: R100000555, R100000617, R100000755..."
                      className="w-full bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl p-3 text-xs font-mono text-[#2C1E16] placeholder:text-[#A89888] focus:outline-none focus:border-[#0284C7]"
                    />
                    <button
                      onClick={handleSaveSantaLuzia}
                      className="w-full py-2.5 bg-[#0284C7] text-white font-serif font-black uppercase text-xs rounded-xl hover:bg-[#0369a1] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Save size={15} /> Salvar Lista de Santa Luzia
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* SLIDE 5: DATABASE TABLE */}
            {currentSlide === 4 && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5DCD0] pb-3 gap-2">
                  <div>
                    <span className="text-xs font-mono font-black text-[#B32025] tracking-widest uppercase flex items-center gap-1.5">
                      <TableIcon size={14} /> SLIDE 05 / 05 — TABELA DE REGISTROS
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-black text-[#2C1E16] uppercase mt-0.5 tracking-tight">
                      Base de Dados ({iscas.length})
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7462]" size={14} />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#FAF7F2] border border-[#E5DCD0] rounded-xl py-1.5 pl-8 pr-3 text-xs text-[#2C1E16] focus:outline-none focus:border-[#B32025] w-40 font-mono"
                      />
                    </div>
                    <button
                      onClick={clearAllIscas}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#B32025] rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-1 border border-[#B32025]/30 cursor-pointer"
                    >
                      <Trash2 size={13} /> Limpar
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E5DCD0] bg-white max-h-[340px] max-w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#E5DCD0] text-[10px] font-mono text-[#8C6239] uppercase tracking-wider">
                        <th className="p-2.5">Nº Isca</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Destino</th>
                        <th className="p-2.5">Cavalo / Placa</th>
                        <th className="p-2.5">Nota Fiscal</th>
                        <th className="p-2.5">Responsável</th>
                        <th className="p-2.5 text-center">Santa Luzia?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DCD0] text-xs font-mono">
                      {iscas
                        .filter(i => 
                          i.iscaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.cavalo.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item) => {
                          const isSL = santaLuziaList.includes(item.iscaNumber);
                          const cfg = CATEGORY_COLORS[item.status] || CATEGORY_COLORS['EM PREPARAÇÃO'];
                          return (
                            <tr key={item.id} className="hover:bg-[#FAF7F2] transition-colors">
                              <td className="p-2.5 font-bold text-[#2C1E16]">{item.iscaNumber}</td>
                              <td className="p-2.5">
                                <span 
                                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white"
                                  style={{ backgroundColor: cfg.main }}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-2.5 uppercase text-[#2C1E16]">{item.destino}</td>
                              <td className="p-2.5 uppercase text-[#5C4738]">{item.cavalo}</td>
                              <td className="p-2.5 text-[#5C4738]">{item.nf}</td>
                              <td className="p-2.5 text-[#2C1E16]">{item.responsavel}</td>
                              <td className="p-2.5 text-center">
                                {isSL ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px]">SIM</span>
                                ) : (
                                  <span className="text-[#8C7462]">NÃO</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#8C6239] pt-3 border-t border-[#E5DCD0]">
              <span className="flex items-center gap-1 text-[#2C1E16] font-medium">
                <Sparkle size={12} className="text-[#B32025]" /> Café Três Corações S.A. — Relatório Executivo
              </span>
              <span>Slide {currentSlide + 1} de {slides.length} — Use ← → no teclado</span>
            </div>

          </motion.div>
        </AnimatePresence>

      </main>

    </div>
  );
}
