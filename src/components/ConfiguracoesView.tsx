import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Database,
  Building,
  User,
  Bell,
  Sliders,
  CheckCircle2,
  Lock,
  Save,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface ConfiguracoesViewProps {
  user?: UserProfile;
}

export default function ConfiguracoesView({
  user = {
    name: 'Jefferson Augusto',
    role: 'Sistema Web',
    site: '3 COR - BH',
    email: 'jefferson@3coracoes.com.br'
  }
}: ConfiguracoesViewProps) {
  const [activeSite, setActiveSite] = useState(user.site);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [telemetryAutoSync, setTelemetryAutoSync] = useState(true);
  const [cinematicMode, setCinematicMode] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-amber-800">
              <Settings size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2c1a0e]">
              Configurações do Sistema & Preferências
            </h2>
            <p className="text-xs text-[#7d6b5c]">
              Personalize unidades operacionais, parâmetros de telemetria 3D e integrações em tempo real.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <Save size={15} />
          Salvar Alterações
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 font-bold text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600" />
          Configurações salvas e sincronizadas com sucesso no servidor!
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box 1: Unidade Operacional & Site */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0e8db]">
            <Building className="text-amber-800" size={20} />
            <h3 className="text-base font-bold text-[#2c1a0e]">Unidade / Site Operacional</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-[#4a392b] block mb-1">Site Principal Conectado</label>
              <select
                value={activeSite}
                onChange={(e) => setActiveSite(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#faf6ef] border border-[#e8ded0] font-bold text-[#2c1a0e] focus:outline-none focus:border-amber-600"
              >
                <option value="3 COR - BH">3 COR - BH (Belo Horizonte - Minas Gerais)</option>
                <option value="Matriz - São Paulo">Matriz - São Paulo (CD Central)</option>
                <option value="CD Varginha - Sul de Minas">CD Varginha - Sul de Minas (Armazém Geral)</option>
                <option value="Porto de Santos - Exportação">Porto de Santos - Terminal de Exportação</option>
                <option value="Unidade Manhuaçu - Matas de Minas">Unidade Manhuaçu - Matas de Minas</option>
              </select>
            </div>

            <div className="p-3 bg-[#fdfbf7] rounded-xl border border-[#f0e8db]">
              <span className="text-[11px] text-[#7d6b5c] block">
                As consultas de estoque, faturamento e rastreamento da frota serão filtradas prioritariamente por esta unidade.
              </span>
            </div>
          </div>
        </div>

        {/* Box 2: Perfil do Usuário */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0e8db]">
            <User className="text-amber-800" size={20} />
            <h3 className="text-base font-bold text-[#2c1a0e]">Perfil de Acesso</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-[#4a392b] block mb-1">Nome do Operador</label>
              <input
                type="text"
                defaultValue={user.name}
                className="w-full p-2.5 rounded-xl bg-[#faf6ef] border border-[#e8ded0] font-bold text-[#2c1a0e]"
              />
            </div>
            <div>
              <label className="font-bold text-[#4a392b] block mb-1">E-mail Corporativo</label>
              <input
                type="email"
                defaultValue={user.email}
                className="w-full p-2.5 rounded-xl bg-[#faf6ef] border border-[#e8ded0] font-mono text-[#2c1a0e]"
              />
            </div>
          </div>
        </div>

        {/* Box 3: Experiência Visual 3D 4K */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0e8db]">
            <Sparkles className="text-amber-800" size={20} />
            <h3 className="text-base font-bold text-[#2c1a0e]">Motor de Renderização Tridimensional</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#faf6ef] border border-[#e8ded0] cursor-pointer">
              <div>
                <strong className="block text-[#2c1a0e]">Gráficos Volumétricos em 3D Cinema</strong>
                <span className="text-[11px] text-[#7d6b5c]">Habilita sombreamento, cilindros 3D e radar com relevo topográfico</span>
              </div>
              <input
                type="checkbox"
                checked={cinematicMode}
                onChange={(e) => setCinematicMode(e.target.checked)}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#faf6ef] border border-[#e8ded0] cursor-pointer">
              <div>
                <strong className="block text-[#2c1a0e]">Sincronização Telemetria em Tempo Real</strong>
                <span className="text-[11px] text-[#7d6b5c]">Atualizar coordenadas de veículos a cada 15 segundos</span>
              </div>
              <input
                type="checkbox"
                checked={telemetryAutoSync}
                onChange={(e) => setTelemetryAutoSync(e.target.checked)}
                className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Box 4: Segurança & Banco de Dados */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f0e8db]">
            <Database className="text-amber-800" size={20} />
            <h3 className="text-base font-bold text-[#2c1a0e]">Conexão e Armazenamento</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span className="font-bold text-emerald-900">Nuvem Firebase Conectada</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 font-bold">Latência: 18ms</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#faf6ef] rounded-xl border border-[#e8ded0]">
              <span className="text-[#5c493c] font-semibold">Último Backup de Averbações</span>
              <span className="font-mono font-bold text-[#2c1a0e]">Hoje • 10:21:44</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
