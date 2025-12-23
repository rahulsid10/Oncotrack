import React, { useState } from 'react';
import { Patient, PatientStatus, ClinicalNote, WorkflowStatus } from '../types';
import { getPatientInsight } from '../services/geminiService';
import { updatePatient, deletePatient } from '../services/patientService';
import { 
  ArrowLeft, Brain, Zap, Pill, Activity, Calendar, 
  AlertTriangle, Stethoscope, Sparkles, Thermometer, LogOut, Trash2, Loader2, Edit, Microscope, ImageIcon, ClipboardList, Clock, CheckCircle2, Circle, ListChecks, Info
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { EditPatientModal } from './EditPatientModal';
import { AddNoteModal } from './AddNoteModal';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onPatientUpdated?: (updatedPatient: Patient) => void;
  onPatientDeleted?: (id: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-semibold text-slate-700 mb-2">{new Date(label).toLocaleDateString()}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 capitalize">{entry.name}:</span>
            <span className="font-medium text-slate-900">
              {entry.value}
              {entry.name.includes('Temp') ? '°C' : ''}
              {entry.name.includes('SpO2') ? '%' : ''}
              {entry.name.includes('BP') ? ' mmHg' : ''}
              {entry.name.includes('Rate') ? ' bpm' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onPatientUpdated, onPatientDeleted }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'treatment' | 'vitals' | 'notes'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [discharging, setDischarging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Note Modal State
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteType, setNoteType] = useState<'General' | 'Pathology' | 'Imaging'>('General');

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const result = await getPatientInsight(patient);
    setInsight(result);
    setLoadingInsight(false);
  };

  const handleEditSuccess = (updatedPatient: Patient) => {
      if (onPatientUpdated) {
          onPatientUpdated(updatedPatient);
      }
  };

  const handleAddNote = async (note: ClinicalNote) => {
    const updatedPatient = {
      ...patient,
      clinicalNotes: [note, ...(patient.clinicalNotes || [])]
    };
    
    const { success, error } = await updatePatient(updatedPatient);
    if (success && onPatientUpdated) {
      onPatientUpdated(updatedPatient);
      setActiveTab('notes');
    } else {
      console.error(error);
      alert("Failed to save note");
    }
  };

  const openNoteModal = (type: 'General' | 'Pathology' | 'Imaging') => {
    setNoteType(type);
    setIsNoteModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete the record for ${patient.name}? This action cannot be undone.`)) {
      setDeleting(true);
      const { success, error } = await deletePatient(patient.id);
      if (success) {
        if (onPatientDeleted) {
           onPatientDeleted(patient.id);
        } else {
           onBack();
        }
      } else {
        alert("Failed to delete patient: " + (error || "Unknown error"));
        setDeleting(false);
      }
    }
  };

  const handleDischarge = async () => {
      if (window.confirm(`Are you sure you want to discharge ${patient.name}? This will move the patient to the Discharge Log.`)) {
          setDischarging(true);
          const updated = { ...patient, status: PatientStatus.DISCHARGED };
          const { success } = await updatePatient(updated);
          
          if (success) {
              if (onPatientUpdated) onPatientUpdated(updated);
              onBack(); 
          } else {
              setDischarging(false);
              alert("Failed to discharge patient. Please try again.");
          }
      }
  };

  const rtProgress = patient.radiationPlan 
    ? Math.round((patient.radiationPlan.fractionsCompleted / patient.radiationPlan.fractionsTotal) * 100) 
    : 0;

  const chemoProgress = patient.chemoProtocol
    ? Math.round((patient.chemoProtocol.cycleCurrent / patient.chemoProtocol.cycleTotal) * 100)
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const getWorkflowIcon = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.APPROVED:
      case WorkflowStatus.COMPLETED:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case WorkflowStatus.IN_PROGRESS:
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="bg-white min-h-full">
      {/* Header */}
      <div className="border-b border-slate-200 sticky top-0 bg-white z-10">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 md:gap-4">
              <img 
                src={patient.imageUrl} 
                alt={patient.name} 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div className="overflow-hidden">
                <h1 className="text-lg md:text-xl font-bold text-slate-900 truncate">{patient.name}</h1>
                <p className="text-xs md:text-sm text-slate-500 truncate">{patient.mrn} • {patient.gender}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={handleDelete}
                disabled={deleting || discharging}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all"
                title="Delete Patient Record"
             >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
             </button>
             <button 
               onClick={handleDischarge}
               disabled={discharging}
               className="p-2 md:px-4 md:py-2 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-2 transition-colors"
               title="Discharge"
             >
               <LogOut className="w-5 h-5 md:w-4 md:h-4" />
               <span className="hidden md:inline">{discharging ? 'Discharging...' : 'Discharge'}</span>
             </button>
             <button 
               onClick={() => setIsEditModalOpen(true)}
               className="p-2 md:px-4 md:py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
               title="Edit Details"
             >
               <Edit className="w-5 h-5 md:hidden" />
               <span className="hidden md:inline">Edit Details</span>
             </button>
             <button 
               onClick={() => openNoteModal('General')}
               className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm transition-colors"
             >
               Add Clinical Note
             </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-4 md:px-8 flex gap-6 md:gap-8 overflow-x-auto no-scrollbar">
          {['overview', 'treatment', 'vitals', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab 
                  ? 'border-teal-600 text-teal-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {tab === 'notes' && (patient.clinicalNotes?.length || 0) > 0 && (
                 <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                   {patient.clinicalNotes?.length}
                 </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {activeTab === 'overview' && (
              <>
                {/* AI Insight Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-2 text-indigo-900">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h2 className="font-semibold text-lg">AI Clinical Insight</h2>
                    </div>
                    {!insight && (
                      <button 
                        onClick={handleGenerateInsight}
                        disabled={loadingInsight}
                        className="w-full sm:w-auto px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {loadingInsight ? (
                          <>Generating...</>
                        ) : (
                          <>Generate Analysis</>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {insight ? (
                    <div className="bg-white/80 rounded-xl p-4 border border-indigo-100/50 prose prose-sm prose-indigo max-w-none">
                      <ReactMarkdown>{insight}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-indigo-800/70 text-sm">
                      Click generate to analyze current vitals, treatment progress, and potential risks using Gemini 2.5.
                    </p>
                  )}
                </div>

                {/* Diagnosis Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-slate-500" />
                    Diagnosis & Admission
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Primary Diagnosis</p>
                      <p className="text-slate-900 font-medium mt-1">{patient.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stage</p>
                      <p className="text-slate-900 font-medium mt-1">{patient.stage}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Admission Date</p>
                      <p className="text-slate-900 font-medium mt-1">{patient.admissionDate}</p>
                    </div>
                     <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Room</p>
                      <p className="text-slate-900 font-medium mt-1">{patient.roomNumber}</p>
                    </div>
                  </div>
                </div>

                 {/* Allergies & Alerts */}
                 <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    Allergies & Alerts
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map(a => (
                      <span key={a} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-sm font-medium border border-rose-100">
                        {a}
                      </span>
                    ))}
                    {patient.status === 'Critical' && (
                       <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold border border-red-200">
                        CRITICAL CONDITION
                      </span>
                    )}
                    {patient.allergies.length === 0 && (
                      <span className="text-slate-500 text-sm italic">No known allergies</span>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'treatment' && (
              <>
                 {/* Radiation Section */}
                 {patient.radiationPlan ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-500" />
                          Radiation Therapy Details
                        </h3>
                        <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2 py-1 rounded-lg border border-amber-100">
                          {patient.radiationPlan.technique}
                        </span>
                      </div>

                      {/* RT Workflow Timeline */}
                      <div className="mb-8 overflow-x-auto pb-4">
                        <div className="min-w-[600px] relative flex justify-between">
                          <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-100 -z-10" />
                          {[
                            { label: 'CT Sim', key: 'ctSimulation' },
                            { label: 'Contouring', key: 'contouring' },
                            { label: 'Contour Appr.', key: 'contouringApproval' },
                            { label: 'Plan Appr.', key: 'planApproval' }
                          ].map((step, idx) => {
                            const stepData = patient.radiationPlan?.workflow?.[step.key as keyof typeof patient.radiationPlan.workflow];
                            const status = stepData?.status || WorkflowStatus.PENDING;
                            return (
                              <div key={step.key} className="flex flex-col items-center px-2">
                                <div className={`w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center mb-2 shadow-sm
                                  ${status === WorkflowStatus.APPROVED || status === WorkflowStatus.COMPLETED ? 'border-emerald-500' : 
                                    status === WorkflowStatus.IN_PROGRESS ? 'border-blue-500' : 'border-slate-200'}
                                `}>
                                  {getWorkflowIcon(status)}
                                </div>
                                <span className="text-xs font-bold text-slate-900 whitespace-nowrap">{step.label}</span>
                                <span className={`text-[10px] mt-0.5 font-medium
                                  ${status === WorkflowStatus.APPROVED || status === WorkflowStatus.COMPLETED ? 'text-emerald-600' : 
                                    status === WorkflowStatus.IN_PROGRESS ? 'text-blue-600' : 'text-slate-400'}
                                `}>{status}</span>
                                {stepData?.staff && <span className="text-[9px] text-slate-400 mt-0.5">{stepData.staff}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-slate-700">Course Progress</span>
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-900">{rtProgress}%</span>
                             <span className="text-slate-500 text-xs">({patient.radiationPlan.fractionsCompleted}/{patient.radiationPlan.fractionsTotal} Fx)</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${rtProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-slate-500 text-xs">Target Site</p>
                          <p className="font-semibold text-slate-800">{patient.radiationPlan.targetSite}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-slate-500 text-xs">Total Dose</p>
                          <p className="font-semibold text-slate-800">{patient.radiationPlan.totalDoseGy} Gy</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-slate-500 text-xs">Fractionation</p>
                          <p className="font-semibold text-slate-800">{(patient.radiationPlan.totalDoseGy / patient.radiationPlan.fractionsTotal).toFixed(2)} Gy / Fx</p>
                        </div>
                      </div>
                    </div>

                    {/* Daily Fraction Log */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                          <ListChecks className="w-5 h-5 text-slate-500" />
                          Daily Treatment Log
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                           <Info className="w-3.5 h-3.5" />
                           <span>Last verified by physics on {patient.radiationPlan.lastFractionDate}</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                         <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                             <tr>
                               <th className="px-4 py-3 font-medium">Fx</th>
                               <th className="px-4 py-3 font-medium">Date</th>
                               <th className="px-4 py-3 font-medium">Status</th>
                               <th className="px-4 py-3 font-medium">Physics Check</th>
                               <th className="px-4 py-3 font-medium">Skin/Toxicities</th>
                               <th className="px-4 py-3 font-medium">Notes</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {patient.radiationPlan.dailyLog && patient.radiationPlan.dailyLog.length > 0 ? (
                               patient.radiationPlan.dailyLog.map((entry, i) => (
                                 <tr key={i} className="hover:bg-slate-50 transition-colors">
                                   <td className="px-4 py-3 font-bold text-slate-900">{entry.fractionNumber}</td>
                                   <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{entry.date}</td>
                                   <td className="px-4 py-3">
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px] border border-emerald-100">
                                        <CheckCircle2 className="w-3 h-3" /> Delivered
                                      </span>
                                   </td>
                                   <td className="px-4 py-3">
                                      {entry.physicistCheck ? (
                                        <span className="text-teal-600 font-bold text-xs flex items-center gap-1">Verified</span>
                                      ) : (
                                        <span className="text-amber-500 font-bold text-xs">Pending</span>
                                      )}
                                   </td>
                                   <td className="px-4 py-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${entry.skinReaction === 'None' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'}`}>
                                        {entry.skinReaction || 'N/A'}
                                      </span>
                                   </td>
                                   <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{entry.notes || '-'}</td>
                                 </tr>
                               ))
                             ) : (
                               <tr>
                                 <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No fractions recorded in daily log yet.</td>
                               </tr>
                             )}
                           </tbody>
                         </table>
                      </div>
                    </div>
                  </div>
                 ) : (
                   <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                     <p className="text-slate-500">No active Radiation Therapy plan.</p>
                     <button onClick={() => setIsEditModalOpen(true)} className="mt-2 text-teal-600 hover:underline text-sm font-medium">Add Radiation Plan</button>
                   </div>
                 )}

                 {/* Chemo Section */}
                 {patient.chemoProtocol ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-indigo-500" />
                        Chemotherapy Protocol
                      </h3>
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-lg border border-indigo-100">
                        Cycle {patient.chemoProtocol.cycleCurrent} of {patient.chemoProtocol.cycleTotal}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700">Regimen Progress</span>
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-slate-900">{chemoProgress}%</span>
                           <span className="text-slate-500 text-xs">({patient.chemoProtocol.cycleCurrent}/{patient.chemoProtocol.cycleTotal} Cycles)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${chemoProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                       <h4 className="text-sm font-medium text-slate-700 mb-3">Protocol: {patient.chemoProtocol.protocolName}</h4>
                       <div className="overflow-x-auto rounded-xl border border-slate-200">
                         <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-slate-500">
                             <tr>
                               <th className="px-4 py-3 font-medium whitespace-nowrap">Drug</th>
                               <th className="px-4 py-3 font-medium whitespace-nowrap">Dosage</th>
                               <th className="px-4 py-3 font-medium whitespace-nowrap">Route</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {patient.chemoProtocol.drugs.map((drug, i) => (
                               <tr key={i} className="bg-white">
                                 <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{drug.name}</td>
                                 <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{drug.dosage}</td>
                                 <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{drug.route}</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                       <Calendar className="w-4 h-4" />
                       <span>Next planned cycle start: <span className="font-semibold text-slate-700">{patient.chemoProtocol.nextCycleDate}</span></span>
                    </div>
                  </div>
                 ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No active Chemotherapy protocol.</p>
                     <button onClick={() => setIsEditModalOpen(true)} className="mt-2 text-teal-600 hover:underline text-sm font-medium">Add Chemo Protocol</button>
                  </div>
                 )}
              </>
            )}

            {activeTab === 'vitals' && (
              <div className="space-y-8">
                {/* Chart 1: Hemodynamics */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                   <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-rose-500" />
                      Hemodynamics (BP & Heart Rate)
                   </h3>
                   <div className="h-72 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={patient.vitalsHistory} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={formatDate}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Line 
                            type="monotone" 
                            dataKey="systolic" 
                            name="Systolic BP" 
                            stroke="#0f766e" 
                            strokeWidth={2} 
                            dot={{ fill: '#0f766e', r: 4 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="diastolic" 
                            name="Diastolic BP" 
                            stroke="#2dd4bf" 
                            strokeWidth={2} 
                            dot={{ fill: '#2dd4bf', r: 4 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="heartRate" 
                            name="Heart Rate" 
                            stroke="#f43f5e" 
                            strokeWidth={2} 
                            dot={{ fill: '#f43f5e', r: 4 }} 
                          />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                {/* Chart 2: Clinical Status (Temp & SpO2) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                   <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                      <Thermometer className="w-5 h-5 text-amber-500" />
                      Clinical Status (Temp & SpO2)
                   </h3>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={patient.vitalsHistory} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={formatDate}
                          />
                          <YAxis 
                            yAxisId="left" 
                            domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                            stroke="#f59e0b" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            unit="°C"
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            domain={[85, 100]} 
                            stroke="#3b82f6" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            unit="%"
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="temp" 
                            name="Temperature" 
                            stroke="#f59e0b" 
                            strokeWidth={2} 
                            dot={{ fill: '#f59e0b', r: 4 }} 
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="spo2" 
                            name="SpO2" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            dot={{ fill: '#3b82f6', r: 4 }} 
                          />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                     <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg Temp</p>
                     <p className="text-xl font-bold text-amber-600 mt-1">
                       {(patient.vitalsHistory.reduce((acc, curr) => acc + curr.temp, 0) / patient.vitalsHistory.length).toFixed(1)}°C
                     </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                     <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg SpO2</p>
                     <p className="text-xl font-bold text-blue-600 mt-1">
                       {Math.round(patient.vitalsHistory.reduce((acc, curr) => acc + curr.spo2, 0) / patient.vitalsHistory.length)}%
                     </p>
                  </div>
                   <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                     <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Avg HR</p>
                     <p className="text-xl font-bold text-rose-600 mt-1">
                       {Math.round(patient.vitalsHistory.reduce((acc, curr) => acc + curr.heartRate, 0) / patient.vitalsHistory.length)} <span className="text-xs font-medium">bpm</span>
                     </p>
                  </div>
                   <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                     <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Data Points</p>
                     <p className="text-xl font-bold text-slate-700 mt-1">
                       {patient.vitalsHistory.length}
                     </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-slate-500" />
                    Notes & Requisitions
                  </h3>
                  <button 
                     onClick={() => openNoteModal('General')}
                     className="md:hidden text-sm text-teal-600 font-medium"
                  >
                    + Add Note
                  </button>
                </div>

                {(!patient.clinicalNotes || patient.clinicalNotes.length === 0) ? (
                   <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                     <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                     <p className="text-slate-500">No clinical notes or orders yet.</p>
                     <p className="text-sm text-slate-400 mt-1">Use the Quick Actions panel or Add button to create one.</p>
                   </div>
                ) : (
                  <div className="space-y-4">
                    {patient.clinicalNotes.map((note) => (
                      <div 
                        key={note.id} 
                        className={`p-5 rounded-xl border relative overflow-hidden transition-all
                          ${note.type === 'Pathology' 
                            ? 'bg-amber-50 border-amber-200 hover:border-amber-300' 
                            : note.type === 'Imaging' 
                            ? 'bg-blue-50 border-blue-200 hover:border-blue-300' 
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}
                        `}
                      >
                         {(note.type === 'Pathology' || note.type === 'Imaging') && (
                            <div className={`absolute top-0 left-0 bottom-0 w-1 ${note.type === 'Pathology' ? 'bg-amber-400' : 'bg-blue-400'}`} />
                         )}

                         <div className="flex justify-between items-start mb-3 pl-2">
                           <div className="flex items-center gap-2">
                              {note.type === 'Pathology' && <Microscope className="w-4 h-4 text-amber-600" />}
                              {note.type === 'Imaging' && <ImageIcon className="w-4 h-4 text-blue-600" />}
                              {note.type === 'General' && <ClipboardList className="w-4 h-4 text-slate-400" />}
                              
                              <span className={`text-sm font-semibold
                                ${note.type === 'Pathology' ? 'text-amber-800' : note.type === 'Imaging' ? 'text-blue-800' : 'text-slate-700'}
                              `}>
                                {note.type === 'General' ? 'Clinical Note' : note.type === 'Pathology' ? 'Lab Investigation Order' : 'Imaging Requisition'}
                              </span>
                           </div>
                           <div className="flex items-center gap-1.5 text-xs text-slate-400">
                             <Clock className="w-3 h-3" />
                             <span>{new Date(note.date).toLocaleString()}</span>
                           </div>
                         </div>
                         
                         <div className={`pl-2 text-sm leading-relaxed whitespace-pre-wrap ${note.type !== 'General' ? 'font-medium' : ''} text-slate-700`}>
                           {note.content}
                         </div>

                         <div className="mt-4 pl-2 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">{note.author}</span>
                            {(note.type === 'Pathology' || note.type === 'Imaging') && (
                               <span className={`text-xs px-2 py-0.5 rounded border 
                                  ${note.type === 'Pathology' ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-blue-100 border-blue-200 text-blue-700'}
                               `}>
                                 Alert: Requisition Active
                               </span>
                            )}
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-500" />
                Care Team
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                    {patient.attendingPhysician.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{patient.attendingPhysician}</p>
                    <p className="text-xs text-slate-500">Oncologist</p>
                  </div>
                </div>
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                    NS
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Nurse Station A</p>
                    <p className="text-xs text-slate-500">Primary Nursing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => openNoteModal('Pathology')}
                  className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between group"
                >
                  <span>Schedule Lab Work</span>
                  <Microscope className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                </button>
                 <button 
                   onClick={() => openNoteModal('Imaging')}
                   className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left flex items-center justify-between group"
                 >
                  <span>Request Imaging</span>
                  <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </button>
                 <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left"
                 >
                  Log Vital Signs
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <EditPatientModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        patient={patient}
        onSuccess={handleEditSuccess}
      />

      <AddNoteModal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        onSave={handleAddNote}
        initialType={noteType}
      />
    </div>
  );
}