
import React, { useState, useEffect, useRef } from 'react';
import { Batch, Student } from '../types';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  batches: Batch[];
  initialData?: Student | null;
}

const AdmissionModal: React.FC<AdmissionModalProps> = ({ isOpen, onClose, onSubmit, batches, initialData }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const formRef = useRef<HTMLFormElement>(null);

  // Reset state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setIsDirty(false);
      setStatus(initialData?.status || 'Active');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleCloseAttempt = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm('You have unsaved changes. Are you sure you want to discard?');
      if (!confirmDiscard) return;
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit({
      ...data,
      totalFees: Number(data.totalFees),
      status: status
    });
    setIsDirty(false); 
    onClose();
  };

  const handleFormChange = () => {
    if (!isDirty) setIsDirty(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{initialData ? 'Update Student Details' : 'Student Admission Form'}</h2>
            <p className="text-blue-100 text-xs">
              {initialData ? `Editing record for ${initialData.id}` : 'Register a new student to the institute'}
            </p>
          </div>
          <button 
            onClick={handleCloseAttempt} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          onChange={handleFormChange}
          className="p-8 overflow-y-auto space-y-6"
        >
          {/* Status Selection */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment Status</p>
              <p className="text-xs text-gray-500 font-medium">Set student current activity state</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <button
                type="button"
                onClick={() => { setStatus('Active'); setIsDirty(true); }}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${status === 'Active' ? 'bg-green-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => { setStatus('Inactive'); setIsDirty(true); }}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${status === 'Inactive' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Inactive
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
              <input 
                name="name" 
                required 
                defaultValue={initialData?.name}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="e.g. Rahul Sharma" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number *</label>
              <input 
                name="mobile" 
                required 
                type="tel" 
                defaultValue={initialData?.mobile}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="10-digit number" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
              <input 
                name="email" 
                type="email" 
                defaultValue={initialData?.email}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="email@example.com" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Guardian Name</label>
              <input 
                name="guardianName" 
                defaultValue={initialData?.guardianName}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Parent/Guardian" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Course *</label>
                <input 
                  name="course" 
                  required 
                  defaultValue={initialData?.course}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Physics Pro" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Assign Batch *</label>
                <select 
                  name="batchId" 
                  required 
                  defaultValue={initialData?.batchId}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Choose a batch...</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.timing})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Total Fees (INR) *</label>
                <input 
                  name="totalFees" 
                  type="number" 
                  required 
                  defaultValue={initialData?.totalFees}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Admission Date</label>
                <input 
                  name="admissionDate" 
                  type="date" 
                  defaultValue={initialData?.admissionDate || new Date().toISOString().split('T')[0]} 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button" 
              onClick={handleCloseAttempt} 
              className="flex-1 py-4 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="flex-2 grow bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
              <i className={initialData ? "fas fa-save" : "fas fa-user-plus"}></i> 
              {initialData ? 'Update Record' : 'Complete Admission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmissionModal;
