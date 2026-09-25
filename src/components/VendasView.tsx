import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  CreditCard,
  DollarSign,
  ChevronRight,
  PackageCheck
} from 'lucide-react';
import { OrderItem } from '../types';

interface VendasViewProps {
  orders: OrderItem[];
  onNewOrder?: () => void;
  onSelectOrder?: (order: OrderItem) => void;
  onBack?: () => void;
}

export default function VendasView({
  orders,
  onNewOrder,
  onSelectOrder,
  onBack
}: VendasViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || ord.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalVolume = orders.reduce((acc, curr) => acc + curr.weightKg, 0);
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)]">
          <span className="text-[11px] font-bold text-[#7d6b5c] uppercase">Faturamento Total do Mês</span>
          <strong className="text-xl font-black text-[#2c1a0e] font-mono block mt-1">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </strong>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">↑ 12,5% vs mês anterior</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)]">
          <span className="text-[11px] font-bold text-[#7d6b5c] uppercase">Volume Comercializado</span>
          <strong className="text-xl font-black text-[#2c1a0e] font-mono block mt-1">
            {totalVolume.toLocaleString('pt-BR')} kg
          </strong>
          <span className="text-[11px] font-bold text-amber-700 mt-1 block">Média R$ 48,20 / kg</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)]">
          <span className="text-[11px] font-bold text-[#7d6b5c] uppercase">Pedidos em Trânsito</span>
          <strong className="text-xl font-black text-cyan-700 font-mono block mt-1">
            {orders.filter((o) => o.status === 'em_transporte').length} cargas
          </strong>
          <span className="text-[11px] font-bold text-cyan-600 mt-1 block">Telemetria 100% monitorada</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)]">
          <span className="text-[11px] font-bold text-[#7d6b5c] uppercase">Eficiência de Entrega</span>
          <strong className="text-xl font-black text-emerald-600 font-mono block mt-1">
            99.4%
          </strong>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">SLA de 24h a 48h cumprido</span>
        </div>
      </div>

      {/* Main Orders Table & Action Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)]">
        {/* Table Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#f0e8db]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-amber-800">
                <ShoppingCart size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2c1a0e]">
                Gestão de Vendas & Pedidos em Tempo Real
              </h3>
              <span className="text-xs text-[#8c7866]">
                Acompanhe o faturamento, status de expedição e notas fiscais emitidas
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar pedido, cliente ou café..."
                className="pl-9 pr-3 py-2 rounded-xl bg-[#faf6ef] border border-[#e8ded0] text-xs font-semibold text-[#2c1a0e] focus:outline-none focus:border-amber-600 w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#faf6ef] border border-[#e8ded0] text-xs font-bold text-[#2c1a0e] focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="em_separacao">Em Separação</option>
              <option value="faturado">Faturado</option>
              <option value="em_transporte">Em Transporte</option>
              <option value="entregue">Entregue</option>
            </select>

            {onNewOrder && (
              <button
                onClick={onNewOrder}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#2c1808] font-bold text-xs shadow-md transition-all"
              >
                <Plus size={15} />
                Novo Pedido
              </button>
            )}
          </div>
        </div>

        {/* Wide Full-Width Orders Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f0e8db] text-[11px] font-bold uppercase tracking-wider text-[#8c7866]">
                <th className="py-3 px-4">Pedido #</th>
                <th className="py-3 px-4">Cliente / Razão Social</th>
                <th className="py-3 px-4">Produto & Lote</th>
                <th className="py-3 px-4">Volume (kg)</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">Destino</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8f4ed] text-xs font-medium text-[#2c1a0e]">
              {filteredOrders.map((order) => {
                const statusBadge =
                  order.status === 'em_separacao'
                    ? { bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500', label: 'Em Separação' }
                    : order.status === 'faturado'
                    ? { bg: 'bg-blue-100 text-blue-900 border-blue-300', dot: 'bg-blue-500', label: 'Faturado' }
                    : order.status === 'em_transporte'
                    ? { bg: 'bg-cyan-100 text-cyan-900 border-cyan-300', dot: 'bg-cyan-500', label: 'Em Transporte' }
                    : { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500', label: 'Entregue' };

                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-[#faf6ef] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#2c1a0e]">
                      {order.client}
                    </td>
                    <td className="py-3.5 px-4 text-[#5c493c]">
                      {order.product}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {order.weightKg.toLocaleString('pt-BR')} kg
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-[#5c493c]">
                      {order.destination}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#8c7866] font-mono text-[11px]">
                      {order.time}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-800 transition-colors"
                        title="Ver Detalhes do Pedido"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Slide-over */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#e8ded0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8db]">
              <div className="flex items-center gap-2">
                <PackageCheck className="text-amber-700" />
                <h3 className="text-base font-bold text-[#2c1a0e]">
                  Detalhes do Pedido {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-full bg-[#f4ece1] text-[#2c1a0e] font-bold flex items-center justify-center hover:bg-[#e8ded0]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#faf6ef] p-3.5 rounded-2xl space-y-2 border border-[#e8ded0]">
                <div className="flex justify-between">
                  <span className="text-[#8c7866] font-semibold">Cliente:</span>
                  <strong className="text-[#2c1a0e]">{selectedOrder.client}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866] font-semibold">Destino de Entrega:</span>
                  <strong className="text-[#2c1a0e]">{selectedOrder.destination}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866] font-semibold">Produto Especificado:</span>
                  <strong className="text-[#2c1a0e]">{selectedOrder.product}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866] font-semibold">Volume em Grãos:</span>
                  <strong className="font-mono text-[#2c1a0e]">{selectedOrder.weightKg.toLocaleString('pt-BR')} kg</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866] font-semibold">Valor Total Faturado:</span>
                  <strong className="font-mono text-emerald-700 text-sm">
                    R$ {selectedOrder.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Nota Fiscal Eletrônica (NF-e) gerada e averbada com sucesso.</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#f4ece1] text-[#2c1a0e] font-bold text-xs hover:bg-[#e8ded0]"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  alert(`Imprimindo DANFE do pedido ${selectedOrder.orderNumber}`);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-md"
              >
                Imprimir DANFE / Romaneio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
