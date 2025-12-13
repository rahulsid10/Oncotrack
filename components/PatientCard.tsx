import React from 'react';
import { Patient, PatientStatus } from '../types';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.CRITICAL: return 'bg-rose-100 text-rose-700 border-rose-200';
      case PatientStatus.STABLE: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case PatientStatus.RECOVERING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case PatientStatus.DISCHARGE_READY: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const rtProgress = patient.radiationPlan 
    ? Math.round((patient.radiationPlan.fractionsCompleted / patient.radiationPlan.fractionsTotal) * 100) 
    : 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <img 
            src={patient.imageUrl} 
            alt={patient.name} 
            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{patient.name}</h3>
            <p className="text-sm text-slate-500">{patient.mrn}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(patient.status)}`}>
          {patient.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Activity className="w-4 h-4 text-slate-400" />
          <span className="truncate">{patient.diagnosis}</span>
        </div>

        {patient.radiationPlan && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Radiation ({patient.radiationPlan.targetSite})</span>
              <span>{patient.radiationPlan.fractionsCompleted}/{patient.radiationPlan.fractionsTotal} Fx</span>
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
            <span>{patient.chemoProtocol.protocolName}</span>
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