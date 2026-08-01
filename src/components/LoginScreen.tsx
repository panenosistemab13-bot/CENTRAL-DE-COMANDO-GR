import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Coffee,
  Database,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';
import { cn } from '../lib/utils';
import { rtdb, auth } from '../firebase';
import { ref, get, set, push, update } from 'firebase/database';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import coffeeBg from '../assets/images/coffee_rustic_bg_1780760486326.png';

interface LoginScreenProps {
  onLoginSuccess: (user: { email: string; name: string; role: string }) => void;
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

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  // Check if email exists in Dados (system_auth/users)
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, informe seu e-mail corporativo ou cadastrado.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const usersRef = ref(rtdb, 'system_auth/users');
      const snapshot = await get(usersRef);
      const data = snapshot.val();

      let foundUser: any = null;
      if (data) {
        const list = Object.values(data) as any[];
        foundUser = list.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
      }

      // Default bootstrap admin if no users configured yet
      const lowerEmail = email.trim().toLowerCase();
      if (!foundUser && (lowerEmail === 'jeffersondizzy@gmail.com' || lowerEmail === 'panenosistemab13@gmail.com')) {
        foundUser = {
          email: lowerEmail,
          name: 'Administrador Principal',
          password: '#trescafe2027',
          role: 'admin'
        };
        const newRef = push(ref(rtdb, 'system_auth/users'));
        await set(newRef, foundUser);
      }

      if (!foundUser) {
        setError('Este e-mail não está cadastrado na Página de Dados. Solicite ao administrador a liberação do seu acesso.');
        setLoading(false);
        return;
      }

