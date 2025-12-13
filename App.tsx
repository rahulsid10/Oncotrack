import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/PatientList';
import { PatientDetail } from './components/PatientDetail';
import { Patient } from './types';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'patients'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleNavigate = (view: 'dashboard' | 'patients') => {
    setActiveView(view);
    setSelectedPatient(null);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        activeView={activeView} 
        onNavigate={handleNavigate} 
      />
      
      <main className="flex-1 ml-64 relative">
        {selectedPatient ? (
          <PatientDetail 
            patient={selectedPatient} 
            onBack={() => setSelectedPatient(null)} 
          />
        ) : (
          <>
            {activeView === 'dashboard' && (
              <Dashboard 
                onSelectPatient={handleSelectPatient}
                onNavigatePatients={() => setActiveView('patients')}
              />
            )}
            {activeView === 'patients' && (
              <PatientList 
                onSelectPatient={handleSelectPatient} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;