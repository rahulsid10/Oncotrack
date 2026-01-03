export enum PatientStatus {
  STABLE = 'Stable',
  CRITICAL = 'Critical',
  RECOVERING = 'Recovering',
  DISCHARGE_READY = 'Discharge Ready',
  DISCHARGED = 'Discharged'
}

export enum RTIntent {
  RADICAL = 'Radical',
  ADJUVANT = 'Adjuvant',
  PALLIATIVE = 'Palliative'
}

export enum WorkflowStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  APPROVED = 'Approved'
}

export interface RTWorkflowStep {
  status: WorkflowStatus;
  date?: string;
  notes?: string;
  staff?: string;
}

export interface RTWorkflow {
  ctSimulation: RTWorkflowStep;
  contouring: RTWorkflowStep;
  contouringApproval: RTWorkflowStep;
  planApproval: RTWorkflowStep;
}

export interface RTFractionEntry {
  fractionNumber: number;
  date: string;
  delivered: boolean;
  notes?: string;
  physicistCheck: boolean;
  skinReaction?: 'None' | 'Grade 1' | 'Grade 2' | 'Grade 3';
}

export interface RadiationPlan {
  id: string;
  targetSite: string; // e.g., "Left Breast", "Prostate"
  technique: string; // e.g., "IMRT", "VMAT"
  machine?: 'Versa HD' | 'Elekta Compac' | 'Other';
  totalDoseGy: number;
  fractionsTotal: number;
  fractionsCompleted: number;
  startDate: string;
  endDate: string;
  lastFractionDate?: string;
  workflow?: RTWorkflow;
  dailyLog?: RTFractionEntry[];
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
  dischargeDate?: string;
  diagnosis: string;
  stage: string; // e.g., "Stage IIB"
  roomNumber: string;
  status: PatientStatus;
  intent?: RTIntent;
  attendingPhysician: string;
  radiationPlan?: RadiationPlan;
  chemoProtocol?: ChemoProtocol;
  vitalsHistory: VitalSign[];
  allergies: string[];
  imageUrl: string;
  clinicalNotes: ClinicalNote[];
}