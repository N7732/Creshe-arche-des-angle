import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Loader2, Plus, Mail, Save, User } from 'lucide-react';

export default function Staff() {
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

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
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
      // 1. Log the invitation role in the database for the trigger to pick up
      const { error: inviteError } = await supabase
        .from('invitations')
        .upsert({ email: inviteEmail, role: inviteRole }, { onConflict: 'email' });
      
      if (inviteError) {
        console.error('Failed to set invitation role:', inviteError);
        throw new Error('Failed to set role permissions. You must be a superadmin.');
      }

      // 2. Create the user using a secondary client to prevent logging out
      const { createClient } = await import('@supabase/supabase-js');
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
        import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key',
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { error } = await tempSupabase.auth.signUp({
        email: inviteEmail,
        password: invitePassword
      });

      if (error) throw error;
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
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      fetchProfiles();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user. Make sure you have superadmin privileges.');
    }
  };

  const startEditing = (profile) => {
    setEditingId(profile.id);
    setEditForm({
      full_name: profile.full_name || '',
      role_title: profile.role_title || '',
      phone: profile.phone || '',
      email: profile.email || '',
      color: profile.color || 'from-primary to-blue-600',
      role: profile.role || 'teacher'
    });
  };

  const saveProfile = async (id) => {
    try {
      const { error } = await supabase.from('profiles').update(editForm).eq('id', id);
      if (error) throw error;
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
        <h1 className="text-3xl font-extrabold text-slate-800 ">Staff Management</h1>
        <p className="text-slate-500  mt-2 text-sm">Add teachers, assign privileges, and update public profile details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Staff Form */}
        <div className="lg:col-span-1">
          <div className="bg-white  backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 ">
            <h2 className="text-lg font-bold text-slate-800  mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Create Staff
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email Address</label>
                <input 
                  type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Temporary Password</label>
                <input 
                  type="password" required value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Assign Privileges</label>
                <select 
                  value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                >
                  <option value="teacher">Teacher (View & Edit Students)</option>
                  <option value="editor">Editor (Manage Content)</option>
                </select>
              </div>
              <button 
                type="submit" disabled={inviting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Create Account</>}
              </button>
            </form>
          </div>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2">
          <div className="bg-white  backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100  overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-100 ">
              <h2 className="font-bold text-slate-800  flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Active Team Members
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : profiles.length === 0 ? (
              <div className="p-12 text-center text-slate-500 ">
                No profiles found. They will appear after logging in.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 ">
                {profiles.map(profile => (
                  <li key={profile.id} className="p-6 hover:bg-slate-50 :bg-slate-800/50 transition-colors">
                    
                    {editingId === profile.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Full Name" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="px-3 py-2 border  rounded bg-transparent  text-sm" />
                          <input type="text" placeholder="Role Title (e.g. Head Teacher)" value={editForm.role_title} onChange={e => setEditForm({...editForm, role_title: e.target.value})} className="px-3 py-2 border  rounded bg-transparent  text-sm" />
                          <input type="text" placeholder="Phone" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="px-3 py-2 border  rounded bg-transparent  text-sm" />
                          <input type="email" placeholder="Contact Email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="px-3 py-2 border  rounded bg-transparent  text-sm" />
                          <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="px-3 py-2 border  rounded bg-transparent  text-sm">
                            <option value="teacher">Teacher</option>
                            <option value="editor">Editor</option>
                          </select>
                          <select value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})} className="px-3 py-2 border  rounded bg-transparent  text-sm">
                            <option value="from-primary to-blue-600">Blue</option>
                            <option value="from-accent-pink to-pink-500">Pink</option>
                            <option value="from-secondary to-orange-400">Orange</option>
                            <option value="from-accent-green to-emerald-500">Green</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveProfile(profile.id)} className="bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-1"><Save className="w-4 h-4"/> Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-200  px-4 py-2 rounded text-sm font-bold ">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-lg text-slate-800  flex items-center gap-2">
                            {profile.full_name || 'Unnamed User'}
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-black ${profile.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{profile.role}</span>
                          </div>
                          <div className="text-sm text-slate-500 mt-1">{profile.role_title || 'No Title Set'} • {profile.phone || 'No Phone'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditing(profile)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold bg-indigo-50 px-3 py-1 rounded">
                            Edit Profile
                          </button>
                          <button onClick={() => deleteProfile(profile.id, profile.full_name || profile.email)} className="text-red-600 hover:text-red-800 text-sm font-bold bg-red-50 px-3 py-1 rounded transition-colors">
                            Delete User
                          </button>
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
