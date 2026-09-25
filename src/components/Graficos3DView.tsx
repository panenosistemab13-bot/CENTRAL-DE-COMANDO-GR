import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  PieChart,
  Layers,
  Award,
  Calendar,
  Filter,
  Download,
  RotateCcw,
  Zap,
  Coffee,
  CheckCircle2
} from 'lucide-react';
import { PremiumBarChart, PremiumDonutChart, PremiumLineChart } from './charts';
import { INITIAL_PERFORMANCE_30_DAYS, INITIAL_PRODUCT_DISTRIBUTION } from '../data/coffeeData';

export default function Graficos3DView() {
  const [activeMetric, setActiveMetric] = useState<'volume' | 'financeiro' | 'qualidade' | 'eficiencia'>('volume');
  const [selectedRegion, setSelectedRegion] = useState<string>('todos');
  const [chartAngle, setChartAngle] = useState<number>(15);

  // Cupping SCA Quality Radar Scores (80+ Especial / Gourmet)
  const cuppingScores = [
    { attribute: 'Aroma & Fragrância', score: 8.75, max: 10, note: 'Notas florais de jasmim e caramelo tostado' },
    { attribute: 'Sabor & Acidez', score: 8.90, max: 10, note: 'Acidez cítrica brilhante e corpo sedoso' },
    { attribute: 'Corpo & Textura', score: 9.10, max: 10, note: 'Aveludado, cremoso, persistente no paladar' },
    { attribute: 'Finalização', score: 8.85, max: 10, note: 'Retrogosto limpo com notas de cacau fino' },
    { attribute: 'Doçura Residual', score: 9.00, max: 10, note: 'Doçura natural de cana-de-açúcar e mel' },
    { attribute: 'Equilíbrio Geral (SCA)', score: 88.6, max: 100, note: 'Certificação Q-Grader Especial Reserva' },
  ];

  // Financial Breakdown by Channel
  const channelData = [
    { channel: 'Grandes Redes Varejo (Supermercados)', value: 2450000, percentage: 57.5, color: '#f59e0b' },
    { channel: 'Exportação & Portos (Café Verde / Grãos)', value: 1120000, percentage: 26.3, color: '#06b6d4' },
    { channel: 'Rede Própria & Cafeterias Parceiras', value: 480000, percentage: 11.3, color: '#10b981' },
    { channel: 'E-commerce & Linha Colecionável', value: 208900, percentage: 4.9, color: '#8b5cf6' }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Studio Control Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#e8ded0] shadow-[0_10px_30px_rgba(45,28,14,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-[#2c1808] text-[10px] font-black uppercase tracking-wider">
              Cinema 3D 4K
            </span>
            <h2 className="text-xl font-bold text-[#2c1a0e]">
              Central de Gráficos & BI Tridimensional
            </h2>
          </div>
          <p className="text-xs text-[#7d6b5c] mt-1">
            Visualizações volumétricas de produção, safras, qualidade SCA e performance de vendas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-[#f4ece1] p-1 rounded-xl border border-[#e2d5c3]">
            <button
              onClick={() => setActiveMetric('volume')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetric === 'volume'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-[#5c493c] hover:text-[#2c1808]'
              }`}
            >
              Volume & Safra
            </button>
            <button
              onClick={() => setActiveMetric('qualidade')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetric === 'qualidade'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-[#5c493c] hover:text-[#2c1808]'
              }`}
            >
              Qualidade SCA
            </button>
            <button
              onClick={() => setActiveMetric('financeiro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetric === 'financeiro'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-[#5c493c] hover:text-[#2c1808]'
              }`}
            >
              Financeiro
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#faf6ef] border border-[#d4a373] text-[#2c1808] text-xs font-bold transition-colors shadow-xs"
          >
            <Download size={14} className="text-amber-700" />
            Exportar 4K
          </button>
        </div>
      </div>

      {/* Main 3D Cinema Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Big Stage (8 cols): Interactive Volumetric 3D Cylinder Arena */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0e8db] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-amber-800">
                    <BarChart3 size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2c1a0e]">
                    Evolução Tridimensional de Produção e Vendas
                  </h3>
                  <span className="text-xs text-[#8c7866]">
                    Cilindros volumétricos com sombreamento dinâmico e nó de dispersão
                  </span>
                </div>
              </div>

              {/* Quick 3D Tilt Slider */}
              <div className="flex items-center gap-2 bg-[#faf6ef] px-3 py-1.5 rounded-xl border border-[#e8ded0]">
                <RotateCcw size={13} className="text-amber-800" />
                <span className="text-[11px] font-bold text-[#5c493c]">Inclinação 3D:</span>
                <input
                  type="range"
                  min="5"
                  max="35"
                  value={chartAngle}
                  onChange={(e) => setChartAngle(Number(e.target.value))}
                  className="w-20 accent-amber-600 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-[#2c1a0e]">{chartAngle}°</span>
              </div>
            </div>

            {/* Modern High-End Executive Line Area Chart Render */}
            <div className="py-2">
              <PremiumLineChart
                data={INITIAL_PERFORMANCE_30_DAYS.map(d => ({
                  day: d.dateLabel,
                  Produção: d.producaoKg,
                  Vendas: d.vendasKg
                }))}
                xKey="day"
                lines={[
                  { key: 'Produção', name: 'Produção (kg)', color: '#9b1526' },
                  { key: 'Vendas', name: 'Vendas (kg)', color: '#dfb15b' }
                ]}
                height={260}
                unit="kg"
              />
            </div>
          </div>

          {/* Bottom Live Metrics Highlights */}
          <div className="mt-6 pt-4 border-t border-[#f0e8db] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#faf6ef] p-3 rounded-xl border border-[#e8ded0]">
              <span className="text-[10px] font-bold text-[#8c7866] uppercase">Pico Produção</span>
              <strong className="text-sm font-black text-[#2c1a0e] font-mono block mt-0.5">48.900 kg</strong>
              <span className="text-[10px] text-emerald-600 font-bold">18/09/2026</span>
            </div>
            <div className="bg-[#faf6ef] p-3 rounded-xl border border-[#e8ded0]">
              <span className="text-[10px] font-bold text-[#8c7866] uppercase">Pico Vendas</span>
              <strong className="text-sm font-black text-[#2c1a0e] font-mono block mt-0.5">44.500 kg</strong>
              <span className="text-[10px] text-cyan-600 font-bold">18/09/2026</span>
            </div>
            <div className="bg-[#faf6ef] p-3 rounded-xl border border-[#e8ded0]">
              <span className="text-[10px] font-bold text-[#8c7866] uppercase">Média Diária</span>
              <strong className="text-sm font-black text-[#2c1a0e] font-mono block mt-0.5">34.200 kg</strong>
              <span className="text-[10px] text-amber-700 font-bold">Estável</span>
            </div>
            <div className="bg-[#faf6ef] p-3 rounded-xl border border-[#e8ded0]">
              <span className="text-[10px] font-bold text-[#8c7866] uppercase">Atingimento</span>
              <strong className="text-sm font-black text-emerald-600 font-mono block mt-0.5">108,4%</strong>
              <span className="text-[10px] text-emerald-700 font-bold">Meta Superada</span>
            </div>
          </div>
        </div>

        {/* Right Stage (4 cols): 3D Quality SCA & Mix */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: 3D Donut Mix */}
          <div className="bg-white rounded-3xl p-5 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8db] mb-3">
              <div className="flex items-center gap-2">
                <PieChart size={17} className="text-amber-800" />
                <h4 className="text-sm font-bold text-[#2c1a0e]">Mix de Portfólio 3D</h4>
              </div>
            </div>

            <div className="py-2">
              <PremiumDonutChart
                data={INITIAL_PRODUCT_DISTRIBUTION.map(p => ({
                  name: p.name,
                  value: p.percentage,
                  color: p.color
                }))}
                height={180}
                unit="%"
                centerLabel="Portfólio"
                centerValue="100%"
                showLegend={false}
              />
            </div>

            <div className="space-y-2 mt-2">
              {INITIAL_PRODUCT_DISTRIBUTION.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-[#f8f4ed] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-[#4a392b]">{p.name}</span>
                  </div>
                  <strong className="font-mono font-bold text-[#2c1a0e]">{p.percentage}%</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Card: SCA Coffee Cupping Specialty Score */}
          <div className="bg-white rounded-3xl p-5 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8db] mb-3">
              <div className="flex items-center gap-2">
                <Award size={17} className="text-amber-800" />
                <h4 className="text-sm font-bold text-[#2c1a0e]">Classificação SCA (Laudo)</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-black text-xs">
                88.6 pts
              </span>
            </div>

            <div className="space-y-3">
              {cuppingScores.slice(0, 4).map((c) => (
                <div key={c.attribute}>
                  <div className="flex justify-between text-xs font-bold text-[#2c1a0e] mb-1">
                    <span>{c.attribute}</span>
                    <span className="font-mono text-amber-800">{c.score} / {c.max}</span>
                  </div>
                  <div className="w-full bg-[#f0e8db] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-700 h-full rounded-full"
                      style={{ width: `${(c.score / c.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#8c7866] mt-0.5 block">{c.note}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Revenue Breakdown by Channel */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)]">
        <h3 className="text-base font-bold text-[#2c1a0e] mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-amber-700" />
          Distribuição Financeira por Canal de Distribuição
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelData.map((c) => (
            <div key={c.channel} className="p-4 rounded-2xl bg-[#faf6ef] border border-[#e8ded0] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#7d6b5c] block leading-tight mb-2">
                  {c.channel}
                </span>
                <strong className="text-lg font-black text-[#2c1a0e] font-mono block">
                  R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="mt-3 pt-2 border-t border-[#e8ded0] flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700">Participação:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-mono font-bold text-xs">
                  {c.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
