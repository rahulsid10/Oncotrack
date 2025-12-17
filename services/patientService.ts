import { supabase } from '../lib/supabaseClient';
import { Patient } from '../types';
import { MOCK_PATIENTS } from '../constants';

// Helper to map DB columns (snake_case) to App types (camelCase)
const mapDBToPatient = (row: any): Patient => ({
  id: row.id.toString(),
  mrn: row.mrn,
  name: row.name,
  age: row.age,
  gender: row.gender,
  admissionDate: row.admission_date,
  diagnosis: row.diagnosis,
  stage: row.stage,
  roomNumber: row.room_number,
  status: row.status,
  attendingPhysician: row.attending_physician,
  radiationPlan: row.radiation_plan,
  chemoProtocol: row.chemo_protocol,
  vitalsHistory: row.vitals_history || [],
  allergies: row.allergies || [],
  // Use DB value, or fallback to avatar generator if null/missing
  imageUrl: row.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`,
  clinicalNotes: row.clinical_notes || [],
});

export const getPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    console.error('Supabase fetch error:', error.message);
    // Throw error so UI can handle "missing table" state
    throw new Error(error.message);
  }

  return (data || []).map(mapDBToPatient);
};

export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<{ success: boolean; error?: string }> => {
  const dbRow = {
    mrn: patient.mrn,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    admission_date: patient.admissionDate,
    diagnosis: patient.diagnosis,
    stage: patient.stage,
    room_number: patient.roomNumber,
    status: patient.status,
    attending_physician: patient.attendingPhysician,
    radiation_plan: patient.radiationPlan || null,
    chemo_protocol: patient.chemoProtocol || null,
    vitals_history: patient.vitalsHistory || [],
    allergies: patient.allergies || [],
    image_url: patient.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`,
    clinical_notes: patient.clinicalNotes || [],
  };

  const { error } = await supabase.from('patients').insert([dbRow]);

  if (error) {
    // Robustness: If the schema is outdated and missing image_url, retry without it
    // Handle both lowercase and sentence case error messages
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('image_url') || errorMsg.includes('column "image_url"')) {
      console.warn("Schema mismatch: image_url column missing. Retrying insert without image_url.");
      
      // Explicitly clone and delete to be safe
      const safeRow: any = { ...dbRow };
      delete safeRow.image_url;

      const { error: retryError } = await supabase.from('patients').insert([safeRow]);
      
      if (retryError) {
        console.error('Supabase retry insert error:', retryError.message);
        return { success: false, error: retryError.message };
      }
      return { success: true };
    }

    console.error('Supabase insert error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const updatePatient = async (patient: Patient): Promise<{ success: boolean; error?: string }> => {
  const dbRow = {
    mrn: patient.mrn,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    admission_date: patient.admissionDate,
    diagnosis: patient.diagnosis,
    stage: patient.stage,
    room_number: patient.roomNumber,
    status: patient.status,
    attending_physician: patient.attendingPhysician,
    radiation_plan: patient.radiationPlan || null,
    chemo_protocol: patient.chemoProtocol || null,
    vitals_history: patient.vitalsHistory || [],
    allergies: patient.allergies || [],
    image_url: patient.imageUrl,
    clinical_notes: patient.clinicalNotes || [],
  };

  const { error } = await supabase
    .from('patients')
    .update(dbRow)
    .eq('id', patient.id)
    .select(); // IMPORTANT: Ensure we wait for the write to be confirmed and return data

  if (error) {
    // Robustness: If the schema is outdated and missing image_url, retry without it
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('image_url') || errorMsg.includes('column "image_url"')) {
       console.warn("Schema mismatch: image_url column missing. Retrying update without image_url.");
       
       const safeRow: any = { ...dbRow };
       delete safeRow.image_url;
       
       const { error: retryError } = await supabase
          .from('patients')
          .update(safeRow)
          .eq('id', patient.id)
          .select();
      
       if (retryError) return { success: false, error: retryError.message };
       return { success: true };
    }

    console.error('Supabase update error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const deletePatient = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const seedPatients = async (): Promise<{ success: boolean; error?: string }> => {
  // Maps mock data to DB column structure
  const dbRows = MOCK_PATIENTS.map(p => ({
    mrn: p.mrn,
    name: p.name,
    age: p.age,
    gender: p.gender,
    admission_date: p.admissionDate,
    diagnosis: p.diagnosis,
    stage: p.stage,
    room_number: p.roomNumber,
    status: p.status,
    attending_physician: p.attendingPhysician,
    radiation_plan: p.radiationPlan || null,
    chemo_protocol: p.chemoProtocol || null,
    vitals_history: p.vitalsHistory || [],
    allergies: p.allergies || [],
    image_url: p.imageUrl,
    clinical_notes: (p as any).clinicalNotes || []
  }));

  const { error } = await supabase.from('patients').insert(dbRows);

  if (error) {
    // Retry without image_url if schema is old
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('image_url') || errorMsg.includes('column "image_url"')) {
       console.warn("Schema mismatch during seed: image_url column missing. Retrying seed without image_url.");
       
       const safeRows = dbRows.map(r => {
         const { image_url, ...rest } = r as any;
         return rest;
       });

       const { error: retryError } = await supabase.from('patients').insert(safeRows);
       if (retryError) {
         console.error('Supabase retry seed error:', retryError.message);
         return { success: false, error: retryError.message };
       }
       return { success: true };
    }

    console.error('Supabase seed error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
};
