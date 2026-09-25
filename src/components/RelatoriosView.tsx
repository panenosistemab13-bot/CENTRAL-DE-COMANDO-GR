import React, { useState } from 'react';
import {
  FileText,
  ClipboardList,
  Truck,
  MapPin,
  FileCheck2,
  Presentation,
  Download,
  Share2,
  Sparkles
} from 'lucide-react';
import { ReportSubTab } from '../types';

import Averbacao from './Averbacao';
import Checklist from './Checklist';
import Rotas from './Rotas';
import SMCreator from './SMCreator';

interface RelatoriosViewProps {
  initialSubTab?: ReportSubTab;
  onBackToHome?: () => void;
}

export default function RelatoriosView({
  initialSubTab = 'averbacao',
  onBackToHome
}: RelatoriosViewProps) {
  const [activeTab, setActiveTab] = useState<ReportSubTab>(initialSubTab);

  const reportTabs = [
    { id: 'averbacao', label: 'Averbação de Cargas', icon: <FileCheck2 size={16} /> },
    { id: 'checklist', label: 'Checklist Veicular', icon: <ClipboardList size={16} /> },
    { id: 'rotas', label: 'Gestão de Rotas PGR', icon: <MapPin size={16} /> },
    { id: 'sm', label: 'Gerador de SM (Solicitação de Monitoramento)', icon: <FileText size={16} /> },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Navigation & Sub-tab Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-[#2c1808] text-[10px] font-black uppercase tracking-wider">
              Módulos Integrados
            </span>
            <h2 className="text-xl font-bold text-[#2c1a0e]">
              Central de Relatórios & Operações PGR
            </h2>
          </div>
          <p className="text-xs text-[#7d6b5c] mt-0.5">
            Acesse as ferramentas operacionais de conformidade, averbação, frotas e monitoramento.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#f5ede3] p-1.5 rounded-2xl border border-[#e2d5c3]">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportSubTab)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-md scale-[1.02]'
                  : 'text-[#5c493c] hover:bg-white/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Submodule Content Container (Wide 4K responsive wrapper) */}
      <div className="w-full bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] min-h-[600px] overflow-hidden">
        {activeTab === 'averbacao' && <Averbacao view="generator" onBack={onBackToHome} />}
        {activeTab === 'checklist' && <Checklist />}
        {activeTab === 'rotas' && <Rotas onBack={onBackToHome} />}
        {activeTab === 'sm' && <SMCreator onBack={onBackToHome} />}
      </div>
    </div>
  );
}
