import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Radio,
  Zap,
  MapPin,
  Maximize2,
  Minimize2,
  Sparkles,
  Compass
} from 'lucide-react';
import { cn } from '../lib/utils';

interface BrazilMapHUDProps {
  selectedMapNode: string | null;
  setSelectedMapNode: (node: string | null) => void;
  hoveredCity: string | null;
  setHoveredCity: (city: string | null) => void;
  count: number;
}

export const BrazilMapHUD: React.FC<BrazilMapHUDProps> = ({
  selectedMapNode,
  setSelectedMapNode,
  hoveredCity,
  setHoveredCity,
  count,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const cities = [
    { name: 'Santa Luzia', uf: 'MG', x: 64, y: 64, type: 'SMART TOTAL SERVICE', isBase: true, pings: '12ms' },
    { name: 'Londrina', uf: 'PR', x: 48, y: 76, type: 'CLIENTE', isBase: false, pings: '24ms' },
    { name: 'Gravataí', uf: 'RS', x: 42, y: 90, type: 'CLIENTE', isBase: false, pings: '35ms' },
    { name: 'Gov. Celso Ramos', uf: 'SC', x: 49, y: 83, type: 'CLIENTE', isBase: false, pings: '31ms' },
    { name: 'Pinhais', uf: 'PR', x: 50, y: 79, type: 'CLIENTE', isBase: false, pings: '28ms' },
    { name: 'Cuiabá', uf: 'MT', x: 30, y: 52, type: 'CLIENTE', isBase: false, pings: '48ms' },
    { name: 'Sumaré', uf: 'SP', x: 57, y: 72, type: 'CLIENTE', isBase: false, pings: '18ms' },
    { name: 'Natal', uf: 'RN', x: 90, y: 24, type: 'CLIENTE', isBase: false, pings: '45ms' },
    { name: 'Guarulhos', uf: 'SP', x: 59, y: 74, type: 'CLIENTE', isBase: false, pings: '14ms' },
    { name: 'Viana', uf: 'ES', x: 72, y: 63, type: 'CLIENTE', isBase: false, pings: '22ms' },
    { name: 'Salvador', uf: 'BA', x: 80, y: 44, type: 'CLIENTE', isBase: false, pings: '29ms' }
  ];

  return (
    <section 
      ref={containerRef}
      className={cn(
        "relative cinema-card cinema-3d p-5 md:p-7 lg:p-8 overflow-hidden",
        isFullscreen && "fixed inset-0 z-[999] rounded-none w-screen h-screen overflow-auto bg-[#F7F3EC]"
      )}
    >
      <div className="cinema-light -top-40 -left-40" />

      {/* HEADER */}
      <header className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-[#754B2A]/10">
        <div className="flex items-center gap-4">
          <div
            className="
              w-14 h-14
              rounded-2xl
              flex items-center justify-center
              bg-gradient-to-br from-[#E7C88A] to-[#754B2A]
              shadow-[0_15px_35px_rgba(117,75,42,.20)]
            "
          >
            <Compass className="w-6 h-6 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#B88935] animate-ping" />
              <span className="text-[10px] uppercase tracking-[.22em] font-extrabold text-[#B88935]">
                Rede Geográfica Operacional
              </span>
            </div>

            <h2 className="cinema-title text-3xl md:text-4xl text-[#2C1B12]">
              Centro de Comando Brasil
            </h2>

            <p className="text-xs text-[#756D63] mt-1">
              Monitoramento orbital de bases e rotas integradas
              <span className="mx-2">•</span>
              Base Central: <strong className="text-[#754B2A]">Santa Luzia / MG</strong>
            </p>
          </div>
        </div>

        {/* FILTROS E FULLSCREEN */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelectedMapNode(selectedMapNode === 'SMART TOTAL SERVICE' ? null : 'SMART TOTAL SERVICE')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm",
              selectedMapNode === 'SMART TOTAL SERVICE'
                ? "bg-gradient-to-r from-[#B88935] to-[#754B2A] text-white shadow-[0_10px_25px_rgba(117,75,42,0.25)]"
                : "bg-white/80 border border-[#754B2A]/15 text-[#2C1B12] hover:bg-[#F2E4C8]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#B88935]" />
            Smart Total Service
          </button>

          <button
            onClick={() => setSelectedMapNode(selectedMapNode === 'CLIENTE' ? null : 'CLIENTE')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm",
              selectedMapNode === 'CLIENTE'
                ? "bg-gradient-to-r from-[#3D8B68] to-[#2C1B12] text-white shadow-[0_10px_25px_rgba(61,139,104,0.25)]"
                : "bg-white/80 border border-[#754B2A]/15 text-[#2C1B12] hover:bg-[#F2E4C8]"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#3D8B68]" />
            Cliente
          </button>

          <button
            onClick={toggleFullscreen}
            className="cinema-button flex items-center gap-2 text-xs py-2 px-4"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? "Sair" : "Tela Cheia"}</span>
          </button>
        </div>
      </header>

      {/* MAPA ORBITAL CINEMATOGRÁFICO */}
      <div className="
        relative
        w-full
        min-h-[580px]
        rounded-[32px]
        overflow-hidden
        bg-gradient-to-br
        from-[#FFFDF8]
        via-[#F1E9DC]
        to-[#DED0BE]
        border
        border-white
        shadow-[0_35px_100px_rgba(67,46,28,.16)]
        mt-7
        flex
        items-center
        justify-center
      ">
        {/* Iluminação volumétrica */}
        <div className="
          absolute
          -top-40
          -right-40
          w-[500px]
          h-[500px]
          rounded-full
          bg-[#E7C88A]/35
          blur-[100px]
          pointer-events-none
        " />

        <div className="
          absolute
          -bottom-40
          -left-40
          w-[500px]
          h-[500px]
          rounded-full
          bg-[#754B2A]/12
          blur-[100px]
          pointer-events-none
        " />

        {/* Grid discreto arquitetônico */}
        <div
          className="
            absolute
            inset-0
            opacity-[.14]
            pointer-events-none
          "
          style={{
            backgroundImage: `
              linear-gradient(rgba(117,75,42,.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(117,75,42,.25) 1px, transparent 1px)
            `,
            backgroundSize: '55px 55px'
          }}
        />

        {/* Órbita Central Radiante */}
        <div className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[420px]
          h-[420px]
          rounded-full
          border
          border-[#B88935]/25
          pointer-events-none
        ">
          <div className="absolute inset-[40px] rounded-full border border-[#B88935]/15" />
          <div className="absolute inset-[90px] rounded-full border border-[#B88935]/20" />
        </div>

        {/* Linhas de Conexão Vetorial Suaves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="orbitRoute" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B88935" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#754B2A" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {cities.slice(1).map((city, idx) => (
            <line
              key={idx}
              x1={`${cities[0].x}%`}
              y1={`${cities[0].y}%`}
              x2={`${city.x}%`}
              y2={`${city.y}%`}
              stroke="url(#orbitRoute)"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="opacity-70"
            />
          ))}
        </svg>

        {/* Base Central Emblema */}
        <div className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-28
          h-28
          rounded-full
          bg-gradient-to-br
          from-[#E7C88A]
          to-[#754B2A]
          shadow-[0_25px_70px_rgba(117,75,42,.35)]
          flex
          items-center
          justify-center
          border-[5px]
          border-white/80
          z-10
          pointer-events-none
        ">
          <div className="
            w-16
            h-16
            rounded-full
            bg-[#FFFDF8]
            shadow-inner
            flex
            items-center
            justify-center
          ">
            <span className="
              text-[9px]
              font-extrabold
              uppercase
              tracking-widest
              text-[#754B2A]
              text-center
              leading-tight
            ">
              Base<br />Central
            </span>
          </div>
        </div>

        {/* CIDADES INTERATIVAS */}
        {cities.map((city) => {
          const isSelected = selectedMapNode === city.name || selectedMapNode === city.type;
          return (
            <button
              key={city.name}
              style={{
                left: `${city.x}%`,
                top: `${city.y}%`
              }}
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => setSelectedMapNode(selectedMapNode === city.name ? null : city.name)}
              className="
                absolute
                -translate-x-1/2
                -translate-y-1/2
                group
                z-20
                cursor-pointer
                focus:outline-none
              "
            >
              {/* Halo Iluminado */}
              <span className={cn(
                "absolute -inset-5 rounded-full blur-md transition-all",
                city.isBase ? "bg-[#B88935]/35 scale-125" : "bg-[#E7C88A]/20 group-hover:bg-[#B88935]/40"
              )} />

              {/* Ponto 3D */}
              <span className={cn(
                "relative flex rounded-full border-[3px] border-white transition-transform duration-300 shadow-[0_5px_20px_rgba(117,75,42,.35)]",
                city.isBase ? "w-6 h-6 bg-gradient-to-br from-[#E7C88A] via-[#B88935] to-[#754B2A]" : "w-4 h-4 bg-gradient-to-br from-[#E7C88A] to-[#754B2A]",
                "group-hover:scale-150"
              )} />

              {/* Tag com Nome & UF */}
              <div className="
                absolute
                left-1/2
                top-7
                -translate-x-1/2
                whitespace-nowrap
                rounded-xl
                bg-[#2C1B12]/95
                text-white
                px-3
                py-1.5
                text-[11px]
                font-bold
                opacity-90
                group-hover:opacity-100
                group-hover:scale-110
                transition-all
                shadow-[0_15px_30px_rgba(44,27,18,0.3)]
                border border-[#E7C88A]/30
                flex items-center gap-1.5
              ">
                <span>{city.name}</span>
                <span className="text-[#E7C88A] font-extrabold">{city.uf}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
