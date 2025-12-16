import React, { useState, useEffect } from 'react';
import { Save, Bell, Moon, Sun, Monitor, Shield, Layout, Mail } from 'lucide-react';

export const Settings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    hospitalName: 'General Oncology Ward',
    wardId: 'Wing-3',
    notifications: true,
    emailAlerts: false,
    darkMode: false,
    compactView: false,
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('oncotrack-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('oncotrack-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Application Settings</h1>
          <p className="text-slate-500 mt-1">Manage your preferences and ward configuration</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        
        {/* General Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            General Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hospital / Clinic Name</label>
              <input 
                type="text" 
                value={settings.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ward Identifier</label>
              <input 
                type="text" 
                value={settings.wardId}
                onChange={(e) => handleChange('wardId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Notifications & Alerts
          </h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100">
                        <Bell className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">In-App Notifications</p>
                        <p className="text-xs text-slate-500">Receive popups for critical vitals changes</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.notifications} onChange={(e) => handleChange('notifications', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
             </div>

             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100">
                        <Mail className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Daily Email Summary</p>
                        <p className="text-xs text-slate-500">Receive a morning digest of ward status</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.emailAlerts} onChange={(e) => handleChange('emailAlerts', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
             </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-500" />
            Display Optimization
          </h2>
          <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100">
                        <Layout className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Compact List View</p>
                        <p className="text-xs text-slate-500">Show more patients per screen in the directory</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.compactView} onChange={(e) => handleChange('compactView', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>
             
             {/* Mock Theme Toggle */}
             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg opacity-60 cursor-not-allowed" title="Coming soon">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100">
                        {settings.darkMode ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-slate-600" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Dark Mode</p>
                        <p className="text-xs text-slate-500">Reduce eye strain during night shifts (Coming Soon)</p>
                    </div>
                </div>
                 <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" disabled checked={settings.darkMode} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer"></div>
                </label>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};