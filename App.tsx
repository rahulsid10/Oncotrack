import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { PatientHistory } from './components/PatientHistory';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Patient, PatientStatus } from './types';
import { getPatients } from './services/patientService';
import { Loader2, Menu, Activity, WifiOff, CloudOff, RefreshCw } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'patients' | 'history' | 'settings'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('oncotrack_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchData = async () => {
    if (patients.length === 0) setLoading(true);
    
    try {
      const { data, isLocal } = await getPatients();
      setPatients(data);
      setIsLocalMode(isLocal);
      setError(null);
    } catch (err: any) {
      // Prevent [object Object] by robustly stringifying the error
      const errorMessage = err.message || (typeof err === 'string' ? err : JSON.stringify(err));
      console.error("Critical Sync Failure:", errorMessage);
      
      // If we have NO data at all (not even from mock/local), then show error
      if (patients.length === 0) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    localStorage.setItem('oncotrack_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('oncotrack_auth');
    setIsAuthenticated(false);
    setPatients([]);
    setSelectedPatient(null);
    setActiveView('dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (view: 'dashboard' | 'patients' | 'history' | 'settings') => {
    setActiveView(view);
    setSelectedPatient(null);
    setIsMobileMenuOpen(false);
  };

  const handlePatientUpdated = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient?.id === updatedPatient.id) {
      setSelectedPatient(updatedPatient);
    }
  };

  const handlePatientDeleted = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    if (selectedPatient?.id === id) {
      setSelectedPatient(null);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const activePatients = patients.filter(p => p.status !== PatientStatus.DISCHARGED);

  if (loading && patients.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <Activity className="w-16 h-16 text-teal-600 animate-pulse mx-auto" />
            <Loader2 className="w-16 h-16 text-teal-200 animate-spin mx-auto absolute inset-0" />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-lg">Initializing OncoTrack</p>
            <p className="text-slate-500 text-sm mt-1">Establishing secure connection to ward database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        activeView={activeView} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLocalMode={isLocalMode}
      />
      
      <main className="flex-1 md:ml-64 relative flex flex-col min-h-screen">
        
        {/* Connection Status Banner */}
        {isLocalMode && (
          <div className="bg-amber-600 text-white px-4 py-2 flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest sticky top-0 z-50 shadow-lg">
            <div className="flex items-center gap-3">
              <CloudOff className="w-3.5 h-3.5" />
              <span>Offline Archive Mode: Cloud Database Unreachable</span>
            </div>
            <button 
              onClick={fetchData} 
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded border border-white/40 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <RefreshCw className="w-3 h-3" />
              Reconnect
            </button>
          </div>
        )}

        {error && !isLocalMode && (
          <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest sticky top-0 z-50 shadow-lg">
            <span>Clinical Sync Error: {error}</span>
            <button 
              onClick={fetchData} 
              className="ml-4 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded border border-white/40 transition-colors shrink-0"
            >
              Retry Sync
            </button>
          </div>
        )}

        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">OncoTrack</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {selectedPatient ? (
          <PatientDetail 
            patient={selectedPatient} 
            onBack={() => setSelectedPatient(null)}
            onPatientUpdated={handlePatientUpdated}
            onPatientDeleted={handlePatientDeleted}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
            {activeView === 'dashboard' && (
              <Dashboard 
                patients={activePatients}
                onSelectPatient={setSelectedPatient}
                onNavigatePatients={() => setActiveView('patients')}
                onRefresh={fetchData}
              />
            )}
            {activeView === 'patients' && (
              <PatientList 
                patients={activePatients}
                onSelectPatient={setSelectedPatient} 
                onRefresh={fetchData}
              />
            )}
            {activeView === 'history' && (
              <PatientHistory 
                patients={patients}
                onRefresh={fetchData}
              />
            )}
            {activeView === 'settings' && (
              <Settings />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
