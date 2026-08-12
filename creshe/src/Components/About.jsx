import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { History, Lightbulb, TrendingUp, Rocket, Target, Eye, Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { fetcher } from '../utils/fetcher';

import 'swiper/css';
import 'swiper/css/pagination';

export default function About() {
  const { t } = useTranslation();
  const { data: teamData } = useSWR('http://localhost:5000/api/team', fetcher);
  const { data: testimoniesData } = useSWR('http://localhost:5000/api/testimonies', fetcher);

  const team = Array.isArray(teamData) ? teamData : [];
  const testimonies = Array.isArray(testimoniesData) ? testimoniesData : [];

  const storyCards = [
    {
      id: 'started',
      icon: <History className="w-8 h-8 text-primary" />,
      title: t('about.story_title'),
      desc: t('about.story_desc')
    },
    {
      id: 'philosophy',
      icon: <Lightbulb className="w-8 h-8 text-secondary" />,
      title: t('about.phil_title'),
      desc: t('about.phil_desc')
    },
    {
      id: 'growth',
      icon: <TrendingUp className="w-8 h-8 text-accent-green" />,
      title: t('about.growth_title'),
      desc: t('about.growth_desc')
    },
    {
      id: 'future',
      icon: <Rocket className="w-8 h-8 text-accent-pink" />,
      title: t('about.future_title'),
      desc: t('about.future_desc')
    }
  ];

  return (
    <div className="min-h-screen">
      
      {/* 1. Our Story */}
      <section className="bg-[#005078] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 mb-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-sm font-extrabold text-white uppercase tracking-widest bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">{t('about.origins_badge')}</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">{t('about.origins_title')}</h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              {t('about.origins_sub')}
            </p>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 md:pb-0">
            {storyCards.map((card, idx) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-center bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-white/20"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-xs">
                  {card.icon}
                </div>
                <h3 className="text-xl font-extrabold text-white mb-3">{card.title}</h3>
                <p className="text-blue-50 text-sm leading-relaxed font-medium">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Mission, Vision, Values */}
      <section className="bg-white dark:bg-slate-800 py-16 border-y border-slate-200 dark:border-slate-700 mb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white">{t('about.mvv_title')}</h2>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar lg:grid lg:grid-cols-3 gap-8 pb-8 lg:pb-0">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="shrink-0 w-[85vw] sm:w-[350px] lg:w-auto snap-center bg-gradient-to-br from-primary to-blue-600 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
            >
              <Target className="w-12 h-12 mb-6 text-white/80" />
              <h3 className="text-2xl font-extrabold mb-4">{t('about.mvv_mission')}</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                {t('about.mvv_mission_desc')}
              </p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="shrink-0 w-[85vw] sm:w-[350px] lg:w-auto snap-center bg-gradient-to-br from-secondary to-orange-400 rounded-3xl p-8 md:p-10 text-slate-900 shadow-xl relative overflow-hidden"
            >
              <Eye className="w-12 h-12 mb-6 text-slate-800/80" />
              <h3 className="text-2xl font-extrabold mb-4">{t('about.mvv_vision')}</h3>
              <p className="text-slate-800 text-lg leading-relaxed">
                {t('about.mvv_vision_desc')}
              </p>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-2xl"></div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="shrink-0 w-[85vw] sm:w-[350px] lg:w-auto snap-center bg-gradient-to-br from-accent-pink to-pink-500 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden"
            >
              <Star className="w-12 h-12 mb-6 text-white/80" />
              <h3 className="text-2xl font-extrabold mb-4">{t('about.mvv_values')}</h3>
              <ul className="text-pink-100 text-lg font-bold space-y-2">
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white"></span> {t('home.val_1')}</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white"></span> {t('home.val_2')}</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white"></span> {t('home.val_3')}</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white"></span> {t('home.val_4')}</li>
                <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white"></span> {t('home.val_5')}</li>
              </ul>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2.5 Meet Our Team */}
      {team.length > 0 && (
        <section className="bg-slate-100 dark:bg-slate-900/50 py-16 border-b border-slate-200 dark:border-slate-700 mb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
            
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <span className="text-sm font-extrabold text-primary uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 px-4 py-1 rounded-full">{t('about.staff_badge')}</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white">{t('about.staff_title')}</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {t('about.staff_sub')}
              </p>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-8 sm:pb-0">
              {team.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-center bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 group hover:shadow-2xl transition-all"
                >
                  <div className="h-64 overflow-hidden bg-slate-100">
                    {member.image_url ? (
                      <img 
                        src={member.image_url} 
                        alt={member.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">{t('about.no_photo')}</div>
                    )}
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-1">{member.name}</h3>
                    <p className="text-sm font-bold text-primary mb-3">{member.role}</p>
                    {member.bio && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 3. Parents Testimonies */}
      <section className="bg-white py-16 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 dark:text-white">{t('about.test_title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {t('about.test_sub')}
            </p>
          </div>

          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="pb-16 px-4"
          >
            {testimonies.map((testimony) => (
              <SwiperSlide key={testimony.id} className="h-auto">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-md border border-slate-100 dark:border-slate-700 h-full flex flex-col justify-between">
                  <div>
                    <Quote className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-4" />
                    <p className="text-slate-600 dark:text-slate-300 italic text-sm md:text-base leading-relaxed mb-6">
                      "{testimony.message}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
                    <img src={testimony.image_url} alt={testimony.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">{testimony.name}</h4>
                      <p className="text-xs font-bold text-primary">{testimony.child_class}</p>
                      <div className="flex text-secondary mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3 h-3 fill-current ${i < (testimony.rating || 5) ? 'text-amber-400' : 'text-slate-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      </section>

    </div>
  );
}
