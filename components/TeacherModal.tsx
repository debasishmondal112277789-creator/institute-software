
import React, { useState, useEffect } from 'react';
import { Teacher } from '../types';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Teacher | null;
}

const TeacherModal: React.FC<TeacherModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen) setIsDirty(false);
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
    const subjects = (data.subjects as string).split(',').map(s => s.trim()).filter(s => s !== '');
    onSubmit({ ...data, subjects });
    setIsDirty(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-purple-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{initialData ? 'Edit Faculty Member' : 'Add New Teacher'}</h2>
            <p className="text-purple-100 text-xs">Manage teacher profile and assigned subjects</p>
          </div>
          <button onClick={handleCloseAttempt} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name *</label>
              <input name="name" required defaultValue={initialData?.name} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Email Address *</label>
              <input name="email" type="email" required defaultValue={initialData?.email} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number *</label>
              <input name="mobile" required defaultValue={initialData?.mobile} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Subjects (Comma separated) *</label>
              <input name="subjects" required defaultValue={initialData?.subjects.join(', ')} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Maths, Physics, Chemistry" />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={handleCloseAttempt} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-2 grow bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-lg transition-all">
              {initialData ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherModal;
