
import { Patient, PatientStatus } from './types';

const generateVitals = (days: number) => {
  const vitals = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));
    vitals.push({
      date: date.toISOString().split('T')[0],
      systolic: 110 + Math.floor(Math.random() * 30),
      diastolic: 70 + Math.floor(Math.random() * 20),
      heartRate: 65 + Math.floor(Math.random() * 30),
      temp: 36.5 + Math.random(),
      spo2: 95 + Math.floor(Math.random() * 5),
    });
  }
  return vitals;
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    mrn: 'ONC-2024-001',
    name: 'Eleanor Vance',
    age: 58,
    gender: 'Female',
    admissionDate: '2023-10-15',
    diagnosis: 'Infiltrating Ductal Carcinoma',
    stage: 'Stage IIA',
    roomNumber: '304-A',
    status: PatientStatus.STABLE,
    attendingPhysician: 'Dr. Sarah Chen',
    imageUrl: 'https://picsum.photos/id/64/200/200',
    allergies: ['Penicillin', 'Sulfa'],
    clinicalNotes: [],
    radiationPlan: {
      id: 'r1',
      targetSite: 'Left Breast',
      technique: '3D-CRT',
      totalDoseGy: 50,
      fractionsTotal: 25,
      fractionsCompleted: 18,
      startDate: '2023-10-20',
      endDate: '2023-11-25',
      lastFractionDate: '2023-11-14',
    },
    chemoProtocol: {
      id: 'c1',
      protocolName: 'AC (Doxorubicin + Cyclophosphamide)',
      cycleCurrent: 3,
      cycleTotal: 4,
      cycleFrequencyDays: 21,
      nextCycleDate: '2023-11-20',
      lastAdministeredDate: '2023-10-30',
      drugs: [
        { name: 'Doxorubicin', dosage: '60 mg/m2', route: 'IV' },
        { name: 'Cyclophosphamide', dosage: '600 mg/m2', route: 'IV' },
      ],
    },
    vitalsHistory: generateVitals(7),
  },
  {
    id: '2',
    mrn: 'ONC-2024-042',
    name: 'Arthur Pym',
    age: 72,
    gender: 'Male',
    admissionDate: '2023-11-01',
    diagnosis: 'Non-Small Cell Lung Cancer',
    stage: 'Stage IIIB',
    roomNumber: '305-B',
    status: PatientStatus.CRITICAL,
    attendingPhysician: 'Dr. Marcus Webb',
    imageUrl: 'https://picsum.photos/id/91/200/200',
    allergies: ['Latex'],
    clinicalNotes: [],
    radiationPlan: {
      id: 'r2',
      targetSite: 'Right Lung Upper Lobe',
      technique: 'IMRT',
      totalDoseGy: 60,
      fractionsTotal: 30,
      fractionsCompleted: 5,
      startDate: '2023-11-05',
      endDate: '2023-12-15',
      lastFractionDate: '2023-11-10',
    },
    // No chemo for this patient yet, simulating concurrent RT setup phase
    vitalsHistory: generateVitals(7).map(v => ({...v, spo2: 88 + Math.random() * 4, heartRate: 90 + Math.random() * 20})),
  },
  {
    id: '3',
    mrn: 'ONC-2024-088',
    name: 'Lydia Deetz',
    age: 45,
    gender: 'Female',
    admissionDate: '2023-09-20',
    diagnosis: 'Glioblastoma Multiforme',
    stage: 'Grade IV',
    roomNumber: 'ICU-02',
    status: PatientStatus.RECOVERING,
    attendingPhysician: 'Dr. Sarah Chen',
    imageUrl: 'https://picsum.photos/id/338/200/200',
    allergies: ['None'],
    clinicalNotes: [],
    radiationPlan: {
      id: 'r3',
      targetSite: 'Brain',
      technique: 'VMAT',
      totalDoseGy: 60,
      fractionsTotal: 30,
      fractionsCompleted: 29,
      startDate: '2023-09-25',
      endDate: '2023-11-06',
      lastFractionDate: '2023-11-05',
    },
    chemoProtocol: {
      id: 'c3',
      protocolName: 'Temozolomide',
      cycleCurrent: 1,
      cycleTotal: 6,
      cycleFrequencyDays: 28,
      nextCycleDate: '2023-12-01',
      lastAdministeredDate: '2023-11-03',
      drugs: [
        { name: 'Temozolomide', dosage: '75 mg/m2', route: 'Oral' },
      ],
      notes: 'Concurrent with RT phase.'
    },
    vitalsHistory: generateVitals(7),
  },
  {
    id: '4',
    mrn: 'ONC-2024-112',
    name: 'Roderick Usher',
    age: 64,
    gender: 'Male',
    admissionDate: '2023-11-10',
    diagnosis: 'Colorectal Cancer',
    stage: 'Stage III',
    roomNumber: '302-A',
    status: PatientStatus.DISCHARGE_READY,
    attendingPhysician: 'Dr. Marcus Webb',
    imageUrl: 'https://picsum.photos/id/100/200/200',
    allergies: ['Contrast Dye'],
    clinicalNotes: [],
    chemoProtocol: {
      id: 'c4',
      protocolName: 'FOLFOX',
      cycleCurrent: 12,
      cycleTotal: 12,
      cycleFrequencyDays: 14,
      nextCycleDate: 'N/A', // Completed
      lastAdministeredDate: '2023-11-12',
      drugs: [
        { name: 'Oxaliplatin', dosage: '85 mg/m2', route: 'IV' },
        { name: 'Leucovorin', dosage: '400 mg/m2', route: 'IV' },
        { name: 'Fluorouracil', dosage: '400 mg/m2', route: 'IV Bolus' },
      ],
      notes: 'Final cycle completed successfully.'
    },
    vitalsHistory: generateVitals(7),
  }
];