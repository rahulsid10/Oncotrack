import { Patient, PatientStatus, WorkflowStatus, RTIntent } from './types';

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
    intent: RTIntent.ADJUVANT,
    attendingPhysician: 'Dr. Sarah Chen',
    imageUrl: 'https://picsum.photos/id/64/200/200',
    allergies: ['Penicillin', 'Sulfa'],
    clinicalNotes: [],
    radiationPlan: {
      id: 'r1',
      targetSite: 'Left Breast',
      technique: '3D-CRT',
      machine: 'Versa HD',
      totalDoseGy: 50,
      fractionsTotal: 25,
      fractionsCompleted: 18,
      startDate: '2023-10-20',
      endDate: '2023-11-25',
      lastFractionDate: '2023-11-14',
      workflow: {
        ctSimulation: { status: WorkflowStatus.COMPLETED, date: '2023-10-16', staff: 'Tech. Rogers', notes: 'Prone position, breast board used.' },
        contouring: { status: WorkflowStatus.COMPLETED, date: '2023-10-17', staff: 'Dr. Chen', notes: 'GTV and CTV-p defined.' },
        contouringApproval: { status: WorkflowStatus.APPROVED, date: '2023-10-18', staff: 'Dr. Miller', notes: 'Peer reviewed, contours approved.' },
        planApproval: { status: WorkflowStatus.APPROVED, date: '2023-10-19', staff: 'Phys. Wong', notes: 'DVH constraints met, 2-field tangent plan.' }
      },
      dailyLog: Array.from({ length: 18 }, (_, i) => ({
        fractionNumber: i + 1,
        date: new Date(2023, 9, 20 + i).toISOString().split('T')[0],
        delivered: true,
        physicistCheck: true,
        skinReaction: i > 10 ? 'Grade 1' : 'None'
      }))
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
    intent: RTIntent.PALLIATIVE,
    attendingPhysician: 'Dr. Marcus Webb',
    imageUrl: 'https://picsum.photos/id/91/200/200',
    allergies: ['Latex'],
    clinicalNotes: [],
    radiationPlan: {
      id: 'r2',
      targetSite: 'Right Lung Upper Lobe',
      technique: 'IMRT',
      machine: 'Elekta Compac',
      totalDoseGy: 60,
      fractionsTotal: 30,
      fractionsCompleted: 5,
      startDate: '2023-11-05',
      endDate: '2023-12-15',
      lastFractionDate: '2023-11-10',
      workflow: {
        ctSimulation: { status: WorkflowStatus.COMPLETED, date: '2023-11-02', staff: 'Tech. Smith', notes: '4DCT for respiratory gating.' },
        contouring: { status: WorkflowStatus.IN_PROGRESS, date: '2023-11-03', staff: 'Dr. Webb', notes: 'ITV creation from 4DCT phases.' },
        contouringApproval: { status: WorkflowStatus.PENDING },
        planApproval: { status: WorkflowStatus.PENDING }
      },
      dailyLog: Array.from({ length: 5 }, (_, i) => ({
        fractionNumber: i + 1,
        date: new Date(2023, 10, 5 + i).toISOString().split('T')[0],
        delivered: true,
        physicistCheck: true,
        skinReaction: 'None'
      }))
    },
    vitalsHistory: generateVitals(7).map(v => ({...v, spo2: 88 + Math.random() * 4, heartRate: 90 + Math.random() * 20})),
  }
];