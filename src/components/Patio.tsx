import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&inline';
import { motion, AnimatePresence } from 'motion/react';

import { PatioItem } from '../data/patioData';
import { cn } from '../lib/utils';
import { useCurrentPrinciple } from '../utils/principles';

import { 
  Truck, 
  Trash2, 
  Loader2, 
  Activity, 
  ShieldCheck, 
  Search, 
  Plus, 
  Database,
  Image as ImageIcon,
  ChevronLeft,
  Copy,
  Check,
  Cpu,
  UploadCloud,
  Edit,
  X,
  Save,
  FileText,
  FileSpreadsheet,
  Globe,
  Key,
  Phone,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Mail,
  Clock,
  Filter
} from 'lucide-react';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { rtdb as db } from '../firebase';
import { GlassPanel3D } from './3d/GlassPanel3D';
import { MetricCard3D } from './3d/MetricCard3D';
import { HUDPanel } from './3d/HUDPanel';
import { StatusIndicator3D } from './3d/StatusIndicator3D';
import { FilterPanel3D } from './3d/FilterPanel3D';
import { Modal3D } from './3d/Modal3D';

// Initialize PDF.js worker locally using inlined worker
pdfjsLib.GlobalWorkerOptions.workerPort = new PDFWorker();

interface PatioProps {
  onBack?: () => void;
}

// High-fidelity Mercosul Licence Plate displays for 3D UI
const LicensePlate3D: React.FC<{ 
  plate: string; 
  type?: 'cavalo' | 'carreta'; 
}> = ({ plate, type }) => {
  if (!plate || plate === '-') return <span className="text-slate-500 font-mono font-bold text-xs">-</span>;
  
  const cleanPlate = plate.trim().toUpperCase();
  const isCarreta = type === 'carreta';
  const isCavalo = type === 'cavalo';
  
  const headerText = isCavalo ? 'CAVALO' : isCarreta ? 'CARRETA' : 'BRASIL';
  
  return (
    <div className="inline-flex flex-col items-center justify-center overflow-hidden select-none font-mono w-[110px] h-[36px] shrink-0 rounded-lg shadow-md border border-slate-600 bg-slate-900">
      {/* Mercosul Header */}
      <div className="w-full bg-[#0051A2] h-[9px] flex items-center justify-between px-1.5 relative">
        <span className="text-[5px] text-white font-sans font-bold">BR</span>
        <span className="text-[6px] text-white font-sans font-black tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          {headerText}
        </span>
      </div>
      {/* Plate characters */}
      <div className="w-full flex-1 flex items-center justify-center px-2 bg-gradient-to-b from-white to-slate-200">
        <span className="text-slate-950 font-black text-sm tracking-wider select-all">
          {cleanPlate}
        </span>
      </div>
    </div>
  );
};

