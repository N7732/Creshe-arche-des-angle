import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Mail, Save, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Staff() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState('teacher');
  const [inviting, setInviting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchProfiles();
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  });

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://creshe-arche-des-angle-2.onrender.com/api/auth/users`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      const response = await fetch(`https://creshe-arche-des-angle-2.onrender.com/api/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: inviteEmail,
          password: invitePassword,
          role: inviteRole
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create user');

      alert(`Staff member created: ${inviteEmail} with ${inviteRole} privileges.`);
      setInviteEmail('');
      setInvitePassword('');
      setInviteRole('teacher');
      fetchProfiles();
    } catch (error) {
      console.error('Create staff error:', error);
      alert(error.message);
    } finally {
      setInviting(false);
    }
  };

  const deleteProfile = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the user: ${name}?`)) return;
    try {
      const response = await fetch(`https://creshe-arche-des-angle-2.onrender.com/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete user');
      fetchProfiles();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user. Make sure you have superadmin privileges.');
    }
  };

  const startEditing = (profile) => {
    setEditingId(profile.id);
    setEditForm({
      username: profile.username || '',
      role: profile.role || 'teacher'
    });
  };

  const saveProfile = async (id) => {
    try {
      const response = await fetch(`https://creshe-arche-des-angle-2.onrender.com/api/auth/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      setEditingId(null);
      fetchProfiles();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 ">{t('admin.staff_admin.title')}</h1>
        <p className="text-slate-300  mt-2 text-sm">{t('admin.staff_admin.sub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Staff Form */}
        <div className="lg:col-span-1">
          <div className="bg-white text-slate-900  backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 ">
            <h2 className="text-lg font-bold text-slate-800  mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> {t('admin.staff_admin.create')}
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.staff_admin.username')}</label>
                <input 
                  type="text" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.staff_admin.temp_pass')}</label>
                <input 
                  type="password" required value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                  placeholder={t('admin.staff_admin.min_chars')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.staff_admin.privileges')}</label>
                <select 
                  value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                >
                  <option value="teacher">{t('admin.staff_admin.teacher')}</option>
                  <option value="editor">{t('admin.staff_admin.editor')}</option>
                  <option value="admin">{t('admin.staff_admin.admin')}</option>
                </select>
              </div>
              <button 
                type="submit" disabled={inviting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> {t('admin.staff_admin.create_btn')}</>}
              </button>
            </form>
          </div>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2">
          <div className="bg-white text-slate-900  backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100  overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-100 ">
              <h2 className="font-bold text-slate-800  flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> {t('admin.staff_admin.active')}
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : profiles.length === 0 ? (
              <div className="p-12 text-center text-slate-500 ">
                {t('admin.staff_admin.empty')}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 ">
                {profiles.map(profile => (
                  <li key={profile.id} className="p-6 hover:bg-slate-50 text-slate-900 :bg-slate-800/50 transition-colors">
                    
                    {editingId === profile.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Username" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="px-3 py-2 border  rounded bg-transparent  text-sm" />
                          <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="px-3 py-2 border  rounded bg-transparent  text-sm">
                            <option value="teacher">Teacher</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveProfile(profile.id)} className="bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-1"><Save className="w-4 h-4"/> {t('admin.staff_admin.save')}</button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-200  px-4 py-2 rounded text-sm font-bold ">{t('admin.staff_admin.cancel')}</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-lg text-slate-800  flex items-center gap-2">
                            {profile.username || 'Unnamed User'}
                          </div>
                          <div className="text-slate-500  text-sm mt-1">{t('admin.staff_admin.role')} <span className="font-bold text-indigo-600">{profile.role}</span></div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditing(profile)} className="text-slate-400 hover:text-indigo-600 font-medium text-sm transition-colors">{t('admin.staff_admin.edit')}</button>
                          <button onClick={() => deleteProfile(profile.id, profile.username)} className="text-rose-400 hover:text-rose-600 font-medium text-sm transition-colors">{t('admin.staff_admin.delete')}</button>
                        </div>
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
  );
}
