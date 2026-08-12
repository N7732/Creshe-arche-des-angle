import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { fetcher } from '../utils/fetcher';

const categories = ['All', 'Playing', 'Learning', 'Sports', 'Art', 'Events', 'Classrooms', 'General'];

export default function Gallery({ initialCategory = 'All' }) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedImage, setSelectedImage] = useState(null);

  const { data, isLoading } = useSWR(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/galleries`, fetcher);
  const galleries = Array.isArray(data) ? data : [];
  const loading = isLoading;

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  const filteredImages = activeCategory === 'All' 
    ? galleries 
    : galleries.filter(img => img.category === activeCategory);

  return (
    <div className="pt-32 pb-24 min-h-screen bg-slate-50 dark:bg-slate-800">
      
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4 mb-12">
        <span className="text-sm font-extrabold text-primary uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 px-4 py-1 rounded-full">{t('gallery.badge')}</span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white">{t('gallery.title')}</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
          {t('gallery.sub')}
        </p>
      </section>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 px-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all transform ${
              activeCategory === cat 
                ? 'bg-primary text-white shadow-lg scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:text-primary'
            }`}
          >
            {t(`gallery.cats.${cat}`, cat)}
          </button>
        ))}
      </div>

      {/* Masonry Layout (CSS Columns) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            {t('gallery.empty')}
          </div>
        ) : (
          <motion.div layout className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar sm:block sm:columns-2 lg:columns-3 gap-6 sm:space-y-6 pb-8 sm:pb-0">
            <AnimatePresence>
              {filteredImages.map((img) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  key={img.id}
                  className="shrink-0 w-[85vw] sm:w-auto snap-center relative group overflow-hidden rounded-2xl shadow-md cursor-pointer break-inside-avoid bg-slate-200 dark:bg-slate-900"
                  onClick={() => setSelectedImage(img)}
                >
                  <img 
                    src={img.image_url} 
                    alt={img.title} 
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 min-h-[200px]" 
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-blue-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <ZoomIn className="w-10 h-10 mb-2 transform scale-50 group-hover:scale-100 transition-transform duration-300" />
                    <h3 className="font-extrabold text-lg tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 px-4 text-center">{img.title}</h3>
                    <span className="text-sm font-medium text-white/80 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{t(`gallery.cats.${img.category}`, img.category)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-slate-800/50 p-2 rounded-full transition-colors z-[110]"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.title} 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg text-center">
                <h3 className="text-white font-bold text-2xl drop-shadow-md">{selectedImage.title}</h3>
                <span className="text-blue-300 text-sm font-medium uppercase tracking-widest">{t(`gallery.cats.${selectedImage.category}`, selectedImage.category)}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
