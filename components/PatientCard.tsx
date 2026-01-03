import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';
import { Activity, AlertCircle, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { updatePatient } from '../services/patientService';

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
  onRefresh?: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick, onRefresh }) => {
  const [discharging, setDischarging] = useState(false);

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.CRITICAL: return 'bg-rose-100 text-rose-700 border-rose-200';
      case PatientStatus.STABLE: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case PatientStatus.RECOVERING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case PatientStatus.DISCHARGE_READY: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusDotColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.CRITICAL: return 'bg-rose-500';
      case PatientStatus.STABLE: return 'bg-emerald-500';
      case PatientStatus.RECOVERING: return 'bg-blue-500';
      case PatientStatus.DISCHARGE_READY: return 'bg-slate-500';
      default: return 'bg-slate-300';
    }
  };

  const handleQuickDischarge = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger card click
    if (window.confirm(`Discharge ${patient.name} to the historical log?`)) {
      setDischarging(true);
      const updated: Patient = { 
        ...patient, 
        status: PatientStatus.DISCHARGED,
        dischargeDate: new Date().toISOString().split('T')[0] // Record current date
      };
      const { success } = await updatePatient(updated);
      if (success && onRefresh) {
        onRefresh();
      }
      setDischarging(false);
    }
  };

  const rtProgress = patient.radiationPlan 
    ? Math.round((patient.radiationPlan.fractionsCompleted / patient.radiationPlan.fractionsTotal) * 100) 
    : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <img 
            src={patient.imageUrl} 
            alt={patient.name} 
            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{patient.name}</h3>
              <span 
                className={`w-2 h-2 rounded-full ${getStatusDotColor(patient.status)}`} 
                title={`Status: ${patient.status}`}
              />
            </div>
            <p className="text-sm text-slate-500">{patient.mrn}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleQuickDischarge}
            disabled={discharging}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            title="Quick Discharge"
          >
            {discharging ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          </button>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${getStatusColor(patient.status)}`}>
            {patient.status}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="truncate">{patient.diagnosis}</span>
        </div>

        {patient.radiationPlan && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span className="font-medium">Radiation ({patient.radiationPlan.targetSite})</span>
              <span className="font-bold text-slate-700">{patient.radiationPlan.fractionsCompleted}/{patient.radiationPlan.fractionsTotal} Fx</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${rtProgress}%` }}
              />
            </div>
          </div>
        )}

        {patient.chemoProtocol && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="font-medium text-slate-700">Chemo:</span>
            <span className="truncate">{patient.chemoProtocol.protocolName}</span>
          </div>
        )}

        {!patient.radiationPlan && !patient.chemoProtocol && (
           <div className="flex items-center gap-2 text-xs text-slate-400 p-2 italic">
             No active active protocol tracked
           </div>
        )}
      </div>
    </div>
  );
};