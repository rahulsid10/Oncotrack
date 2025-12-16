import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';
import { Search, Trash2, RotateCcw, FileText, CheckCircle } from 'lucide-react';
import { deletePatient, updatePatient } from '../services/patientService';

interface PatientHistoryProps {
  patients: Patient[];
  onRefresh: () => void;
}

export const PatientHistory: React.FC<PatientHistoryProps> = ({ patients, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const dischargedPatients = patients.filter(p => p.status === PatientStatus.DISCHARGED);
  
  const filteredPatients = dischargedPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this record? This action cannot be undone.')) {
        setProcessingId(id);
        const { success } = await deletePatient(id);
        if (success) onRefresh();
        setProcessingId(null);
    }
  };

  const handleRestore = async (patient: Patient) => {
    setProcessingId(patient.id);
    // Restore to Stable status
    const updated = { ...patient, status: PatientStatus.STABLE };
    const { success } = await updatePatient(updated);
    if (success) onRefresh();
    setProcessingId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discharged Patients Log</h1>
          <p className="text-slate-500 mt-1">History of completed treatments and discharges</p>
        </div>
        
        <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-64 text-sm bg-white"
            />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm font-medium border-b border-slate-100">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Diagnosis</th>
                    <th className="px-6 py-4">Physician</th>
                    <th className="px-6 py-4">Admission Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                            No discharged patients found in the log.
                        </td>
                    </tr>
                ) : (
                    filteredPatients.map(patient => (
                        <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{patient.name}</div>
                                        <div className="text-xs text-slate-500">{patient.mrn}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {patient.diagnosis}
                                <div className="text-xs text-slate-400">{patient.stage}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {patient.attendingPhysician}
                            </td>
                             <td className="px-6 py-4 text-sm text-slate-600">
                                {patient.admissionDate}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                        onClick={() => handleRestore(patient)}
                                        disabled={!!processingId}
                                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                        title="Restore to Inpatients"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                     <button 
                                        onClick={() => handleDelete(patient.id)}
                                        disabled={!!processingId}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};