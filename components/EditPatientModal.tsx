import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Pill, Zap, Activity, Plus, Trash2, CheckCircle2, Circle, User, StickyNote, Calendar } from 'lucide-react';
import { Patient, PatientStatus, ChemoDrug, WorkflowStatus, RTWorkflow, RTIntent } from '../types';
import { updatePatient } from '../services/patientService';

interface EditPatientModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPatient: Patient) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({ patient, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'radiation' | 'chemo'>('general');

  // State initialization
  const [formData, setFormData] = useState<Patient>(patient);
  const [hasRadiation, setHasRadiation] = useState(!!patient.radiationPlan);
  const [hasChemo, setHasChemo] = useState(!!patient.chemoProtocol);
  
  useEffect(() => {
    if (isOpen) {
        setFormData(JSON.parse(JSON.stringify(patient))); 
        setHasRadiation(!!patient.radiationPlan);
        setHasChemo(!!patient.chemoProtocol);
        setError(null);
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (
    section: 'radiationPlan' | 'chemoProtocol', 
    field: string, 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      } as any
    }));
  };

  const handleWorkflowChange = (stepKey: keyof RTWorkflow, field: string, value: any) => {
    setFormData(prev => {
      const currentWorkflow = prev.radiationPlan?.workflow || {
        ctSimulation: { status: WorkflowStatus.PENDING },
        contouring: { status: WorkflowStatus.PENDING },
        contouringApproval: { status: WorkflowStatus.PENDING },
        planApproval: { status: WorkflowStatus.PENDING }
      };

      return {
        ...prev,
        radiationPlan: {
          ...prev.radiationPlan!,
          workflow: {
            ...currentWorkflow,
            [stepKey]: {
              ...currentWorkflow[stepKey],
              [field]: value
            }
          }
        }
      };
    });
  };

  const addFraction = () => {
    const nextNum = (formData.radiationPlan?.dailyLog?.length || 0) + 1;
    const newEntry = {
      fractionNumber: nextNum,
      date: new Date().toISOString().split('T')[0],
      delivered: true,
      physicistCheck: false,
      skinReaction: 'None' as const
    };

    setFormData(prev => ({
      ...prev,
      radiationPlan: {
        ...prev.radiationPlan!,
        fractionsCompleted: (prev.radiationPlan?.fractionsCompleted || 0) + 1,
        lastFractionDate: newEntry.date,
        dailyLog: [...(prev.radiationPlan?.dailyLog || []), newEntry]
      }
    }));
  };

  const addDrug = () => {
      const newDrug: ChemoDrug = { name: '', dosage: '', route: 'IV' };
      setFormData(prev => ({
          ...prev,
          chemoProtocol: {
              ...prev.chemoProtocol!,
              drugs: [...(prev.chemoProtocol?.drugs || []), newDrug]
          }
      }));
  };

  const removeDrug = (index: number) => {
    setFormData(prev => ({
        ...prev,
        chemoProtocol: {
            ...prev.chemoProtocol!,
            drugs: prev.chemoProtocol!.drugs.filter((_, i) => i !== index)
        }
    }));
  };

  const updateDrug = (index: number, field: keyof ChemoDrug, value: string) => {
    setFormData(prev => {
        const newDrugs = [...prev.chemoProtocol!.drugs];
        newDrugs[index] = { ...newDrugs[index], [field]: value };
        return {
            ...prev,
            chemoProtocol: {
                ...prev.chemoProtocol!,
                drugs: newDrugs
            }
        };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalPatient = { ...formData };

    if (hasRadiation) {
        if (!finalPatient.radiationPlan) {
            finalPatient.radiationPlan = {
                id: Math.random().toString(36).substr(2, 9),
                targetSite: '',
                technique: 'VMAT',
                machine: 'Versa HD',
                totalDoseGy: 0,
                fractionsTotal: 0,
                fractionsCompleted: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: 'TBD',
                workflow: {
                  ctSimulation: { status: WorkflowStatus.PENDING },
                  contouring: { status: WorkflowStatus.PENDING },
                  contouringApproval: { status: WorkflowStatus.PENDING },
                  planApproval: { status: WorkflowStatus.PENDING }
                },
                dailyLog: []
            };
        } else {
           finalPatient.radiationPlan.totalDoseGy = Number(finalPatient.radiationPlan.totalDoseGy);
           finalPatient.radiationPlan.fractionsTotal = Number(finalPatient.radiationPlan.fractionsTotal);
           finalPatient.radiationPlan.fractionsCompleted = Number(finalPatient.radiationPlan.fractionsCompleted);
        }
    } else {
        finalPatient.radiationPlan = undefined;
    }

    if (hasChemo) {
        if (!finalPatient.chemoProtocol) {
            finalPatient.chemoProtocol = {
                id: Math.random().toString(36).substr(2, 9),
                protocolName: '',
                cycleCurrent: 1,
                cycleTotal: 4,
                cycleFrequencyDays: 21,
                nextCycleDate: new Date().toISOString().split('T')[0],
                drugs: [],
                notes: ''
            };
        } else {
            finalPatient.chemoProtocol.cycleCurrent = Number(finalPatient.chemoProtocol.cycleCurrent);
            finalPatient.chemoProtocol.cycleTotal = Number(finalPatient.chemoProtocol.cycleTotal);
            finalPatient.chemoProtocol.cycleFrequencyDays = Number(finalPatient.chemoProtocol.cycleFrequencyDays);
        }
    } else {
        finalPatient.chemoProtocol = undefined;
    }

    const { success, error: apiError } = await updatePatient(finalPatient);

    if (success) {
      onSuccess(finalPatient);
      onClose();
    } else {
      setError(apiError || "Failed to update patient");
    }
    setLoading(false);
  };

  const toggleRadiation = (enabled: boolean) => {
      setHasRadiation(enabled);
      if (enabled && !formData.radiationPlan) {
          setFormData(prev => ({
              ...prev,
              radiationPlan: {
                  id: 'temp',
                  targetSite: '',
                  technique: 'VMAT',
                  machine: 'Versa HD',
                  totalDoseGy: 0,
                  fractionsTotal: 0,
                  fractionsCompleted: 0,
                  startDate: '',
                  endDate: '',
                  workflow: {
                    ctSimulation: { status: WorkflowStatus.PENDING },
                    contouring: { status: WorkflowStatus.PENDING },
                    contouringApproval: { status: WorkflowStatus.PENDING },
                    planApproval: { status: WorkflowStatus.PENDING }
                  },
                  dailyLog: []
              }
          }));
      }
  };

  const toggleChemo = (enabled: boolean) => {
      setHasChemo(enabled);
      if (enabled && !formData.chemoProtocol) {
          setFormData(prev => ({
              ...prev,
              chemoProtocol: {
                  id: 'temp',
                  protocolName: '',
                  cycleCurrent: 1,
                  cycleTotal: 1,
                  cycleFrequencyDays: 21,
                  nextCycleDate: '',
                  drugs: []
              }
          }));
      }
  };

  const tabClass = (tab: typeof activeTab) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Edit Patient Details</h2>
             <p className="text-sm text-slate-500">{formData.name} (MRN: {formData.mrn})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
            <button type="button" onClick={() => setActiveTab('general')} className={tabClass('general')}>General Info</button>
            <button type="button" onClick={() => setActiveTab('radiation')} className={tabClass('radiation')}>Radiation Details</button>
            <button type="button" onClick={() => setActiveTab('chemo')} className={tabClass('chemo')}>Chemotherapy</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                    <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RT Intent</label>
                    <select name="intent" value={formData.intent} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500">
                      <option value={RTIntent.RADICAL}>Radical</option>
                      <option value={RTIntent.ADJUVANT}>Adjuvant</option>
                      <option value={RTIntent.PALLIATIVE}>Palliative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
                    <input name="stage" value={formData.stage} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                    <input name="roomNumber" value={formData.roomNumber} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500">
                        {Object.values(PatientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Attending Physician</label>
                    <input name="attendingPhysician" value={formData.attendingPhysician} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Admission Date</label>
                    <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Allergies (comma separated)</label>
                    <input 
                        name="allergies" 
                        value={formData.allergies.join(', ')} 
                        onChange={(e) => setFormData({...formData, allergies: e.target.value.split(',').map(s => s.trim())})} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" 
                    />
                 </div>
            </div>
          )}

          {activeTab === 'radiation' && (
            <div className="space-y-8">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-slate-900">Enable Radiation Workflow</span>
                    <label className="relative inline-flex items-center cursor-pointer ml-auto">
                        <input type="checkbox" checked={hasRadiation} onChange={(e) => toggleRadiation(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                </div>

                {hasRadiation && formData.radiationPlan && (
                    <>
                      {/* Prescriptive Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Target Site</label>
                              <input 
                                  value={formData.radiationPlan.targetSite} 
                                  onChange={(e) => handleNestedChange('radiationPlan', 'targetSite', e.target.value)} 
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" 
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Machine</label>
                              <select 
                                  value={formData.radiationPlan.machine || 'Versa HD'} 
                                  onChange={(e) => handleNestedChange('radiationPlan', 'machine', e.target.value)} 
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" 
                              >
                                  <option value="Versa HD">Versa HD</option>
                                  <option value="Elekta Compac">Elekta Compac</option>
                                  <option value="Other">Other</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Total Dose (Gy)</label>
                              <input 
                                  type="number"
                                  value={formData.radiationPlan.totalDoseGy} 
                                  onChange={(e) => handleNestedChange('radiationPlan', 'totalDoseGy', e.target.value)} 
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" 
                              />
                          </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Fractions Total</label>
                              <input 
                                  type="number"
                                  value={formData.radiationPlan.fractionsTotal} 
                                  onChange={(e) => handleNestedChange('radiationPlan', 'fractionsTotal', e.target.value)} 
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" 
                              />
                          </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Fractions Completed</label>
                              <input 
                                  type="number"
                                  value={formData.radiationPlan.fractionsCompleted} 
                                  onChange={(e) => handleNestedChange('radiationPlan', 'fractionsCompleted', e.target.value)} 
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" 
                              />
                          </div>
                      </div>

                      {/* Workflow Editing */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                           <Activity className="w-4 h-4 text-teal-600" />
                           Treatment Preparation Workflow
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { label: 'CT Simulation', key: 'ctSimulation' },
                            { label: 'Contouring', key: 'contouring' },
                            { label: 'Contouring Approval', key: 'contouringApproval' },
                            { label: 'Plan Approval', key: 'planApproval' }
                          ].map((step) => {
                            const stepData = formData.radiationPlan?.workflow?.[step.key as keyof RTWorkflow] || { status: WorkflowStatus.PENDING };
                            return (
                              <div key={step.key} className="p-5 border border-slate-200 rounded-2xl space-y-4 bg-white shadow-sm transition-all hover:border-teal-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{step.label}</span>
                                  <select 
                                    value={stepData.status} 
                                    onChange={(e) => handleWorkflowChange(step.key as keyof RTWorkflow, 'status', e.target.value)}
                                    className={`text-xs font-bold border rounded-lg px-3 py-1.5 outline-none transition-all ${
                                      stepData.status === WorkflowStatus.APPROVED || stepData.status === WorkflowStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      stepData.status === WorkflowStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500'
                                    }`}
                                  >
                                    {Object.values(WorkflowStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                     <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                     <input 
                                        type="date"
                                        value={stepData.date || ''}
                                        onChange={(e) => handleWorkflowChange(step.key as keyof RTWorkflow, 'date', e.target.value)}
                                        className="text-xs border border-slate-200 rounded-lg px-3 py-2 w-full outline-none focus:ring-1 focus:ring-teal-500"
                                      />
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <User className="w-3.5 h-3.5 text-slate-400" />
                                     <input 
                                        placeholder="Staff/Physician Name"
                                        value={stepData.staff || ''}
                                        onChange={(e) => handleWorkflowChange(step.key as keyof RTWorkflow, 'staff', e.target.value)}
                                        className="text-xs border border-slate-200 rounded-lg px-3 py-2 w-full outline-none focus:ring-1 focus:ring-teal-500"
                                      />
                                  </div>
                                  <div className="flex items-start gap-2">
                                     <StickyNote className="w-3.5 h-3.5 text-slate-400 mt-2" />
                                     <textarea 
                                        placeholder="Add clinical/planning notes..."
                                        value={stepData.notes || ''}
                                        onChange={(e) => handleWorkflowChange(step.key as keyof RTWorkflow, 'notes', e.target.value)}
                                        className="text-xs border border-slate-200 rounded-lg px-3 py-2 w-full min-h-[60px] resize-none outline-none focus:ring-1 focus:ring-teal-500"
                                      />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fraction Entry Fast Actions */}
                      <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100 flex items-center justify-between shadow-sm">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                             <CheckCircle2 className="w-6 h-6" />
                           </div>
                           <div>
                             <p className="text-sm font-bold text-teal-900 uppercase tracking-tight">Record Treatment Session</p>
                             <p className="text-xs text-teal-600">Instantly log today's delivered fraction for tracking.</p>
                           </div>
                         </div>
                         <button 
                           type="button" 
                           onClick={addFraction}
                           className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-all hover:scale-105 active:scale-95"
                         >
                           Deliver Fraction #{ (formData.radiationPlan?.dailyLog?.length || 0) + 1 }
                         </button>
                      </div>
                    </>
                )}
            </div>
          )}

          {activeTab === 'chemo' && (
             <div className="space-y-6">
                 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Pill className="w-5 h-5 text-indigo-500" />
                    <span className="font-semibold text-slate-900">Include Chemotherapy Protocol</span>
                    <label className="relative inline-flex items-center cursor-pointer ml-auto">
                        <input type="checkbox" checked={hasChemo} onChange={(e) => toggleChemo(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                </div>

                {hasChemo && formData.chemoProtocol && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Protocol Name</label>
                                <input 
                                    value={formData.chemoProtocol.protocolName} 
                                    onChange={(e) => handleNestedChange('chemoProtocol', 'protocolName', e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                                    placeholder="e.g. AC-T, FOLFOX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Cycle</label>
                                <input 
                                    type="number"
                                    value={formData.chemoProtocol.cycleCurrent} 
                                    onChange={(e) => handleNestedChange('chemoProtocol', 'cycleCurrent', e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Cycles</label>
                                <input 
                                    type="number"
                                    value={formData.chemoProtocol.cycleTotal} 
                                    onChange={(e) => handleNestedChange('chemoProtocol', 'cycleTotal', e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Cycle Frequency (Days)</label>
                                <input 
                                    type="number"
                                    value={formData.chemoProtocol.cycleFrequencyDays} 
                                    onChange={(e) => handleNestedChange('chemoProtocol', 'cycleFrequencyDays', e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Next Cycle Date</label>
                                <input 
                                    type="date"
                                    value={formData.chemoProtocol.nextCycleDate} 
                                    onChange={(e) => handleNestedChange('chemoProtocol', 'nextCycleDate', e.target.value)} 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                                />
                            </div>
                         </div>

                         <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                             <div className="flex justify-between items-center mb-3">
                                 <h4 className="text-sm font-bold text-indigo-900">Protocol Drugs</h4>
                                 <button type="button" onClick={addDrug} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 flex items-center gap-1">
                                     <Plus className="w-3 h-3" /> Add Drug
                                 </button>
                             </div>
                             
                             <div className="space-y-3">
                                 {formData.chemoProtocol.drugs.length === 0 && <p className="text-sm text-indigo-400 italic">No drugs added yet.</p>}
                                 {formData.chemoProtocol.drugs.map((drug, idx) => (
                                     <div key={idx} className="flex gap-2 items-start">
                                         <input 
                                            placeholder="Drug Name"
                                            value={drug.name}
                                            onChange={(e) => updateDrug(idx, 'name', e.target.value)}
                                            className="flex-1 px-2 py-1.5 text-sm border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                                         />
                                          <input 
                                            placeholder="Dosage"
                                            value={drug.dosage}
                                            onChange={(e) => updateDrug(idx, 'dosage', e.target.value)}
                                            className="w-24 px-2 py-1.5 text-sm border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                                         />
                                          <input 
                                            placeholder="Route"
                                            value={drug.route}
                                            onChange={(e) => updateDrug(idx, 'route', e.target.value)}
                                            className="w-20 px-2 py-1.5 text-sm border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                                         />
                                         <button type="button" onClick={() => removeDrug(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                )}
             </div>
          )}
        </form>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};