
import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { Language, translations } from '../utils/translations';
import { BrainCircuit, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { isConfigured } from '../services/supabaseClient';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  showToast: (msg: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, lang, setLang, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState(''); // Treating as Email for Supabase
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = translations[lang];
  const configured = isConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await authService.login(username, password);
        if (result.success && result.user) {
          showToast(t.toastWelcome);
          onLogin(result.user);
        } else {
          const msg = result.message || 'Error';
          setError((t as any)[msg] || msg);
        }
      } else {
        const result = await authService.register(username, password);
        if (result.success && result.user) {
          showToast(t.toastRegistered);
          onLogin(result.user);
        } else {
          const msg = result.message || 'Error';
          setError((t as any)[msg] || msg);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // If the developer hasn't pasted the keys into supabaseClient.ts yet
  if (!configured) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg shadow-2xl">
            <div className="bg-rose-500/10 text-rose-500 p-4 rounded-full inline-flex mb-4">
               <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Setup Required</h2>
            <p className="text-slate-400 mb-6 text-sm">
                To deploy this app, you must configure the database credentials in the source code.
            </p>
            <div className="text-left bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 mb-4">
                <p className="text-slate-500 mb-2">// 1. Open services/supabaseClient.ts</p>
                <p className="text-slate-500 mb-2">// 2. Replace placeholders with your keys:</p>
                <p>const SUPABASE_URL = '...';</p>
                <p>const SUPABASE_ANON_KEY = '...';</p>
            </div>
            <p className="text-xs text-slate-500">
                After saving the file, this screen will automatically disappear.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="z-10 w-full max-w-md">
        {/* Header Logo */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-indigo-600 p-3 rounded-2xl shadow-2xl shadow-indigo-500/20 mb-4">
                <BrainCircuit className="text-white h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{t.appTitle}</h1>
            <p className="text-slate-400 mt-2">{t.appSubtitle} <span className="text-indigo-400 text-xs font-mono px-2 py-0.5 bg-indigo-500/10 rounded-full">CLOUD</span></p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
                {isLogin ? t.loginTitle : t.registerTitle}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 ml-1">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon size={18} className="text-slate-500" />
                        </div>
                        <input
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 ml-1">{t.password}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-500" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder={t.password}
                            minLength={6}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : (
                        <>
                            {isLogin ? t.btnLogin : t.btnRegister}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => { setIsLogin(!isLogin); setError(null); }}
                    className="text-slate-400 hover:text-white text-sm transition-colors hover:underline"
                >
                    {isLogin ? t.linkRegister : t.linkLogin}
                </button>
            </div>
        </div>

        {/* Language Switcher */}
        <div className="mt-8 flex justify-center gap-2">
            <button 
                onClick={() => setLang('zh')} 
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${lang === 'zh' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
                中文
            </button>
            <div className="w-px h-6 bg-slate-800"></div>
            <button 
                onClick={() => setLang('en')} 
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${lang === 'en' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
                English
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
