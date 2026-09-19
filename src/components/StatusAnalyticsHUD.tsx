import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Maximize2,
  Minimize2,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
  Line
} from 'recharts';
import { cn } from '../lib/utils';

export interface StatusStatItem {
  key: string;
  label: string;
  color: string;
  glow: string;
  count: number;
  percentage: number;
}

export interface TimelineDataItem {
  hora: string;
  emRota: number;
  noDestino: number;
  alerta: number;
}

interface StatusAnalyticsHUDProps {
  statusStats: StatusStatItem[];
  timelineData?: TimelineDataItem[];
  totalIscas: number;
}

const DEFAULT_TIMELINE_DATA: TimelineDataItem[] = [
  { hora: '06:00', emRota: 6, noDestino: 2, alerta: 0 },
  { hora: '09:00', emRota: 10, noDestino: 4, alerta: 1 },
  { hora: '12:00', emRota: 14, noDestino: 6, alerta: 1 },
  { hora: '15:00', emRota: 16, noDestino: 9, alerta: 2 },
  { hora: '18:00', emRota: 21, noDestino: 12, alerta: 2 },
];

const GOLD = '#B88935';
const BRONZE = '#754B2A';
const GREEN = '#3D8B68';

export const StatusAnalyticsHUD: React.FC<StatusAnalyticsHUDProps> = ({
  statusStats,
  timelineData = DEFAULT_TIMELINE_DATA,
  totalIscas
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

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative cinema-card cinema-3d p-5 md:p-7 lg:p-8 overflow-hidden",
        isFullscreen &&
          "fixed inset-0 z-[999] rounded-none w-screen h-screen overflow-auto bg-[#F7F3EC]"
      )}
    >
      <div className="cinema-light -top-40 -right-40" />

      {/* HEADER */}
      <header className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-[#754B2A]/10">
        <div className="flex items-center gap-4">
          <div
            className="
              w-14 h-14
              rounded-2xl
              flex items-center justify-center
              bg-gradient-to-br from-[#E7C88A] to-[#B88935]
              shadow-[0_15px_35px_rgba(117,75,42,.20)]
            "
          >
            <Activity className="w-6 h-6 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#3D8B68] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[.22em] font-extrabold text-[#B88935]">
                Monitoramento operacional
              </span>
            </div>

            <h2 className="cinema-title text-3xl md:text-4xl text-[#2C1B12]">
              Painel de Estatísticas e Fluxo
            </h2>

            <p className="text-xs text-[#756D63] mt-1">
              Métricas de performance em tempo real
              <span className="mx-2">•</span>
              Total de iscas:
              <strong className="ml-1 text-[#754B2A]">
                {totalIscas}
              </strong>
            </p>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="cinema-button flex items-center gap-2 self-start"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span>Sair da tela cheia</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span>Tela cheia</span>
            </>
          )}
        </button>
      </header>

      {/* MÉTRICAS */}
      <div className="
        relative z-10
        grid
        grid-cols-2
        md:grid-cols-3
        xl:grid-cols-7
        gap-4
        mt-7
      ">
        {statusStats.map((stat, index) => {
          const percentage = Math.min(100, Math.max(0, stat.percentage));

          return (
            <div
              key={stat.key}
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                p-5
                bg-white/75
                border border-white
                shadow-[0_15px_40px_rgba(67,46,28,.08)]
                transition-all duration-300
                hover:-translate-y-1
              "
            >
              <div
                className="
                  absolute
                  -right-10
                  -top-10
                  w-24
                  h-24
                  rounded-full
                  bg-[#E7C88A]/20
                  blur-xl
                "
              />

              <div className="relative">
                <div className="
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[.12em]
                  text-[#756D63]
                  min-h-[28px]
                ">
                  {stat.label}
                </div>

                <div className="
                  relative
                  w-24
                  h-24
                  mx-auto
                  my-4
                ">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full -rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#E9E1D5"
                      strokeWidth="9"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={
                        index % 3 === 0
                          ? GOLD
                          : index % 3 === 1
                            ? BRONZE
                            : GREEN
                      }
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={`${percentage * 2.51} 251`}
                    />
                  </svg>

                  <div className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                  ">
                    <span className="cinema-number text-xl text-[#2C1B12]">
                      {percentage}%
                    </span>
                  </div>
                </div>

                <div className="
                  flex
                  justify-between
                  items-center
                  pt-3
                  border-t
                  border-[#754B2A]/10
                ">
                  <span className="text-[10px] text-[#756D63]">
                    Quantidade
                  </span>

                  <span className="cinema-number text-[#754B2A]">
                    {stat.count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GRÁFICOS */}
      <div className="
        relative z-10
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
        mt-7
      ">
        {/* BARRAS */}
        <div className="
          rounded-3xl
          bg-white/70
          border border-white
          p-6
          shadow-[0_20px_50px_rgba(67,46,28,.08)]
        ">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="
                  w-9 h-9
                  rounded-xl
                  bg-[#F2E4C8]
                  flex
                  items-center
                  justify-center
                ">
                  <BarChart3 className="w-4 h-4 text-[#754B2A]" />
                </div>

                <h3 className="font-extrabold text-sm text-[#2C1B12]">
                  Distribuição de cargas
                </h3>
              </div>

              <p className="text-[10px] text-[#756D63] mt-1">
                Distribuição por status operacional
              </p>
            </div>

            <Layers className="w-5 h-5 text-[#B88935]" />
          </div>

          <div className="h-[330px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={statusStats}
                margin={{
                  top: 15,
                  right: 15,
                  left: -20,
                  bottom: 25
                }}
              >
                <defs>
                  <linearGradient
                    id="goldBar"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#E7C88A" />
                    <stop offset="50%" stopColor="#B88935" />
                    <stop offset="100%" stopColor="#754B2A" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="#E5DED2"
                  strokeDasharray="4 8"
                />

                <XAxis
                  dataKey="label"
                  stroke="#8A8074"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />

                <YAxis
                  stroke="#8A8074"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  cursor={{
                    fill: 'rgba(184,137,53,.06)'
                  }}
                  contentStyle={{
                    background: '#FFFDF8',
                    border: '1px solid #E7C88A',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(67,46,28,.15)',
                    fontFamily: 'Manrope'
                  }}
                />

                <Bar
                  dataKey="count"
                  radius={[12, 12, 5, 5]}
                  maxBarSize={52}
                  fill="url(#goldBar)"
                >
                  {statusStats.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        index % 3 === 0
                          ? '#B88935'
                          : index % 3 === 1
                            ? '#754B2A'
                            : '#3D8B68'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AREA CHART */}
        <div className="
          rounded-3xl
          bg-[#2C1B12]
          p-6
          shadow-[0_25px_70px_rgba(44,27,18,.25)]
          overflow-hidden
          relative
        ">
          <div className="
            absolute
            -right-20
            -top-20
            w-64
            h-64
            rounded-full
            bg-[#E7C88A]/10
            blur-3xl
          " />

          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="
                    w-9 h-9
                    rounded-xl
                    bg-white/10
                    flex
                    items-center
                    justify-center
                  ">
                    <TrendingUp className="w-4 h-4 text-[#E7C88A]" />
                  </div>

                  <h3 className="font-extrabold text-sm text-white">
                    Fluxo operacional
                  </h3>
                </div>

                <p className="text-[10px] text-white/50 mt-1">
                  Evolução das movimentações durante o dia
                </p>
              </div>

              <Sparkles className="w-5 h-5 text-[#E7C88A]" />
            </div>

            <div className="h-[330px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient
                      id="cinemaArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#E7C88A"
                        stopOpacity=".45"
                      />
                      <stop
                        offset="100%"
                        stopColor="#E7C88A"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#FFFFFF"
                    strokeOpacity=".08"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="hora"
                    stroke="#FFFFFF"
                    strokeOpacity=".4"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#FFFFFF"
                    strokeOpacity=".4"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: '#FFFDF8',
                      border: 'none',
                      borderRadius: '16px',
                      color: '#2C1B12',
                      boxShadow: '0 20px 40px rgba(0,0,0,.2)'
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="emRota"
                    stroke="#E7C88A"
                    strokeWidth={4}
                    fill="url(#cinemaArea)"
                  />

                  <Line
                    type="monotone"
                    dataKey="noDestino"
                    stroke="#70B58F"
                    strokeWidth={3}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="alerta"
                    stroke="#D97973"
                    strokeWidth={3}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
