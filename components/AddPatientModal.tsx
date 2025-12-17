
import React, { useState } from 'react';
import { X, Save, Loader2, UserPlus, Zap } from 'lucide-react';
import { Patient, PatientStatus } from '../types';
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
    allergies: '',
    // Radiation Fields
    radTargetSite: '',
    radTechnique: '3D-CRT',
    radTotalDose: '',
    radFractions: '',
    radStartDate: new Date().toISOString().split('T')[0],
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.name || !formData.mrn || !formData.diagnosis) {
      setError("Please fill in all required fields marked with *");
      setLoading(false);
      return;
    }

    // Radiation validation
    if (includeRadiation && (!formData.radTargetSite || !formData.radTotalDose || !formData.radFractions)) {
      setError("Please fill in all Radiation Plan details (Target, Dose, Fractions) or uncheck the option.");
      setLoading(false);
      return;
    }

    const radiationPlan = includeRadiation ? {
      id: Math.random().toString(36).substr(2, 9),
      targetSite: formData.radTargetSite,
      technique: formData.radTechnique,
      totalDoseGy: parseFloat(formData.radTotalDose) || 0,
      fractionsTotal: parseInt(formData.radFractions) || 0,
      fractionsCompleted: 0,
      startDate: formData.radStartDate,
      endDate: 'TBD', // Placeholder
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
      allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
      vitalsHistory: [], // Empty initially
      imageUrl: '', // Will be generated in service
      radiationPlan,
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Admit New Patient</h2>
              <p className="text-sm text-slate-500">Enter patient details for admission</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Personal Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    placeholder="Years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">MRN (Medical Record #) *</label>
                <input
                  name="mrn"
                  value={formData.mrn}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="e.g. ONC-2024-XXX"
                  required
                />
              </div>
            </div>

            {/* Clinical Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Clinical Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis *</label>
                <input
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="e.g. Lung Adenocarcinoma"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stage</label>
                <input
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="e.g. Stage IIIB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Known Allergies</label>
                <input
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="Comma separated (e.g. Penicillin, Peanuts)"
                />
              </div>
            </div>

            {/* Admission Info */}
            <div className="space-y-4 md:col-span-2">
               <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Admission Status</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Number</label>
                    <input
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                      placeholder="e.g. 304-A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Attending Physician</label>
                    <input
                      name="attendingPhysician"
                      value={formData.attendingPhysician}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                      placeholder="e.g. Dr. Sarah Chen"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    >
                      {Object.values(PatientStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Admission Date</label>
                    <input
                      name="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    />
                  </div>
               </div>
            </div>

            {/* Radiation Plan */}
            <div className="space-y-4 md:col-span-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="checkbox"
                  id="includeRadiation"
                  checked={includeRadiation}
                  onChange={(e) => setIncludeRadiation(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
                />
                <label htmlFor="includeRadiation" className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 cursor-pointer select-none">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Add Radiation Therapy Plan
                </label>
              </div>

              {includeRadiation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Site *</label>
                    <input
                      name="radTargetSite"
                      value={formData.radTargetSite}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white"
                      placeholder="e.g. Left Breast"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Technique</label>
                     <select
                      name="radTechnique"
                      value={formData.radTechnique}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white"
                    >
                      <option value="3D-CRT">3D-CRT</option>
                      <option value="IMRT">IMRT</option>
                      <option value="VMAT">VMAT</option>
                      <option value="SBRT">SBRT</option>
                      <option value="Proton">Proton Therapy</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Total Dose (Gy) *</label>
                      <input
                        name="radTotalDose"
                        type="number"
                        value={formData.radTotalDose}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white"
                        placeholder="e.g. 50"
                      />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fractions *</label>
                      <input
                        name="radFractions"
                        type="number"
                        value={formData.radFractions}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white"
                        placeholder="e.g. 25"
                      />
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      name="radStartDate"
                      type="date"
                      value={formData.radStartDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
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
            Admit Patient
          </button>
        </div>
      </div>
    </div>
  );
};