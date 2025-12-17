import React from 'react';
import { LayoutDashboard, Users, Calendar, Activity, Settings, LogOut, History, ClipboardList } from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'patients' | 'history' | 'settings';
  onNavigate: (view: 'dashboard' | 'patients' | 'history' | 'settings') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onLogout }) => {
  const navItemClass = (isActive: boolean) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
      isActive 
        ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`;

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">OncoTrack</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <div 
          className={navItemClass(activeView === 'dashboard')}
          onClick={() => onNavigate('dashboard')}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </div>
        <div 
          className={navItemClass(activeView === 'patients')}
          onClick={() => onNavigate('patients')}
        >
          <Users className="w-5 h-5" />
          <span>Inpatients</span>
        </div>
        
         <div 
          className={navItemClass(activeView === 'history')}
          onClick={() => onNavigate('history')}
        >
          <History className="w-5 h-5" />
          <span>Discharge Log</span>
        </div>

        {/* Mock Links for visuals */}
        <div className={navItemClass(false)}>
          <Calendar className="w-5 h-5" />
          <span>Schedule</span>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div 
          className={navItemClass(activeView === 'settings')}
          onClick={() => onNavigate('settings')}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </div>
        <div 
          onClick={onLogout}
          className="mt-2 flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </div>
      </div>
    </div>
  );
};