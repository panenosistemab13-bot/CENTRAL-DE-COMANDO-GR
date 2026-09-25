import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Sparkles,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';
import { ProductCatalogItem } from '../types';

interface ProdutosViewProps {
  products: ProductCatalogItem[];
  onAddProduct?: () => void;
  onSelectProduct?: (prod: ProductCatalogItem) => void;
  onBack?: () => void;
}

export default function ProdutosView({
  products,
  onAddProduct,
  onSelectProduct,
  onBack
}: ProdutosViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeProduct, setActiveProduct] = useState<ProductCatalogItem | null>(null);

  const categories = [
    { id: 'todos', label: 'Todos os Produtos' },
    { id: 'grãos', label: 'Café em Grãos' },
    { id: 'cappuccino', label: 'Cappuccinos & Solúveis' },
    { id: 'torrado', label: 'Torrado e Moído' },
    { id: 'acessorios', label: 'Acessórios & Colecionáveis' },
  ];

  const filteredProducts = products.filter((prod) => {
    const matchSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === 'todos' || prod.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Catalog Overview */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8ded0] shadow-[0_15px_35px_rgba(45,28,14,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-amber-800">
              <Package size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2c1a0e]">
              Catálogo de Produtos & Embalagens 3D
            </h2>
            <p className="text-xs text-[#7d6b5c]">
              Gestão de estoques, perfis de torra sensorial, pesos e precificação por lote.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, lote ou SKU..."
              className="pl-9 pr-3 py-2 rounded-xl bg-[#faf6ef] border border-[#e8ded0] text-xs font-semibold text-[#2c1a0e] focus:outline-none focus:border-amber-600 w-56"
            />
          </div>

          <button
            onClick={() => alert('Cadastrando novo produto')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md hover:bg-amber-700 transition-all"
          >
            <Plus size={15} />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#e8ded0] shadow-sm">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-[#5c493c] hover:bg-[#faf6ef]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of 3D Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            onClick={() => setActiveProduct(prod)}
            className="bg-white rounded-3xl p-5 border border-[#e8ded0] shadow-[0_8px_24px_rgba(45,28,14,0.06)] hover:shadow-[0_16px_40px_rgba(45,28,14,0.14)] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Top 3D Packaging Thumbnail Stage */}
              <div className="w-full h-44 rounded-2xl bg-gradient-to-b from-[#fbf8f3] to-[#f4ece1] border border-[#e8ded0] flex items-center justify-center p-4 relative overflow-hidden mb-4 group-hover:border-amber-400 transition-colors">
                <img
                  src={
                    prod.category === 'grãos'
                      ? '/src/assets/images/coffee_packages_3d_1789847080376.jpg'
                      : prod.category === 'acessorios'
                      ? '/src/assets/images/steaming_cup_coffee_1789847106425.jpg'
                      : '/src/assets/images/coffee_beans_3d_1789847062486.jpg'
                  }
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="max-h-36 object-contain filter drop-shadow-[0_10px_20px_rgba(45,28,14,0.25)] group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/hero-podium-coffee.jpg';
                  }}
                />

                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 text-amber-300 font-mono font-bold text-[10px] backdrop-blur-md border border-white/10">
                  {prod.weight}
                </span>

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-[#2c1808] font-black text-[9px] uppercase tracking-wider shadow">
                  {prod.sku}
                </span>
              </div>

              {/* Product Info */}
              <h3 className="text-sm font-bold text-[#2c1a0e] group-hover:text-amber-700 transition-colors line-clamp-1">
                {prod.name}
              </h3>
              <p className="text-[11px] text-[#7d6b5c] mt-1 line-clamp-2 leading-relaxed">
                {prod.description}
              </p>

              {/* Sensory & Intensity Profile */}
              <div className="mt-3 pt-3 border-t border-[#f0e8db] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#8c7866] text-[11px]">Perfil de Torra:</span>
                  <span className="font-bold text-amber-800 text-[11px]">{prod.roastProfile}</span>
                </div>

                {prod.intensity > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#8c7866] text-[11px]">Intensidade:</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-3 rounded-xs ${
                            i < prod.intensity ? 'bg-amber-600' : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Stock Footer */}
            <div className="mt-4 pt-3 border-t border-[#f0e8db] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8c7866] uppercase block">Preço Unitário</span>
                <strong className="text-base font-black text-[#2c1a0e] font-mono">
                  R$ {prod.pricePerUnit.toFixed(2).replace('.', ',')}
                </strong>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-[#8c7866] uppercase block">Estoque</span>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 size={11} />
                  {prod.stockUnits.toLocaleString('pt-BR')} un
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#e8ded0] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0e8db]">
              <div className="flex items-center gap-2">
                <Coffee className="text-amber-700" />
                <h3 className="text-base font-bold text-[#2c1a0e]">
                  {activeProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="w-7 h-7 rounded-full bg-[#f4ece1] text-[#2c1a0e] font-bold flex items-center justify-center hover:bg-[#e8ded0]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-700 leading-relaxed">{activeProduct.description}</p>
              
              <div className="bg-[#faf6ef] p-3.5 rounded-2xl space-y-2 border border-[#e8ded0]">
                <div className="flex justify-between">
                  <span className="text-[#8c7866]">SKU Identificador:</span>
                  <strong className="font-mono text-[#2c1a0e]">{activeProduct.sku}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866]">Perfil Sensorial:</span>
                  <strong className="text-[#2c1a0e]">{activeProduct.roastProfile}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866]">Embalagem:</span>
                  <strong className="text-[#2c1a0e]">{activeProduct.weight}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866]">Estoque em Pátio/CD:</span>
                  <strong className="font-mono text-emerald-700 font-bold">{activeProduct.stockUnits} unidades</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8c7866]">Preço Médio de Tabela:</span>
                  <strong className="font-mono text-amber-800 text-sm font-bold">
                    R$ {activeProduct.pricePerUnit.toFixed(2).replace('.', ',')}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2.5">
              <button
                onClick={() => setActiveProduct(null)}
                className="px-4 py-2 rounded-xl bg-[#f4ece1] text-[#2c1a0e] font-bold text-xs hover:bg-[#e8ded0]"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  alert(`Ajustando lote do produto ${activeProduct.name}`);
                  setActiveProduct(null);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-md"
              >
                Editar Lote & Estoque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
