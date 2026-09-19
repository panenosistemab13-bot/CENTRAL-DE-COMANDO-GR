import React, { useState, useMemo } from 'react';
import { 
  Maximize2, 
  Download, 
  MapPin, 
  BarChart3, 
  Building2, 
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BrazilMapHUD } from './BrazilMapHUD';
import { StatusAnalyticsHUD } from './StatusAnalyticsHUD';
import { StatusDetailHUD } from './StatusDetailHUD';
import { DestinoRankingHUD } from './DestinoRankingHUD';
import { UnidadeAnalyticsHUD } from './UnidadeAnalyticsHUD';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { FilterPanel3D } from './3d/FilterPanel3D';
import { Modal3D } from './3d/Modal3D';

export interface IscaDataRow {
  id: string;
  idIsca: string;
  destino: string;
  status: string;
  obs1: string;
  dataStatus: string;
  carreta: string;
  cavalo: string;
  motorista: string;
  unidade: string;
}

export type ActiveTabType = 'status' | 'destinos' | 'unidade' | 'import';

export default function Slides() {
  const [data, setData] = useState<IscaDataRow[]>(() => {
    const saved = localStorage.getItem('slides_data');
    return saved ? JSON.parse(saved) : [];
  });
  
  React.useEffect(() => {
    localStorage.setItem('slides_data', JSON.stringify(data));
  }, [data]);
  
  const [activeTab, setActiveTab] = useState<ActiveTabType>('status');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(
      r =>
        r.idIsca.toLowerCase().includes(term) ||
        r.destino.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term) ||
        r.motorista.toLowerCase().includes(term) ||
        r.unidade.toLowerCase().includes(term) ||
        r.cavalo.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const handleImportText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    const lines = pastedText.split(/\r?\n/).filter(l => l.trim() !== '');
    const newRows: IscaDataRow[] = lines.map((line, idx) => {
      const parts = line.split(/\t|;/).map(p => p.trim());
      return {
        id: `isca_${Date.now()}_${idx}`,
        idIsca: parts[0] || `ISC-${idx}`,
        destino: parts[1] || 'GUARULHOS-SP',
        status: parts[2] || 'Em Rota Ida',
        obs1: parts[3] || '',
        dataStatus: parts[4] || new Date().toLocaleDateString('pt-BR'),
        carreta: parts[5] || '',
        cavalo: parts[6] || '',
        motorista: parts[7] || '',
        unidade: parts[8] || 'SANTA LUZIA'
      };
    });

    const updated = [...data, ...newRows];
    setData(updated);
    setPastedText('');
    setShowImportModal(false);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER BAR */}
      <GlassPanel3D className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" variant="glow">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="led-status led-status-blue" />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400">
              PGR COMMAND CENTER 3D • TELA DE APRESENTACAO CINEMATOGRAFICA 4K
            </span>
          </div>
          <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Maximize2 size={24} className="text-sky-400" />
            CENTRAL DE MUDANÇA E TELEMETRIA OPERACIONAL
          </h1>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus size={16} /> IMPORTAR DADOS DE SLIDE
        </button>
      </GlassPanel3D>

      {/* SUB TAB SELECTOR */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800/80">
        {[
          { id: 'status', label: 'Visão Geral & Mapa 3D', icon: MapPin },
          { id: 'destinos', label: 'Ranking por Destino', icon: BarChart3 },
          { id: 'unidade', label: 'Analytics por Unidade', icon: Building2 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer",
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

      {/* SEARCH AND FILTER BAR */}
      <FilterPanel3D
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Pesquisar isca, destino, cavalo, motorista..."
      />

      {/* VIEW: STATUS & MAP */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HUDPanel title="Mapa Tático de Dispositivos e Unidades" badge="BRASIL MAP">
            <BrazilMapHUD data={filteredData} />
          </HUDPanel>
          <HUDPanel title="Analytics de Status Operacional" badge="STATUS HUD">
            <StatusAnalyticsHUD data={filteredData} />
          </HUDPanel>
        </div>
      )}

      {/* VIEW: DESTINOS */}
      {activeTab === 'destinos' && (
        <HUDPanel title="Análise e Ranking de Dispositivos por Destino" badge="DESTINOS">
          <DestinoRankingHUD data={filteredData} />
        </HUDPanel>
      )}

      {/* VIEW: UNIDADE */}
      {activeTab === 'unidade' && (
        <HUDPanel title="Análise de Telemetria por Unidade Operacional" badge="UNIDADES">
          <UnidadeAnalyticsHUD data={filteredData} />
        </HUDPanel>
      )}

      {/* IMPORT MODAL */}
      <Modal3D
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importar Dados de Iscas / Slides"
      >
        <form onSubmit={handleImportText} className="flex flex-col gap-4 font-mono text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Cole a tabela do Excel / TSV:</label>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="IDIsca	Destino	Status	Obs	DataStatus	Carreta	Cavalo	Motorista	Unidade"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-sky-400 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md cursor-pointer"
            >
              Processar Dados
            </button>
          </div>
        </form>
      </Modal3D>

    </div>
  );
}
