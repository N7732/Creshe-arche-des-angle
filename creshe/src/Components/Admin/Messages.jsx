import React, { useState, useEffect } from 'react';
import { Loader2, Mail, Phone, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const getToken = () => localStorage.getItem('authToken');
  const handle401 = (res) => {
    if (res.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
      throw new Error('Unauthorized');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      handle401(res);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
              <Mail className="w-6 h-6" />
            </div>
            Contact Messages
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            View all messages submitted through the public Contact Us form.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Messages</div>
            <div className="text-2xl font-black text-slate-800">{messages.length}</div>
          </div>
        </div>
      </div>

      {/* Messages Grid */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-16 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">No Messages Yet</h3>
          <p className="text-slate-500 font-medium">When parents contact you, their messages will appear here.</p>
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
                className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
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
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-100">
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
