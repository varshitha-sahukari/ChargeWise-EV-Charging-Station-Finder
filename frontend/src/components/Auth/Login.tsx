import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Try admin@chargewise.in / admin123 or user@chargewise.in / user123.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin('user@chargewise.in'); // Mock google token login
      navigate('/');
    } catch (err) {
      setError('Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-green-500/10 blur-[120px] pointer-events-none" />

      <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 text-center animate-in zoom-in-95 duration-200">
        
        {/* Brand Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/25 mb-5">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        
        <h2 className="font-display font-extrabold text-2xl text-white tracking-tight leading-none">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-2 font-medium">Log in to find stations and plan routes</p>

        {error && (
          <div className="mt-4 p-3.5 bg-red-950/20 border border-red-500/10 text-red-400 text-xs rounded-xl text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="e.g. user@chargewise.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 text-slate-200 text-xs border border-white/5 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 text-slate-200 text-xs border border-white/5 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-[10px] font-bold text-emerald-400 hover:text-emerald-350 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/10 active:scale-98 transition-all text-center flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <span className="h-px bg-white/5 flex-1" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">or sign in with</span>
          <span className="h-px bg-white/5 flex-1" />
        </div>

        {/* Mock Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 font-extrabold text-xs rounded-2xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <Globe className="w-4 h-4" />
          Google Account
        </button>

        <p className="text-xs text-slate-400 mt-6 font-medium">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-emerald-400 hover:underline">
            Register Here
          </Link>
        </p>

        {/* Admin/User credentials reference */}
        <div className="mt-6 pt-4 border-t border-white/5 text-[10px] text-slate-500 text-left space-y-1">
          <p className="font-semibold text-slate-400">Demo Credentials:</p>
          <p>Admin: admin@chargewise.in / admin123</p>
          <p>User: user@chargewise.in / user123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
