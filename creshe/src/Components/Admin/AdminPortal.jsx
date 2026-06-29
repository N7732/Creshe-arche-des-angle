import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { LogIn, Loader2 } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function AdminPortal() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setSession({ user: { email: 'superadmin' } });
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      
      localStorage.setItem('authToken', data.token);
      setSession({ user: { email: email } });
    } catch (error) {
      setMessage(error.error_description || error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 px-4 font-sans selection:bg-indigo-500/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        
        <div className="max-w-4xl w-full bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden min-h-[500px]">
          
          {/* Left Side - Login Form */}
          <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-800 mb-2">Sign In</h2>
              <p className="text-sm font-bold text-slate-400">Secure Admin Portal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all font-medium text-sm"
                  placeholder="Email address"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all font-medium text-sm"
                  placeholder="Password"
                />
              </div>
              
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SECURE LOGIN'}
              </button>
              
              {message && (
                <div className={`p-3 rounded-xl text-xs text-center font-bold ${message.includes('Check') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {message}
                </div>
              )}
            </form>
            
          </div>

          {/* Right Side - Purple Welcome Panel */}
          <div className="w-full md:w-1/2 bg-indigo-600 p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden md:rounded-tl-[100px] md:rounded-bl-[32px]">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4">Hello, Admin!</h2>
              <p className="text-indigo-100 font-medium text-sm leading-relaxed mb-8 max-w-[250px] mx-auto">
                Enter your authorized email and password to log in.
              </p>
              
              <a href="/" className="inline-block border-2 border-white/30 hover:bg-white hover:text-indigo-600 text-white font-bold px-8 py-3 rounded-full transition-colors text-sm tracking-wider uppercase">
                Return to Home
              </a>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return <DashboardLayout session={session} />;
}
