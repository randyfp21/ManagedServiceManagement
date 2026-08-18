import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Lock, User, ArrowRight, ShieldCheck, AlertCircle, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch, setToken, setUser } from '../utils/api';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (res.success && res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        setIsTransitioning(true);
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setError(res.message || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animate-gradient-bg flex flex-col justify-between items-center p-4 relative overflow-hidden select-none">
      {/* Full-screen Login Success Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="text-center space-y-5 max-w-sm w-full">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-2xl shadow-blue-500/50 transform animate-bounce">
                <Layers className="h-10 w-10" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 animate-pulse" />
                <span>Autentikasi Berhasil!</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 font-medium">
                Selamat datang kembali, <strong className="text-blue-400">Randy Farhan</strong>! Menyiapkan Dashboard...
              </p>
            </div>

            {/* Smooth Loading Bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full animate-pulse transition-all duration-1000 w-full"></div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              <span>Memuat data alokasi & profitabilitas...</span>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex-1 flex flex-col justify-center items-center relative z-10 my-auto">
        <div className="w-full max-w-md">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 items-center justify-center shadow-2xl shadow-blue-500/30 text-white mb-4 transition-transform hover:scale-105">
              <Layers className="h-9 w-9" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AIGS Resource Management
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Managed Services Allocation & Profitability System</span>
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"></div>

            <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
              <span>Sign In</span>
              <span className="text-xs text-blue-400 font-normal flex items-center gap-1 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                <ShieldCheck className="h-3.5 w-3.5" /> IDR Currency Mode
              </span>
            </h2>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username / Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || isTransitioning}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 group text-sm disabled:opacity-50"
              >
                {loading || isTransitioning ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Small Alert below login form */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                <span>ONLY RANDY CAN ACCESS !</span>
              </div>
            </div>

            {/* Quick Demo Credentials */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Demo Credentials: <code className="text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded">admin</code> / <code className="text-blue-400 bg-slate-800 px-1.5 py-0.5 rounded">admin123</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="py-4 text-center text-xs text-slate-500 font-medium relative z-10">
        copyright by Randy Farhan 2026
      </footer>
    </div>
  );
}
