import React, { useState } from 'react';
/* Added AlertCircle to imports from lucide-react */
import { X, Save, Loader2, UserPlus, Zap, Pill, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Patient, PatientStatus, ChemoDrug, WorkflowStatus, RTIntent } from '../types';
import { createPatient } from '../services/patientService';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeRadiation, setIncludeRadiation] = useState(false);
  const [includeChemo, setIncludeChemo] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    mrn: '',
    age: '',
    gender: 'Male',
    diagnosis: '',
    stage: '',
    roomNumber: '',
    attendingPhysician: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: PatientStatus.STABLE,
    intent: RTIntent.RADICAL,
    allergies: '',
    // Radiation Fields
    radTargetSite: '',
    radTechnique: 'VMAT',
    radMachine: 'Versa HD',
    radTotalDose: '',
    radFractions: '',
    radStartDate: new Date().toISOString().split('T')[0],
    // Chemo Fields
    chemoProtocolName: '',
    chemoTotalCycles: '4',
    chemoFrequency: '21',
    chemoNextDate: new Date().toISOString().split('T')[0],
  });

  const [chemoDrugs, setChemoDrugs] = useState<ChemoDrug[]>([]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addDrug = () => {
    setChemoDrugs([...chemoDrugs, { name: '', dosage: '', route: 'IV' }]);
  };

  const removeDrug = (index: number) => {
    setChemoDrugs(chemoDrugs.filter((_, i) => i !== index));
  };

  const updateDrug = (index: number, field: keyof ChemoDrug, value: string) => {
    const newDrugs = [...chemoDrugs];
    newDrugs[index] = { ...newDrugs[index], [field]: value };
    setChemoDrugs(newDrugs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.mrn || !formData.diagnosis) {
      setError("Please fill in all required fields marked with *");
      setLoading(false);
      return;
    }

    if (includeRadiation && (!formData.radTargetSite || !formData.radTotalDose || !formData.radFractions)) {
      setError("Please fill in all Radiation Plan details.");
      setLoading(false);
      return;
    }

    if (includeChemo && (!formData.chemoProtocolName || chemoDrugs.length === 0)) {
      setError("Please fill in Chemo Protocol name and add at least one drug.");
      setLoading(false);
      return;
    }

    const radiationPlan = includeRadiation ? {
      id: Math.random().toString(36).substr(2, 9),
      targetSite: formData.radTargetSite,
      technique: formData.radTechnique,
      machine: formData.radMachine as any,
      totalDoseGy: parseFloat(formData.radTotalDose) || 0,
      fractionsTotal: parseInt(formData.radFractions) || 0,
      fractionsCompleted: 0,
      startDate: formData.radStartDate,
      endDate: 'TBD',
      workflow: {
        ctSimulation: { status: WorkflowStatus.PENDING },
        contouring: { status: WorkflowStatus.PENDING },
        contouringApproval: { status: WorkflowStatus.PENDING },
        planApproval: { status: WorkflowStatus.PENDING }
      },
      dailyLog: []
    } : undefined;

    const chemoProtocol = includeChemo ? {
      id: Math.random().toString(36).substr(2, 9),
      protocolName: formData.chemoProtocolName,
      cycleCurrent: 1,
      cycleTotal: parseInt(formData.chemoTotalCycles) || 1,
      cycleFrequencyDays: parseInt(formData.chemoFrequency) || 21,
      nextCycleDate: formData.chemoNextDate,
      drugs: chemoDrugs,
    } : undefined;

    const newPatient: Omit<Patient, 'id'> = {
      name: formData.name,
      mrn: formData.mrn,
      age: parseInt(formData.age) || 0,
      gender: formData.gender as 'Male' | 'Female' | 'Other',
      diagnosis: formData.diagnosis,
      stage: formData.stage,
      roomNumber: formData.roomNumber,
      attendingPhysician: formData.attendingPhysician,
      admissionDate: formData.admissionDate,
      status: formData.status,
      intent: formData.intent,
      allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
      vitalsHistory: [],
      imageUrl: '',
      radiationPlan,
      chemoProtocol,
      clinicalNotes: [],
    };

    const { success, error: apiError } = await createPatient(newPatient);

    if (success) {
      onSuccess();
      onClose();
    } else {
      setError(apiError || "Failed to create patient");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Admit New Patient</h2>
              <p className="text-sm text-slate-500">Record patient intake data</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Section: Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Identification</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">MRN *</label>
                  <input name="mrn" value={formData.mrn} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" required />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Clinical Context</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis *</label>
                  <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" required />
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Allergies</label>
                  <input name="allergies" value={formData.allergies} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" placeholder="Comma separated" />
                </div>
              </div>
            </div>

            {/* Section: Admission */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Admission Log</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room #</label>
                  <input name="roomNumber" value={formData.roomNumber} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Physician</label>
                  <input name="attendingPhysician" value={formData.attendingPhysician} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admit Date</label>
                  <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" />
                </div>
              </div>
            </div>

            {/* Section: Radiation */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="incRad" checked={includeRadiation} onChange={(e) => setIncludeRadiation(e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
                <label htmlFor="incRad" className="text-sm font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                  <Zap className="w-4 h-4 text-amber-500" /> Radiation Therapy
                </label>
              </div>
              {includeRadiation && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-amber-50/50 border border-amber-100 rounded-xl animate-in fade-in duration-300">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-amber-700 uppercase">Target Site</label>
                    <input name="radTargetSite" value={formData.radTargetSite} onChange={handleChange} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-amber-700 uppercase">Treatment Machine</label>
                    <select name="radMachine" value={formData.radMachine} onChange={handleChange} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm bg-white">
                      <option value="Versa HD">Versa HD</option>
                      <option value="Elekta Compac">Elekta Compac</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-700 uppercase">Dose (Gy)</label>
                    <input name="radTotalDose" type="number" value={formData.radTotalDose} onChange={handleChange} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-amber-700 uppercase">Fractions</label>
                    <input name="radFractions" type="number" value={formData.radFractions} onChange={handleChange} className="w-full px-3 py-1.5 border border-amber-200 rounded-lg text-sm" />
                  </div>
                </div>
              )}
            </div>

            {/* Section: Chemo */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="incChemo" checked={includeChemo} onChange={(e) => setIncludeChemo(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                <label htmlFor="incChemo" className="text-sm font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                  <Pill className="w-4 h-4 text-indigo-500" /> Chemotherapy
                </label>
              </div>
              {includeChemo && (
                <div className="space-y-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold text-indigo-700 uppercase">Protocol Name</label>
                      <input name="chemoProtocolName" value={formData.chemoProtocolName} onChange={handleChange} className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-indigo-700 uppercase">Total Cycles</label>
                      <input name="chemoTotalCycles" type="number" value={formData.chemoTotalCycles} onChange={handleChange} className="w-full px-3 py-1.5 border border-indigo-200 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Drug Regimen</span>
                      <button type="button" onClick={addDrug} className="text-[10px] font-bold text-white bg-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-700 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Drug
                      </button>
                    </div>
                    <div className="space-y-2">
                      {chemoDrugs.map((drug, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input placeholder="Drug" value={drug.name} onChange={(e) => updateDrug(idx, 'name', e.target.value)} className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded outline-none focus:ring-1 focus:ring-indigo-500" />
                          <input placeholder="Dosage" value={drug.dosage} onChange={(e) => updateDrug(idx, 'dosage', e.target.value)} className="w-20 px-2 py-1 text-xs border border-slate-200 rounded outline-none" />
                          <button type="button" onClick={() => removeDrug(idx)} className="p-1 text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Admit Patient
          </button>
        </div>
      </div>
    </div>
  );
};