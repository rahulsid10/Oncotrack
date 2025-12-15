import React, { useState } from 'react';
import { Patient } from '../types';
import { getPatientInsight } from '../services/geminiService';
import { 
  ArrowLeft, Brain, Zap, Pill, Activity, Calendar, 
  AlertTriangle, Stethoscope, Sparkles, Thermometer 
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { EditPatientModal } from './EditPatientModal';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onPatientUpdated?: (updatedPatient: Patient) => void;
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

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onPatientUpdated }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'treatment' | 'vitals'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const result = await getPatientInsight(patient);
    setInsight(result);
    setLoadingInsight(false);
  };

  const handleEditSuccess = (updatedPatient: Patient) => {
      // Update local view if needed, or bubble up
      if (onPatientUpdated) {
          onPatientUpdated(updatedPatient);
      }
  };

  const rtProgress = patient.radiationPlan 
    ? Math.round((patient.radiationPlan.fractionsCompleted / patient.radiationPlan.fractionsTotal) * 100) 
    : 0;

  const chemoProgress = patient.chemoProtocol
    ? Math.round((patient.chemoProtocol.cycleCurrent / patient.chemoProtocol.cycleTotal) * 100)
    : 0;

  // Formatting date for X-Axis
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="bg-white min-h-full">
      {/* Header */}
      <div className="border-b border-slate-200 sticky top-0 bg-white z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <img 
                src={patient.imageUrl} 
                alt={patient.name} 
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">{patient.name}</h1>
                <p className="text-sm text-slate-500">MRN: {patient.mrn} • {patient.age}y • {patient.gender}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => setIsEditModalOpen(true)}
               className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
             >
               Edit Details
             </button>
             <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm">
               Add Clinical Note
             </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-8 flex gap-8">
          {['overview', 'treatment', 'vitals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab 
                  ? 'border-teal-600 text-teal-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {activeTab === 'overview' && (
              <>
                {/* AI Insight Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-900">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h2 className="font-semibold text-lg">AI Clinical Insight</h2>
                    </div>
                    {!insight && (
                      <button 
                        onClick={handleGenerateInsight}
                        disabled={loadingInsight}
                        className="px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 disabled:opacity-50 transition-all flex items-center gap-2"
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
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
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
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Radiation Therapy
                      </h3>
                      <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2 py-1 rounded-lg border border-amber-100">
                        {patient.radiationPlan.technique}
                      </span>
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

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500 text-xs">Target Site</p>
                        <p className="font-semibold text-slate-800">{patient.radiationPlan.targetSite}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500 text-xs">Total Dose</p>
                        <p className="font-semibold text-slate-800">{patient.radiationPlan.totalDoseGy} Gy</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-500 text-xs">Last Fraction</p>
                        <p className="font-semibold text-slate-800">{patient.radiationPlan.lastFractionDate}</p>
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
                       <div className="overflow-hidden rounded-xl border border-slate-200">
                         <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-slate-500">
                             <tr>
                               <th className="px-4 py-3 font-medium">Drug</th>
                               <th className="px-4 py-3 font-medium">Dosage</th>
                               <th className="px-4 py-3 font-medium">Route</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {patient.chemoProtocol.drugs.map((drug, i) => (
                               <tr key={i} className="bg-white">
                                 <td className="px-4 py-3 font-medium text-slate-800">{drug.name}</td>
                                 <td className="px-4 py-3 text-slate-600">{drug.dosage}</td>
                                 <td className="px-4 py-3 text-slate-600">{drug.route}</td>
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
                       <LineChart data={patient.vitalsHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                       <LineChart data={patient.vitalsHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={formatDate}
                          />
                          {/* Left Axis for Temp */}
                          <YAxis 
                            yAxisId="left" 
                            domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                            stroke="#f59e0b" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false}
                            unit="°C"
                          />
                          {/* Right Axis for SpO2 */}
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
                <div className="grid grid-cols-4 gap-4">
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
                <button className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left">
                  Schedule Lab Work
                </button>
                 <button className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left">
                  Request Imaging
                </button>
                 <button className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors text-left">
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
    </div>
  );
}