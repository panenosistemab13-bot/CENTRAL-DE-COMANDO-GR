import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Shield, 
  Activity, 
  Wifi, 
  WifiOff, 
  UserCheck, 
  Calendar,
  HardDrive,
  Server,
  Folder,
  FolderOpen,
  UserPlus,
  Trash2,
  Key,
  Mail,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb } from '../firebase';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { motion } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AccessSession {
  id: string;
  timestamp: number;
  dateFormatted: string;
  userAgent?: string;
}

interface SystemUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: string;
  accessCount?: number;
  lastActive?: number;
  status?: 'online' | 'offline';
  history?: Record<string, AccessSession>;
}

function Screw({ className }: { className?: string }) {
  return (
    <div className={cn(
      "w-4 h-4 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65),inset_0.5px_0.5px_1px_rgba(255,255,255,0.25)] relative flex items-center justify-center select-none shrink-0",
      className
    )}>
      <div className="w-2.5 h-[1.5px] bg-[#311b09]/80 rotate-[35deg] rounded-sm shadow-inner" />
    </div>
  );
}

const WoodenPlaque: React.FC<{
  children: React.ReactNode;
  className?: string;
  screwSize?: string;
}> = ({ children, className, screwSize }) => {
  return (
    <div className={cn(
      "rounded-2xl bg-gradient-to-br from-[#f8f1e5] via-[#eddaba] to-[#e4cbab] border-[6px] border-[#311f14] shadow-[0_22px_45px_rgba(0,0,0,0.88),inset_1.5px_1.5px_3px_rgba(255,255,255,0.45)] relative p-6 flex flex-col justify-between ring-2 ring-[#1c1109]/30",
      className
    )}>
      <Screw className={cn("absolute top-3 left-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute top-3 right-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute bottom-3 left-3 w-3 h-3", screwSize)} />
      <Screw className={cn("absolute bottom-3 right-3 w-3 h-3", screwSize)} />
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
};

export default function Dados() {
  const [users, setUsers] = useState<Record<string, SystemUser>>({});
  const [loading, setLoading] = useState(true);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);

  // New user form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const authUsersRef = ref(rtdb, 'system_auth/users');
    const unsubscribe = onValue(authUsersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(data);
      } else {
        // Bootstrap initial admin if empty
        const defaultAdmin = {
          email: 'jeffersondizzy@gmail.com',
          name: 'Administrador Principal',
          password: '#trescafe2027',
          role: 'admin',
          accessCount: 1,
          lastActive: Date.now()
        };
        const newRef = push(authUsersRef);
        set(newRef, defaultAdmin);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword.trim()) {
      setErrorMsg('Informe o email e a senha para o novo usuário.');
      return;
    }

    try {
      const authUsersRef = ref(rtdb, 'system_auth/users');
      const newUserRef = push(authUsersRef);
      await set(newUserRef, {
        email: newEmail.trim().toLowerCase(),
        name: newName.trim() || newEmail.split('@')[0],
        password: newPassword.trim(),
        role: newRole,
        accessCount: 0,
        lastActive: Date.now(),
        status: 'offline'
      });

      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNewRole('user');
      setShowAddForm(false);
      setSuccessMsg('Usuário adicionado com sucesso à Página de Dados!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('Erro ao adicionar usuário: ' + err.message);
    }
  };

  const handleDeleteUser = async (userKey: string) => {
    if (window.confirm('Tem certeza que deseja remover este usuário do sistema?')) {
      try {
        await remove(ref(rtdb, `system_auth/users/${userKey}`));
        setSuccessMsg('Usuário removido com sucesso.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err: any) {
        setErrorMsg('Erro ao remover usuário: ' + err.message);
      }
    }
  };

  const userList = Object.entries(users).map(([key, val]) => ({ key, ...(val as SystemUser) }));
  const totalAccesses = userList.reduce((acc, u) => acc + (u.accessCount || 0), 0);
  const onlineCount = userList.filter(u => u.status === 'online').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#2D1A10] text-stone-100 font-sans p-6 space-y-6" style={{ zoom: 0.88 }}>
      
      {/* HEADER */}
      <div className="bg-[#3A2414] border-4 border-[#6B4423] rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-md"></div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-[#fdf8f0] uppercase font-serif flex items-center gap-2">
              <Database size={24} className="text-[#C7A26A]" />
              PÁGINA DE DADOS • CONTROLE DE ACESSOS & CREDENCIAIS
            </h1>
            <p className="text-xs text-[#eddaba]/80 font-serif mt-1">
              Gerencie cadastros de e-mail/senha e monitore o histórico completo de acessos de cada usuário.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#B32025] hover:bg-[#9a1a1e] text-white font-serif font-black px-4 py-2.5 rounded-2xl shadow-lg transition-all flex items-center gap-2 uppercase tracking-wider text-xs border border-[#d4bc96]/40 cursor-pointer"
          >
            <UserPlus size={16} />
            {showAddForm ? 'Fechar Formulário' : 'Adicionar Novo Usuário'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-serif flex items-center gap-2 shadow-md">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-100 border-2 border-red-400 text-red-900 px-4 py-3 rounded-2xl text-xs font-serif flex items-center gap-2 shadow-md">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* ADD USER FORM MODAL/PANEL */}
      {showAddForm && (
        <WoodenPlaque className="p-6 border-4 border-[#B32025]">
          <div className="flex items-center justify-between mb-4 border-b border-[#d4bc96] pb-3">
            <h2 className="text-sm font-serif font-black uppercase text-[#311f14] flex items-center gap-2">
              <UserPlus size={18} className="text-[#B32025]" />
              Cadastrar Novo Usuário Autorizado na Página de Dados
            </h2>
            <span className="text-[10px] font-mono text-[#5c3c24]">O usuário só poderá logar se estiver cadastrado aqui</span>
          </div>

          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#5c3c24] uppercase tracking-wider mb-1">Nome do Usuário</label>
              <input 
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-white/80 border-2 border-[#d4bc96] rounded-xl px-3 py-2 text-xs font-serif text-[#311f14] focus:outline-none focus:border-[#B32025]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-[#5c3c24] uppercase tracking-wider mb-1">E-mail (Google / Login)</label>
              <input 
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="joao@empresa.com"
                className="w-full bg-white/80 border-2 border-[#d4bc96] rounded-xl px-3 py-2 text-xs font-serif text-[#311f14] focus:outline-none focus:border-[#B32025]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-[#5c3c24] uppercase tracking-wider mb-1">Senha de Acesso</label>
              <input 
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Senha temporária"
                className="w-full bg-white/80 border-2 border-[#d4bc96] rounded-xl px-3 py-2 text-xs font-serif text-[#311f14] focus:outline-none focus:border-[#B32025]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-[#B32025] hover:bg-[#9a1a1e] text-white font-serif font-black py-2.5 px-4 rounded-xl shadow-md transition-all uppercase tracking-wider text-xs cursor-pointer"
              >
                Salvar Cadastro
              </button>
            </div>
          </form>
        </WoodenPlaque>
      )}

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WoodenPlaque className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-extrabold text-[#5c3c24] uppercase tracking-wider">Usuários Cadastrados</span>
            <Users size={20} className="text-[#B32025]" />
          </div>
          <div className="text-3xl font-serif font-black text-[#311f14]">
            {userList.length} <span className="text-xs font-sans font-bold text-[#5c3c24]">perfis</span>
          </div>
          <p className="text-xs text-[#5c3c24] italic font-serif mt-2">
            E-mails autorizados para acesso via Google ou senha.
          </p>
        </WoodenPlaque>

        <WoodenPlaque className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-extrabold text-[#5c3c24] uppercase tracking-wider">Total de Acessos ao App</span>
            <Activity size={20} className="text-emerald-700" />
          </div>
          <div className="text-3xl font-serif font-black text-[#311f14]">
            {totalAccesses} <span className="text-xs font-sans font-bold text-[#5c3c24]">sessões registradas</span>
          </div>
          <p className="text-xs text-[#5c3c24] italic font-serif mt-2">
            Soma de todas as entradas de todos os usuários.
          </p>
        </WoodenPlaque>

        <WoodenPlaque className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-extrabold text-[#5c3c24] uppercase tracking-wider">Status Geral</span>
            <Server size={20} className="text-[#C7A26A]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-serif font-black text-sm text-[#311f14]">Banco de Dados Ativo</span>
          </div>
          <p className="text-xs text-[#5c3c24] italic font-serif mt-2">
            Monitoramento em tempo real conectado.
          </p>
        </WoodenPlaque>
      </div>

      {/* USER FOLDERS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-serif font-black uppercase text-[#eddaba] flex items-center gap-2">
            <FolderOpen size={20} className="text-[#C7A26A]" />
            Pastas Individuais de Usuários ({userList.length})
          </h2>
          <span className="text-xs font-mono text-[#eddaba]/70">Clique na pasta para ver o histórico detalhado de acessos</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 text-[#eddaba] animate-spin" />
          </div>
        ) : userList.length === 0 ? (
          <WoodenPlaque className="p-12 text-center text-[#5c3c24] font-serif italic">
            Nenhum usuário cadastrado na Página de Dados.
          </WoodenPlaque>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {userList.map((user) => {
              const isExpanded = expandedFolder === user.key;
              const historyEntries = user.history ? Object.values(user.history) as AccessSession[] : [];
              // Sort history descending by timestamp
              historyEntries.sort((a, b) => b.timestamp - a.timestamp);

              return (
                <div key={user.key} className="transition-all">
                  <WoodenPlaque className={cn(
                    "p-5 transition-all cursor-pointer border-2",
                    isExpanded ? "border-[#B32025] shadow-2xl bg-gradient-to-br from-[#fbf5eb] via-[#f3e6d0] to-[#ecd7b8]" : "border-[#311f14]"
                  )}>
                    <div 
                      onClick={() => setExpandedFolder(isExpanded ? null : user.key)}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#311f14] border-2 border-[#C7A26A] flex items-center justify-center text-[#eddaba] shadow-md shrink-0">
                          {isExpanded ? <FolderOpen size={24} /> : <Folder size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-serif font-black text-base text-[#311f14]">{user.name}</span>
                            <span className="px-2 py-0.5 rounded bg-[#311f14] text-[#eddaba] font-mono text-[10px] font-bold uppercase">
                              {user.role || 'Usuário'}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-[#5c3c24] flex items-center gap-1.5 mt-0.5">
                            <Mail size={12} className="text-[#B32025]" />
                            {user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                          <span className="block text-[9px] font-mono uppercase text-[#5c3c24]">Total de Acessos</span>
                          <strong className="font-serif font-black text-base text-[#311f14]">
                            {user.accessCount || 0} {user.accessCount === 1 ? 'acesso' : 'acessos'}
                          </strong>
                        </div>

                        <div className="text-right">
                          <span className="block text-[9px] font-mono uppercase text-[#5c3c24]">Última Vez Visto</span>
                          <strong className="font-serif font-bold text-xs text-[#311f14]">
                            {user.lastActive ? (() => {
                              try {
                                const d = new Date(user.lastActive);
                                if (isNaN(d.getTime())) return 'Nunca';
                                return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
                              } catch {
                                return 'Nunca';
                              }
                            })() : 'Nunca'}
                          </strong>
                        </div>

                        {user.email !== 'panenosistemab13@gmail.com' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.key); }}
                            className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 transition-colors cursor-pointer"
                            title="Remover Usuário"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        <div className="w-8 h-8 rounded-xl bg-[#311f14]/10 flex items-center justify-center text-[#311f14]">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED FOLDER CONTENT: HISTÓRICO DE TODAS AS VEZES QUE ACESSOU */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 pt-6 border-t-2 border-[#d4bc96] space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-serif font-black uppercase text-[#311f14] flex items-center gap-2">
                            <Clock size={16} className="text-[#B32025]" />
                            Histórico de Acessos Detalhado ({historyEntries.length} registros de data e hora)
                          </h3>
                          <span className="text-[10px] font-mono text-[#5c3c24]">Senha atual: <code className="bg-white px-2 py-0.5 rounded font-bold text-[#B32025]">{user.password || 'N/A'}</code></span>
                        </div>

                        {historyEntries.length === 0 ? (
                          <div className="bg-white/50 border border-[#d4bc96] rounded-xl p-4 text-center text-xs font-serif text-[#5c3c24] italic">
                            Nenhum acesso registrado ainda. O histórico aparecerá assim que o usuário fizer login.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
                            {historyEntries.map((session, idx) => (
                              <div key={session.id || idx} className="bg-white/80 border border-[#d4bc96] rounded-xl p-3 shadow-sm flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#B32025]/10 flex items-center justify-center text-[#B32025] font-mono font-bold text-xs shrink-0">
                                  #{historyEntries.length - idx}
                                </div>
                                <div>
                                  <span className="block font-serif font-black text-xs text-[#311f14]">
                                    {session.dateFormatted || (session.timestamp ? (() => {
                                      try {
                                        const d = new Date(session.timestamp);
                                        if (isNaN(d.getTime())) return '—';
                                        return format(d, 'dd/MM/yyyy HH:mm:ss');
                                      } catch {
                                        return '—';
                                      }
                                    })() : '—')}
                                  </span>
                                  {session.userAgent && (
                                    <span className="block text-[9px] font-mono text-[#5c3c24] truncate max-w-[200px]" title={session.userAgent}>
                                      {session.userAgent}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </WoodenPlaque>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
