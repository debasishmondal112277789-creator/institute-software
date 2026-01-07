
import React, { useState, useEffect } from 'react';
import { Batch, Teacher } from '../types';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  teachers: Teacher[];
  initialData?: Batch | null;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose, onSubmit, teachers, initialData }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [useCustomTiming, setUseCustomTiming] = useState(false);
  const [customTiming, setCustomTiming] = useState('');

  // Sync state with initialData when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsDirty(false);
      if (initialData && initialData.timing) {
        // Simple heuristic to see if it's our structured format: "Days | Start - End"
        if (initialData.timing.includes('|') && initialData.timing.includes('-')) {
          const [daysPart, timePart] = initialData.timing.split('|').map(s => s.trim());
          const [start, end] = timePart.split('-').map(s => s.trim());
          setSelectedDays(daysPart.split(', ').filter(d => DAYS.includes(d)));
          setStartTime(start);
          setEndTime(end);
          setUseCustomTiming(false);
        } else {
          setUseCustomTiming(true);
          setCustomTiming(initialData.timing);
        }
      } else {
        setSelectedDays(['Mon']);
        setStartTime('09:00');
        setEndTime('10:00');
        setUseCustomTiming(false);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setIsDirty(true);
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleCloseAttempt = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm('You have unsaved changes. Are you sure you want to discard?');
      if (!confirmDiscard) return;
    }
    onClose();
  };

  const getFormattedTiming = () => {
    if (useCustomTiming) return customTiming;
    if (selectedDays.length === 0) return 'No days selected';
    return `${selectedDays.join(', ')} | ${startTime} - ${endTime}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Inject the formatted timing
    onSubmit({
      ...data,
      timing: getFormattedTiming()
    });
    setIsDirty(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{initialData ? 'Reschedule Batch' : 'Create New Batch'}</h2>
            <p className="text-emerald-100 text-xs">Configure recurring class schedule and faculty</p>
          </div>
          <button onClick={handleCloseAttempt} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} onChange={() => setIsDirty(true)} className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Batch Name *</label>
              <input name="name" required defaultValue={initialData?.name} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" placeholder="e.g. Morning Star A" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Name *</label>
              <input name="course" required defaultValue={initialData?.course} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" placeholder="e.g. JEE Advance" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assign Expert Faculty *</label>
            <select name="teacherId" required defaultValue={initialData?.teacherId} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold">
              <option value="">Select a teacher...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Class Schedule (Recurring)</label>
              <button 
                type="button" 
                onClick={() => setUseCustomTiming(!useCustomTiming)}
                className="text-[10px] font-black text-emerald-600 uppercase hover:underline"
              >
                {useCustomTiming ? 'Use Time Picker' : 'Enter Manually'}
              </button>
            </div>

            {useCustomTiming ? (
              <input 
                value={customTiming}
                onChange={(e) => setCustomTiming(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" 
                placeholder="e.g. Every Monday 10 AM"
              />
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                        selectedDays.includes(day) 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' 
                          : 'bg-white border-gray-100 text-gray-400 hover:border-emerald-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-300 uppercase">Start Time</label>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => { setStartTime(e.target.value); setIsDirty(true); }}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-700" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-300 uppercase">End Time</label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => { setEndTime(e.target.value); setIsDirty(true); }}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-700" 
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-1">Schedule Summary</p>
                    <p className="text-sm font-bold text-emerald-900 leading-tight">
                      {getFormattedTiming()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={handleCloseAttempt} className="flex-1 py-4 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              Discard
            </button>
            <button type="submit" className="flex-2 grow bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-save"></i>
              {initialData ? 'Update Schedule' : 'Launch Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;
