import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { fetcher } from '../utils/fetcher';

export default function Staff() {
  const { t } = useTranslation();
  const { data, isLoading } = useSWR('https://backend-creshe.onrender.com/api/team', fetcher);
  const loading = isLoading;

  const staffMembers = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(member => ({
      id: member.id,
      full_name: member.name,
      role_title: member.role,
      avatar_url: member.image_url,
      email: member.email,
      phone: member.phone,
      bio: member.bio,
    }));
  }, [data]);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50 dark:bg-slate-800">
      
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4 mb-16">
        <span className="text-sm font-extrabold text-primary uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 px-4 py-1 rounded-full">{t('staff.badge')}</span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white">{t('staff.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
          {t('staff.sub')}
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : staffMembers.length === 0 ? (
          <div className="text-center text-slate-500 py-12 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xl font-bold">{t('staff.empty')}</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 sm:pb-0">
            {staffMembers.map((staff, idx) => (
              <motion.div
                key={staff.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="shrink-0 w-[85vw] sm:w-auto snap-center bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-700 group"
              >
                {/* Image Header */}
                <div className="relative h-72 overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <div className={`absolute inset-0 bg-gradient-to-t ${staff.color || 'from-primary to-blue-600'} mix-blend-multiply opacity-20 group-hover:opacity-10 transition-opacity z-10`}></div>
                  {staff.avatar_url ? (
                    <img 
                      src={staff.avatar_url} 
                      alt={staff.full_name} 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="text-slate-400 font-bold tracking-widest uppercase">{t('staff.no_photo')}</div>
                  )}
                  
                  {/* Role Badge */}
                  <div className="absolute top-3 right-3 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                    <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-100 tracking-wider">
                      {staff.role_title || t('staff.default_role')}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 md:p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-1">{staff.full_name || t('staff.unnamed')}</h3>
                    {staff.bio && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mt-2 mb-2 leading-relaxed">{staff.bio}</p>}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <a 
                      href={`tel:${staff.phone || ''}`}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      {staff.phone || t('staff.na')}
                    </a>
                    
                    <a 
                      href={`mailto:${staff.email || ''}`}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium"
                    >
                      <div className="w-7 h-7 rounded-full bg-pink-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{staff.email || t('staff.na')}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
