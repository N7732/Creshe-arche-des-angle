import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Target, Eye, Star, Sparkles } from 'lucide-react';
import homeVideoFallback from '../assets/homevideo.mp4';
import { supabase } from '../supabaseClient';

export default function Home({ onNav }) {
  const [videoUrl, setVideoUrl] = useState(homeVideoFallback);

  useEffect(() => {
    const fetchSettings = async () => {
        const res = await fetch('http://localhost:5000/api/settings/home_video_url');
        if (res.ok) {
          const data = await res.json();
          if (data && data.value) {
            setVideoUrl(data.value);
          }
        }
    };
    fetchSettings();
  }, []);

  const cards = [
    {
      id: 'mission',
      icon: <Target className="w-8 h-8 text-white" />,
      bg: 'bg-blue-500',
      title: 'Our Mission',
      content: 'To provide quality early childhood education that inspires creativity, confidence and lifelong learning in a warm, nurturing setting.'
    },
    {
      id: 'vision',
      icon: <Eye className="w-8 h-8 text-slate-800" />,
      bg: 'bg-amber-400',
      title: 'Our Vision',
      textColor: 'text-slate-800',
      content: 'To become a leading nursery school that shapes happy, responsible and successful children ready to take on tomorrow\'s challenges.'
    },
    {
      id: 'values',
      icon: <Star className="w-8 h-8 text-white" />,
      bg: 'bg-pink-400',
      title: 'Our Values',
      content: (
        <ul className="space-y-1.5 ml-2">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> Love & Respect</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> Safety First</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> Excellence in Education</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> Nurturing Creativity</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white/80"></span> Teamwork & Community</li>
        </ul>
      )
    }
  ];

  return (
    <div className="w-full relative">
      
      {/* Hero Section */}
      <section className="relative w-full flex items-start justify-center pt-48 pb-40 min-h-[60vh] overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 bg-slate-900">
          <div className="absolute inset-0 bg-green-900/60 dark:bg-green-950/70 z-10"></div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            key={videoUrl} // forces video reload if URL changes
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-xl leading-tight"
          >
            Welcome to <br /> <span className="text-secondary drop-shadow-2xl">CRÈCHE ARCHE DES ANGES de Bugesera</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 text-lg sm:text-xl md:text-2xl font-medium text-slate-100 drop-shadow-md max-w-2xl mx-auto"
          >
            Where Every Child Learns, Plays and Grows With Love
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
          >
            <button 
              onClick={() => onNav('portal')}
              className="bg-secondary text-slate-900 px-8 py-4 rounded-full font-extrabold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform flex items-center justify-center gap-2"
            >
              Enroll Now <Sparkles className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                document.getElementById('welcome-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 backdrop-blur-md text-white border-2 border-white px-8 py-4 rounded-full font-extrabold text-lg shadow-xl hover:bg-white hover:text-primary transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Explore Our School
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
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 relative z-10">Welcome Message</h2>
          <p className="text-lg md:text-xl leading-relaxed font-medium relative z-10 max-w-3xl mx-auto">
            At CRÈCHE ARCHE DES ANGES de Bugesera, we provide a safe, joyful and nurturing environment where every child can grow academically, socially and emotionally.
          </p>
        </motion.div>
      </section>

      {/* Mission, Vision, Values Cards */}
      <section className="py-12 bg-slate-50 dark:bg-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`${card.bg} rounded-3xl p-8 shadow-xl ${card.textColor || 'text-white'} transform transition-transform cursor-default relative overflow-hidden group`}
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
