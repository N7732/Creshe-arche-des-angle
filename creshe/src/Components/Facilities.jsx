import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { fetcher } from '../utils/fetcher';

export default function Facilities({ handleNav }) {
  const { t } = useTranslation();
  const { data, isLoading } = useSWR('http://localhost:5000/api/facilities', fetcher);
  const facilities = Array.isArray(data) ? data : [];
  const loading = isLoading;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-blue-900/25 dark:bg-slate-800">
      
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4 mb-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white">{t('facilities.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-lg leading-relaxed">
          {t('facilities.sub')}
        </p>
      </section>

      {/* Grid Layout matching screenshot */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center text-slate-500 py-12 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700">
            <p className="text-xl font-bold">{t('facilities.empty')}</p>
            <p className="mt-2">{t('facilities.empty_sub')}</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 md:pb-0">
            {facilities.map((facility, idx) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-center bg-white dark:bg-slate-800 flex flex-col shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden rounded-3xl group"
              >
                {/* Top Banner */}
                <div className="bg-green-800 py-3 text-center">
                  <h2 className="text-white font-bold text-xl tracking-wide">{facility.title}</h2>
                </div>
                
                {/* Image */}
                <div className="w-full h-56 md:h-64 overflow-hidden relative bg-slate-100 dark:bg-slate-900">
                  {facility.image_url ? (
                    <img 
                      src={facility.image_url} 
                      alt={facility.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">{t('facilities.no_image')}</div>
                  )}
                </div>

                {/* Content Box */}
                <div className="p-6 md:p-8 flex flex-col items-center text-center grow">
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">{facility.title}</h3>
                  
                  <p className="text-black dark:text-slate-200 font-medium text-sm leading-relaxed mb-8 grow">
                    {facility.description}
                  </p>

                  <button 
                    onClick={() => handleNav('gallery', facility.category || 'All')}
                    className="bg-[#8B5A2B] hover:bg-[#704822] text-white px-8 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm"
                  >
                    {t('facilities.learn_more')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
