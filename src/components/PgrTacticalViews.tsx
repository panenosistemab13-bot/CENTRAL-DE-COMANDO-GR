import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  CheckCircle2,
  Radio,
  Truck,
  Shield,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  FileSpreadsheet,
  Download,
  Filter
} from 'lucide-react';

interface TacticalViewProps {
  view: 'alertas' | 'relatorios' | 'monitoramento';
  onBack: () => void;
}

export default function PgrTacticalViews({ view, onBack }: TacticalViewProps) {
  if (view === 'alertas') {
    return (
      <div className="w-full flex flex-col gap-4 text-slate-100 animate-in fade-in duration-300">
        <div className="flex items-center justify-between p-4 pgr-glass-card rounded-2xl border border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl pgr-prism-red flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wide">
                Central de Alertas & Ocorrências 8K
              </h2>
              <p className="text-xs text-slate-400">
                Detecção antecipada de sinistros, bloqueios e anomalias em rotas ativas.
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
          >
            ← Voltar ao Início
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="pgr-glass-card p-4 rounded-2xl border border-red-500/30">
            <span className="text-xs font-bold text-red-400 uppercase">Críticos Ativos</span>
            <div className="text-3xl font-black text-white mt-1">5</div>
            <p className="text-[10px] text-slate-400 mt-1">Requer intervenção imediata da torre</p>
          </div>
          <div className="pgr-glass-card p-4 rounded-2xl border border-amber-500/30">
            <span className="text-xs font-bold text-amber-400 uppercase">Moderados em Análise</span>
            <div className="text-3xl font-black text-white mt-1">12</div>
            <p className="text-[10px] text-slate-400 mt-1">Monitoramento por telemetria e satélite</p>
          </div>
          <div className="pgr-glass-card p-4 rounded-2xl border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400 uppercase">Baixos / Preventivos</span>
            <div className="text-3xl font-black text-white mt-1">28</div>
            <p className="text-[10px] text-slate-400 mt-1">Rotinas de pátio e checklist regular</p>
          </div>
        </div>

        <div className="pgr-glass-card rounded-2xl p-4 border border-cyan-500/20">
          <h3 className="text-sm font-black uppercase text-slate-200 mb-3">Histórico Recente de Ocorrências</h3>
          <div className="flex flex-col gap-2.5">
            {[
              { id: '1', level: 'CRÍTICO', title: 'Vazamento de fluido na baia 04', loc: 'Unidade Santa Luzia MG', time: 'Há 2 horas', status: 'Equipe de contenção mobilizada' },
              { id: '2', level: 'CRÍTICO', title: 'Queda de barreira na Rodovia BR-381', loc: 'Km 420 - Trecho Betim', time: 'Há 3 horas', status: 'Rota alternativa despachada' },
              { id: '3', level: 'MODERADO', title: 'Neblina e velocidade restrita (<40km/h)', loc: 'Serra do Cafezal SP/MG', time: 'Há 4 horas', status: 'Macro de alerta enviada aos condutores' },
              { id: '4', level: 'MODERADO', title: 'Atraso em janela de descarga fiscal', loc: 'Filial Pouso Alegre MG', time: 'Há 5 horas', status: 'Reprogramação de escala solicitada' },
              { id: '5', level: 'BAIXO', title: 'Checklist de tacógrafo e periféricos', loc: 'Unidade Rio de Janeiro RJ', time: 'Há 6 horas', status: 'Concluído com 100% de conformidade' },
            ].map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider ${
                    item.level === 'CRÍTICO' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    item.level === 'MODERADO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {item.level}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[10px] text-slate-400">{item.loc} • {item.status}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'relatorios') {
    return (
      <div className="w-full flex flex-col gap-4 text-slate-100 animate-in fade-in duration-300">
        <div className="flex items-center justify-between p-4 pgr-glass-card rounded-2xl border border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl pgr-prism-cyan flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wide">
                Relatórios & Indicadores Gerenciais PGR
              </h2>
              <p className="text-xs text-slate-400">
                Consolidado de KPIs de segurança, tempos de resposta e conformidade operacional.
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
          >
            ← Voltar ao Início
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="pgr-glass-card p-4 rounded-2xl border border-emerald-500/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Índice de Conformidade</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">93.4%</div>
            <span className="text-[10px] text-emerald-500 font-bold">↑ +2.8% no trimestre</span>
          </div>
          <div className="pgr-glass-card p-4 rounded-2xl border border-cyan-500/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tempo Médio Resposta</span>
            <div className="text-3xl font-black text-cyan-300 mt-1">12 min</div>
            <span className="text-[10px] text-cyan-400 font-bold">Meta batida (&lt;15 min)</span>
          </div>
          <div className="pgr-glass-card p-4 rounded-2xl border border-amber-500/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Vistorias Realizadas</span>
            <div className="text-3xl font-black text-amber-300 mt-1">1.248</div>
            <span className="text-[10px] text-slate-400">Total acumulado mês</span>
          </div>
          <div className="pgr-glass-card p-4 rounded-2xl border border-blue-500/30">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Frotas Monitoradas</span>
            <div className="text-3xl font-black text-blue-400 mt-1">100%</div>
            <span className="text-[10px] text-blue-300">Rastreadores homologados</span>
          </div>
        </div>
      </div>
    );
  }

  // monitoramento view
  return (
    <div className="w-full flex flex-col gap-4 text-slate-100 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 pgr-glass-card rounded-2xl border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl pgr-prism-cyan flex items-center justify-center">
            <Radio size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase text-white tracking-wide">
              Torre de Telemetria & Monitoramento 24h
            </h2>
            <p className="text-xs text-slate-400">
              Rastreamento em tempo real de cavalos, carretas, sensores de porta e iscas ativas.
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
        >
          ← Voltar ao Início
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="pgr-glass-card p-4 rounded-2xl border border-cyan-500/20">
          <span className="text-xs font-bold text-cyan-400 uppercase">Veículos em Trânsito</span>
          <div className="text-3xl font-black text-white mt-1">142</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sinais recebidos a cada 60s</p>
        </div>
        <div className="pgr-glass-card p-4 rounded-2xl border border-emerald-500/20">
          <span className="text-xs font-bold text-emerald-400 uppercase">Em Pátio / Carga</span>
          <div className="text-3xl font-black text-white mt-1">38</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Janelas de agendamento ativas</p>
        </div>
        <div className="pgr-glass-card p-4 rounded-2xl border border-amber-500/20">
          <span className="text-xs font-bold text-amber-400 uppercase">Paradas Programadas</span>
          <div className="text-3xl font-black text-white mt-1">16</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Pontos de apoio certificados PGR</p>
        </div>
      </div>
    </div>
  );
}
