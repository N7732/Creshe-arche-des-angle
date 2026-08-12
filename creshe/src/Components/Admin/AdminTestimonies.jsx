import React, { useState, useEffect } from 'react';
import { Loader2, Plus, MessageSquare, Save, Trash2, Image as ImageIcon, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import { fetcher } from '../../utils/fetcher';

export default function AdminTestimonies() {
  const { t } = useTranslation();
  const { data, isLoading } = useSWR(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/testimonies`, fetcher);
  const testimonies = Array.isArray(data) ? data : [];
  const loading = isLoading;

  const [adding, setAdding] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [childClass, setChildClass] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState('');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  });

  const handleAddTestimony = async (e) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Please paste a Google Drive View Link for the profile image.");
      return;
    }

    setAdding(true);
    const payload = {
      name,
      child_class: childClass,
      message,
      rating,
      image_url: imageUrl
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/testimonies`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create testimony');

      alert('Testimony added successfully!');
      setName('');
      setChildClass('');
      setMessage('');
      setRating(5);
      setImageUrl('');
      mutate(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/testimonies`);
    } catch (error) {
      console.error('Create testimony error:', error);
      alert('Failed to add testimony.');
    } finally {
      setAdding(false);
    }
  };

  const deleteTestimony = async (id, testimonyName) => {
    if (!window.confirm(`Are you sure you want to delete testimony by ${testimonyName}?`)) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/testimonies/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete testimony');
      mutate(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/testimonies`);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete testimony.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">{t('admin.testimonies.title')}</h1>
        <p className="text-slate-300 mt-2 text-sm">{t('admin.testimonies.sub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Testimony Form */}
        <div className="lg:col-span-1">
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> {t('admin.testimonies.add')}
            </h2>
            <form onSubmit={handleAddTestimony} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.testimonies.name')}</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.testimonies.class')}</label>
                <input 
                  type="text" required value={childClass} onChange={(e) => setChildClass(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                  placeholder="e.g. Nursery 2"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.testimonies.msg')}</label>
                <textarea 
                  required value={message} onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600 resize-none"
                  placeholder="Enter their testimony..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.testimonies.rating')}</label>
                <select 
                  value={rating} onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.testimonies.photo')}</label>
                <input 
                  type="url" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600"
                  placeholder="https://drive.google.com/file/d/.../view"
                />
              </div>

              <button 
                type="submit" disabled={adding}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
              >
                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> {t('admin.testimonies.btn')}</>}
              </button>
            </form>
          </div>
        </div>

        {/* List of Testimonies */}
        <div className="lg:col-span-2">
          <div className="bg-white text-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" /> {t('admin.testimonies.existing')}
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : testimonies.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-500 text-center">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">{t('admin.testimonies.empty')}</h3>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {testimonies.map(t => (
                  <li key={t.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-4">
                    <img src={t.image_url} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{t.name}</h3>
                          <p className="text-xs font-bold text-indigo-600 uppercase">{t.child_class}</p>
                        </div>
                        <button onClick={() => deleteTestimony(t.id, t.name)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3 h-3 ${star <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>
                      
                      <p className="text-slate-600 text-sm italic">"{t.message}"</p>
                    </div>
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
