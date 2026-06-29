import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Loader2, Search, Filter, MessageCircle, Mail } from 'lucide-react';

export default function Students() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const TABS = ['All', 'Pending', 'Approved', 'Active', 'Rejected'];

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:5000/api/enrollments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('authToken');
        window.location.reload();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : []);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:5000/api/enrollments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, currentProgressCode: 0 })
      });
      if (!res.ok) throw new Error('Update failed');
      fetchEnrollments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    let matchesTab = true;
    if (activeTab === 'Pending') matchesTab = ['Submitted', 'Reviewing'].includes(e.status);
    else if (activeTab === 'Approved') matchesTab = e.status === 'Approved';
    else if (activeTab === 'Active') matchesTab = e.status === 'Enrolled';
    else if (activeTab === 'Rejected') matchesTab = e.status === 'Rejected';

    const matchesSearch = (e.childName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (e.parentName || '').toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getWhatsAppLink = (parentName, childName, phone) => {
    // Remove non-numeric characters from phone
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const message = `Hello ${parentName}, your enrollment request for ${childName} at CRÈCHE ARCHE DES ANGES de Bugesera has been Approved! Please bring your child in to complete the process.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getEmailLink = (parentName, childName, email) => {
    const subject = `Enrollment Approved - ${childName}`;
    const body = `Hello ${parentName},\n\nYour enrollment request for ${childName} at CRÈCHE ARCHE DES ANGES de Bugesera has been Approved!\n\nPlease bring your child in to complete the process.\n\nBest regards,\nAdministration`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Student Enrollments</h1>
          <p className="text-slate-500 text-sm">Manage incoming admission requests and active students.</p>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-pink-500 text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-pink-50 border border-pink-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search names..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/80 border border-pink-100 rounded-lg text-sm focus:ring-pink-500 focus:border-pink-500 text-slate-800 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-md border border-pink-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 ">
            No enrollments found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-pink-50/50 text-slate-600 font-semibold border-b border-pink-100">
                <tr>
                  <th className="px-6 py-4">Child Name</th>
                  <th className="px-6 py-4">Age Group</th>
                  <th className="px-6 py-4">Parent Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{enrollment.childName}</div>
                      <div className="text-xs text-slate-500">DOB: {enrollment.childDob}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{enrollment.ageGroup}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{enrollment.parentName}</div>
                      <div className="text-xs text-slate-500">{enrollment.parentPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        enrollment.status === 'Approved' || enrollment.status === 'Enrolled' ? 'bg-emerald-100 text-emerald-700  ' :
                        enrollment.status === 'Rejected' ? 'bg-red-100 text-red-700  ' :
                        'bg-amber-100 text-amber-700  '
                      }`}>
                        {enrollment.status}
                      </span>
                      {enrollment.status === 'Approved' && (
                        <div className="mt-3 flex items-center gap-2">
                          <a 
                            href={getWhatsAppLink(enrollment.parentName, enrollment.childName, enrollment.parentPhone)}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] text-white hover:scale-110 transition-transform shadow-sm"
                            title="Notify via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          <a 
                            href={getEmailLink(enrollment.parentName, enrollment.childName, enrollment.parentEmail)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:scale-110 transition-transform shadow-sm"
                            title="Notify via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right align-top space-x-2">
                      <select 
                        value={enrollment.status}
                        onChange={(e) => updateStatus(enrollment.id, e.target.value)}
                        className="px-2 py-1 bg-slate-100  border-none rounded text-xs cursor-pointer"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Approved">Approved</option>
                        <option value="Enrolled">Enrolled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
