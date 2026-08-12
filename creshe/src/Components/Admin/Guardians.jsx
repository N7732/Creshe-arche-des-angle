import React, { useState, useEffect } from 'react';
import { Mail, Users, Filter, CheckSquare, Square, Send, Loader2, X, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { fetcher } from '../../utils/fetcher';

export default function Guardians() {
  const { t } = useTranslation();
  const { data, isLoading } = useSWR('http://localhost:5000/api/guardians', fetcher);
  const guardians = Array.isArray(data) ? data : [];
  const loading = isLoading;

  const [filterClass, setFilterClass] = useState('All');
  const [selectedEmails, setSelectedEmails] = useState([]);
  
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');

  const classOptions = ['All', 'Baby Class', 'Nursery 1', 'Nursery 2', 'Nursery 3', 'Pre-Primary'];

  // Filter guardians by child class
  const filteredGuardians = guardians.filter(g => {
    if (filterClass === 'All') return true;
    return g.children.some(child => child.class === filterClass);
  });

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredGuardians.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredGuardians.map(g => g.email));
    }
  };

  const handleSelectOne = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (selectedEmails.length === 0) return alert('Please select at least one guardian to email.');
    if (!emailSubject.trim() || !emailMessage.trim()) return alert('Subject and message are required.');

    setSending(true);
    setSendSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/guardians/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: selectedEmails,
          subject: emailSubject,
          message: emailMessage
        })
      });

      if (res.ok) {
        setSendSuccess('Emails successfully sent!');
        setTimeout(() => {
          setIsComposeOpen(false);
          setEmailSubject('');
          setEmailMessage('');
          setSendSuccess('');
        }, 3000);
      } else {
        alert('Failed to send emails. Check server logs.');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      alert('An error occurred.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white text-slate-900 p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            {t('admin.guardians.title')}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">
            {t('admin.guardians.sub')}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 text-slate-900 px-5 py-3 rounded-2xl border border-slate-100">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{t('admin.guardians.total')}</div>
            <div className="text-2xl font-black text-slate-800">{guardians.length}</div>
          </div>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            value={filterClass} 
            onChange={(e) => {
              setFilterClass(e.target.value);
              setSelectedEmails([]); // clear selection on filter change
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 font-medium"
          >
            {classOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500">
            {selectedEmails.length} {t('admin.guardians.selected')}
          </span>
          <button
            onClick={() => setIsComposeOpen(true)}
            disabled={selectedEmails.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
              selectedEmails.length > 0 
                ? 'bg-primary text-white hover:bg-blue-700 hover:shadow-md cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Mail className="w-4 h-4" />
            {t('admin.guardians.compose')}
          </button>
        </div>
      </div>

      {/* Guardians List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* SWIPE HINT MOBILE */}
        <div className="md:hidden flex items-center justify-end gap-1 text-xs text-slate-400 font-medium mb-3 mt-4">
          <ArrowLeftRight className="w-3 h-3" /> {t('admin.swipe_hint')}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-4">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center">
                    {selectedEmails.length === filteredGuardians.length && filteredGuardians.length > 0 ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">{t('admin.guardians.info')}</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">{t('admin.guardians.contact')}</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-wider">{t('admin.guardians.children')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuardians.length > 0 ? (
                filteredGuardians.map((guardian, idx) => (
                  <tr key={idx} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => handleSelectOne(guardian.email)} className="text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center">
                        {selectedEmails.includes(guardian.email) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{guardian.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{guardian.email}</div>
                      <div className="text-slate-500 text-xs mt-1">{guardian.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {guardian.children.map((child, i) => (
                          <div key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-md font-medium border border-indigo-100">
                            {child.name} <span className="opacity-75">({child.class})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    {t('admin.guardians.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose Email Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  {t('admin.guardians.compose_title')}
                </h3>
                <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {sendSuccess ? (
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl font-bold border border-green-100 flex items-center gap-2">
                    {sendSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.guardians.to')}</label>
                      <div className="w-full px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm border border-slate-200">
                        {selectedEmails.length} {t('admin.guardians.selected_bcc')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.guardians.subject')}</label>
                      <input 
                        type="text" 
                        required
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-primary focus:border-primary block"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{t('admin.guardians.message')}</label>
                      <textarea 
                        required
                        rows={6}
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder={t('admin.guardians.placeholder')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-primary focus:border-primary block resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="submit"
                        disabled={sending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-70"
                      >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        {sending ? t('admin.guardians.sending') : t('admin.guardians.send_btn')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
