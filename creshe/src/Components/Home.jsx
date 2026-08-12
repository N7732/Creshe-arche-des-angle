import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Heart, Target, Eye, Star, Sparkles } from 'lucide-react';
import home1 from '../assets/home1.jpeg';
import home2 from '../assets/home2.png';
import home3 from '../assets/home3.jpeg';

export default function Home({ onNav }) {
  const { t } = useTranslation();

  const bgImages = [home1, home2, home3];
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      id: 'mission',
      icon: <Target className="w-8 h-8 text-white" />,
      bg: 'bg-[#005078]',
      title: t('home.mission_title'),
      content: t('home.mission_text')
    },
    {
      id: 'vision',
      icon: <Eye className="w-8 h-8 text-slate-800" />,
      bg: 'bg-[#E9A300]',
      title: t('home.vision_title'),
      textColor: 'text-slate-800',
      content: t('home.vision_text')
    },
    {
      id: 'values',
      icon: <Star className="w-8 h-8 text-white" />,
      bg: 'bg-[#E91E3A]',
      title: t('home.values_title'),
      content: (
        <ul className="space-y-1.5 ml-2">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> {t('home.val_1')}</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> {t('home.val_2')}</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> {t('home.val_3')}</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> {t('home.val_4')}</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> {t('home.val_5')}</li>
        </ul>
      )
    }
  ];

  return (
    <div className="w-full relative">
      
      {/* Hero Section */}
      <section className="relative w-full flex items-start justify-center pt-48 pb-40 min-h-[60vh] overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[rgba(25,100,132,0.6)] z-10 pointer-events-none"></div>
          {bgImages.map((img, index) => (
            <motion.img 
              key={img}
              src={img}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: index === currentBgIndex ? 1 : 0,
                scale: index === currentBgIndex ? 1 : 1.05
              }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="School background"
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-xl leading-tight"
          >
            {t('home.welcome')} <br /> <span className="text-secondary drop-shadow-2xl">CRÈCHE ARCHE DES ANGES de Bugesera</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-lg sm:text-xl md:text-2xl font-medium text-slate-100 drop-shadow-md max-w-2xl mx-auto"
          >
            {t('home.subtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
          >
            <button 
              onClick={() => onNav('academics')}
              className="bg-secondary text-slate-900 px-8 py-4 rounded-full font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform flex items-center justify-center gap-2"
            >
              {t('home.explore')} <Sparkles className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onNav('contact')}
              className="bg-white/10 backdrop-blur-md text-white border-2 border-white px-8 py-4 rounded-full font-extrabold text-lg shadow-xl hover:bg-white hover:text-primary transition-all transform hover:scale-105 flex items-center justify-center"
            >
              {t('home.contact')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Welcome Block (Brown Div) */}
      <section id="welcome-section" className="relative z-30 max-w-5xl mx-auto px-4 -mt-24 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#8B5A2B] rounded-[2rem] p-8 md:p-12 text-center shadow-2xl text-white border-4 border-[#A0522D]/50 relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
          
          <Heart className="w-12 h-12 mx-auto mb-6 text-[#FFD54F] relative z-10" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 relative z-10">{t('home.welcome_title')}</h2>
          <p className="text-lg md:text-xl leading-relaxed font-medium relative z-10 max-w-3xl mx-auto">
            {t('home.welcome_text')}
          </p>
        </motion.div>
      </section>

      {/* Mission, Vision, Values Cards */}
      <section className="py-12 bg-slate-50 dark:bg-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-3 gap-6 md:gap-8 pb-8 md:pb-0">
            
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-center ${card.bg} rounded-3xl p-8 shadow-xl ${card.textColor || 'text-white'} transform transition-transform cursor-default relative overflow-hidden group`}
              >
                {/* Decorative background circle */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${card.textColor ? 'bg-black/10' : 'bg-white/20'} rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`}></div>
                
                <div className={`w-16 h-16 ${card.textColor ? 'bg-black/10' : 'bg-white/20'} backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-xs border ${card.textColor ? 'border-black/10' : 'border-white/30'} group-hover:rotate-12 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="text-2xl font-extrabold mb-4">{card.title}</h3>
                <div className={`${card.textColor ? 'text-slate-800' : 'text-white/90'} text-sm leading-relaxed font-medium`}>
                  {card.content}
                </div>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

    </div>
  );
}
