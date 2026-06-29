import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { 
  LayoutDashboard, Users, Video, Image as ImageIcon, 
  Settings, LogOut, GraduationCap, Building2, Menu, X, Loader2, ShieldAlert, ClipboardCheck, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import Overview from './Overview';
import Students from './Students';
import Staff from './Staff';
import WebSettings from './WebSettings';
import Galleries from './Galleries';
import Facilities from './Facilities';
import Team from './Team';
import Management from './Management';
import Messages from './Messages';

export default function DashboardLayout({ session }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState(null);

  React.useEffect(() => {
    async function fetchRole() {
      if (session?.user?.email) {
        // Since we are using a local admin backend, any logged-in user is an admin
        if (session.user.email === 'nshimyumuremyio228@gmail.com' || session.user.email === 'superadmin') {
          setRole('superadmin');
        } else {
          setRole('superadmin'); // Default all local logins to superadmin for now
        }
      }
    }
    fetchRole();
  }, [session]);

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  const basePath = '/portal/superadmin-secure-login';
  const navItems = [
    { name: 'Overview', path: basePath, icon: LayoutDashboard, roles: ['superadmin', 'teacher', 'editor'] },
    { name: 'Students & Enrollments', path: `${basePath}/students`, icon: GraduationCap, roles: ['superadmin', 'teacher'] },
    { name: 'Staff Management', path: `${basePath}/staff`, icon: Users, roles: ['superadmin'] },
    { name: 'Public Team Profiles', path: `${basePath}/team`, icon: Users, roles: ['superadmin', 'editor'] },
    { name: 'Daily Class Management', path: `${basePath}/management`, icon: ClipboardCheck, roles: ['superadmin', 'teacher'] },
    { name: 'Galleries', path: `${basePath}/galleries`, icon: ImageIcon, roles: ['superadmin', 'editor'] },
    { name: 'Facilities', path: `${basePath}/facilities`, icon: Building2, roles: ['superadmin', 'editor'] },
    { name: 'Contact Messages', path: `${basePath}/messages`, icon: Mail, roles: ['superadmin', 'editor', 'teacher'] },
    { name: 'Web Settings & Video', path: `${basePath}/settings`, icon: Settings, roles: ['superadmin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  const SidebarContent = () => (
    <>
      <div className="p-4 md:p-5">
        <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg shadow-lg flex items-center justify-center text-sm">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          Portal
        </h2>
        <p className="text-xs text-indigo-300 mt-2 font-medium truncate bg-indigo-900/50 p-2 rounded-lg border border-indigo-800">
          {session.user.email}
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide">
        {visibleNavItems.map((item) => {
          // Check if current path exactly matches or matches with trailing slash
          const isActive = location.pathname === item.path || location.pathname === `${item.path}/`;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25' 
                  : 'hover:bg-indigo-900/50 text-indigo-200 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 md:p-5">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2.5 w-full text-center text-red-300 hover:text-white hover:bg-red-500/20 bg-red-500/10 border border-red-500/20 rounded-lg transition-all font-bold backdrop-blur-sm text-sm"
        >
          <LogOut className="w-4 h-4" />
          Secure Sign Out
        </button>
      </div>
    </>
  );

  if (!role) {
    return (
      <div className="min-h-screen bg-[#FDF8F9] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        <p className="font-bold text-slate-800 animate-pulse tracking-wide uppercase text-sm">Loading Privileges...</p>
      </div>
    );
  }

  if (role === 'unauthorized') {
    return (
      <div className="min-h-screen bg-[#FDF8F9] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-600 mb-6">Your account has not been assigned any administrative privileges.</p>
        <button onClick={handleLogout} className="bg-slate-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-slate-900 transition-colors">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FDF8F9] text-slate-800 font-sans selection:bg-pink-500/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#0A0F2C] border-r border-indigo-900/50 flex-col relative overflow-hidden shadow-2xl z-20">
        {/* Decorative ambient glow */}
        <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none"></div>
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0F2C] flex items-center justify-between px-4 z-50 border-b border-indigo-900/50">
        <div className="text-white font-black text-xl flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-md"></div>
          Portal
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-indigo-200 hover:text-white p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="md:hidden fixed top-16 left-0 bottom-0 w-72 bg-[#0A0F2C] flex flex-col z-40 border-r border-indigo-900/50 shadow-2xl"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto mt-16 md:mt-0 relative bg-[#FFF0F5] text-slate-800">
        
        <div className="relative z-10 min-h-full">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="students" element={<Students />} />
            <Route path="staff" element={<Staff />} />
            <Route path="team" element={<Team />} />
            <Route path="management" element={<Management />} />
            <Route path="galleries" element={<Galleries />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<WebSettings />} />
            <Route path="*" element={<Overview />} />
          </Routes>
        </div>
      </main>

    </div>
  );
}
