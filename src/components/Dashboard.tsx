import React, { useState, useEffect } from 'react';
import { 
  Maximize, Minimize, Upload, Users, Award, TrendingUp, Filter, Search
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-canvas p-6 font-sans text-text-main flex flex-col gap-6">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">RANKING DE PRODUTIVIDADE</h1>
          <p className="text-text-muted text-sm">66 Colaboradores • Pódio 3D 4K</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleFullScreen}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-white/10 rounded-lg hover:bg-slate-700 transition"
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
            {isFullScreen ? "SAIR DA TELA CHEIA" : "TELA CHEIA"}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-4 gap-6 flex-1">
        {/* Placeholder for Metrics/Podium/Indicators */}
        <div className="col-span-4 bg-card p-6 rounded-2xl border border-white/5 h-64 flex items-center justify-center">
            <p className="text-text-muted">Podium & Métricas (Placeholder)</p>
        </div>
        
        {/* Ranking Table */}
        <div className="col-span-4 dashboard-card p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold">RANKING COMPLETO</h2>
            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-white/5"><Search size={16}/> Buscar</button>
                <button className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-white/5"><Filter size={16}/> Filtros</button>
            </div>
          </div>
          <div className="text-text-muted">Tabela de ranking (Placeholder)</div>
        </div>
      </div>
    </div>
  );
}
