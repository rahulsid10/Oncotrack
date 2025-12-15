import React from 'react';
import { PatientStatus } from '../types';
import { Users, AlertCircle, CheckCircle2, BedDouble } from 'lucide-react';
import { PatientCard } from './PatientCard';
import { Patient } from '../types';

interface DashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNavigatePatients: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ patients, onSelectPatient, onNavigatePatients }) => {
  const criticalCount = patients.filter(p => p.status === PatientStatus.CRITICAL).length;
  const stableCount = patients.filter(p => p.status === PatientStatus.STABLE).length;
  const dischargeCount = patients.filter(p => p.status === PatientStatus.DISCHARGE_READY).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ward Overview</h1>
        <p className="text-slate-500 mt-1">Oncology Wing 3 • Today, {new Date().toLocaleDateString()}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Inpatients</p>
            <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Critical Status</p>
            <p className="text-2xl font-bold text-slate-900">{criticalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Stable</p>
            <p className="text-2xl font-bold text-slate-900">{stableCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Discharge Ready</p>
            <p className="text-2xl font-bold text-slate-900">{dischargeCount}</p>
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Priority Attention</h2>
            <button 
              onClick={onNavigatePatients}
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View All Patients
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients
              .sort((a, b) => (a.status === PatientStatus.CRITICAL ? -1 : 1))
              .slice(0, 4)
              .map(patient => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  onClick={() => onSelectPatient(patient)} 
                />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Treatment Schedule</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="divide-y divide-slate-100">
               {patients.filter(p => p.radiationPlan).map(p => (
                 <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectPatient(p)}>
                   <div className="flex justify-between items-start mb-1">
                     <span className="font-medium text-slate-900 text-sm">{p.name}</span>
                     <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                       {p.radiationPlan?.lastFractionDate ? '10:30 AM' : 'Pending'}
                     </span>
                   </div>
                   <p className="text-xs text-slate-500">Radiation: {p.radiationPlan?.targetSite}</p>
                 </div>
               ))}
               <div className="p-4 text-center">
                 <button className="text-sm font-medium text-slate-500 hover:text-slate-800">
                   View Full Schedule
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};