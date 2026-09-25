import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Users,
  Layers,
  Calendar as CalendarIcon,
  MapPin,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Heart,
  Crown,
  BarChart2,
  Table as TableIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  CollaboratorProductivity,
  INITIAL_COLLABORATORS,
  loadStoredCollaborators,
  saveStoredCollaborators
} from '../data/productivityData';
import { parseSagaReportText } from '../utils/sagaPdfParser';

interface RankingProdutividadeProps {
  onBackToMenu?: () => void;
}

export default function RankingProdutividade({ onBackToMenu }: RankingProdutividadeProps) {
  // State
  const [collaborators, setCollaborators] = useState<CollaboratorProductivity[]>(() => loadStoredCollaborators());
  const [viewMode, setViewMode] = useState<'dashboard' | 'presentation3d'>('dashboard');
  const [presentationSubMode, setPresentationSubMode] = useState<'top3' | 'carousel'>('top3');
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [pastedReportText, setPastedReportText] = useState<string>('');
  const [importNotification, setImportNotification] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation for 3D presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'presentation3d') {
        if (e.key === 'ArrowRight') {
          handleNextSlide();
        } else if (e.key === 'ArrowLeft') {
          handlePrevSlide();
        } else if (e.key === 'Escape') {
          setViewMode('dashboard');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, presentationSubMode, carouselIndex, collaborators.length]);

  // Slideshow auto-play timer
  useEffect(() => {
    let timer: any = null;
    if (viewMode === 'presentation3d' && isAutoPlay) {
      timer = setInterval(() => {
        handleNextSlide();
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [viewMode, isAutoPlay, presentationSubMode, carouselIndex, collaborators.length]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleNextSlide = () => {
    if (presentationSubMode === 'top3') {
      setPresentationSubMode('carousel');
      setCarouselIndex(0);
    } else {
      setCarouselIndex(prev => (prev + 1) % collaborators.length);
    }
  };

  const handlePrevSlide = () => {
    if (presentationSubMode === 'carousel') {
      if (carouselIndex === 0) {
        setPresentationSubMode('top3');
      } else {
        setCarouselIndex(prev => (prev - 1 + collaborators.length) % collaborators.length);
      }
    } else {
      setPresentationSubMode('carousel');
      setCarouselIndex(collaborators.length - 1);
    }
  };

  // Calculations
  const totalProductivity = useMemo(() => {
    return collaborators.reduce((acc, c) => acc + c.productivity, 0);
  }, [collaborators]);

  const totalMovements = useMemo(() => {
    return collaborators.reduce((acc, c) => acc + c.movements, 0);
  }, [collaborators]);

  const totalCollaboratorsCount = collaborators.length;

  const averagePerColab = useMemo(() => {
    return totalCollaboratorsCount > 0 ? Math.round(totalProductivity / totalCollaboratorsCount) : 0;
  }, [totalProductivity, totalCollaboratorsCount]);

  const top1 = collaborators[0] || null;
  const top2 = collaborators[1] || null;
  const top3 = collaborators[2] || null;

  // Filtered collaborators for table
  const filteredCollaborators = useMemo(() => {
    return collaborators.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.rank).includes(searchTerm);
      const matchShift = filterShift === 'all' || c.shift === filterShift;
      return matchSearch && matchShift;
    });
  }, [collaborators, searchTerm, filterShift]);

  // Import handler
  const handleImportText = () => {
    if (!pastedReportText.trim()) return;
    const extracted = parseSagaReportText(pastedReportText);
    if (extracted.length === 0) {
      setImportNotification({
        show: true,
        message: 'Nenhum registro de operador reconhecido no texto informado.',
        type: 'error'
      });
      setTimeout(() => setImportNotification({ show: false, message: '', type: 'info' }), 4000);
      return;
    }

    setCollaborators(extracted);
    saveStoredCollaborators(extracted);
    setShowImportModal(false);
    setPastedReportText('');
    setImportNotification({
      show: true,
      message: `Sucesso! ${extracted.length} operadores do SAGA WMS importados com sucesso.`,
      type: 'success'
    });
    setTimeout(() => setImportNotification({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const extracted = parseSagaReportText(content);
        if (extracted.length > 0) {
          setCollaborators(extracted);
          saveStoredCollaborators(extracted);
          setShowImportModal(false);
          setImportNotification({
            show: true,
            message: `Arquivo processado: ${extracted.length} colaboradores carregados!`,
            type: 'success'
          });
          setTimeout(() => setImportNotification({ show: false, message: '', type: 'info' }), 4000);
        } else {
          setImportNotification({
            show: true,
            message: 'Não foi possível extrair dados estruturados deste arquivo. Use colar texto.',
            type: 'error'
          });
          setTimeout(() => setImportNotification({ show: false, message: '', type: 'info' }), 4000);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetToOfficialDefaults = () => {
    setCollaborators(INITIAL_COLLABORATORS);
    saveStoredCollaborators(INITIAL_COLLABORATORS);
    setImportNotification({
      show: true,
      message: 'Dados oficiais 3 Corações SAGA WMS restaurados!',
      type: 'info'
    });
    setTimeout(() => setImportNotification({ show: false, message: '', type: 'info' }), 3500);
  };

  // Sparkline mini SVG generator
  const renderSparkline = (points?: number[], color = '#3b82f6') => {
    const data = points && points.length > 0 ? points : [10, 15, 12, 18, 20, 22, 25];
    const min = Math.min(...data);
    const max = Math.max(...data) || 1;
    const width = 64;
    const height = 22;
    const step = width / (data.length - 1);

    const coords = data.map((val, i) => {
      const x = i * step;
      const normalized = (val - min) / (max - min || 1);
      const y = height - (normalized * (height - 6) + 3);
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.join(' ')}
        />
      </svg>
    );
  };

  // Max productivity for progress bar
  const maxProdValue = useMemo(() => {
    return Math.max(...collaborators.map(c => c.productivity), 1);
  }, [collaborators]);

  return (
    <div className="w-full h-full min-h-screen relative flex flex-col font-sans select-none overflow-x-hidden text-slate-800">
      
      {/* 4K Cinematic Boardroom Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/boardroom_cinema_4k.jpg"
          alt="Executive Boardroom 4K Background"
          className="w-full h-full object-cover select-none brightness-[1.03] saturate-[1.08]"
          referrerPolicy="no-referrer"
        />
        {/* Optical warm daylight bloom */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            background: 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.25) 0%, rgba(245, 240, 230, 0.45) 70%, rgba(220, 205, 185, 0.7) 100%)' 
          }} 
        />
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {importNotification.show && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-3 border text-sm font-semibold",
              importNotification.type === 'success' && "bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-600/30",
              importNotification.type === 'info' && "bg-blue-600/95 text-white border-blue-400 shadow-blue-600/30",
              importNotification.type === 'error' && "bg-rose-600/95 text-white border-rose-400 shadow-rose-600/30"
            )}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{importNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-3 sm:py-4">
        
        {/* ========================================================= */}
        {/* TOP CINEMATIC HEADER (Matches Exact Screenshots)          */}
        {/* ========================================================= */}
        <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
          
          {/* Brand & Main Title */}
          <div className="flex items-center gap-4">
            {/* 3 Corações Heart Logo */}
            <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-white/80">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#EA1D2C] via-[#FF4D4D] to-[#FF8000] flex items-center justify-center shadow-md relative">
                <Heart className="w-5 h-5 text-white fill-white" />
                <span className="absolute text-[9px] font-black text-white bottom-0.5 right-1">3</span>
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-black tracking-wider text-[#26140D]">3 CORAÇÕES</span>
                <span className="block text-[8.5px] font-medium uppercase tracking-wider text-amber-900/80">MAIS QUE CAFÉ, RELAÇÕES</span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                RANKING DE PRODUTIVIDADE
              </h1>
              <p className="text-xs font-medium text-slate-600">
                <span className="font-semibold text-slate-800">{totalCollaboratorsCount} Colaboradores</span> • Pódio 3D 4K • Navegação por Teclado (Setas ◀ ▶)
              </p>
            </div>
          </div>

          {/* Center Mode Controls: SAGA WMS + 3D / LISTA Toggle */}
          <div className="flex items-center gap-2 bg-white/85 backdrop-blur-xl p-1 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white/90">
            {/* SAGA WMS Badge */}
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-[11px] px-3.5 py-1.5 rounded-full shadow-sm tracking-wide">
              SAGA WMS
            </span>

            {/* Apresentação 3D Button */}
            <button
              id="btn-nav-apresentacao-3d"
              onClick={() => {
                setViewMode('presentation3d');
                setPresentationSubMode('top3');
              }}
              className={cn(
                "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all duration-300",
                viewMode === 'presentation3d'
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25 scale-[1.02]"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/70"
              )}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>APRESENTAÇÃO 3D (TECLADO ➔)</span>
            </button>

            {/* Modo Lista Button */}
            <button
              id="btn-nav-modo-lista"
              onClick={() => setViewMode('dashboard')}
              className={cn(
                "flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all duration-300",
                viewMode === 'dashboard'
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-[1.02]"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/70"
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>MODO LISTA</span>
            </button>
          </div>

          {/* Right Info Badges & Fullscreen */}
          <div className="flex items-center gap-2.5">
            {/* Período */}
            <div className="hidden lg:flex items-center gap-2 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/80 text-xs shadow-sm">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
              <div className="leading-none">
                <span className="block text-[8.5px] uppercase font-bold text-slate-400">PERÍODO</span>
                <span className="block font-bold text-slate-700 text-[11px]">01/09/2026 - 19/09/2026</span>
              </div>
            </div>

            {/* Site */}
            <div className="hidden sm:flex items-center gap-2 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/80 text-xs shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <div className="leading-none">
                <span className="block text-[8.5px] uppercase font-bold text-slate-400">SITE</span>
                <span className="block font-bold text-slate-700 text-[11px]">3 COR - BH</span>
              </div>
            </div>

            {/* Motivational Tag */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs font-medium italic text-slate-700 px-2">
              <span>Juntos por um futuro mais produtivo.</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-900 border border-amber-600/30 font-bold text-[11px] px-3.5 py-1.5 rounded-full transition-all shadow-sm"
              title="Alternar Tela Cheia"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'SAIR DA TELA CHEIA' : 'TELA CHEIA'}</span>
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* VIEW 1: DASHBOARD COMPLETO (Image 1)                      */}
        {/* ========================================================= */}
        {viewMode === 'dashboard' ? (
          <div className="space-y-4">
            
            {/* Top Row: Métricas Gerais + Pódio Top 3 3D + Indicadores & Ações */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              
              {/* Left Column: Métricas Gerais (Span 3) */}
              <div className="lg:col-span-3 bg-white/92 backdrop-blur-xl rounded-3xl p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-white/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">MÉTRICAS GERAIS</h2>
                        <p className="text-[10px] text-slate-500">Consolidado Operacional SAGA</p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      ONLINE
                    </span>
                  </div>

                  <div className="space-y-3 mt-2">
                    {/* Total Produtividade */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">TOTAL PRODUTIVIDADE</span>
                        <span className="text-emerald-600 text-[11px] font-bold">↑ 12,5%</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {totalProductivity.toLocaleString('pt-BR')}
                      </div>
                      <span className="text-[10px] text-slate-500">Unidades apanhadas e conferidas</span>
                    </div>

                    {/* Total Colaboradores */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">TOTAL COLABORADORES</span>
                        <span className="text-blue-600 text-[11px] font-bold">100% SAGA</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {totalCollaboratorsCount}
                      </div>
                      <span className="text-[10px] text-slate-500">{totalCollaboratorsCount} operadores no relatório oficial</span>
                    </div>

                    {/* Movimentações */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">MOVIMENTAÇÕES</span>
                        <span className="text-purple-600 text-[11px] font-bold">{totalMovements.toLocaleString('pt-BR')} ordens</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {totalMovements.toLocaleString('pt-BR')}
                      </div>
                      <span className="text-[10px] text-slate-500">Fluxo total de pallets e volumes</span>
                    </div>
                  </div>
                </div>

                {/* Footer Atividade Principal */}
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Atividade Principal:</span>
                  <span className="font-bold text-slate-800">CONF VOLUME (182.324)</span>
                </div>
              </div>

              {/* Center Column: Pódio 3D dos Líderes (Span 6) */}
              <div className="lg:col-span-6 flex flex-col items-center justify-end relative">
                
                {/* Header Tag */}
                <div className="mb-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-[11px] px-5 py-1.5 rounded-full shadow-md tracking-wider flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PÓDIO DE LÍDERES • TOP 3 EM DESTAQUE</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                {/* The 3 Podium Plaques Standing on the Table */}
                <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3.5 items-end max-w-xl mx-auto pt-4 pb-1">
                  
                  {/* 2º LUGAR: PRATA / CHROME CRYSTAL */}
                  {top2 && (
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      onClick={() => {
                        setViewMode('presentation3d');
                        setPresentationSubMode('carousel');
                        setCarouselIndex(1);
                      }}
                      className="cursor-pointer group flex flex-col items-center"
                    >
                      <div className="w-full rounded-3xl p-4 bg-gradient-to-b from-slate-50 via-white to-slate-200 border-2 border-slate-300/80 shadow-[0_15px_30px_rgba(0,0,0,0.12),inset_0_2px_4px_rgba(255,255,255,0.9)] flex flex-col items-center text-center relative overflow-hidden h-[260px] sm:h-[285px] justify-between">
                        
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none" />

                        {/* Top Rank Badge */}
                        <div className="flex flex-col items-center">
                          <Crown className="w-5 h-5 text-slate-400 mb-0.5" />
                          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 text-slate-800 font-black text-sm flex items-center justify-center shadow-inner border border-white">
                            2º
                          </div>
                        </div>

                        {/* Name & Stats */}
                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-slate-800 leading-tight uppercase line-clamp-2">
                            {top2.name}
                          </h3>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                            {top2.productivity.toLocaleString('pt-BR')}
                          </div>
                          <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">
                            TOTAL DE PRODUTIVIDADE
                          </span>
                        </div>

                        {/* Bottom movements pill */}
                        <div className="w-full bg-slate-200/80 rounded-full py-1 px-3 text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1.5 border border-slate-300">
                          <span className="w-4 h-4 rounded-full bg-slate-400 text-white flex items-center justify-center text-[9px]">2</span>
                          <span>{top2.movements.toLocaleString('pt-BR')} Movimentações</span>
                        </div>
                      </div>

                      {/* Mirror Reflection on Desk */}
                      <div className="w-[85%] h-3 bg-gradient-to-b from-slate-400/25 to-transparent blur-[3px] rounded-full mt-1" />
                    </motion.div>
                  )}

                  {/* 1º LUGAR: OURO 24K CRYSTAL (ELEVADO) */}
                  {top1 && (
                    <motion.div
                      whileHover={{ scale: 1.04, y: -6 }}
                      onClick={() => {
                        setViewMode('presentation3d');
                        setPresentationSubMode('carousel');
                        setCarouselIndex(0);
                      }}
                      className="cursor-pointer group flex flex-col items-center -mt-6 sm:-mt-8 z-10"
                    >
                      <div className="w-full rounded-3xl p-4 bg-gradient-to-b from-[#FFF2B2] via-[#FFD700] to-[#E6A100] border-2 border-[#FFE885] shadow-[0_20px_45px_rgba(230,161,0,0.35),inset_0_2px_8px_rgba(255,255,255,0.9)] flex flex-col items-center text-center relative overflow-hidden h-[300px] sm:h-[330px] justify-between">
                        
                        {/* Gold sheen ray */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none" />

                        {/* Top 1st Badge */}
                        <div className="flex flex-col items-center">
                          <Crown className="w-6 h-6 text-amber-800 drop-shadow-sm mb-0.5" />
                          <div className="w-11 h-11 rounded-full bg-gradient-to-b from-white to-amber-200 text-amber-950 font-black text-base flex items-center justify-center shadow-lg border-2 border-amber-300">
                            1º
                          </div>
                        </div>

                        {/* Name & Stats */}
                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-amber-950 leading-tight uppercase line-clamp-2">
                            {top1.name}
                          </h3>
                          <div className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight mt-1 drop-shadow-sm">
                            {top1.productivity.toLocaleString('pt-BR')}
                          </div>
                          <span className="block text-[9.5px] uppercase tracking-wider font-black text-amber-900/80">
                            TOTAL DE PRODUTIVIDADE
                          </span>
                        </div>

                        {/* Bottom movements pill */}
                        <div className="w-full bg-amber-900/20 backdrop-blur-sm rounded-full py-1.5 px-3 text-[10.5px] font-black text-amber-950 flex items-center justify-center gap-1.5 border border-amber-600/30">
                          <span className="w-4 h-4 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center text-[9px]">1</span>
                          <span>{top1.movements.toLocaleString('pt-BR')} Movimentações</span>
                        </div>
                      </div>

                      {/* Mirror Reflection on Desk */}
                      <div className="w-[90%] h-4 bg-gradient-to-b from-amber-500/35 to-transparent blur-[4px] rounded-full mt-1" />
                    </motion.div>
                  )}

                  {/* 3º LUGAR: BRONZE / COPPER CRYSTAL */}
                  {top3 && (
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      onClick={() => {
                        setViewMode('presentation3d');
                        setPresentationSubMode('carousel');
                        setCarouselIndex(2);
                      }}
                      className="cursor-pointer group flex flex-col items-center"
                    >
                      <div className="w-full rounded-3xl p-4 bg-gradient-to-b from-[#F2D1B3] via-[#D9824C] to-[#9C4B18] border-2 border-[#E8B08A] shadow-[0_15px_30px_rgba(156,75,24,0.22),inset_0_2px_4px_rgba(255,255,255,0.8)] flex flex-col items-center text-center relative overflow-hidden h-[245px] sm:h-[270px] justify-between text-white">
                        
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none" />

                        {/* Top Rank Badge */}
                        <div className="flex flex-col items-center">
                          <Crown className="w-5 h-5 text-amber-200 mb-0.5" />
                          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-white to-[#E8B08A] text-amber-950 font-black text-sm flex items-center justify-center shadow-inner border border-white">
                            3º
                          </div>
                        </div>

                        {/* Name & Stats */}
                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-white leading-tight uppercase line-clamp-2">
                            {top3.name}
                          </h3>
                          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 drop-shadow-sm">
                            {top3.productivity.toLocaleString('pt-BR')}
                          </div>
                          <span className="block text-[9px] uppercase tracking-wider font-bold text-amber-100">
                            TOTAL DE PRODUTIVIDADE
                          </span>
                        </div>

                        {/* Bottom movements pill */}
                        <div className="w-full bg-amber-950/40 rounded-full py-1 px-3 text-[10px] font-bold text-amber-100 flex items-center justify-center gap-1.5 border border-amber-400/30">
                          <span className="w-4 h-4 rounded-full bg-amber-800 text-amber-100 flex items-center justify-center text-[9px]">3</span>
                          <span>{top3.movements.toLocaleString('pt-BR')} Movimentações</span>
                        </div>
                      </div>

                      {/* Mirror Reflection on Desk */}
                      <div className="w-[85%] h-3 bg-gradient-to-b from-amber-700/25 to-transparent blur-[3px] rounded-full mt-1" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right Column: Indicadores & Ações (Span 3) */}
              <div className="lg:col-span-3 bg-white/92 backdrop-blur-xl rounded-3xl p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-white/90 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">INDICADORES & AÇÕES</h2>
                        <p className="text-[10px] text-slate-500">Desempenho & Relatórios</p>
                      </div>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      3 COR - BH
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {/* Média / Colab */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">MÉDIA / COLAB.</span>
                      <div className="text-xl font-black text-slate-900 mt-1">
                        {averagePerColab.toLocaleString('pt-BR')}
                      </div>
                      <span className="text-[9.5px] text-emerald-600 font-bold">↑ 10,2% vs meta</span>
                    </div>

                    {/* Líder SAGA */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">LÍDER SAGA</span>
                      <div className="text-sm font-black text-slate-900 mt-1 truncate">
                        {top1?.name?.split(' ')?.[0] || 'WESLLEY'} {top1?.name?.split(' ')?.[1] || 'ALAN'}
                      </div>
                      <span className="text-[10px] font-black text-amber-600">{top1?.productivity.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Período dos Dados */}
                  <div className="mt-3 bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block">PERÍODO DOS DADOS</span>
                      <span className="text-xs font-bold text-slate-800">01/09/2026 - 19/09/2026</span>
                    </div>
                  </div>
                </div>

                {/* Big Orange Button: Importar Relatório PDF / TXT SAGA */}
                <div className="mt-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block text-center mb-1">
                    GERENCIAR DADOS DO SAGA
                  </span>
                  <button
                    id="btn-importar-pdf-saga"
                    onClick={() => setShowImportModal(true)}
                    className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm py-3 px-4 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>IMPORTAR RELATÓRIO PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section: RANKING COMPLETO [3D 4K ULTRA] */}
            <div className="bg-white/92 backdrop-blur-xl rounded-3xl p-5 shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-white/90">
              
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    RANKING COMPLETO
                  </h2>
                  <span className="bg-slate-900 text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider border border-amber-400/30">
                    3D 4K ULTRA
                  </span>
                </div>

                {/* Search & Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar colaborador..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-100/90 border border-slate-200 rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 w-48 sm:w-64"
                    />
                  </div>

                  {/* Filter Shift */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 transition-all"
                    >
                      <Filter className="w-3 h-3 text-slate-500" />
                      <span>FILTROS</span>
                    </button>
                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs">
                        <div className="font-bold text-slate-400 px-2 py-1 uppercase text-[9px]">Turno</div>
                        {['all', '1º Turno', '2º Turno', '3º Turno'].map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setFilterShift(s);
                              setShowFilterDropdown(false);
                            }}
                            className={cn(
                              "w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-all",
                              filterShift === s ? "bg-amber-50 text-amber-900 font-bold" : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {s === 'all' ? 'Todos os Turnos' : s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Apresentação 3D Trigger */}
                  <button
                    onClick={() => {
                      setViewMode('presentation3d');
                      setPresentationSubMode('top3');
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all"
                  >
                    <span>APRESENTAÇÃO 3D (TECLADO ➔)</span>
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                      <th className="pb-2.5 pl-3 w-64">POSIÇÃO / COLABORADOR</th>
                      <th className="pb-2.5 px-3 min-w-[220px]">DESEMPENHO RELATIVO</th>
                      <th className="pb-2.5 px-3 text-right">TOTAL DE PRODUTIVIDADE</th>
                      <th className="pb-2.5 px-3 text-right">MOVIMENTAÇÕES</th>
                      <th className="pb-2.5 px-3 text-right">PARTICIPAÇÃO</th>
                      <th className="pb-2.5 px-3 text-center">EVOLUÇÃO</th>
                      <th className="pb-2.5 pr-3 text-right w-16">3D</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCollaborators.slice(0, 50).map((colab) => {
                      const pctOfMax = Math.min(100, Math.max(5, (colab.productivity / maxProdValue) * 100));
                      
                      // Bar Color styling matching rank
                      let barGradient = "from-blue-500 to-blue-600";
                      let badgeStyle = "bg-slate-100 text-slate-700";

                      if (colab.rank === 1) {
                        barGradient = "from-amber-400 via-amber-500 to-orange-500 shadow-[0_2px_10px_rgba(245,158,11,0.4)]";
                        badgeStyle = "bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 font-black shadow-sm";
                      } else if (colab.rank === 2) {
                        barGradient = "from-slate-400 via-slate-500 to-slate-700 shadow-[0_2px_8px_rgba(100,116,139,0.3)]";
                        badgeStyle = "bg-gradient-to-b from-slate-200 to-slate-400 text-slate-800 font-black shadow-sm";
                      } else if (colab.rank === 3) {
                        barGradient = "from-amber-600 via-amber-700 to-amber-900 shadow-[0_2px_8px_rgba(180,83,9,0.3)]";
                        badgeStyle = "bg-gradient-to-b from-amber-400 to-amber-700 text-white font-black shadow-sm";
                      }

                      return (
                        <tr
                          key={colab.id}
                          className="hover:bg-amber-50/50 transition-colors group cursor-pointer"
                          onClick={() => {
                            setViewMode('presentation3d');
                            setPresentationSubMode('carousel');
                            setCarouselIndex(colab.rank - 1);
                          }}
                        >
                          {/* Posição + Nome */}
                          <td className="py-2.5 pl-3">
                            <div className="flex items-center gap-2.5">
                              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0", badgeStyle)}>
                                {colab.rank}º
                              </div>
                              <span className="font-bold text-slate-800 tracking-tight group-hover:text-amber-900 transition-colors">
                                {colab.name}
                              </span>
                            </div>
                          </td>

                          {/* Desempenho Relativo (Barra 3D) */}
                          <td className="py-2.5 px-3">
                            <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 shadow-inner">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pctOfMax}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={cn("h-full rounded-full bg-gradient-to-r", barGradient)}
                              />
                            </div>
                          </td>

                          {/* Total Produtividade */}
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 text-sm">
                            {colab.productivity.toLocaleString('pt-BR')}
                          </td>

                          {/* Movimentações */}
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-600">
                            {colab.movements.toLocaleString('pt-BR')}
                          </td>

                          {/* Participação */}
                          <td className="py-2.5 px-3 text-right font-bold text-slate-700">
                            {colab.percentage.toFixed(2)}%
                          </td>

                          {/* Evolução Mini Chart */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                ↑ {colab.growth}%
                              </span>
                              {renderSparkline(
                                colab.sparklineData,
                                colab.rank === 1 ? '#f59e0b' : colab.rank === 2 ? '#64748b' : colab.rank === 3 ? '#b45309' : '#3b82f6'
                              )}
                            </div>
                          </td>

                          {/* 3D Action Button */}
                          <td className="py-2.5 pr-3 text-right">
                            <button
                              title="Destacar no Pódio 3D"
                              className="bg-amber-100/80 hover:bg-amber-500 hover:text-white text-amber-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-amber-200 transition-all flex items-center justify-center gap-1 ml-auto"
                            >
                              <span>3D</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Exibindo {filteredCollaborators.length} de {totalCollaboratorsCount} colaboradores</span>
                </div>
                <div className="italic text-[11px] text-slate-400">
                  Clique em qualquer colaborador para destacar no pódio 3D
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: APRESENTAÇÃO 3D CINEMATOGRÁFICA (Image 2)         */
          /* ========================================================= */
          <div className="flex-1 flex flex-col justify-between items-center py-2 relative min-h-[580px]">
            
            {/* Top Sub-Mode Toggle (PÓDIO TOP 3 ISOLADO vs CARROSSEL 1 A 1) */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl p-1 rounded-full shadow-2xl border border-white/20 mb-3 z-20">
              <button
                onClick={() => setPresentationSubMode('top3')}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-full transition-all duration-300",
                  presentationSubMode === 'top3'
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>PÓDIO TOP 3 ISOLADO</span>
              </button>

              <button
                onClick={() => setPresentationSubMode('carousel')}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold px-5 py-2 rounded-full transition-all duration-300",
                  presentationSubMode === 'carousel'
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span>CARROSSEL 1 A 1 (TODOS OS {totalCollaboratorsCount})</span>
              </button>
            </div>

            {/* Navigation Left and Right Floating Arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-2xl border border-white/30 transition-transform active:scale-95 z-30"
              title="Anterior (Seta Esquerda)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextSlide}
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-2xl border border-white/30 transition-transform active:scale-95 z-30"
              title="Próximo (Seta Direita)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Center 3D Stage Directly on Marble Desk */}
            <div className="w-full flex-1 flex items-center justify-center px-4 py-2">
              <AnimatePresence mode="wait">
                {presentationSubMode === 'top3' ? (
                  /* TOP 3 ISOLADO 3D STAGE */
                  <motion.div
                    key="top3-stage"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-4xl grid grid-cols-3 gap-4 sm:gap-8 items-end justify-center"
                  >
                    {/* 2º Lugar */}
                    {top2 && (
                      <div className="flex flex-col items-center">
                        <div className="w-full rounded-[32px] p-6 bg-gradient-to-b from-slate-100 via-white to-slate-200 border-4 border-white/90 shadow-[0_25px_50px_rgba(0,0,0,0.25),inset_0_2px_6px_rgba(255,255,255,0.95)] flex flex-col items-center text-center relative overflow-hidden h-[340px] sm:h-[380px] justify-between">
                          <div className="flex flex-col items-center">
                            <Crown className="w-7 h-7 text-slate-400 mb-1" />
                            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 text-slate-800 font-black text-lg flex items-center justify-center shadow-inner border-2 border-white">
                              2º
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-800 uppercase leading-tight line-clamp-2">
                              {top2.name}
                            </h3>
                            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                              {top2.productivity.toLocaleString('pt-BR')}
                            </div>
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
                              TOTAL DE PRODUTIVIDADE
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/90 rounded-full py-1.5 px-4 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 border border-slate-300">
                            <span className="w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[10px]">2</span>
                            <span>{top2.movements.toLocaleString('pt-BR')} Movimentações</span>
                          </div>
                        </div>
                        {/* Desk Mirror Reflection */}
                        <div className="w-[85%] h-5 bg-gradient-to-b from-slate-400/30 to-transparent blur-[5px] rounded-full mt-2" />
                      </div>
                    )}

                    {/* 1º Lugar (Center Elevated) */}
                    {top1 && (
                      <div className="flex flex-col items-center -mt-8 sm:-mt-12 z-10">
                        <div className="w-full rounded-[36px] p-7 bg-gradient-to-b from-[#FFF0A0] via-[#FFD700] to-[#E69F00] border-4 border-[#FFF5C2] shadow-[0_30px_70px_rgba(230,159,0,0.45),inset_0_2px_10px_rgba(255,255,255,0.95)] flex flex-col items-center text-center relative overflow-hidden h-[390px] sm:h-[430px] justify-between">
                          <div className="flex flex-col items-center">
                            <Crown className="w-9 h-9 text-amber-900 drop-shadow mb-1" />
                            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-white to-amber-200 text-amber-950 font-black text-2xl flex items-center justify-center shadow-xl border-2 border-amber-300">
                              1º
                            </div>
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-amber-950 uppercase leading-tight line-clamp-2">
                              {top1.name}
                            </h3>
                            <div className="text-4xl sm:text-5xl font-black text-amber-950 tracking-tight mt-2 drop-shadow">
                              {top1.productivity.toLocaleString('pt-BR')}
                            </div>
                            <span className="block text-[11px] uppercase tracking-wider font-black text-amber-900/80 mt-0.5">
                              TOTAL DE PRODUTIVIDADE
                            </span>
                          </div>
                          <div className="w-full bg-amber-950/20 backdrop-blur-sm rounded-full py-2 px-4 text-xs font-black text-amber-950 flex items-center justify-center gap-2 border border-amber-600/40">
                            <span className="w-5 h-5 rounded-full bg-amber-900 text-amber-100 flex items-center justify-center text-[10px]">1</span>
                            <span>{top1.movements.toLocaleString('pt-BR')} Movimentações</span>
                          </div>
                        </div>
                        {/* Desk Mirror Reflection */}
                        <div className="w-[90%] h-6 bg-gradient-to-b from-amber-500/45 to-transparent blur-[6px] rounded-full mt-2" />
                      </div>
                    )}

                    {/* 3º Lugar */}
                    {top3 && (
                      <div className="flex flex-col items-center">
                        <div className="w-full rounded-[32px] p-6 bg-gradient-to-b from-[#F2D1B3] via-[#D9824C] to-[#9C4B18] border-4 border-[#F5D8C2] shadow-[0_25px_50px_rgba(156,75,24,0.3),inset_0_2px_6px_rgba(255,255,255,0.85)] flex flex-col items-center text-center relative overflow-hidden h-[320px] sm:h-[360px] justify-between text-white">
                          <div className="flex flex-col items-center">
                            <Crown className="w-7 h-7 text-amber-200 mb-1" />
                            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-white to-[#E8B08A] text-amber-950 font-black text-lg flex items-center justify-center shadow-inner border-2 border-white">
                              3º
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-white uppercase leading-tight line-clamp-2">
                              {top3.name}
                            </h3>
                            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2 drop-shadow">
                              {top3.productivity.toLocaleString('pt-BR')}
                            </div>
                            <span className="block text-[10px] uppercase tracking-wider font-bold text-amber-100 mt-0.5">
                              TOTAL DE PRODUTIVIDADE
                            </span>
                          </div>
                          <div className="w-full bg-amber-950/40 rounded-full py-1.5 px-4 text-xs font-bold text-amber-100 flex items-center justify-center gap-2 border border-amber-400/30">
                            <span className="w-5 h-5 rounded-full bg-amber-800 text-amber-100 flex items-center justify-center text-[10px]">3</span>
                            <span>{top3.movements.toLocaleString('pt-BR')} Movimentações</span>
                          </div>
                        </div>
                        {/* Desk Mirror Reflection */}
                        <div className="w-[85%] h-5 bg-gradient-to-b from-amber-700/35 to-transparent blur-[5px] rounded-full mt-2" />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* CARROSSEL 1 A 1 3D STAGE */
                  <motion.div
                    key={`carousel-${carouselIndex}`}
                    initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-lg flex flex-col items-center"
                  >
                    {(() => {
                      const currentColab = collaborators[carouselIndex] || top1;
                      const isGold = currentColab.rank === 1;
                      const isSilver = currentColab.rank === 2;
                      const isBronze = currentColab.rank === 3;

                      return (
                        <>
                          <div
                            className={cn(
                              "w-full rounded-[38px] p-8 flex flex-col items-center text-center relative overflow-hidden h-[430px] justify-between shadow-2xl border-4",
                              isGold && "bg-gradient-to-b from-[#FFF2B2] via-[#FFD700] to-[#E6A100] border-[#FFEAA0] text-amber-950 shadow-amber-500/40",
                              isSilver && "bg-gradient-to-b from-slate-100 via-white to-slate-200 border-white text-slate-900 shadow-slate-500/30",
                              isBronze && "bg-gradient-to-b from-[#F2D1B3] via-[#D9824C] to-[#9C4B18] border-[#FCE8DA] text-white shadow-amber-900/40",
                              !isGold && !isSilver && !isBronze && "bg-gradient-to-b from-white via-slate-50 to-blue-50 border-white text-slate-900 shadow-blue-500/20"
                            )}
                          >
                            {/* Top Badge */}
                            <div className="flex flex-col items-center">
                              <Crown className={cn("w-8 h-8 mb-1", isGold ? "text-amber-900" : isSilver ? "text-slate-500" : isBronze ? "text-amber-200" : "text-blue-500")} />
                              <div className="w-14 h-14 rounded-full bg-white/95 text-slate-900 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white">
                                {currentColab.rank}º
                              </div>
                            </div>

                            {/* Colab Name & Big Stats */}
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-widest opacity-75">
                                {currentColab.shift || '1º Turno'} • {currentColab.category || 'OPERAÇÃO'}
                              </span>
                              <h3 className="text-xl sm:text-2xl font-black uppercase leading-tight mt-1">
                                {currentColab.name}
                              </h3>
                              <div className="text-5xl font-black tracking-tight mt-3">
                                {currentColab.productivity.toLocaleString('pt-BR')}
                              </div>
                              <span className="block text-xs uppercase tracking-wider font-bold opacity-80 mt-1">
                                TOTAL DE PRODUTIVIDADE
                              </span>
                            </div>

                            {/* Detailed Statistics Bar */}
                            <div className="w-full grid grid-cols-2 gap-2 bg-black/15 backdrop-blur-md rounded-2xl p-2.5 text-xs font-bold border border-white/20">
                              <div>
                                <span className="block text-[9.5px] uppercase opacity-75">MOVIMENTAÇÕES</span>
                                <span className="text-sm font-black">{currentColab.movements.toLocaleString('pt-BR')}</span>
                              </div>
                              <div>
                                <span className="block text-[9.5px] uppercase opacity-75">PARTICIPAÇÃO</span>
                                <span className="text-sm font-black">{currentColab.percentage.toFixed(2)}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Desk Mirror Reflection */}
                          <div className="w-[85%] h-6 bg-gradient-to-b from-black/25 to-transparent blur-[6px] rounded-full mt-2" />
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Action Pills (Image 2) */}
            <div className="flex items-center gap-3 mt-4 z-20">
              {/* Auto Play Slideshow */}
              <button
                id="btn-auto-play"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={cn(
                  "flex items-center gap-2 bg-white/90 hover:bg-white text-slate-900 font-bold text-xs px-5 py-2.5 rounded-full shadow-lg border border-white/90 transition-all",
                  isAutoPlay && "bg-amber-100 text-amber-900 border-amber-300"
                )}
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-slate-700" />}
                <span>{isAutoPlay ? 'PAUSAR SLIDESHOW' : 'AUTO PLAY SLIDESHOW'}</span>
              </button>

              {/* Ver em Modo Lista */}
              <button
                id="btn-ver-modo-lista"
                onClick={() => setViewMode('dashboard')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-blue-600/30 transition-all"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>VER EM MODO LISTA</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: IMPORTAR RELATÓRIO DO SAGA WMS (PDF / TEXTO)       */}
      {/* ========================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Importar Relatório SAGA WMS</h3>
                  <p className="text-xs text-slate-500">PDF, TXT ou colar diretamente as linhas do relatório</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 space-y-4">
              {/* File upload box */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  1. Selecionar Arquivo do Relatório (.txt ou .pdf)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt,.pdf,.csv,.doc,.docx"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer border border-slate-200 rounded-xl p-1.5"
                />
              </div>

              {/* Paste raw text box */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  2. Ou Cole os Dados do Relatório Aqui
                </label>
                <textarea
                  rows={6}
                  value={pastedReportText}
                  onChange={(e) => setPastedReportText(e.target.value)}
                  placeholder="Cole aqui o texto do relatório do SAGA WMS (ex: WESLLEY ALAN 57095 1122)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={handleResetToOfficialDefaults}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2.5 px-3.5 rounded-xl transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrão 3 Corações</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 py-2.5 px-4 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportText}
                  disabled={!pastedReportText.trim()}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md disabled:opacity-50 disabled:pointer-events-none transition-all"
                >
                  Processar Relatório
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
