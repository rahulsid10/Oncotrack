import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';
import { Search, Trash2, RotateCcw, Loader2, Calendar, User, Activity, LogOut } from 'lucide-react';
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
    if (window.confirm('PERMANENT DELETE: Are you sure? This patient record will be removed from all logs forever.')) {
        setProcessingId(id);
        const { success, error } = await deletePatient(id);
        if (success) {
          onRefresh();
        } else {
          alert('Error deleting patient: ' + error);
        }
        setProcessingId(null);
    }
  };

  const handleRestore = async (patient: Patient) => {
    if (window.confirm(`Restore ${patient.name} to the active ward list?`)) {
      setProcessingId(patient.id);
      // Restore to Stable status and clear discharge metadata
      const updated: Patient = { 
        ...patient, 
        status: PatientStatus.STABLE,
        dischargeDate: undefined 
      };
      const { success, error } = await updatePatient(updated);
      if (success) {
        onRefresh();
      } else {
        alert('Error restoring patient: ' + error);
      }
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discharged Patients Log</h1>
          <p className="text-slate-500 mt-1">Total {dischargedPatients.length} historical records archived</p>
        </div>
        
        <div className="relative w-full md:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-full md:w-64 text-sm bg-white shadow-sm"
            />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Patient Profile</th>
                      <th className="px-6 py-4">Clinical Diagnosis</th>
                      <th className="px-6 py-4">Attending</th>
                      <th className="px-6 py-4">Dates</th>
                      <th className="px-6 py-4 text-right">Records Management</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {filteredPatients.length === 0 ? (
                      <tr>
                          <td colSpan={5} className="px-6 py-16 text-center">
                              <div className="max-w-xs mx-auto text-slate-400">
                                <RotateCcw className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                <p className="font-medium">No archived records found.</p>
                                <p className="text-xs mt-1">Discharge active patients to see them listed here.</p>
                              </div>
                          </td>
                      </tr>
                  ) : (
                      filteredPatients.map(patient => (
                          <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-5">
                                  <div className="flex items-center gap-4">
                                      <img 
                                        src={patient.imageUrl} 
                                        alt="" 
                                        className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover" 
                                      />
                                      <div>
                                          <div className="font-bold text-slate-900">{patient.name}</div>
                                          <div className="text-xs font-mono text-slate-500">{patient.mrn}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-5">
                                  <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                    <Activity className="w-4 h-4 text-slate-400" />
                                    {patient.diagnosis}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1 pl-6">{patient.stage}</div>
                              </td>
                              <td className="px-6 py-5">
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <User className="w-4 h-4 text-slate-400" />
                                    {patient.attendingPhysician}
                                  </div>
                              </td>
                               <td className="px-6 py-5">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                                      <Calendar className="w-3.5 h-3.5" />
                                      Adm: {patient.admissionDate}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-rose-600 font-bold">
                                      <LogOut className="w-3.5 h-3.5" />
                                      Dis: {patient.dischargeDate || 'N/A'}
                                    </div>
                                  </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                  <div className="flex justify-end gap-3">
                                       <button 
                                          onClick={() => handleRestore(patient)}
                                          disabled={!!processingId}
                                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-teal-600 hover:bg-teal-50 rounded-lg border border-transparent hover:border-teal-200 transition-all disabled:opacity-50"
                                          title="Restore to Active Ward"
                                      >
                                          {processingId === patient.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                          Restore
                                      </button>
                                       <button 
                                          onClick={() => handleDelete(patient.id)}
                                          disabled={!!processingId}
                                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
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
    </div>
  );
};