import React from 'react';
import { LayoutDashboard, Users, Calendar, Activity, Settings, LogOut, History, X, WifiOff } from 'lucide-react';

interface SidebarProps {
  activeView: 'dashboard' | 'patients' | 'history' | 'settings';
  onNavigate: (view: 'dashboard' | 'patients' | 'history' | 'settings') => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  isLocalMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onLogout, isOpen, onClose, isLocalMode }) => {
  const navItemClass = (isActive: boolean) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
      isActive 
        ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`;

  const handleNavClick = (view: 'dashboard' | 'patients' | 'history' | 'settings') => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 ease-in-out w-64
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
        md:translate-x-0 md:shadow-none
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">OncoTrack</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div 
            className={navItemClass(activeView === 'dashboard')}
            onClick={() => handleNavClick('dashboard')}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>RT Overview</span>
          </div>
          <div 
            className={navItemClass(activeView === 'patients')}
            onClick={() => handleNavClick('patients')}
          >
            <Users className="w-5 h-5" />
            <span>On RT Patients</span>
          </div>
          
           <div 
            className={navItemClass(activeView === 'history')}
            onClick={() => handleNavClick('history')}
          >
            <History className="w-5 h-5" />
            <span>Discharge Log</span>
          </div>

          <div className={navItemClass(false)}>
            <Calendar className="w-5 h-5" />
            <span>Schedule</span>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50 md:bg-white space-y-4">
          {isLocalMode && (
            <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight">Offline Mode</p>
                <p className="text-[9px] text-amber-600 leading-tight">Saving to Local Disk</p>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            <div 
              className={navItemClass(activeView === 'settings')}
              onClick={() => handleNavClick('settings')}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>
            <div 
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};