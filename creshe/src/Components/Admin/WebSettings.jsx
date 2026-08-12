import React, { useState, useEffect } from 'react';
import { Loader2, Save, UploadCloud, Video, Settings2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import { fetcher } from '../../utils/fetcher';

export default function WebSettings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data, isLoading } = useSWR('http://localhost:5000/api/settings', fetcher);
  const loading = isLoading;

  useEffect(() => {
    if (data) {
      const settingsMap = {};
      data.forEach(item => {
        settingsMap[item.key] = item.value;
      });
      setSettings(settingsMap);
    }
  }, [data]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await fetch('http://localhost:5000/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value })
        });
      }
      mutate('http://localhost:5000/api/settings');
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
          <h1 className="text-2xl font-extrabold text-slate-100 ">{t('admin.settings.title')}</h1>
          <p className="text-slate-300  text-sm">{t('admin.settings.sub')}</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {t('admin.settings.save')}
        </button>
      </div>

      <div className="bg-white text-slate-900  rounded-2xl shadow-sm border border-slate-100 p-8 space-y-10">
        
        {/* VIDEO SECTION */}
        <section>
          <h2 className="text-lg font-bold text-slate-800  mb-6 flex items-center gap-2">
            <Video className="w-5 h-5 text-amber-500" /> {t('admin.settings.video')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700  mb-2">{t('admin.settings.video_url')}</label>
              <input 
                type="text" 
                value={settings.home_video_url || ''}
                onChange={(e) => handleSettingChange('home_video_url', e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 text-slate-900  border border-slate-200  rounded-lg text-sm focus:ring-primary focus:border-primary "
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700  mb-2">{t('admin.settings.upload')}</label>
              <div className="relative border-2 border-dashed border-slate-300  rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 text-slate-900  hover:bg-slate-100 transition-colors">
                <input 
                  type="file" 
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="flex items-center gap-2 text-indigo-600 font-medium">
                    <Loader2 className="w-5 h-5 animate-spin" /> Uploading {uploadProgress}%...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-600 ">
                    <UploadCloud className="w-5 h-5" /> <span className="text-sm font-bold">{t('admin.settings.drag')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {settings.home_video_url && (
            <div className="mt-4 rounded-xl overflow-hidden bg-black aspect-video max-w-sm border border-slate-200 ">
              <video src={settings.home_video_url} controls className="w-full h-full object-cover" />
            </div>
          )}
        </section>

        {/* ENROLLMENT CONFIG */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <Settings2 className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800 ">{t('admin.settings.enrollment')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700  mb-2">{t('admin.settings.status')}</label>
              <select 
                value={settings.enrollment_status || 'open'}
                onChange={(e) => handleSettingChange('enrollment_status', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900  border border-slate-200  rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="open">{t('admin.settings.open')}</option>
                <option value="closed">Closed (Waitlist Only)</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700  mb-2">{t('admin.settings.capacity')}</label>
              <input 
                type="number"
                value={settings.max_capacity || 50}
                onChange={(e) => handleSettingChange('max_capacity', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900  border border-slate-200  rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500  mt-2">{t('admin.settings.limit')}</p>
            </div>
          </div>
        </section>

        {/* RETENTION POLICY */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800 ">{t('admin.settings.retention')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700  mb-2">{t('admin.settings.msg_retention')}</label>
              <input 
                type="number"
                value={settings.contact_retention_days || 30}
                onChange={(e) => handleSettingChange('contact_retention_days', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900  border border-slate-200  rounded-lg focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-xs text-slate-500  mt-2">{t('admin.settings.del_msg')}</p>
            </div>
          </div>
        </section>

        {/* CONTACT / GENERAL */}
        <section>
          <h2 className="text-lg font-bold text-slate-800  mb-6">{t('admin.settings.general')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-bold text-slate-700  mb-2">{t('admin.settings.email')}</label>
              <input 
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900  border border-slate-200  rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700  mb-2">{t('admin.settings.phone')}</label>
              <input 
                type="text"
                value={settings.contact_phone || ''}
                onChange={(e) => handleSettingChange('contact_phone', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900  border border-slate-200  rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
