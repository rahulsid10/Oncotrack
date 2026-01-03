import { supabase } from '../lib/supabaseClient';
import { Patient } from '../types';
import { MOCK_PATIENTS } from '../constants';

const LOCAL_STORAGE_KEY = 'oncotrack_local_patients';

/**
 * Robust Local Storage Retrieval
 * Ensures the app has data even if the Supabase project is paused or blocked.
 */
const getLocalPatients = (): Patient[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Local storage parse failed, resetting to defaults.");
  }
  
  // Initial fallback if no storage exists
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(MOCK_PATIENTS));
  return MOCK_PATIENTS;
};

const saveLocalPatients = (patients: Patient[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(patients));
  } catch (e) {
    console.error("Critical: Failed to persist ward data locally.", e);
  }
};

/**
 * Database to Frontend Mapper
 * Handles the transition from snake_case (Postgres) to camelCase (TypeScript).
 */
const mapDBToPatient = (row: any): Patient => {
  if (!row) throw new Error("Null data encountered in patient mapping");
  
  return {
    id: row.id?.toString() || Math.random().toString(36).substr(2, 9),
    mrn: row.mrn || 'N/A',
    name: row.name || 'Unknown Patient',
    age: Number(row.age) || 0,
    gender: row.gender || 'Other',
    admissionDate: row.admission_date || new Date().toISOString().split('T')[0],
    dischargeDate: row.discharge_date || undefined,
    diagnosis: row.diagnosis || 'Diagnosis Pending',
    stage: row.stage || '',
    roomNumber: row.room_number || '',
    status: row.status || 'Stable',
    intent: row.intent || null, 
    attendingPhysician: row.attending_physician || 'Unassigned',
    radiationPlan: row.radiation_plan || undefined,
    chemoProtocol: row.chemo_protocol || undefined,
    vitalsHistory: Array.isArray(row.vitals_history) ? row.vitals_history : [],
    allergies: Array.isArray(row.allergies) ? row.allergies : [],
    imageUrl: row.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || 'P')}&background=random`,
    clinicalNotes: Array.isArray(row.clinical_notes) ? row.clinical_notes : [],
  };
};

export const getPatients = async (): Promise<{ data: Patient[], isLocal: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.debug(`Supabase Error ${error.code}: ${error.message}`);
      throw new Error(error.message);
    }
    
    const mappedData = (data || []).map(mapDBToPatient);
    saveLocalPatients(mappedData);
    
    return { data: mappedData, isLocal: false };
  } catch (err: any) {
    const errorMsg = String(err);
    
    const isConnectivityIssue = 
      errorMsg.includes('fetch') || 
      err.name === 'TypeError' || 
      err.code === 'PGRST100' || 
      !window.navigator.onLine;

    if (isConnectivityIssue) {
      console.warn("Cloud connection unreachable. Transitioning to local ward cache.");
    } else {
      console.error("Unexpected Clinical Data Error:", errorMsg);
    }
    
    return { data: getLocalPatients(), isLocal: true };
  }
};

export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<{ success: boolean; error?: string }> => {
  const dbRow: any = {
    mrn: patient.mrn,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    admission_date: patient.admissionDate,
    discharge_date: patient.dischargeDate || null,
    diagnosis: patient.diagnosis,
    stage: patient.stage,
    room_number: patient.roomNumber,
    status: patient.status,
    intent: patient.intent, 
    attending_physician: patient.attendingPhysician,
    radiation_plan: patient.radiationPlan || null,
    chemo_protocol: patient.chemoProtocol || null,
    vitals_history: patient.vitalsHistory || [],
    allergies: patient.allergies || [],
    image_url: patient.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`,
    clinical_notes: patient.clinicalNotes || [],
  };

  try {
    const { error } = await supabase.from('patients').insert([dbRow]);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    if (String(err).includes('fetch') || err.name === 'TypeError') {
      const local = getLocalPatients();
      const newPatient = { ...patient, id: `loc-${Math.random().toString(36).substr(2, 5)}` } as Patient;
      saveLocalPatients([newPatient, ...local]);
      return { success: true };
    }
    return { success: false, error: err.message || "Unknown write error" };
  }
};

export const updatePatient = async (patient: Patient): Promise<{ success: boolean; error?: string }> => {
  const dbRow: any = {
    mrn: patient.mrn,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    admission_date: patient.admissionDate,
    discharge_date: patient.dischargeDate || null,
    diagnosis: patient.diagnosis,
    stage: patient.stage,
    room_number: patient.roomNumber,
    status: patient.status,
    intent: patient.intent,
    attending_physician: patient.attendingPhysician,
    radiation_plan: patient.radiationPlan || null,
    chemo_protocol: patient.chemoProtocol || null,
    vitals_history: patient.vitalsHistory || [],
    allergies: patient.allergies || [],
    image_url: patient.imageUrl,
    clinical_notes: patient.clinicalNotes || [],
  };

  try {
    const { error } = await supabase
      .from('patients')
      .update(dbRow)
      .eq('id', patient.id);
    
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    if (String(err).includes('fetch') || err.name === 'TypeError') {
      const local = getLocalPatients();
      const updated = local.map(p => p.id === patient.id ? patient : p);
      saveLocalPatients(updated);
      return { success: true };
    }
    return { success: false, error: err.message || "Unknown update error" };
  }
};

export const deletePatient = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    if (String(err).includes('fetch') || err.name === 'TypeError') {
      const local = getLocalPatients();
      saveLocalPatients(local.filter(p => p.id !== id));
      return { success: true };
    }
    return { success: false, error: err.message || "Unknown deletion error" };
  }
};