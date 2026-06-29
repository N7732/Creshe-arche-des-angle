import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Loader2, Plus, Trash2, Building2, Save, UploadCloud } from 'lucide-react';

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Learning');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://backend-creshe.onrender.com/api/facilities');
      const data = await res.json();
      setFacilities(data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !imageFile) {
      alert('Please fill all fields and select an image.');
      return;
    }
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', newTitle);
      formData.append('description', newDesc);
      formData.append('category', newCategory);

      const res = await fetch('https://backend-creshe.onrender.com/api/facilities', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      setNewTitle('');
      setNewDesc('');
      setNewCategory('Learning');
      setImageFile(null);
      document.getElementById('facility-image').value = '';
      
      fetchFacilities();
    } catch (error) {
      console.error('Add error:', error);
      alert('Failed to add facility.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      const res = await fetch(`https://backend-creshe.onrender.com/api/facilities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setFacilities(facilities.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete facility.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 ">Facilities Management</h1>
        <p className="text-slate-500  mt-2 text-sm">Add and manage the physical spaces available at the school.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white  backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 ">
            <h2 className="text-lg font-bold text-slate-800  mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Add Facility
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Facility Name</label>
                <input 
                  id="facility-title-input"
                  type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50  border border-slate-200  rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600  transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Category</label>
                <select 
                  value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50  border border-slate-200  rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600  transition-all cursor-pointer"
                >
                  <option value="Learning">Learning</option>
                  <option value="Playing">Playing</option>
                  <option value="Events">Events</option>
                  <option value="Art">Art</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Image</label>
                <input 
                  type="file" id="facility-image" accept="image/*" required onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-4 py-2 bg-slate-50  border border-slate-200  rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600  transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Description</label>
                <textarea 
                  required value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows="4"
                  className="w-full px-4 py-2 bg-slate-50  border border-slate-200  rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600  transition-all resize-none"
                />
              </div>
              <button 
                type="submit" disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Facility</>}
              </button>
            </form>
          </div>
        </div>

        {/* Facilities List */}
        <div className="lg:col-span-2">
          <div className="bg-white  backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100  overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-100 ">
              <h2 className="font-bold text-slate-800  flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Current Facilities
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : facilities.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-20 h-20 bg-indigo-50  rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Building2 className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800  mb-2">No Facilities Found</h3>
                <p className="text-slate-500  max-w-md mb-8">
                  You haven't added any facilities yet. Add your first facility to let parents explore the school's environments!
                </p>
                <button 
                  onClick={() => document.getElementById('facility-title-input')?.focus()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5" /> Add New Facility
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {facilities.map((fac) => (
                  <div key={fac.id} className="bg-slate-50  rounded-xl overflow-hidden border border-slate-200  group relative">
                    <div className="h-40 overflow-hidden relative">
                      {fac.image_url ? (
                        <img src={fac.image_url} alt={fac.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-slate-200  flex items-center justify-center">No Image</div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                        {fac.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-slate-800  mb-1">{fac.title}</h3>
                      <p className="text-xs text-slate-600  line-clamp-3">{fac.description}</p>
                    </div>
                    <button onClick={() => handleDelete(fac.id)} className="absolute top-2 left-2 p-2 bg-rose-500/90 hover:bg-rose-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
