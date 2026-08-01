import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Users, Clock, Globe, Activity, CheckCircle2, AlertTriangle, Monitor, Lock, RefreshCw, Radio } from 'lucide-react';
import { rtdb } from '../firebase';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { cn } from '../lib/utils';

interface DadosPageProps {
  onBack: () => void;
}

interface VisitorSession {
  id: string;
  ip?: string;
  userAgent: string;
  lastActive: number;
  loginTime: number;
  deviceType: string;
}

export default function DadosPage({ onBack }: DadosPageProps) {
  const [activeUsers, setActiveUsers] = useState<VisitorSession[]>([]);
  const [lastAccessLog, setLastAccessLog] = useState<{ time: number; userAgent: string } | null>(null);
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // 1. Register current visitor presence in Firebase Realtime Database
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    const sessionRef = ref(rtdb, `analytics/online_users/${sessionId}`);

    const sessionData = {
      id: sessionId,
      userAgent: navigator.userAgent,
      loginTime: Date.now(),
      lastActive: serverTimestamp(),
      deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    };

    set(sessionRef, sessionData).catch((err) => console.error("Error setting session", err));

    // Keepalive ping every 10 seconds to keep presence alive
    const pingInterval = setInterval(() => {
      set(ref(rtdb, `analytics/online_users/${sessionId}/lastActive`), serverTimestamp()).catch(() => {});
    }, 10000);

    // Also update overall last access
    set(ref(rtdb, `analytics/last_access`), {
      time: serverTimestamp(),
      userAgent: navigator.userAgent
    }).catch(() => {});

    // Listen to online users
    const onlineRef = ref(rtdb, 'analytics/online_users');
    const unsubscribeOnline = onValue(onlineRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = Date.now();
        const active: VisitorSession[] = [];
        Object.values(data).forEach((val: any) => {
          // consider active if pinged within last 30 seconds
          if (val && val.lastActive && (now - val.lastActive < 30000)) {
            active.push(val as VisitorSession);
          }
        });
        setActiveUsers(active);
      } else {
        setActiveUsers([]);
      }
    });

    // Listen to last access
    const lastAccessRef = ref(rtdb, 'analytics/last_access');
    const unsubscribeLast = onValue(lastAccessRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setLastAccessLog(val);
      }
    });

    // Listen to total visits counter
    const visitsRef = ref(rtdb, 'analytics/total_visits');
    const unsubscribeVisits = onValue(visitsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setTotalVisits(val);
      } else {
        // initialize if first time
        set(visitsRef, 1);
        setTotalVisits(1);
      }
    });

    return () => {
      clearInterval(pingInterval);
      unsubscribeOnline();
      unsubscribeLast();
      unsubscribeVisits();
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Agora mesmo';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="w-full min-h-screen bg-[#120A05] text-[#F3E5D8] p-4 sm:p-6 md:p-8 flex flex-col font-sans relative overflow-y-auto">
      
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(181, 138, 76, 0.12) 0%, rgba(18, 10, 5, 0.95) 80%)' }} />

      {/* Header Bar */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#3E2718] mb-8">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#2A160A] hover:bg-[#3E2718] border border-[#5C3A21] text-[#E6C79C] flex items-center gap-2 font-medium transition-colors cursor-pointer shadow-lg"
          >
            <ArrowLeft size={18} />
            <span>Voltar ao Início</span>
          </motion.button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B32025] to-[#5C1014] flex items-center justify-center shadow-[0_0_15px_rgba(179,32,37,0.4)] border border-red-500/30">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-950 text-red-400 border border-red-800 uppercase tracking-widest">
                  Área Restrita - Admin
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F9F1E6] tracking-tight">
                Painel de Dados e Conexões
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className={cn(
              "p-2.5 rounded-xl bg-[#2A160A] hover:bg-[#3E2718] border border-[#5C3A21] text-[#E6C79C] flex items-center gap-2 transition-colors cursor-pointer",
              isRefreshing && "animate-spin"
            )}
            title="Atualizar Dados"
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Online Users Now */}
        <div className="p-6 rounded-2xl bg-[#1C1008] border-2 border-[#4A2D19] shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-emerald-500">
            <Radio size={72} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A8835E]">Usuários Online Agora</span>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            </div>
            <div className="text-4xl font-black text-[#F9F1E6] mb-1">
              {activeUsers.length}
            </div>
            <p className="text-xs text-zinc-400">Sessões ativas sincronizadas em tempo real via Firebase.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#311D10] flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 size={14} />
            <span>Transmissão WebSocket Ativa</span>
          </div>
        </div>

        {/* Card 2: Last Access */}
        <div className="p-6 rounded-2xl bg-[#1C1008] border-2 border-[#4A2D19] shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-amber-500">
            <Clock size={72} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A8835E]">Último Acesso Registrado</span>
              <Clock size={18} className="text-amber-400" />
            </div>
            <div className="text-lg font-bold text-[#F9F1E6] mb-1">
              {lastAccessLog ? formatTime(lastAccessLog.time) : 'Calculando...'}
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-xs">
              {lastAccessLog?.userAgent ? lastAccessLog.userAgent : 'Monitorando conexões recentes...'}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#311D10] flex items-center gap-2 text-xs text-amber-400 font-medium">
            <Activity size={14} />
            <span>Última interação gravada</span>
          </div>
        </div>

        {/* Card 3: Total Visits */}
        <div className="p-6 rounded-2xl bg-[#1C1008] border-2 border-[#4A2D19] shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-blue-500">
            <Globe size={72} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A8835E]">Total de Acessos ao App</span>
              <Globe size={18} className="text-blue-400" />
            </div>
            <div className="text-4xl font-black text-[#F9F1E6] mb-1">
              {totalVisits > 0 ? totalVisits : '...'}
            </div>
            <p className="text-xs text-zinc-400">Contador global de visualizações na nuvem.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#311D10] flex items-center gap-2 text-xs text-blue-400 font-medium">
            <Shield size={14} />
            <span>Segurança e Auditoria Ativas</span>
          </div>
        </div>

      </div>

      {/* Detailed Online Sessions Table */}
      <div className="relative z-10 max-w-7xl mx-auto w-full p-6 rounded-2xl bg-[#1C1008] border-2 border-[#4A2D19] shadow-[0_12px_35px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#311D10]">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-[#E6C79C]" />
            <h2 className="text-lg font-bold text-[#F9F1E6]">Dispositivos Conectados Recentemente</h2>
          </div>
          <span className="text-xs bg-[#2A160A] border border-[#5C3A21] px-3 py-1 rounded-full text-[#E6C79C] font-semibold">
            {activeUsers.length} online agora
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#311D10] text-[#A8835E] text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">ID da Sessão</th>
                <th className="py-3 px-4 font-bold">Dispositivo</th>
                <th className="py-3 px-4 font-bold">Navegador / Sistema</th>
                <th className="py-3 px-4 font-bold">Entrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A160A] text-sm text-[#F3E5D8]">
              {activeUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                    Nenhum outro usuário online no momento. (Sua sessão está ativa).
                  </td>
                </tr>
              ) : (
                activeUsers.map((user, idx) => (
                  <tr key={user.id || idx} className="hover:bg-[#24130A] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        <span className="text-xs font-semibold text-emerald-400">Online</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-zinc-400">
                      {user.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#2E190E] border border-[#5C3A21] text-xs font-medium text-[#E6C79C]">
                        {user.deviceType || 'Desktop'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-300 max-w-md truncate" title={user.userAgent}>
                      {user.userAgent}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-400">
                      {formatTime(user.loginTime)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
