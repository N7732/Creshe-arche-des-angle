import React, { useState, useEffect } from 'react';
import { Loader2, Mail, Phone, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { fetcher } from '../../utils/fetcher';

export default function Messages() {
  const { t } = useTranslation();
  const { data, error, isLoading } = useSWR(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact`, fetcher);
  
  useEffect(() => {
    if (error && error.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
  }, [error]);

  const messages = Array.isArray(data) ? data : [];
  const loading = isLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white text-slate-900 p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
              <Mail className="w-6 h-6" />
            </div>
            {t('admin.messages.title')}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            {t('admin.messages.sub')}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 text-slate-900 px-5 py-3 rounded-2xl border border-slate-100">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{t('admin.messages.total')}</div>
            <div className="text-2xl font-black text-slate-800">{messages.length}</div>
          </div>
        </div>
      </div>

      {/* Messages Grid */}
      {messages.length === 0 ? (
        <div className="bg-white text-slate-900 rounded-[32px] shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-24 h-24 bg-slate-50 text-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">{t('admin.messages.empty')}</h3>
          <p className="text-slate-500 font-medium">{t('admin.messages.empty_sub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white text-slate-900 rounded-[24px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50 text-slate-900/50">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{msg.subject}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{msg.parentName}</div>
                      <a href={`mailto:${msg.email}`} className="text-sm text-indigo-600 hover:underline block mt-0.5">{msg.email}</a>
                      <a href={`tel:${msg.phone}`} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 mt-1 transition-colors">
                        <Phone className="w-3 h-3" /> {msg.phone}
                      </a>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                    {msg.message}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