export default function Patio({ onBack }: PatioProps) {
  const principle = useCurrentPrinciple();
  const [items, setItems] = useState<PatioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [selectedItem, setSelectedItem] = useState<PatioItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingItem, setEditingItem] = useState<PatioItem | null>(null);

  // New item form state
  const [newItem, setNewItem] = useState<Partial<PatioItem>>({
    placaCavalo: '',
    placaCarreta: '',
    motorista: '',
    telefoneMotorista: '',
    transportadora: '',
    origem: 'SANTA LUZIA',
    destino: '',
    status: 'NO PÁTIO',
    estaNoPatio: 'Sim',
    observacoes: ''
  });

  // PDF Parser State
  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const patioRef = ref(db, 'patio/veiculos');
    const unsubscribe = onValue(patioRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedItems: PatioItem[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setItems(parsedItems);
      } else {
        setItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.placaCavalo) return;

    const patioRef = ref(db, 'patio/veiculos');
    const newRef = push(patioRef);
    const itemData = {
      ...newItem,
      dataEntrada: new Date().toISOString()
    };

    await set(newRef, itemData);
    setIsAddingNew(false);
    setNewItem({
      placaCavalo: '',
      placaCarreta: '',
      motorista: '',
      telefoneMotorista: '',
      transportadora: '',
      origem: 'SANTA LUZIA',
      destino: '',
      status: 'NO PÁTIO',
      estaNoPatio: 'Sim',
      observacoes: ''
    });
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.id) return;

    const itemRef = ref(db, `patio/veiculos/${editingItem.id}`);
    await update(itemRef, editingItem);
    setEditingItem(null);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm("Confirmar remoção de veículo do pátio?")) {
      const itemRef = ref(db, `patio/veiculos/${id}`);
      await remove(itemRef);
    }
  };

  // Filtered vehicles
  const filteredItems = items.filter(item => {
    const query = filterText.toLowerCase();
    return (
      (item.placaCavalo && item.placaCavalo.toLowerCase().includes(query)) ||
      (item.placaCarreta && item.placaCarreta.toLowerCase().includes(query)) ||
      (item.motorista && item.motorista.toLowerCase().includes(query)) ||
      (item.transportadora && item.transportadora.toLowerCase().includes(query)) ||
      (item.destino && item.destino.toLowerCase().includes(query))
    );
  });

  const vehiclesInPatioCount = items.filter(i => i.estaNoPatio === 'Sim').length;

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER SECTION */}
      <GlassPanel3D className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" variant="glow">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="led-status led-status-blue" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400">
                PGR COMMAND CENTER 3D • MÓDULO LOGÍSTICO
              </span>
            </div>
            <h1 className="text-2xl font-mono font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Truck size={24} className="text-sky-400" />
              CENTRAL DE CONTROLE DE PÁTIO
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} /> REGISTRAR ENTRADA
          </button>
        </div>
      </GlassPanel3D>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard3D
          title="Frota No Pátio"
          value={vehiclesInPatioCount}
          subtitle="Base Santa Luzia"
          icon={Truck}
          status="normal"
        />
        <MetricCard3D
          title="Total Registrados"
          value={items.length}
          subtitle="Histórico Ativo"
          icon={Database}
          status="info"
        />
        <MetricCard3D
          title="Em Trânsito / Viagem"
          value={items.filter(i => i.estaNoPatio !== 'Sim').length}
          subtitle="Rotas Liberadas"
          icon={Globe}
          status="warning"
        />
      </div>

      {/* SEARCH AND FILTER BAR */}
      <FilterPanel3D
        searchQuery={filterText}
        onSearchChange={setFilterText}
        searchPlaceholder="Filtrar por placa, motorista, transportadora ou destino..."
      />

      {/* MAIN VEHICLES TABLE */}
      <HUDPanel title={`Veículos no Pátio (${filteredItems.length})`} badge="REALTIME DATABASE">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
            <Loader2 size={24} className="animate-spin text-sky-400" />
            <span>Sincronizando banco de dados do pátio...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500 font-mono text-xs">
            Nenhum veículo localizado com os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-500/20 bg-slate-900/90 text-[10px] font-mono font-black uppercase tracking-wider text-sky-400">
                  <th className="py-3 px-4">Placa Cavalo</th>
                  <th className="py-3 px-4">Placa Carreta</th>
                  <th className="py-3 px-4">Motorista / Contato</th>
                  <th className="py-3 px-4">Transportadora</th>
                  <th className="py-3 px-4">Destino</th>
                  <th className="py-3 px-4">Status Pátio</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-sans text-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-sky-500/10 transition-colors">
                    <td className="py-3 px-4">
                      <LicensePlate3D plate={item.placaCavalo} type="cavalo" />
                    </td>
                    <td className="py-3 px-4">
                      <LicensePlate3D plate={item.placaCarreta || '-'} type="carreta" />
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-white">{item.motorista || 'NÃO INFORMADO'}</div>
                      {item.telefoneMotorista && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Phone size={10} /> {item.telefoneMotorista}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {item.transportadora || 'LOGÍSTICA C3'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-300">
                      {item.destino || 'SANTA LUZIA - MG'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusIndicator3D
                        status={item.estaNoPatio === 'Sim' ? 'normal' : 'info'}
                        label={item.estaNoPatio === 'Sim' ? 'NO PÁTIO' : 'EM VIAGEM'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Editar Registro"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(item.id)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer border border-rose-500/30"
                          title="Excluir Registro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HUDPanel>

      {/* CREATE NEW VEHICLE MODAL */}
      <Modal3D
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        title="Registrar Entrada de Veículo no Pátio"
        subtitle="Sincronização em Tempo Real via Firebase"
      >
        <form onSubmit={handleCreateVehicle} className="flex flex-col gap-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Cavalo *</label>
              <input
                type="text"
                required
                value={newItem.placaCavalo}
                onChange={(e) => setNewItem({ ...newItem, placaCavalo: e.target.value.toUpperCase() })}
                placeholder="ABC1D23"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Carreta</label>
              <input
                type="text"
                value={newItem.placaCarreta}
                onChange={(e) => setNewItem({ ...newItem, placaCarreta: e.target.value.toUpperCase() })}
                placeholder="XYZ9E87"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Motorista</label>
              <input
                type="text"
                value={newItem.motorista}
                onChange={(e) => setNewItem({ ...newItem, motorista: e.target.value })}
                placeholder="Nome do motorista..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Telefone Motorista</label>
              <input
                type="text"
                value={newItem.telefoneMotorista}
                onChange={(e) => setNewItem({ ...newItem, telefoneMotorista: e.target.value })}
                placeholder="(31) 99999-9999"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Transportadora</label>
              <input
                type="text"
                value={newItem.transportadora}
                onChange={(e) => setNewItem({ ...newItem, transportadora: e.target.value })}
                placeholder="Nome da transportadora..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Destino</label>
              <input
                type="text"
                value={newItem.destino}
                onChange={(e) => setNewItem({ ...newItem, destino: e.target.value.toUpperCase() })}
                placeholder="SANTA LUZIA / MG"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md cursor-pointer"
            >
              Confirmar Registro
            </button>
          </div>
        </form>
      </Modal3D>

      {/* EDIT VEHICLE MODAL */}
      {editingItem && (
        <Modal3D
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          title={`Editar Veículo: ${editingItem.placaCavalo}`}
        >
          <form onSubmit={handleUpdateVehicle} className="flex flex-col gap-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Cavalo</label>
                <input
                  type="text"
                  value={editingItem.placaCavalo}
                  onChange={(e) => setEditingItem({ ...editingItem, placaCavalo: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Placa Carreta</label>
                <input
                  type="text"
                  value={editingItem.placaCarreta || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, placaCarreta: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Motorista</label>
                <input
                  type="text"
                  value={editingItem.motorista || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, motorista: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Está no Pátio?</label>
                <select
                  value={editingItem.estaNoPatio}
                  onChange={(e) => setEditingItem({ ...editingItem, estaNoPatio: e.target.value as 'Sim' | 'Não' })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-400 focus:outline-none"
                >
                  <option value="Sim">Sim (No Pátio)</option>
                  <option value="Não">Não (Em Viagem)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold uppercase text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black uppercase text-xs shadow-md cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </Modal3D>
      )}

    </div>
  );
}
