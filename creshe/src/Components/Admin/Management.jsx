import React, { useState, useEffect } from 'react';
import { Loader2, ClipboardCheck, Activity, Save, AlertTriangle, CheckCircle, Plus, Utensils, Check, X, BarChart3, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

export default function Management() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Attendance');
  
  // Attendance State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  
  // Analytics State
  const [attendanceMode, setAttendanceMode] = useState('daily'); // 'daily' | 'analytics'
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week'); // 'week', 'semester', 'year'
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Feeding State
  const [feedingRecords, setFeedingRecords] = useState([]);
  const [feedingLoading, setFeedingLoading] = useState(true);

  // Incidents State
  const [incidents, setIncidents] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  
  // New Incident Form
  const [newIncident, setNewIncident] = useState({ enrollment_id: '', type: 'Sick', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'Attendance') {
      if (attendanceMode === 'daily') {
        fetchAttendance();
      } else {
        fetchAnalytics();
      }
    } else if (activeTab === 'Feeding') {
      fetchFeeding();
    } else {
      fetchIncidents();
      fetchStudents();
    }
  }, [activeTab, date, attendanceMode, analyticsPeriod]);

  const getToken = () => localStorage.getItem('authToken');
  const handle401 = (res) => {
    if (res.status === 401) {
      localStorage.removeItem('authToken');
      window.location.reload();
      throw new Error('Unauthorized');
    }
  };

  // --- ATTENDANCE ---
  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/management/attendance?date=${date}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      handle401(res);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(record => ({
          ...record,
          status: record.attendance?.status || 'Absent', // Default Absent or unrecorded
          formArrival: record.attendance?.arrival_time || '',
          formDeparture: record.attendance?.departure_time || '',
          formReason: record.attendance?.discrepancy_reason || '',
          isDirty: false
        }));
        setAttendanceRecords(formatted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/management/attendance/stats?period=${analyticsPeriod}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      handle401(res);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleAttendanceChange = (enrollment_id, field, value) => {
    setAttendanceRecords(prev => prev.map(rec => {
      if (rec.enrollment_id === enrollment_id) {
        return { ...rec, [field]: value, isDirty: true };
      }
      return rec;
    }));
  };

  const setStatus = async (enrollment_id, newStatus) => {
    handleAttendanceChange(enrollment_id, 'status', newStatus);
    await saveAttendance(enrollment_id, newStatus);
  };

  const saveAttendance = async (enrollment_id, overrideStatus = null) => {
    const record = attendanceRecords.find(r => r.enrollment_id === enrollment_id);
    if (!record) return;

    const finalStatus = overrideStatus || record.status;

    try {
      const res = await fetch('http://localhost:5000/api/management/attendance', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollment_id,
          date,
          status: finalStatus,
          arrival_time: record.formArrival,
          departure_time: record.formDeparture,
          discrepancy_reason: record.formReason
        })
      });
      handle401(res);
      if (res.ok) {
        setAttendanceRecords(prev => prev.map(rec => {
          if (rec.enrollment_id === enrollment_id) {
            return { ...rec, status: finalStatus, isDirty: false };
          }
          return rec;
        }));
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save attendance.');
    }
  };

  // --- FEEDING ---
  const fetchFeeding = async () => {
    setFeedingLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/management/feeding`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      handle401(res);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(record => ({
          ...record,
          formSpecialNeeds: record.specialNeeds || '',
          isEditing: false
        }));
        setFeedingRecords(formatted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFeedingLoading(false);
    }
  };

  const saveFeeding = async (enrollment_id) => {
    const record = feedingRecords.find(r => r.enrollment_id === enrollment_id);
    try {
      const res = await fetch(`http://localhost:5000/api/management/feeding/${enrollment_id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ specialNeeds: record.formSpecialNeeds })
      });
      handle401(res);
      if (res.ok) {
        setFeedingRecords(prev => prev.map(rec => {
          if (rec.enrollment_id === enrollment_id) {
            return { ...rec, specialNeeds: record.formSpecialNeeds, isEditing: false };
          }
          return rec;
        }));
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update dietary restrictions.');
    }
  };


  // --- INCIDENTS ---
  const fetchIncidents = async () => {
    setIncidentsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/management/incidents', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      handle401(res);
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIncidentsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/management/students', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      handle401(res);
      if (res.ok) {
        const data = await res.json();
        setStudentsList(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitIncident = async (e) => {
    e.preventDefault();
    if (!newIncident.enrollment_id || !newIncident.description) return alert('Please fill required fields.');
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/management/incidents', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newIncident,
          incident_type: newIncident.type, 
          date: new Date().toISOString().split('T')[0]
        })
      });
      handle401(res);
      if (res.ok) {
        setNewIncident({ enrollment_id: '', type: 'Sick', description: '' });
        fetchIncidents();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to log incident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveIncident = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/management/incidents/${id}/resolve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      handle401(res);
      if (res.ok) {
        fetchIncidents();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sickStudentsCount = incidents.filter(i => i.status === 'Active' && i.incident_type === 'Sick').length;
  const attendedCount = attendanceRecords.filter(r => r.status === 'Present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;

  const overallAnalyticsRate = analyticsData.length 
    ? Math.round(
        (analyticsData.reduce((sum, r) => sum + r.attendedDays, 0) / 
        (analyticsData.reduce((sum, r) => sum + r.expectedDays, 0) || 1)) * 100
      )
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">{t('admin.management.title')}</h1>
          <p className="text-slate-300 font-medium mt-1">{t('admin.management.sub')}</p>
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white text-slate-900 p-1 rounded-xl shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveTab('Attendance')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'Attendance' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" /> {t('admin.management.roll_call')}
          </button>
          <button
            onClick={() => setActiveTab('Feeding')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'Feeding' ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4" /> {t('admin.management.feeding')}
          </button>
          <button
            onClick={() => setActiveTab('Incidents')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'Incidents' ? 'bg-rose-50 text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" /> {t('admin.management.health')}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Attendance' ? (
          <motion.div 
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {attendanceMode === 'daily' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-[20px] shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-indigo-600/80 uppercase tracking-wide">{t('admin.management.attended')}</p>
                    <h3 className="text-3xl font-black text-indigo-700 mt-1">{attendedCount}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-700 flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-slate-100 border border-slate-200 p-4 rounded-[20px] shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('admin.management.absent')}</p>
                    <h3 className="text-3xl font-black text-slate-600 mt-1">{absentCount}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[20px] shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-emerald-700">{overallAnalyticsRate}%</h3>
                    <p className="text-sm font-bold text-emerald-600/80 uppercase tracking-wide">Overall Rate</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white text-slate-900 rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 text-slate-900/50">
                <div className="flex items-center gap-2 p-1 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 shrink-0">
                  <button 
                    onClick={() => setAttendanceMode('daily')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${attendanceMode === 'daily' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 text-slate-900'}`}
                  >
                    {t('admin.management.daily')}
                  </button>
                  <button 
                    onClick={() => setAttendanceMode('analytics')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${attendanceMode === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 text-slate-900'}`}
                  >
                    {t('admin.management.analytics')}
                  </button>
                </div>

                {attendanceMode === 'daily' ? (
                  <div className="flex items-center gap-3 w-full lg:w-auto ml-auto">
                    <span className="text-sm font-bold text-slate-500">{t('admin.management.date')}</span>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="flex-1 lg:flex-none px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 w-full lg:w-auto ml-auto">
                    <span className="text-sm font-bold text-slate-500">Period:</span>
                    <select
                      value={analyticsPeriod}
                      onChange={(e) => setAnalyticsPeriod(e.target.value)}
                      className="flex-1 lg:flex-none px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="week">Past 7 Days</option>
                      <option value="semester">Past 3 Months</option>
                      <option value="year">Past Year</option>
                    </select>
                  </div>
                )}
              </div>

              {attendanceMode === 'daily' ? (
                attendanceLoading ? (
                  <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-medium">{t('admin.management.empty')}</div>
                ) : (
                  {/* SWIPE HINT MOBILE */}
                <div className="md:hidden flex items-center justify-end gap-1 text-xs text-slate-400 font-medium mb-3 mt-4">
                  <ArrowLeftRight className="w-3 h-3" /> {t('admin.swipe_hint')}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-900 text-slate-600 font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4">Schedule & Info</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4">Arrival</th>
                          <th className="px-6 py-4">Departure</th>
                          <th className="px-6 py-4">Reason / Notes</th>
                          <th className="px-6 py-4 text-center">Save Edit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {attendanceRecords.map(record => (
                          <tr key={record.enrollment_id} className="hover:bg-slate-50 text-slate-900/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800">{record.childName}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{record.parentName} ({record.parentPhone})</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                                {record.scheduleDays}
                              </div>
                              {record.additionalNotes && <div className="text-xs text-slate-500 mt-1 italic max-w-[150px] truncate" title={record.additionalNotes}>Note: {record.additionalNotes}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => setStatus(record.enrollment_id, 'Present')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    record.status === 'Present' 
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm' 
                                      : 'bg-slate-50 text-slate-900 text-slate-400 hover:bg-slate-100'
                                  }`}
                                >
                                  Present
                                </button>
                                <button 
                                  onClick={() => setStatus(record.enrollment_id, 'Absent')}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    record.status === 'Absent' 
                                      ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-sm' 
                                      : 'bg-slate-50 text-slate-900 text-slate-400 hover:bg-slate-100'
                                  }`}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="time" 
                                value={record.formArrival}
                                onChange={e => handleAttendanceChange(record.enrollment_id, 'formArrival', e.target.value)}
                                className="px-2 py-1.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-28"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="time" 
                                value={record.formDeparture}
                                onChange={e => handleAttendanceChange(record.enrollment_id, 'formDeparture', e.target.value)}
                                className="px-2 py-1.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-28"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input 
                                type="text" 
                                placeholder="Reason if late/absent..."
                                value={record.formReason}
                                onChange={e => handleAttendanceChange(record.enrollment_id, 'formReason', e.target.value)}
                                className="px-3 py-1.5 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full min-w-[120px]"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => saveAttendance(record.enrollment_id)}
                                disabled={!record.isDirty}
                                className={`p-2 rounded-lg transition-all ${
                                  record.isDirty 
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:-translate-y-0.5' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                                title="Save Time/Reason Edits"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                // Analytics View
                analyticsLoading ? (
                  <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
                ) : analyticsData.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-medium">No analytics data available.</div>
                ) : (
                  {/* SWIPE HINT MOBILE */}
                <div className="md:hidden flex items-center justify-end gap-1 text-xs text-slate-400 font-medium mb-3 mt-4">
                  <ArrowLeftRight className="w-3 h-3" /> {t('admin.swipe_hint')}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-900 text-slate-600 font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4">Student Name</th>
                          <th className="px-6 py-4 text-center">Expected Days</th>
                          <th className="px-6 py-4 text-center">Attended Days</th>
                          <th className="px-6 py-4 text-center">Missed Days</th>
                          <th className="px-6 py-4 text-center">Attendance Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {analyticsData.map(record => (
                          <tr key={record.enrollment_id} className="hover:bg-slate-50 text-slate-900/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">{record.childName}</td>
                            <td className="px-6 py-4 text-center font-medium text-slate-600">{record.expectedDays}</td>
                            <td className="px-6 py-4 text-center font-bold text-emerald-600">{record.attendedDays}</td>
                            <td className="px-6 py-4 text-center font-bold text-rose-600">{record.expectedDays - record.attendedDays}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${record.attendanceRate >= 90 ? 'bg-emerald-500' : record.attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${record.attendanceRate}%` }}
                                  />
                                </div>
                                <span className={`font-black w-10 text-right ${record.attendanceRate >= 90 ? 'text-emerald-600' : record.attendanceRate >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                                  {record.attendanceRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </motion.div>
        ) : activeTab === 'Feeding' ? (
          <motion.div 
            key="feeding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white text-slate-900 rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-orange-50/30">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Dietary & Feeding Restrictions</h2>
                  <p className="text-xs text-slate-500">Manage what each enrolled child is permitted or forbidden to eat.</p>
                </div>
              </div>

              {feedingLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
              ) : (
                {/* SWIPE HINT MOBILE */}
                <div className="md:hidden flex items-center justify-end gap-1 text-xs text-slate-400 font-medium mb-3 mt-4">
                  <ArrowLeftRight className="w-3 h-3" /> {t('admin.swipe_hint')}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-900 text-slate-600 font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Age Group</th>
                        <th className="px-6 py-4">Dietary Restrictions / Special Needs</th>
                        <th className="px-6 py-4 w-32 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {feedingRecords.map(record => (
                        <tr key={record.enrollment_id} className="hover:bg-slate-50 text-slate-900/30 transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-800">{record.childName}</td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-600 capitalize">{record.ageGroup}</td>
                          <td className="px-6 py-4">
                            {record.isEditing ? (
                              <input 
                                type="text"
                                autoFocus
                                value={record.formSpecialNeeds}
                                onChange={(e) => setFeedingRecords(prev => prev.map(r => r.enrollment_id === record.enrollment_id ? { ...r, formSpecialNeeds: e.target.value } : r))}
                                className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                placeholder="e.g. No Peanuts, Lactose Intolerant"
                              />
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {record.specialNeeds ? (
                                  <span className="bg-red-50 text-red-700 border border-red-200 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                                    <AlertTriangle className="w-3 h-3" />
                                    {record.specialNeeds}
                                  </span>
                                ) : (
                                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                                    <CheckCircle className="w-3 h-3" />
                                    No known restrictions
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {record.isEditing ? (
                              <button
                                onClick={() => saveFeeding(record.enrollment_id)}
                                className="px-4 py-2 bg-orange-600 text-white font-bold rounded-lg shadow-sm hover:bg-orange-700 transition-colors w-full"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => setFeedingRecords(prev => prev.map(r => r.enrollment_id === record.enrollment_id ? { ...r, isEditing: true } : r))}
                                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors w-full opacity-0 group-hover:opacity-100"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="incidents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-[24px] flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-rose-700">{sickStudentsCount}</h3>
                  <p className="text-sm font-bold text-rose-600/80 uppercase tracking-wide">In Sick Room</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form */}
              <div className="lg:col-span-1">
                <div className="bg-white text-slate-900 rounded-[24px] shadow-sm border border-slate-100 overflow-hidden sticky top-6">
                  <div className="p-6 border-b border-slate-100 bg-slate-50 text-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-800">Log New Incident</h2>
                    <p className="text-xs text-slate-500 mt-1">For medical or behavioral staff.</p>
                  </div>
                  <form onSubmit={submitIncident} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Student</label>
                      <select
                        required
                        value={newIncident.enrollment_id}
                        onChange={e => setNewIncident({...newIncident, enrollment_id: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="">Select a student...</option>
                        {studentsList.map(s => (
                          <option key={s.id} value={s.id}>{s.childName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Type</label>
                      <select
                        required
                        value={newIncident.type}
                        onChange={e => setNewIncident({...newIncident, type: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="Sick">Medical / Sick Room</option>
                        <option value="Behavior">Behavioral Issue</option>
                        <option value="Other">Other Observation</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Description</label>
                      <textarea
                        required
                        rows="3"
                        placeholder="Details of the incident..."
                        value={newIncident.description}
                        onChange={e => setNewIncident({...newIncident, description: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-4 h-4" /> Save Record</>}
                    </button>
                  </form>
                </div>
              </div>

              {/* List */}
              <div className="lg:col-span-2">
                <div className="bg-white text-slate-900 rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 text-slate-900/50">
                    <h2 className="text-lg font-bold text-slate-800">Recent Logs</h2>
                  </div>
                  
                  <div className="p-2">
                    {incidentsLoading ? (
                      <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>
                    ) : incidents.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 font-medium">No recent incidents logged.</div>
                    ) : (
                      <ul className="space-y-2">
                        {incidents.map(inc => (
                          <li key={inc.id} className="p-4 rounded-2xl hover:bg-slate-50 text-slate-900 transition-colors border border-transparent hover:border-slate-100 group flex flex-col sm:flex-row gap-4 justify-between">
                            <div className="flex gap-4 items-start">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                inc.incident_type === 'Sick' ? 'bg-rose-100 text-rose-600' :
                                inc.incident_type === 'Behavior' ? 'bg-amber-100 text-amber-600' :
                                'bg-indigo-100 text-indigo-600'
                              }`}>
                                {inc.incident_type === 'Sick' ? <Activity className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-base">{inc.childName}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${
                                    inc.status === 'Active' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  }`}>
                                    {inc.status}
                                  </span>
                                  <span className="text-xs text-slate-500 font-medium">{inc.date} • {inc.incident_type}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{inc.description}</p>
                                <p className="text-xs text-slate-400 mt-2">Logged by: <span className="font-medium text-slate-500">{inc.logged_by}</span></p>
                              </div>
                            </div>
                            
                            {inc.status === 'Active' && (
                              <div className="sm:text-right shrink-0">
                                <button 
                                  onClick={() => resolveIncident(inc.id)}
                                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-sm transition-colors flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4" /> Resolve
                                </button>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
