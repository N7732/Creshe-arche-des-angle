import React from 'react';
import { motion } from 'motion/react';
import { Baby, BookOpen, Music, Palette, Calculator, Compass } from 'lucide-react';
import prayBg from '../assets/pray1.jpg';

const academicClasses = [
  {
    id: 'baby',
    title: 'Baby Class',
    age: '10 Weeks - 15 Months',
    icon: <Baby className="w-10 h-10 text-white" />,
    color: 'bg-blue-500',
    subjects: ['Sensory Play', 'Motor Skills', 'Music & Sounds'],
    activities: ['Tummy Time', 'Story Listening', 'Lullabies', 'Soft Play'],
    objectives: 'Focus on sensory development, basic motor skills, and building a secure attachment with caregivers.'
  },
  {
    id: 'nursery1',
    title: 'Nursery 1',
    age: '15 Months - 2 Years',
    icon: <Palette className="w-10 h-10 text-slate-800" />,
    color: 'bg-amber-500 text-slate-800',
    iconColor: 'text-slate-800',
    subjects: ['Art Exploration', 'Language Basics', 'Physical Play'],
    activities: ['Finger Painting', 'Sing-alongs', 'Simple Puzzles', 'Outdoor Play'],
    objectives: 'Encourage language acquisition, self-expression through art, and social interaction.'
  },
  {
    id: 'nursery2',
    title: 'Nursery 2',
    age: '2 - 3 Years',
    icon: <Music className="w-10 h-10 text-white" />,
    color: 'bg-pink-500 text-white',
    iconColor: 'text-white',
    subjects: ['Bilingual Speech', 'Creative Arts', 'Early Math Concepts'],
    activities: ['Rhyme Time', 'Shape Sorting', 'Role Play', 'Nature Walks'],
    objectives: 'Develop bilingual vocabulary, cognitive problem-solving, and emotional independence.'
  },
  {
    id: 'nursery3',
    title: 'Nursery 3',
    age: '3 - 4 Years',
    icon: <BookOpen className="w-10 h-10 text-white" />,
    color: 'bg-green-700',
    subjects: ['Pre-Reading', 'Numbers & Logic', 'Science Discovery'],
    activities: ['Alphabet Games', 'Counting Blocks', 'Planting Seeds', 'Team Sports'],
    objectives: 'Prepare for formal schooling by mastering alphabets, basic counting, and group cooperation.'
  },
  {
    id: 'preprimary',
    title: 'Pre-Primary',
    age: '4 - 5 Years',
    icon: <Compass className="w-10 h-10 text-white" />,
    color: 'bg-indigo-500',
    subjects: ['Reading & Writing', 'Advanced Math', 'World Geography', 'Robotics Basics'],
    activities: ['Sight Reading', 'Addition/Subtraction', 'Map Reading', 'Coding Toys'],
    objectives: 'Achieve academic readiness for primary school, critical thinking, and leadership skills.'
  }
];

export default function Academics() {
  return (
    <div className="relative pt-32 pb-24 min-h-screen">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={prayBg} alt="Academics Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-blue-950/50 z-10"></div>
      </div>
      
      <div className="relative z-20">
        {/* Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto px-4 mb-16">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md">Our Academic Programs</h1>
          <p className="text-blue-100 text-lg leading-relaxed drop-shadow-sm">
            Tailored learning stages designed to meet the unique developmental needs of every child from infancy to pre-primary.
          </p>
        </section>

        {/* Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {academicClasses.map((cls, idx) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-700 flex flex-col h-full"
            >
              {/* Card Header */}
              <div className={`${cls.color} p-8 text-center relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`mb-4 ${cls.iconColor || 'text-white'}`}>
                    {cls.icon}
                  </div>
                  <h3 className={`text-3xl font-extrabold mb-1 ${cls.iconColor || 'text-white'}`}>{cls.title}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/30 backdrop-blur-sm ${cls.iconColor || 'text-white'}`}>
                    {cls.age}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 flex flex-col grow space-y-6">
                
                {/* Subjects */}
                <div>
                  <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Core Subjects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cls.subjects.map((subject, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-200 text-xs font-bold rounded-md">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Daily Activities
                  </h4>
                  <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {cls.activities.map((act, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green shrink-0"></span> {act}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Objectives */}
                <div className="pt-6 mt-auto border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Learning Objective</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "{cls.objectives}"
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