      setRegisteredUser(foundUser);
      setStep('password');
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao verificar e-mail no sistema: ' + (err.message || 'Erro desconhecido'));
      setLoading(false);
    }
  };

  // Handle Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() && registeredUser?.password) {
      setError('Por favor, informe sua senha de acesso.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (registeredUser.password && registeredUser.password !== password) {
        setError('Senha incorreta. Tente novamente ou contate o administrador.');
        setLoading(false);
        return;
      }

      await recordAccessAndProceed(registeredUser);
    } catch (err: any) {
      setError('Erro ao efetuar login: ' + err.message);
      setLoading(false);
    }
  };

  // Google Sign-In with verification in Dados
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const gEmail = googleUser.email;

      if (!gEmail) {
        setError('Não foi possível obter o e-mail da conta Google.');
        setLoading(false);
        return;
      }

      const usersRef = ref(rtdb, 'system_auth/users');
      const snapshot = await get(usersRef);
      const data = snapshot.val();

      let foundUser: any = null;
      if (data) {
        const list = Object.values(data) as any[];
        foundUser = list.find((u: any) => u.email.toLowerCase() === gEmail.toLowerCase());
      }

      const lowerGEmail = gEmail.toLowerCase();
      if (!foundUser && (lowerGEmail === 'jeffersondizzy@gmail.com' || lowerGEmail === 'panenosistemab13@gmail.com')) {
        foundUser = {
          email: lowerGEmail,
          name: googleUser.displayName || 'Administrador Google',
          password: '#trescafe2027',
          role: 'admin'
        };
        const newRef = push(ref(rtdb, 'system_auth/users'));
        await set(newRef, foundUser);
      }

      if (!foundUser) {
        setError(`O e-mail ${gEmail} não está cadastrado na Página de Dados. O administrador precisa cadastrar este e-mail para permitir o acesso.`);
        setLoading(false);
        return;
      }

      await recordAccessAndProceed(foundUser);
    } catch (err: any) {
      console.error(err);
      setError('Erro na autenticação com Google: ' + err.message);
      setLoading(false);
    }
  };

  const recordAccessAndProceed = async (userObj: any) => {
    const now = Date.now();
    const accessEntry = {
      timestamp: now,
      dateFormatted: new Date(now).toLocaleString('pt-BR'),
      userAgent: navigator.userAgent.substring(0, 80)
    };

    const usersRef = ref(rtdb, 'system_auth/users');
    const snapshot = await get(usersRef);
    const data = snapshot.val();

    let userDbKey = '';
    let currentAccessCount = userObj.accessCount || 0;
    
    if (data) {
      for (const [key, val] of Object.entries(data) as [string, any][]) {
        if (val.email.toLowerCase() === userObj.email.toLowerCase()) {
          userDbKey = key;
          currentAccessCount = (val.accessCount || 0) + 1;
          break;
        }
      }
    }

    if (userDbKey) {
      const historyRef = ref(rtdb, `system_auth/users/${userDbKey}/history`);
      const newHistoryRef = push(historyRef);
      await set(newHistoryRef, accessEntry);

      await update(ref(rtdb, `system_auth/users/${userDbKey}`), {
        accessCount: currentAccessCount,
        lastActive: now,
        status: 'online'
      });
    } else {
      const newRef = push(ref(rtdb, 'system_auth/users'));
      await set(newRef, {
        ...userObj,
        accessCount: 1,
        lastActive: now,
        status: 'online'
      });
      const historyRef = ref(rtdb, `system_auth/users/${newRef.key}/history`);
      const newHistoryRef = push(historyRef);
      await set(newHistoryRef, accessEntry);
    }

    const userData = {
      email: userObj.email,
      name: userObj.name || userObj.email,
      role: userObj.role || 'user'
    };

    localStorage.setItem('logged_user', JSON.stringify(userData));
    localStorage.setItem('user_email', userObj.email);

    onLoginSuccess(userData);
  };

  const fillDemoAdmin = () => {
    setEmail('jeffersondizzy@gmail.com');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cover bg-center overflow-y-auto"
      style={{ backgroundImage: `url(${coffeeBg})` }}
    >
      {/* Dark immersive coffee aroma overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#140a04]/95 via-[#231207]/90 to-[#0c0502]/95 backdrop-blur-md" />

      {/* Decorative ambient coffee steam glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c28e48]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#B32025]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg bg-gradient-to-br from-[#2a170c] via-[#211108] to-[#170c05] border-[6px] border-[#593922] rounded-[2.5xl] shadow-[0_35px_70px_rgba(0,0,0,0.95)] p-8 md:p-10 relative ring-4 ring-[#bfa27a]/20 z-10 my-auto text-[#f9f3eb]">
        
        {/* Vintage industrial corner screws */}
        <Screw className="absolute top-4 left-4" />
        <Screw className="absolute top-4 right-4" />
        <Screw className="absolute bottom-4 left-4" />
        <Screw className="absolute bottom-4 right-4" />

        {/* Brand Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[#3d2314] to-[#1c0e06] border-2 border-[#bfa27a]/50 shadow-lg mb-4 relative group">
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B32025] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse delay-300" />
            </div>
            <Coffee className="w-8 h-8 text-[#f1daaf]" />
          </div>

          <div className="flex items-center justify-center gap-2.5 mb-2">
            <span className="bg-[#B32025] text-white font-serif font-black text-xs px-3.5 py-1.5 rounded-full shadow-md tracking-wider uppercase border border-red-400/40">
              3corações
            </span>
            <span className="bg-[#120804] text-[#d4af37] font-mono font-bold text-xs px-3.5 py-1.5 rounded-full shadow-inner border border-[#d4af37]/40 uppercase tracking-widest">
              AssinaGR
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-serif font-black text-[#fbf8f3] tracking-wide uppercase drop-shadow">
            Gerenciamento de Risco
          </h1>
          <p className="text-xs font-serif text-[#d4af37] mt-1.5 tracking-widest uppercase flex items-center justify-center gap-1.5">
            <Award size={13} className="text-[#d4af37]" />
            Sistema de Autenticação Segura • 3C
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-[#3a1111]/90 border-2 border-[#B32025] text-[#ffdada] px-4 py-3.5 rounded-2xl text-xs font-serif flex items-start gap-3 shadow-xl backdrop-blur">
            <AlertCircle size={20} className="text-[#ff6b6b] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold block mb-0.5 text-white tracking-wide">Atenção ao Acesso</strong>
              {error}
            </div>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleCheckEmail} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-mono font-bold text-[#d4af37] uppercase tracking-wider">
                  E-mail Corporativo ou Autorizado
                </label>
                <button
                  type="button"
                  onClick={fillDemoAdmin}
                  className="text-[10px] font-mono text-[#bfa27a] hover:text-[#f1daaf] underline cursor-pointer"
                >
                  Usar Admin Padrão
                </button>
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bfa27a]" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.nome@3coracoes.com.br"
                  className="w-full bg-[#160b05] border-2 border-[#593922] focus:border-[#d4af37] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-serif text-white placeholder-stone-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
              <p className="text-[11px] text-[#bfa27a]/80 font-serif mt-2 italic leading-relaxed">
                * O e-mail deve estar previamente cadastrado na base de dados de segurança da 3 Corações.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#B32025] via-[#a31a1e] to-[#7d1215] hover:from-[#c42429] hover:to-[#8c1418] text-white font-serif font-black py-4 px-6 rounded-2xl shadow-[0_10px_25px_rgba(179,32,37,0.4)] transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider text-xs border border-red-400/30 cursor-pointer disabled:opacity-50 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando e-mail...
                </span>
              ) : (
                <>
                  Continuar para Senha 
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#593922]"></div>
              <span className="flex-shrink mx-4 text-xs font-mono text-[#bfa27a] uppercase tracking-widest">ou acesso rápido</span>
              <div className="flex-grow border-t border-[#593922]"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#1b0f08] hover:bg-[#25150c] text-white border-2 border-[#593922] hover:border-[#d4af37] font-serif font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Entrar com Conta Google Corporativa
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="bg-[#160b05] border-2 border-[#593922] rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <div className="overflow-hidden pr-2">
                <span className="text-[10px] font-mono text-[#d4af37] uppercase block tracking-wider mb-0.5">Usuário Verificado</span>
                <span className="font-serif font-bold text-xs text-white truncate block">{email}</span>
              </div>
              <button 
                type="button" 
                onClick={() => { setStep('email'); setPassword(''); setError(''); }}
                className="text-xs text-[#d4af37] hover:text-white font-serif font-bold underline shrink-0 cursor-pointer"
              >
                Alterar
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#d4af37] uppercase tracking-wider mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#bfa27a]" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#160b05] border-2 border-[#593922] focus:border-[#d4af37] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-serif text-white placeholder-stone-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
              <p className="text-[11px] text-[#bfa27a]/80 font-serif mt-2 italic">
                * Senha cadastrada pelo administrador na central de dados.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#B32025] via-[#a31a1e] to-[#7d1215] hover:from-[#c42429] hover:to-[#8c1418] text-white font-serif font-black py-4 px-6 rounded-2xl shadow-[0_10px_25px_rgba(179,32,37,0.4)] transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider text-xs border border-red-400/30 cursor-pointer disabled:opacity-50 group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando no Sistema...
                </span>
              ) : (
                <>
                  Entrar no Sistema 
                  <CheckCircle2 size={16} className="text-green-300" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Branding Inside Card */}
        <div className="mt-8 pt-5 border-t border-[#593922]/60 text-center">
          <p className="text-[11px] font-serif text-[#bfa27a]">
            3 Corações Alimentos S.A. • Gerenciamento de Risco e Auditoria
          </p>
        </div>

      </div>
    </div>
  );
}
