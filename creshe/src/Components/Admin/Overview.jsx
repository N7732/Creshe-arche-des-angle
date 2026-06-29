import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Users, GraduationCap, Building2, Image as ImageIcon, Loader2, 
  MessageSquare, ChevronRight, Activity, Clock 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Overview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalFacilities: 0,
    totalGalleries: 0,
    pendingEnrollments: 0,
    unreadMessages: 0
  });
  
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const authHeaders = { 'Authorization': `Bearer ${token}` };

      const enrollmentsRes = await fetch('http://localhost:5000/api/enrollments', { headers: authHeaders });
      
      if (enrollmentsRes.status === 401) {
        localStorage.removeItem('authToken');
        window.location.reload();
        return;
      }

      const [
        facilitiesRes, 
        galleriesRes,
        messagesRes
      ] = await Promise.all([
        fetch('http://localhost:5000/api/facilities').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:5000/api/galleries').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:5000/api/contact', { headers: authHeaders }).then(r => r.ok ? r.json() : [])
      ]);

      const enrollmentsData = enrollmentsRes.ok ? await enrollmentsRes.json() : [];
      const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
      const pending = enrollments.filter(e => e.status === 'Submitted' || e.status === 'Reviewing').length;
      const active = enrollments.filter(e => e.status === 'Enrolled').length;

      setStats({
        totalStudents: enrollments.length || 0,
        activeStudents: active,
        totalFacilities: Array.isArray(facilitiesRes) ? facilitiesRes.length : 0,
        totalGalleries: Array.isArray(galleriesRes) ? galleriesRes.length : 0,
        pendingEnrollments: pending,
        unreadMessages: Array.isArray(messagesRes) ? messagesRes.length : 0
      });

      setRecentEnrollments(enrollments.slice(0, 5));
      setRecentMessages(Array.isArray(messagesRes) ? messagesRes.slice(0, 5) : []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
          <p className="text-pink-600 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Command Center...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Requests', value: stats.totalStudents, icon: GraduationCap, color: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { title: 'Pending Review', value: stats.pendingEnrollments, icon: Clock, color: 'from-amber-500 to-orange-600', shadow: 'shadow-orange-500/20' },
    { title: 'Active Students', value: stats.activeStudents, icon: Users, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { title: 'Contact Messages', value: stats.unreadMessages, icon: MessageSquare, color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-500/20' },
    { title: 'Facilities', value: stats.totalFacilities, icon: Building2, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/20' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-transparent text-slate-800 p-4 lg:p-6 font-sans relative overflow-hidden">
      
      {/* Decorative ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300/20 blur-[120px] rounded-full pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-300/20 blur-[150px] rounded-full pointer-events-none mix-blend-multiply"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-pink-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500">Live Command Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
          </div>
          <div className="bg-white/50 border border-pink-200 px-4 py-2 rounded-xl backdrop-blur-md inline-flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-700">System Online</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <motion.div 
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-pink-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm ${stat.shadow}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-4 shadow-sm transform group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="w-5 h-5" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
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
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-pink-100 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                Recent Enrollments
              </h2>
              <Link to="students" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center transition-colors">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="p-2 grow">
              {recentEnrollments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium text-sm">No recent enrollments found.</div>
              ) : (
                <ul className="space-y-0.5">
                  {recentEnrollments.map(enr => (
                    <li key={enr.id} className="p-3 rounded-xl hover:bg-pink-50/50 transition-colors group flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{enr.childName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{enr.parentName} • {enr.submissionDate}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm ${
                        enr.status === 'Submitted' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' :
                        enr.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        enr.status === 'Enrolled' ? 'bg-teal-50 text-teal-600 border border-teal-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
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
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-pink-100 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-pink-500" />
                Recent Messages
              </h2>
            </div>
            
            <div className="p-2 grow overflow-y-auto">
              {recentMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium text-sm">No recent messages found.</div>
              ) : (
                <ul className="space-y-0.5">
                  {recentMessages.map(msg => (
                    <li key={msg.id} className="p-3 rounded-xl hover:bg-pink-50/50 transition-colors group">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-slate-800 text-sm group-hover:text-pink-600 transition-colors">{msg.parentName}</p>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-600 mb-1">{msg.subject}</p>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{msg.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
