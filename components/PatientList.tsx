import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { PatientCard } from './PatientCard';
import { Search, Filter, Plus } from 'lucide-react';
import { AddPatientModal } from './AddPatientModal';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onRefresh?: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  const handlePatientAdded = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inpatients Directory</h1>
          <p className="text-slate-500 mt-1">{filteredPatients.length} Active cases found</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none w-64 text-sm bg-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium bg-white">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map(patient => (
          <PatientCard 
            key={patient.id} 
            patient={patient} 
            onClick={() => onSelectPatient(patient)} 
          />
        ))}
      </div>
      
      {filteredPatients.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">No patients found matching your search.</p>
          <button 
             onClick={() => setIsAddModalOpen(true)}
             className="mt-4 text-teal-600 font-medium hover:underline"
          >
            Add a new patient
          </button>
        </div>
      )}

      <AddPatientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handlePatientAdded}
      />
    </div>
  );
};