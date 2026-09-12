import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Route, 
  MapPin, 
  Clock, 
  Search, 
  Truck, 
  ArrowRight,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RotaCard {
  id: string;
  origem: string;
  destino: string;
  distanciaKm: number;
  tempoEstimado: string;
  pedagios: string;
  paradasObrigatorias: string;
  risco: 'Baixo' | 'Médio' | 'Alto';
}

const SAMPLE_ROTAS: RotaCard[] = [
  { id: '1', origem: 'Santa Luzia - MG', destino: 'Guarulhos - SP', distanciaKm: 580, tempoEstimado: '08h 30min', pedagios: 'R$ 142,00 (Sem Parar)', paradasObrigatorias: 'Posto Graal Perdões (PGR)', risco: 'Médio' },
  { id: '2', origem: 'Santa Luzia - MG', destino: 'Sumaré - SP', distanciaKm: 610, tempoEstimado: '09h 15min', pedagios: 'R$ 158,50 (Sem Parar)', paradasObrigatorias: 'Posto Sakamoto (PGR)', risco: 'Baixo' },
  { id: '3', origem: 'Santa Luzia - MG', destino: 'Pinhais - PR', distanciaKm: 1040, tempoEstimado: '15h 00min', pedagios: 'R$ 280,00 (Sem Parar)', paradasObrigatorias: 'Régis Bittencourt Km 420', risco: 'Alto' },
  { id: '4', origem: 'Santa Luzia - MG', destino: 'Campo Grande - MS', distanciaKm: 1450, tempoEstimado: '22h 30min', pedagios: 'R$ 310,00', paradasObrigatorias: 'Posto Trevão Araxá', risco: 'Alto' }
];

export default function MobileRotas({ onBack }: { onBack?: () => void }) {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_ROTAS.filter(r => 
    r.origem.toLowerCase().includes(search.toLowerCase()) || 
    r.destino.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#0d0603] text-[#f5ebd6] select-none pb-28">
      <div className="px-4 pt-3 space-y-3.5 max-w-full overflow-x-hidden">
        {/* HEADER */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-stone-900 via-[#261308] to-[#1a0c05] border border-amber-500/30 p-4 shadow-xl">
          <span className="text-[9px] font-mono uppercase text-amber-400 block mb-0.5">
            Logística & Rotas
          </span>
          <h3 className="text-base font-sans font-black text-white uppercase flex items-center gap-1.5">
            <Route size={18} className="text-amber-500" />
            <span>Rotas & Pontos de Parada</span>
          </h3>
          <p className="text-xs text-[#c2a67e] mt-1">
            Distâncias, previsão de trânsito e postos credenciados de parada PGR.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c2a67e]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por destino ou cidade..."
            className="w-full bg-[#160a04] text-[#f5ebd6] placeholder-[#c2a67e]/60 text-xs rounded-2xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* ROTAS CARDS */}
        <div className="space-y-3">
          {filtered.map(rota => (
            <div
              key={rota.id}
              className="w-full rounded-3xl bg-gradient-to-br from-[#1e0e06] to-[#120703] border border-amber-500/20 p-4 shadow-xl"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-black/50 text-[10px] font-mono text-amber-300 border border-amber-500/30">
                  {rota.distanciaKm} KM
                </span>

                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider border",
                  rota.risco === 'Alto'
                    ? "bg-rose-950 text-rose-300 border-rose-500/30"
                    : rota.risco === 'Médio'
                    ? "bg-amber-950 text-amber-300 border-amber-500/30"
                    : "bg-emerald-950 text-emerald-300 border-emerald-500/30"
                )}>
                  Risco {rota.risco}
                </span>
              </div>

              {/* Origin -> Destination */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-white font-bold">{rota.origem}</span>
                <ArrowRight size={14} className="text-[#c2a67e]" />
                <span className="text-xs font-mono text-amber-300 font-black">{rota.destino}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3 bg-black/30 p-2.5 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[#c2a67e] block">Tempo Estimado</span>
                  <span className="text-white font-bold">{rota.tempoEstimado}</span>
                </div>
                <div>
                  <span className="text-[#c2a67e] block">Pedágios Aprox.</span>
                  <span className="text-white font-bold">{rota.pedagios}</span>
                </div>
              </div>

              <div className="text-[11px] text-[#c2a67e] flex items-start gap-1.5 pt-1 border-t border-white/10">
                <MapPin size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Ponto PGR:</strong> {rota.paradasObrigatorias}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
