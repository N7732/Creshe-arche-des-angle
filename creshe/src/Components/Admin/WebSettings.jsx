import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Loader2, Save, UploadCloud, Video, Settings2, Trash2 } from 'lucide-react';

export default function WebSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://backend-creshe.onrender.com/api/settings');
      const data = await res.json();
      
      const settingsMap = {};
      if (data) {
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });
      }
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await fetch('https://backend-creshe.onrender.com/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        });
      }
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(10); // Fake initial progress
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `home-video-${Math.random()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Update the setting
      handleSettingChange('home_video_url', publicUrlData.publicUrl);
      alert('Video uploaded! Do not forget to click Save Settings to apply.');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 ">Web Settings & Media</h1>
          <p className="text-slate-500  text-sm">Manage global website configuration and home page videos.</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white  backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] [0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100  space-y-8">
        
        {/* Home Video Management */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800  flex items-center gap-2 border-b border-slate-100  pb-2">
            <Video className="w-5 h-5 text-secondary" /> Home Page Video
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ">Current Video URL</label>
              <input 
                type="text" 
                value={settings.home_video_url || ''}
                onChange={(e) => handleSettingChange('home_video_url', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50  border border-slate-200  rounded-lg text-sm focus:ring-primary focus:border-primary "
                placeholder="https://..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ">Upload New Video</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className={`w-full px-4 py-2 border-2 border-dashed border-slate-300  rounded-lg flex items-center justify-center gap-2 text-sm font-bold text-slate-500 transition-colors ${uploading ? 'bg-slate-50 ' : 'hover:border-primary hover:text-primary bg-white '}`}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {uploading ? 'Uploading to Supabase...' : 'Click or Drag Video Here'}
                </div>
              </div>
            </div>
          </div>
          
          {settings.home_video_url && (
            <div className="mt-4 rounded-xl overflow-hidden bg-black aspect-video max-w-sm border border-slate-200 ">
              <video src={settings.home_video_url} controls className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Enrollment Configuration */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Settings2 className="w-5 h-5 text-indigo-500" /> Enrollment Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Enrollment Status</label>
              <select
                value={settings.enrollment_enabled || 'true'}
                onChange={(e) => handleSettingChange('enrollment_enabled', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-primary focus:border-primary"
              >
                <option value="true">Open (Accepting Enrollments)</option>
                <option value="false">Closed (Manually Disabled)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Maximum Class Capacity</label>
              <input 
                type="number" 
                min="1"
                value={settings.enrollment_capacity || 50}
                onChange={(e) => handleSettingChange('enrollment_capacity', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-slate-500">Form will automatically close if active requests reach this limit.</p>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Trash2 className="w-5 h-5 text-rose-500" /> Data Retention Policies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Contact Message Retention (Days)</label>
              <input 
                type="number" 
                min="1"
                value={settings.contact_retention_days || 30}
                onChange={(e) => handleSettingChange('contact_retention_days', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-slate-500">Contact messages older than this will be permanently deleted automatically.</p>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800  flex items-center gap-2 border-b border-slate-100  pb-2">
            General Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ">Contact Email</label>
              <input 
                type="email" 
                value={settings.contact_email || ''}
                onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50  border border-slate-200  rounded-lg text-sm focus:ring-primary focus:border-primary "
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ">Contact Phone</label>
              <input 
                type="text" 
                value={settings.contact_phone || ''}
                onChange={(e) => handleSettingChange('contact_phone', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50  border border-slate-200  rounded-lg text-sm focus:ring-primary focus:border-primary "
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
