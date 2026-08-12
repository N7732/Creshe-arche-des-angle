import React, { useState, useEffect } from 'react';
import { Loader2, Search, Filter, MessageCircle, Mail, Download, ArrowLeftRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import { fetcher } from '../../utils/fetcher';

export default function Students() {
  const { t } = useTranslation();
  const { data, error, isLoading } = useSWR('http://localhost:5000/api/enrollments', fetcher);
  
  useEffect(() => {
    if (error && error.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
    }
  }, [error]);

  const enrollments = Array.isArray(data) ? data : [];
  const loading = isLoading;
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const TABS = ['All', 'Pending', 'Approved', 'Active', 'Rejected'];

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
      mutate('http://localhost:5000/api/enrollments');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const exportToExcel = () => {
    if (!filteredEnrollments || filteredEnrollments.length === 0) {
      alert("No data to export");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredEnrollments.map(e => ({
      "Child Name": e.childName,
      "DOB": e.childDob,
      "Age Group": e.ageGroup,
      "Parent Name": e.parentName,
      "Parent Phone": e.parentPhone,
      "Parent Email": e.parentEmail,
      "Status": e.status,
      "Submitted At": new Date(e.createdAt).toLocaleDateString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Students_List.xlsx");
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
          <h1 className="text-2xl font-extrabold text-slate-100">{t('admin.students.title')}</h1>
          <p className="text-slate-300 text-sm">{t('admin.students.sub')}</p>
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
                    : 'bg-white text-slate-900 text-slate-600 hover:bg-pink-50 border border-pink-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('admin.students.search')} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 border border-pink-100 rounded-lg text-sm focus:ring-pink-500 focus:border-pink-500 shadow-sm"
              />
            </div>
            
            <button
              onClick={exportToExcel}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-md transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              {t('admin.students.export')}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white text-slate-900/80 backdrop-blur-xl rounded-2xl shadow-md border border-pink-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 ">
            {t('admin.students.empty')}
          </div>
        ) : (
          <>
          {/* SWIPE HINT MOBILE */}
        <div className="md:hidden flex items-center justify-end gap-1 text-xs text-slate-400 font-medium mb-3 mt-4">
          <ArrowLeftRight className="w-3 h-3" /> {t('admin.swipe_hint')}
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-pink-50/50 text-slate-600 font-semibold border-b border-pink-100">
                <tr>
                  <th className="px-6 py-4">{t('admin.students.child_name')}</th>
                  <th className="px-6 py-4">{t('admin.students.age_group')}</th>
                  <th className="px-6 py-4">{t('admin.students.parent_info')}</th>
                  <th className="px-6 py-4">{t('admin.students.status')}</th>
                  <th className="px-6 py-4 text-right">{t('admin.students.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{enrollment.childName}</div>
                      <div className="text-xs text-slate-500">{t('admin.students.dob')} {enrollment.childDob}</div>
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
          </>
        )}
      </div>
    </div>
  );
}
