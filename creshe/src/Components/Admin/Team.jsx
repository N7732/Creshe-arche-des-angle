import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Users, Save, Edit2 } from 'lucide-react';

export default function Team() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBio, setNewBio] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const getAuthToken = () => {
    try {
      const sessionStr = localStorage.getItem('creche_admin_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        return session.token;
      }
    } catch(e) {}
    return '';
  };

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://backend-creshe.onrender.com/api/team');
      const data = await res.json();
      setTeam(data || []);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName || !newRole || (!imageFile && !editingId)) {
      alert('Please fill Name, Role, and select an image.');
      return;
    }
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('name', newName);
      formData.append('role', newRole);
      formData.append('email', newEmail);
      formData.append('phone', newPhone);
      formData.append('bio', newBio);

      const url = editingId ? `https://backend-creshe.onrender.com/api/team/${editingId}` : 'https://backend-creshe.onrender.com/api/team';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server returned ${res.status}: ${text}`);
      }
      
      setNewName('');
      setNewRole('');
      setNewEmail('');
      setNewPhone('');
      setNewBio('');
      setImageFile(null);
      setEditingId(null);
      document.getElementById('team-image').value = '';
      
      fetchTeam();
    } catch (error) {
      console.error('Save error:', error);
      alert(editingId ? `Failed to update team member. ${error.message}` : `Failed to add team member. ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    try {
      const res = await fetch(`https://backend-creshe.onrender.com/api/team/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setTeam(team.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete team member.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 ">Public Team Profiles</h1>
        <p className="text-slate-500  mt-2 text-sm">Add and manage staff members that will be publicly visible on the About Us page.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white  backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 ">
            <h2 className="text-lg font-bold text-slate-800  mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> {editingId ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                <input 
                  type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Role / Position</label>
                <input 
                  type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                  placeholder="e.g. Head Teacher"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email</label>
                <input 
                  type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                  placeholder="e.g. staff@nursery.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Contact (Phone)</label>
                <input 
                  type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition-all"
                  placeholder="e.g. +123456789"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Photo {editingId && '(Optional if keeping current)'}</label>
                <input 
                  type="file" id="team-image" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
                  required={!editingId}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Short Bio</label>
                <textarea 
                  value={newBio} onChange={(e) => setNewBio(e.target.value)} rows="3"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600 transition-all resize-none"
                  placeholder="Brief description of their experience..."
                />
              </div>
              <button 
                type="submit" disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {editingId ? 'Update Profile' : 'Save Profile'}</>}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingId(null);
                    setNewName('');
                    setNewRole('');
                    setNewEmail('');
                    setNewPhone('');
                    setNewBio('');
                    setImageFile(null);
                    document.getElementById('team-image').value = '';
                  }}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Team List */}
        <div className="lg:col-span-2">
          <div className="bg-white backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Current Public Team
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : team.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Users className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Profiles Found</h3>
                <p className="text-slate-500 max-w-md mb-8">
                  You haven't added any public staff members yet. Add them to show up on the About Us page!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
                {team.map((member) => (
                  <div key={member.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 group relative flex flex-col">
                    <div className="h-64 overflow-hidden relative">
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">No Image</div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col grow">
                      <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{member.name}</h3>
                      <p className="text-xs font-bold text-indigo-600 mb-2">{member.role}</p>
                      <p className="text-xs text-slate-600 line-clamp-3">{member.bio}</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                        setEditingId(member.id);
                        setNewName(member.name || '');
                        setNewRole(member.role || '');
                        setNewEmail(member.email || '');
                        setNewPhone(member.phone || '');
                        setNewBio(member.bio || '');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="p-2 bg-indigo-500/90 hover:bg-indigo-600 text-white rounded-lg transition-colors backdrop-blur-sm" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="p-2 bg-rose-500/90 hover:bg-rose-600 text-white rounded-lg transition-colors backdrop-blur-sm" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
