import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/parents/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Google login failed');
      
      login(data.parent, data.token);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!isLogin) {
      // Registration only applies to parents
      try {
        const response = await fetch('http://localhost:5000/api/parents/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Authentication failed');
        
        login(data.parent, data.token);
        if (onSuccess) onSuccess(data.parent);
        onClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login Flow: Try Parent -> Fallback to Admin
    try {
      // 1. Try Parent Login
      const parentResponse = await fetch('http://localhost:5000/api/parents/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      let data = await parentResponse.json();
      
      if (!parentResponse.ok) {
        // If parent fails, maybe it's an admin?
        const adminResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        });
        const adminData = await adminResponse.json();
        
        if (!adminResponse.ok) {
          throw new Error('Invalid email or password');
        }
        
        // Admin login successful
        const adminUser = {
          id: adminData.token, // Since admin endpoint doesn't return full user object, we construct it
          fullName: email.split('@')[0],
          email: email,
          role: adminData.role || 'superadmin'
        };
        // Also set authToken for admin portal backwards compatibility
        localStorage.setItem('authToken', adminData.token);
        
        login(adminUser, adminData.token);
        if (onSuccess) onSuccess(adminUser);
        onClose();
        setLoading(false);
        return;
      }
      
      // Parent login successful
      data.parent.role = 'parent';
      login(data.parent, data.token);
      if (onSuccess) onSuccess(data.parent);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header Area */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-8 text-center relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-3xl font-black text-white drop-shadow-sm tracking-tight mb-2">
                {isLogin ? 'Welcome Back!' : 'Join Us Today'}
              </h2>
              <p className="text-amber-50 font-medium">
                {isLogin ? 'Sign in to manage your enrollments.' : 'Create an account to enroll your child.'}
              </p>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2 group"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'} 
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 relative flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-700"></div>
                <div className="relative bg-white dark:bg-slate-800 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or Continue With</div>
              </div>

              <div className="mt-8 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  text={isLogin ? "signin_with" : "signup_with"}
                />
              </div>

              <div className="mt-8 text-center">
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
