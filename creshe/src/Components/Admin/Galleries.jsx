import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import { fetcher } from '../../utils/fetcher';

export default function Galleries() {
  const { t } = useTranslation();
  const { data, isLoading } = useSWR(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/galleries`, fetcher);
  const galleries = Array.isArray(data) ? data : [];
  const loading = isLoading;

  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [imageUrl, setImageUrl] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please paste a Google Drive View Link.');
      return;
    }
    if (!newTitle) {
      alert('Please provide a title for the image.');
      return;
    }

    setUploading(true);
    try {
      const payload = {
        title: newTitle,
        category: newCategory,
        image_url: imageUrl
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/galleries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      setNewTitle('');
      setImageUrl('');
      mutate(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/galleries`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/galleries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      mutate(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/galleries`);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete image.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-100 ">{t('admin.galleries.title')}</h1>
        <p className="text-slate-300  mt-2 text-sm">{t('admin.galleries.sub')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white text-slate-900  backdrop-blur-xl p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 ">
            <h2 className="text-lg font-bold text-slate-800  mb-6 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" /> {t('admin.galleries.upload')}
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.galleries.img_title')}</label>
                <input 
                  type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900  border border-slate-200  rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600  transition-all"
                  placeholder="e.g. Kids playing outside"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.galleries.category')}</label>
                <select 
                  value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900  border border-slate-200  rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600  transition-all cursor-pointer"
                >
                  <option value="General">General</option>
                  <option value="Playing">Playing</option>
                  <option value="Learning">Learning</option>
                  <option value="Sports">Sports</option>
                  <option value="Art">Art</option>
                  <option value="Events">Events</option>
                  <option value="Classrooms">Classrooms</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{t('admin.galleries.photo')}</label>
                <input 
                  type="text" required value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900  border border-slate-200  rounded-xl text-sm focus:ring-indigo-600 focus:border-indigo-600  transition-all"
                  placeholder="https://drive.google.com/file/d/.../view"
                />
              </div>
              
              <button 
                type="submit" disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UploadCloud className="w-5 h-5" /> {t('admin.galleries.btn')}</>}
              </button>
            </form>
          </div>
        </div>

        {/* Gallery List */}
        <div className="lg:col-span-2">
          <div className="bg-white text-slate-900  backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100  overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-100 ">
              <h2 className="font-bold text-slate-800  flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" /> {t('admin.galleries.current')}
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : galleries.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-20 h-20 bg-indigo-50  rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <ImageIcon className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800  mb-2">No Images Found</h3>
                <p className="text-slate-500  max-w-md mb-8">
                  Your gallery is currently empty. Upload your first image to showcase your facilities and events to the parents!
                </p>
                <button 
                  onClick={() => document.querySelector('input[type="url"]')?.focus()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-1"
                >
                  <UploadCloud className="w-5 h-5" /> Start Uploading Now
                </button>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleries.map((img, index) => (
                  <motion.div 
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative rounded-xl overflow-hidden aspect-square bg-slate-100  border border-slate-200 "
                  >
                    <img src={img.image_url} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white font-bold text-sm truncate">{img.title}</p>
                      <p className="text-indigo-300 text-xs font-semibold">{img.category}</p>
                      <button onClick={() => handleDelete(img.id)} className="p-2 bg-white text-slate-900/10 hover:bg-rose-500 text-white rounded-lg backdrop-blur-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
