
export enum PatientStatus {
  STABLE = 'Stable',
  CRITICAL = 'Critical',
  RECOVERING = 'Recovering',
  DISCHARGE_READY = 'Discharge Ready',
  DISCHARGED = 'Discharged'
}

export interface RadiationPlan {
  id: string;
  targetSite: string; // e.g., "Left Breast", "Prostate"
  technique: string; // e.g., "IMRT", "VMAT"
  totalDoseGy: number;
  fractionsTotal: number;
  fractionsCompleted: number;
  startDate: string;
  endDate: string;
  lastFractionDate?: string;
}

export interface ChemoDrug {
  name: string;
  dosage: string;
  route: string; // e.g., "IV", "Oral"
}

export interface ChemoProtocol {
  id: string;
  protocolName: string; // e.g., "AC-T", "FOLFOX"
  cycleCurrent: number;
  cycleTotal: number;
  cycleFrequencyDays: number;
  nextCycleDate: string;
  drugs: ChemoDrug[];
  lastAdministeredDate?: string;
  notes?: string;
}

export interface VitalSign {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temp: number;
  spo2: number;
}

export interface ClinicalNote {
  id: string;
  date: string;
  content: string;
  type: 'General' | 'Pathology' | 'Imaging';
  author: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  admissionDate: string;
  diagnosis: string;
  stage: string; // e.g., "Stage IIB"
  roomNumber: string;
  status: PatientStatus;
  attendingPhysician: string;
  radiationPlan?: RadiationPlan;
  chemoProtocol?: ChemoProtocol;
  vitalsHistory: VitalSign[];
  allergies: string[];
  imageUrl: string;
  clinicalNotes: ClinicalNote[];
}
