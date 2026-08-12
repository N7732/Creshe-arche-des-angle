import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Image as ImageIcon, 
  Settings, LogOut, GraduationCap, Building2, Menu, X, Loader2, ShieldAlert, ClipboardCheck, Mail, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

import Overview from './Overview';
import Students from './Students';
import Staff from './Staff';
import WebSettings from './WebSettings';
import Galleries from './Galleries';
import Facilities from './Facilities';
import Team from './Team';
import Management from './Management';
import Messages from './Messages';
import AdminTestimonies from './AdminTestimonies';
import Guardians from './Guardians';

export default function DashboardLayout({ session }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState(null);

  React.useEffect(() => {
    async function fetchRole() {
      if (session?.user?.email) {
        // Since we are using a unified auth frontend, if they get past AdminPortal, they are an admin
        // By default, we will grant them superadmin dashboard access. In a larger system we could read from the token payload.
        setRole('superadmin');
      }
    }
    fetchRole();
  }, [session]);

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('parentData');
    localStorage.removeItem('parentToken');
    window.location.href = '/';
  };

  const basePath = '/portal/superadmin-secure-login';
  const navItems = [
    { name: t('admin.nav_overview'), path: basePath, icon: LayoutDashboard, roles: ['superadmin', 'teacher', 'editor'] },
    { name: t('admin.nav_students'), path: `${basePath}/students`, icon: GraduationCap, roles: ['superadmin', 'teacher'] },
    { name: t('admin.nav_staff'), path: `${basePath}/staff`, icon: Users, roles: ['superadmin'] },
    { name: t('admin.nav_guardians'), path: `${basePath}/guardians`, icon: Users, roles: ['superadmin'] },
    { name: t('admin.nav_team'), path: `${basePath}/team`, icon: Users, roles: ['superadmin', 'editor'] },
    { name: t('admin.nav_management'), path: `${basePath}/management`, icon: ClipboardCheck, roles: ['superadmin', 'teacher'] },
    { name: t('admin.nav_galleries'), path: `${basePath}/galleries`, icon: ImageIcon, roles: ['superadmin', 'editor'] },
    { name: t('admin.nav_facilities'), path: `${basePath}/facilities`, icon: Building2, roles: ['superadmin', 'editor'] },
    { name: t('admin.nav_messages'), path: `${basePath}/messages`, icon: Mail, roles: ['superadmin', 'editor', 'teacher'] },
    { name: t('admin.nav_testimonies'), path: `${basePath}/testimonies`, icon: MessageSquare, roles: ['superadmin', 'editor'] },
    { name: t('admin.nav_settings'), path: `${basePath}/settings`, icon: Settings, roles: ['superadmin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center text-sm transform group-hover:scale-105 transition-all">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">{t('admin.portal_title')}</h2>
            <p className="text-xs text-slate-400 font-medium">{t('admin.portal_sub')}</p>
          </div>
        </Link>
        <div className="mt-6 flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black shadow-md">
            {session.user.email ? session.user.email.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{session.user.email.split('@')[0]}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide py-2">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname === `${item.path}/`;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm group ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-amber-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-3 w-full text-center text-rose-400 hover:text-white hover:bg-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all font-bold backdrop-blur-sm shadow-sm hover:shadow-rose-500/20"
        >
          <LogOut className="w-5 h-5" />
          {t('admin.sign_out')}
        </button>
      </div>
    </>
  );

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="font-bold text-slate-300 animate-pulse tracking-widest uppercase text-sm">{t('admin.auth')}</p>
      </div>
    );
  }

  if (role === 'unauthorized') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">{t('admin.access_denied')}</h2>
        <p className="text-slate-400 mb-6">{t('admin.access_denied_msg')}</p>
        <button onClick={handleLogout} className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-slate-200 transition-colors">
          {t('admin.sign_out')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 font-sans selection:bg-amber-500/30" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-slate-900/50 border-r border-slate-800 flex-col relative overflow-hidden backdrop-blur-xl z-20 shadow-2xl">
        {/* Decorative ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-6 z-50 border-b border-slate-800">
        <div className="text-white font-black text-xl flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          Portal
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-lg transition-colors">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="md:hidden fixed top-20 left-0 bottom-0 w-72 bg-slate-900/95 backdrop-blur-2xl flex flex-col z-40 border-r border-slate-800 shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto mt-20 md:mt-0 relative bg-slate-950">
        {/* Global ambient glow for main content */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="relative z-10 min-h-full p-4 md:p-8 lg:p-10">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="students" element={<Students />} />
            <Route path="staff" element={<Staff />} />
            <Route path="guardians" element={<Guardians />} />
            <Route path="team" element={<Team />} />
            <Route path="management" element={<Management />} />
            <Route path="galleries" element={<Galleries />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="messages" element={<Messages />} />
            <Route path="testimonies" element={<AdminTestimonies />} />
            <Route path="settings" element={<WebSettings />} />
            <Route path="*" element={<Overview />} />
          </Routes>
        </div>
      </main>

    </div>
  );
}
