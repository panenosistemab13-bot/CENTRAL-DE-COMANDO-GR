import React from 'react';
import { Award, MapPin } from 'lucide-react';

export interface DestinoStat {
  cidade?: string;
  name?: string;
  uf?: string;
  total?: number;
  count?: number;
  percentage?: number;
  iscas?: string[];
  drivers?: string[];
}

interface DestinoRankingHUDProps {
  destinos?: DestinoStat[];
  destinoStats?: DestinoStat[];
}

export const DestinoRankingHUD: React.FC<DestinoRankingHUDProps> = ({ destinos, destinoStats }) => {
  const rawList = destinos || destinoStats || [];
  const totalSum = rawList.reduce((acc, curr) => acc + (curr.total || curr.count || 0), 0) || 1;

  const normalizedList = rawList.map(item => {
    const cityName = item.cidade || item.name || 'Desconhecido';
    const parts = cityName.split('-');
    const cidade = parts[0]?.trim() || cityName;
    const uf = item.uf || parts[1]?.trim() || (
      cidade.toUpperCase() === 'BRASILIA' ? 'DF' :
      cidade.toUpperCase() === 'RIO DE JANEIRO' ? 'RJ' :
      cidade.toUpperCase().includes('GUARULHOS') || cidade.toUpperCase().includes('SUMARE') ? 'SP' :
      cidade.toUpperCase().includes('CUIABA') || cidade.toUpperCase().includes('CUIABÁ') ? 'MT' :
      cidade.toUpperCase().includes('NATAL') ? 'RN' :
      cidade.toUpperCase().includes('SALVADOR') ? 'BA' : 'MG'
    );
    const count = item.total ?? item.count ?? 0;
    const percentage = item.percentage ?? Math.round((count / totalSum) * 100);

    return {
      cidade,
      uf,
      total: count,
      percentage
    };
  });

  return (
    <div className="relative cinema-card cinema-3d p-6 md:p-8 overflow-hidden">
      <div className="cinema-light -top-40 -right-40" />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between mb-8 pb-4 border-b border-[#754B2A]/10">
        <div>
          <div className="text-[10px] uppercase tracking-[.2em] font-extrabold text-[#B88935]">
            Análise de Rotas Principais
          </div>
          <h3 className="cinema-title text-3xl md:text-4xl text-[#2C1B12]">
            Ranking de Destinos
          </h3>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#F2E4C8] flex items-center justify-center shadow-md">
          <MapPin className="text-[#754B2A] w-6 h-6" />
        </div>
      </div>

      {/* PODIUM TOP 3 */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {normalizedList.slice(0, 3).map((dest, index) => (
          <div
            key={index}
            className={`
              relative
              overflow-hidden
              rounded-[30px]
              p-6
              min-h-[260px]
              flex
              flex-col
              justify-between
              ${
                index === 0
                  ? 'bg-gradient-to-br from-[#F5D99C] via-[#B88935] to-[#754B2A]'
                  : index === 1
                    ? 'bg-gradient-to-br from-[#F4F1EB] via-[#D8CFC4] to-[#8C7D6D]'
                    : 'bg-gradient-to-br from-[#E2B792] via-[#A86F45] to-[#5C3218]'
              }
              shadow-[0_25px_60px_rgba(67,46,28,.18)]
              text-white
            `}
          >
            <div className="
              absolute
              -right-12
              -top-12
              w-40
              h-40
              rounded-full
              bg-white/20
              blur-2xl
            " />

            <div className="relative flex justify-between items-start">
              <span className="
                w-12
                h-12
                rounded-2xl
                bg-white/30
                backdrop-blur
                flex
                items-center
                justify-center
                text-xl
                font-black
                text-white
                shadow-md
              ">
                {index + 1}
              </span>

              <Award className="w-7 h-7 text-white drop-shadow" />
            </div>

            <div className="relative">
              <div className="text-xs uppercase tracking-widest text-white/80 font-extrabold">
                Destino Principal
              </div>

              <div className="cinema-title text-3xl text-white mt-1 drop-shadow-sm font-bold">
                {dest.cidade}
              </div>

              <div className="text-sm text-white/90 font-extrabold">
                {dest.uf}
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <span className="text-4xl cinema-number text-white font-extrabold">
                    {dest.total}
                  </span>
                  <span className="text-xs text-white/80 ml-2">
                    viagens
                  </span>
                </div>

                <span className="text-sm font-extrabold text-white bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  {dest.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DEMAIS DESTINOS */}
      {normalizedList.length > 3 && (
        <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {normalizedList.slice(3).map((dest, index) => (
            <div
              key={index}
              className="
                flex
                items-center
                gap-4
                p-4
                rounded-2xl
                bg-white/70
                border
                border-[#754B2A]/10
                shadow-sm
                hover:bg-white/90
                transition-colors
              "
            >
              <span className="
                w-9
                h-9
                rounded-xl
                bg-[#F2E4C8]
                flex
                items-center
                justify-center
                font-extrabold
                text-[#754B2A]
              ">
                {index + 4}
              </span>

              <div className="flex-1">
                <div className="flex justify-between text-sm font-bold text-[#2C1B12]">
                  <span>
                    {dest.cidade} - {dest.uf}
                  </span>
                  <span className="cinema-number text-[#754B2A]">
                    {dest.total} viagens
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-[#E9E1D5] overflow-hidden">
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-gradient-to-r
                      from-[#E7C88A]
                      to-[#754B2A]
                    "
                    style={{
                      width: `${dest.percentage}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
