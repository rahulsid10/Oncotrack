import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Pill, Zap, Activity, Plus, Trash2 } from 'lucide-react';
import { Patient, PatientStatus, ChemoDrug } from '../types';
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
  
  // Initialize or Reset form when patient changes or modal opens
  useEffect(() => {
    if (isOpen) {
        setFormData(JSON.parse(JSON.stringify(patient))); // Deep copy to avoid mutating prop
        setHasRadiation(!!patient.radiationPlan);
        setHasChemo(!!patient.chemoProtocol);
        setError(null);
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  // Generic Change Handler for top-level fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generic Change Handler for nested objects (Radiation/Chemo)
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

  // Chemo Drug Management
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

    // Prepare final object
    const finalPatient = { ...formData };

    // Handle Radiation Logic
    if (hasRadiation) {
        if (!finalPatient.radiationPlan) {
            // Initialize if it was null
            finalPatient.radiationPlan = {
                id: Math.random().toString(36).substr(2, 9),
                targetSite: '',
                technique: '3D-CRT',
                totalDoseGy: 0,
                fractionsTotal: 0,
                fractionsCompleted: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: 'TBD'
            };
        } else {
           // Ensure numbers are numbers
           finalPatient.radiationPlan.totalDoseGy = Number(finalPatient.radiationPlan.totalDoseGy);
           finalPatient.radiationPlan.fractionsTotal = Number(finalPatient.radiationPlan.fractionsTotal);
           finalPatient.radiationPlan.fractionsCompleted = Number(finalPatient.radiationPlan.fractionsCompleted);
        }
    } else {
        finalPatient.radiationPlan = undefined;
    }

    // Handle Chemo Logic
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

  // Toggle helpers that initialize default empty state objects if needed for valid controlled inputs
  const toggleRadiation = (enabled: boolean) => {
      setHasRadiation(enabled);
      if (enabled && !formData.radiationPlan) {
          setFormData(prev => ({
              ...prev,
              radiationPlan: {
                  id: 'temp',
                  targetSite: '',
                  technique: '3D-CRT',
                  totalDoseGy: 0,
                  fractionsTotal: 0,
                  fractionsCompleted: 0,
                  startDate: '',
                  endDate: ''
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
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Edit Patient Details</h2>
             <p className="text-sm text-slate-500">{formData.name} (MRN: {formData.mrn})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-slate-100 flex gap-2">
            <button type="button" onClick={() => setActiveTab('general')} className={tabClass('general')}>General Info</button>
            <button type="button" onClick={() => setActiveTab('radiation')} className={tabClass('radiation')}>Radiation Plan</button>
            <button type="button" onClick={() => setActiveTab('chemo')} className={tabClass('chemo')}>Chemotherapy</button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                    <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
                    <input name="stage" value={formData.stage} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
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

          {/* RADIATION TAB */}
          {activeTab === 'radiation' && (
            <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-slate-900">Include Radiation Plan</span>
                    <label className="relative inline-flex items-center cursor-pointer ml-auto">
                        <input type="checkbox" checked={hasRadiation} onChange={(e) => toggleRadiation(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                </div>

                {hasRadiation && formData.radiationPlan && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Site</label>
                            <input 
                                value={formData.radiationPlan.targetSite} 
                                onChange={(e) => handleNestedChange('radiationPlan', 'targetSite', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Technique</label>
                            <select 
                                value={formData.radiationPlan.technique} 
                                onChange={(e) => handleNestedChange('radiationPlan', 'technique', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="3D-CRT">3D-CRT</option>
                                <option value="IMRT">IMRT</option>
                                <option value="VMAT">VMAT</option>
                                <option value="SBRT">SBRT</option>
                                <option value="Proton">Proton Therapy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Dose (Gy)</label>
                            <input 
                                type="number"
                                value={formData.radiationPlan.totalDoseGy} 
                                onChange={(e) => handleNestedChange('radiationPlan', 'totalDoseGy', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fractions Total</label>
                            <input 
                                type="number"
                                value={formData.radiationPlan.fractionsTotal} 
                                onChange={(e) => handleNestedChange('radiationPlan', 'fractionsTotal', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fractions Completed</label>
                            <input 
                                type="number"
                                value={formData.radiationPlan.fractionsCompleted} 
                                onChange={(e) => handleNestedChange('radiationPlan', 'fractionsCompleted', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                            <input 
                                type="date"
                                value={formData.radiationPlan.startDate} 
                                onChange={(e) => handleNestedChange('radiationPlan', 'startDate', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500" 
                            />
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* CHEMO TAB */}
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

                         {/* Drugs List */}
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

        {/* Footer */}
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