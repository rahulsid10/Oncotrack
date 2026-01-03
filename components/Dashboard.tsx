import React, { useState } from 'react';
import { PatientStatus, WorkflowStatus, RTIntent } from '../types';
import { Users, AlertCircle, CheckCircle2, BedDouble, UserPlus, Zap, Monitor, Activity as ActivityIcon, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { PatientCard } from './PatientCard';
import { Patient } from '../types';
import { AddPatientModal } from './AddPatientModal';

interface DashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onNavigatePatients: () => void;
  onRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ patients, onSelectPatient, onNavigatePatients, onRefresh }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const radicalCount = patients.filter(p => p.intent === RTIntent.RADICAL).length;
  const adjuvantCount = patients.filter(p => p.intent === RTIntent.ADJUVANT).length;
  const palliativeCount = patients.filter(p => p.intent === RTIntent.PALLIATIVE).length;

  const versaHDPatients = patients.filter(p => p.radiationPlan?.machine === 'Versa HD');
  const elektaPatients = patients.filter(p => p.radiationPlan?.machine === 'Elekta Compac');

  const getWorkflowSummary = (patient: Patient) => {
    if (!patient.radiationPlan?.workflow) return 'No Workflow';
    const steps = patient.radiationPlan.workflow;
    if (steps.planApproval.status === WorkflowStatus.APPROVED) return 'Ready for Tx';
    if (steps.contouring.status === WorkflowStatus.IN_PROGRESS) return 'Contouring';
    if (steps.ctSimulation.status === WorkflowStatus.COMPLETED) return 'Post-Sim';
    return 'Pending Sim';
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">RT Overview</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Oncology Wing 3 • Today, {new Date().toLocaleDateString()}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-teal-600/20 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Admit Patient
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
            <BedDouble className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total RT Patients</p>
            <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Radical RT Cases</p>
            <p className="text-2xl font-bold text-slate-900">{radicalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Adjuvant RT Cases</p>
            <p className="text-2xl font-bold text-slate-900">{adjuvantCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 flex-shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Palliative RT Cases</p>
            <p className="text-2xl font-bold text-slate-900">{palliativeCount}</p>
          </div>
        </div>
      </div>

      {/* RT Machine Management Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          RT Machine Utilization
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Versa HD Column */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-bold text-slate-800">Versa HD</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full uppercase">
                {versaHDPatients.length} Patients
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {versaHDPatients.length > 0 ? (
                versaHDPatients.map(p => (
                  <div key={p.id} onClick={() => onSelectPatient(p)} className="p-4 hover:bg-slate-50 cursor-pointer group transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{p.diagnosis}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        getWorkflowSummary(p) === 'Ready for Tx' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {getWorkflowSummary(p)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Fx: {p.radiationPlan?.fractionsCompleted}/{p.radiationPlan?.fractionsTotal}</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                          className="bg-amber-500 h-full" 
                          style={{ width: `${(p.radiationPlan!.fractionsCompleted / p.radiationPlan!.fractionsTotal) * 100}%` }}
                         />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm italic">No patients assigned to Versa HD.</div>
              )}
            </div>
          </div>

          {/* Elekta Compac Column */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-800">Elekta Compac</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded-full uppercase">
                {elektaPatients.length} Patients
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {elektaPatients.length > 0 ? (
                elektaPatients.map(p => (
                  <div key={p.id} onClick={() => onSelectPatient(p)} className="p-4 hover:bg-slate-50 cursor-pointer group transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{p.diagnosis}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        getWorkflowSummary(p) === 'Ready for Tx' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {getWorkflowSummary(p)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Fx: {p.radiationPlan?.fractionsCompleted}/{p.radiationPlan?.fractionsTotal}</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                          className="bg-indigo-500 h-full" 
                          style={{ width: `${(p.radiationPlan!.fractionsCompleted / p.radiationPlan!.fractionsTotal) * 100}%` }}
                         />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm italic">No patients assigned to Elekta Compac.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Priority Attention</h2>
            <button 
              onClick={onNavigatePatients}
              className="text-sm font-medium text-teal-600 hover:text-teal-700"
            >
              View All RT Patients
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
                  onRefresh={onRefresh}
                />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Ward Statistics</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">RT Preparation Phase</span>
                  <span className="text-sm font-bold text-slate-900">
                    {patients.filter(p => p.radiationPlan && p.radiationPlan.workflow?.planApproval.status !== WorkflowStatus.APPROVED).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">On-Treatment (Active)</span>
                  <span className="text-sm font-bold text-slate-900">
                    {patients.filter(p => p.radiationPlan && p.radiationPlan.workflow?.planApproval.status === WorkflowStatus.APPROVED).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Chemo Cycles Active</span>
                  <span className="text-sm font-bold text-slate-900">
                    {patients.filter(p => p.chemoProtocol).length}
                  </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <AddPatientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={() => onRefresh && onRefresh()}
      />
    </div>
  );
};