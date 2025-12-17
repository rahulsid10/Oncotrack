import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Clipboard, Microscope, ImageIcon, AlertCircle } from 'lucide-react';
import { ClinicalNote } from '../types';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: ClinicalNote) => Promise<void>;
  initialType?: 'General' | 'Pathology' | 'Imaging';
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, onClose, onSave, initialType = 'General' }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [type, setType] = useState<'General' | 'Pathology' | 'Imaging'>(initialType);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setContent('');
    }
  }, [isOpen, initialType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    const newNote: ClinicalNote = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      content: content.trim(),
      type: type,
      author: 'Dr. User' // In a real app, this would come from auth context
    };

    await onSave(newNote);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  const getTypeStyles = (t: string) => {
    switch (t) {
      case 'Pathology': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Imaging': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'Pathology': return <Microscope className="w-5 h-5 text-amber-600" />;
      case 'Imaging': return <ImageIcon className="w-5 h-5 text-blue-600" />;
      default: return <Clipboard className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'Pathology' ? 'bg-amber-100' : type === 'Imaging' ? 'bg-blue-100' : 'bg-slate-200'}`}>
              {getIcon()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {type === 'Pathology' ? 'Order Lab Investigation' : type === 'Imaging' ? 'Request Imaging' : 'Add Clinical Note'}
              </h2>
              <p className="text-sm text-slate-500">Record observations or orders</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Selector (if needed to switch) */}
          <div className="grid grid-cols-3 gap-2">
            {['General', 'Pathology', 'Imaging'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t as any)}
                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all flex items-center justify-center gap-2
                  ${type === t ? getTypeStyles(t) + ' border-current ring-1 ring-offset-1' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                `}
              >
                {t === 'Pathology' && <Microscope className="w-3 h-3" />}
                {t === 'Imaging' && <ImageIcon className="w-3 h-3" />}
                {t === 'General' && <Clipboard className="w-3 h-3" />}
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {type === 'General' ? 'Note Content' : 'Requisition Details'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'Pathology' ? 'E.g., CBC, electrolyte panel, liver function test...' :
                type === 'Imaging' ? 'E.g., Chest X-Ray, CT Scan Abdomen...' :
                'Enter clinical observations...'
              }
              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all text-sm"
              required
            />
          </div>

          {type !== 'General' && (
             <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${type === 'Pathology' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>This requisition will be flagged as an alert in the patient's file.</p>
             </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
             <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || !content.trim()}
                className={`px-6 py-2 text-white rounded-lg font-semibold shadow-sm flex items-center gap-2 transition-all disabled:opacity-50
                  ${type === 'Pathology' ? 'bg-amber-600 hover:bg-amber-700' : type === 'Imaging' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'}
                `}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {type === 'General' ? 'Save Note' : 'Place Order'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};
