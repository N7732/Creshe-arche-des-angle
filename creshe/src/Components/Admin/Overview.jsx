import React, { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, Building2, Image as ImageIcon, Loader2, 
  MessageSquare, ChevronRight, Activity, Clock 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { fetcher } from '../../utils/fetcher';

const API_BASE = 'https://backend-creshe.onrender.com/api';

export default function Overview() {
  const { t } = useTranslation();
  const { data: enrollmentsData, error: enrollError } = useSWR(`${API_BASE}/enrollments`, fetcher);
  const { data: facilitiesData } = useSWR(`${API_BASE}/facilities`, fetcher);
  const { data: galleriesData } = useSWR(`${API_BASE}/galleries`, fetcher);
  const { data: messagesData } = useSWR(`${API_BASE}/contact`, fetcher);

  useEffect(() => {
    if (enrollError && enrollError.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
  }, [enrollError]);

  const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
  const facilities = Array.isArray(facilitiesData) ? facilitiesData : [];
  const galleries = Array.isArray(galleriesData) ? galleriesData : [];
  const messages = Array.isArray(messagesData) ? messagesData : [];

  const pending = enrollments.filter(e => e.status === 'Submitted' || e.status === 'Reviewing').length;
  const active = enrollments.filter(e => e.status === 'Enrolled').length;

  const stats = {
    totalStudents: enrollments.length || 0,
    activeStudents: active,
    totalFacilities: facilities.length || 0,
    totalGalleries: galleries.length || 0,
    pendingEnrollments: pending,
    unreadMessages: messages.length || 0
  };

  const recentEnrollments = enrollments.slice(0, 5);
  const recentMessages = messages.slice(0, 5);
  const loading = !enrollmentsData && !enrollError;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-4 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-amber-500 font-bold tracking-widest uppercase text-xs animate-pulse">{t('admin.overview.init')}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: t('admin.overview.total_req'), value: stats.totalStudents, icon: GraduationCap, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { title: t('admin.overview.pending'), value: stats.pendingEnrollments, icon: Clock, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
    { title: t('admin.overview.active'), value: stats.activeStudents, icon: Users, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { title: t('admin.overview.messages'), value: stats.unreadMessages, icon: MessageSquare, color: 'from-rose-400 to-pink-500', shadow: 'shadow-pink-500/20' },
    { title: t('admin.overview.facilities'), value: stats.totalFacilities, icon: Building2, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/20' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">{t('admin.overview.sys_online')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{t('admin.overview.title')}</h1>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 px-5 py-2.5 rounded-xl backdrop-blur-md inline-flex items-center gap-3 shadow-xl">
          <Activity className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-slate-300">{t('admin.overview.live')}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-slate-900/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 relative overflow-hidden group hover:-translate-y-1.5 transition-all duration-300 shadow-lg ${stat.shadow}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon className="w-6 h-6" />
            </div>
            
            <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Complex Data Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Enrollments */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[400px]"
        >
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <h2 className="text-lg font-black text-white flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </div>
              {t('admin.overview.recent_enr')}
            </h2>
            <Link to="students" className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center transition-colors px-3 py-1.5 bg-amber-500/10 rounded-lg hover:bg-amber-500/20">
              {t('admin.overview.view_all')} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="p-3 grow overflow-y-auto scrollbar-hide">
            {recentEnrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                <GraduationCap className="w-8 h-8 opacity-20" />
                <span className="font-medium text-sm">{t('admin.overview.no_enr')}</span>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {recentEnrollments.map(enr => (
                  <li key={enr.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/80 transition-all group flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200 text-sm group-hover:text-amber-400 transition-colors">{enr.childName}</p>
                      <p className="text-xs text-slate-400 mt-1">{enr.parentName} <span className="mx-2 text-slate-600">•</span> {new Date(enr.submissionDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-sm ${
                      enr.status === 'Submitted' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      enr.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      enr.status === 'Enrolled' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {enr.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

        {/* Recent Messages */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[400px]"
        >
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <h2 className="text-lg font-black text-white flex items-center gap-3">
              <div className="p-1.5 bg-rose-500/20 rounded-lg">
                <MessageSquare className="w-4 h-4 text-rose-400" />
              </div>
              {t('admin.overview.recent_msg')}
            </h2>
            <Link to="messages" className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center transition-colors px-3 py-1.5 bg-amber-500/10 rounded-lg hover:bg-amber-500/20">
              {t('admin.overview.view_all')} <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="p-3 grow overflow-y-auto scrollbar-hide">
            {recentMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                <MessageSquare className="w-8 h-8 opacity-20" />
                <span className="font-medium text-sm">{t('admin.overview.no_msg')}</span>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {recentMessages.map(msg => (
                  <li key={msg.id} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/80 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-200 text-sm group-hover:text-rose-400 transition-colors">{msg.parentName}</p>
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded-md">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-300 mb-1">{msg.subject}</p>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{msg.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
