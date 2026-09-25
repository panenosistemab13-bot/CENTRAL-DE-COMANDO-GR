import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  MapPin,
  TrendingUp,
  Phone,
  Mail,
  Award,
  Building,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { TopClient } from '../types';

interface ClientesViewProps {
  clients: TopClient[];
  onSelectClient?: (client: TopClient) => void;
  onBack?: () => void;
}

export default function ClientesView({
  clients,
  onSelectClient,
  onBack
}: ClientesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<TopClient | null>(null);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Portfolio Summary */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-amber-800">
              <Users size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2c1a0e]">
              Carteira de Clientes & CRM Estratégico
            </h2>
            <p className="text-xs text-[#7d6b5c]">
              Gestão de relacionamento, histórico de compras, crédito e distribuição geográfica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente ou cidade..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[#faf6ef] border border-[#e8ded0] text-xs font-semibold text-[#2c1a0e] focus:outline-none focus:border-amber-600 w-64"
            />
          </div>

          <button
            onClick={() => alert('Abrindo formulário de Novo Cliente')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md hover:bg-amber-700 transition-all"
          >
            <Plus size={15} />
            Cadastrar Cliente
          </button>
        </div>
      </div>

      {/* Grid of Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => (
          <div
            key={client.rank}
            onClick={() => setSelectedClient(client)}
            className="bg-white rounded-3xl p-5 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] hover:shadow-[0_15px_35px_rgba(45,28,14,0.12)] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Card Header: Rank Badge & Client Details */}
              <div className="flex items-start justify-between pb-3 border-b border-[#f0e8db] mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={client.avatarUrl || '/hero-podium-coffee.jpg'}
                      alt={client.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-[#2c1808] font-black text-[10px] flex items-center justify-center shadow">
                      #{client.rank}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#2c1a0e] group-hover:text-amber-700 transition-colors">
                      {client.name}
                    </h3>
                    <span className="text-[11px] text-[#8c7866] flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-amber-700" />
                      {client.city}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <TrendingUp size={11} />
                  +{client.growth}%
                </span>
              </div>

              {/* Stats & Products */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#faf6ef]">
                  <span className="text-[#8c7866]">Faturamento Total:</span>
                  <strong className="font-mono text-emerald-700 font-bold">
                    R$ {client.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-[#faf6ef]">
                  <span className="text-[#8c7866]">Pedidos Realizados:</span>
                  <strong className="font-mono text-[#2c1a0e] font-bold">
                    {client.ordersCount} entregas
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8c7866]">Produto Preferido:</span>
                  <span className="font-bold text-amber-800 text-[11px] truncate max-w-[130px]">
                    {client.favoriteProduct}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-[#f0e8db] flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-stone-500">Status: Limite Aprovado</span>
              <button className="text-amber-700 font-bold flex items-center gap-1 hover:text-amber-800 text-[11px]">
                Ver Perfil <ChevronRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Client Detail Drawer / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#e8ded0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8db]">
              <div className="flex items-center gap-2">
                <Building className="text-amber-700" />
                <h3 className="text-base font-bold text-[#2c1a0e]">
                  Ficha do Cliente: {selectedClient.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="w-7 h-7 rounded-full bg-[#f4ece1] text-[#2c1a0e] font-bold flex items-center justify-center hover:bg-[#e8ded0]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 bg-[#faf6ef] p-3.5 rounded-2xl border border-[#e8ded0]">
                <img
                  src={selectedClient.avatarUrl || '/hero-podium-coffee.jpg'}
                  alt={selectedClient.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#2c1a0e]">{selectedClient.name}</h4>
                  <span className="text-[11px] text-[#8c7866] block">{selectedClient.city}</span>
                  <span className="text-[10px] font-mono text-amber-800 font-bold">CNPJ: 14.283.912/0001-45</span>
                </div>
              </div>

              <div className="space-y-2 bg-[#fdfbf7] p-3 rounded-xl border border-[#f0e8db]">
                <div className="flex justify-between">
                  <span className="text-[#8c7866]">Limite de Crédito Disponível:</span>
                  <strong className="text-emerald-700 font-mono">R$ 150.000,00</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866]">Prazo de Pagamento:</span>
                  <strong className="text-[#2c1a0e]">30/60 DDL (Boleto Bancário)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866]">Contato Comercial:</span>
                  <strong className="text-[#2c1a0e]">compras@cliente.com.br</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 rounded-xl bg-[#f4ece1] text-[#2c1a0e] font-bold text-xs hover:bg-[#e8ded0]"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  alert(`Iniciando novo pedido para ${selectedClient.name}`);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-md"
              >
                Criar Pedido para Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
