import { supabase } from '../lib/supabaseClient';
import { Patient } from '../types';
import { MOCK_PATIENTS } from '../constants';

const LOCAL_STORAGE_KEY = 'oncotrack_local_patients';
let cachedAvailableColumns: string[] | null = null;

/**
 * Robust Local Storage Retrieval
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
 * Dynamic Schema Discovery
 * Inspects the table once to see which columns actually exist.
 * This prevents 'Could not find column' errors if the Supabase schema is incomplete.
 */
const getAvailableColumns = async (): Promise<string[]> => {
  if (cachedAvailableColumns) return cachedAvailableColumns;
  
  try {
    // We select 0 rows just to get the column metadata from the first result
    const { data, error } = await supabase.from('patients').select('*').limit(1);
    if (error || !data) throw new Error("Metadata check failed");
    
    cachedAvailableColumns = Object.keys(data[0] || {});
    // If table is empty, we try to guess based on standard schema or return empty
    if (cachedAvailableColumns.length === 0) {
        // Default expected columns if table is empty
        return ['id', 'mrn', 'name', 'age', 'gender', 'admission_date', 'diagnosis', 'status'];
    }
    return cachedAvailableColumns;
  } catch (err) {
    console.warn("Schema discovery failed, falling back to safe defaults.");
    return ['id', 'mrn', 'name', 'age', 'gender', 'admission_date', 'diagnosis', 'status'];
  }
};

/**
 * Payload Filter
 * Removes keys from the payload that don't exist in the remote database.
 */
const filterPayload = async (payload: any) => {
  const cols = await getAvailableColumns();
  const filtered: any = {};
  Object.keys(payload).forEach(key => {
    if (cols.includes(key)) {
      filtered[key] = payload[key];
    }
  });
  return filtered;
};

/**
 * Comprehensive Patient Mapper
 */
const mapDBToPatient = (row: any): Patient => {
  if (!row) throw new Error("Null data encountered in patient mapping");
  
  // Resilient field mapping for various schema versions
  const notes = row.notes || row.clinical_notes || row.clinicalnotes || [];
  const dischargeDate = row.discharge_date || row.discharge_timestamp || undefined;
  
  return {
    id: row.id?.toString() || Math.random().toString(36).substr(2, 9),
    mrn: row.mrn || 'N/A',
    name: row.name || 'Unknown Patient',
    age: Number(row.age) || 0,
    gender: row.gender || 'Other',
    admissionDate: row.admission_date || new Date().toISOString().split('T')[0],
    dischargeDate: dischargeDate,
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
    clinicalNotes: Array.isArray(notes) ? notes : [],
  };
};

export const getPatients = async (): Promise<{ data: Patient[], isLocal: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    
    const mappedData = (data || []).map(mapDBToPatient);
    saveLocalPatients(mappedData);
    
    return { data: mappedData, isLocal: false };
  } catch (err: any) {
    console.warn("Cloud connection issue or schema mismatch. Using local ward cache.");
    return { data: getLocalPatients(), isLocal: true };
  }
};

export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<{ success: boolean; error?: string }> => {
  const rawRow: any = {
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
    notes: patient.clinicalNotes || [],
    clinical_notes: patient.clinicalNotes || [] // Handle both common naming conventions
  };

  try {
    const dbRow = await filterPayload(rawRow);
    const { error } = await supabase.from('patients').insert([dbRow]);
    
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    // If cloud fails (connectivity or final schema issue), save to local only
    const local = getLocalPatients();
    const newPatient = { ...patient, id: `loc-${Math.random().toString(36).substr(2, 5)}` } as Patient;
    saveLocalPatients([newPatient, ...local]);
    return { success: true };
  }
};

export const updatePatient = async (patient: Patient): Promise<{ success: boolean; error?: string }> => {
  const rawRow: any = {
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
    notes: patient.clinicalNotes || [],
    clinical_notes: patient.clinicalNotes || []
  };

  try {
    const dbRow = await filterPayload(rawRow);
    const { error } = await supabase
      .from('patients')
      .update(dbRow)
      .eq('id', patient.id);
    
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    const local = getLocalPatients();
    const updated = local.map(p => p.id === patient.id ? patient : p);
    saveLocalPatients(updated);
    return { success: true };
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
    const local = getLocalPatients();
    saveLocalPatients(local.filter(p => p.id !== id));
    return { success: true };
  }
};