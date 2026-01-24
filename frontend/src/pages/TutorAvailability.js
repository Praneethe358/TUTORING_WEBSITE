import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const TutorAvailability = () => {
  const [availability, setAvailability] = useState(days.map(d => ({ day: d, slots: [] })));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // could fetch existing availability here if needed
  }, []);

  const toggleSlot = (dayIndex, slot) => {
    setAvailability(prev => prev.map((day, idx) => {
      if (idx !== dayIndex) return day;
      const exists = day.slots.includes(slot);
      return { ...day, slots: exists ? day.slots.filter(s => s !== slot) : [...day.slots, slot] };
    }));
  };

  const slots = ['09:00-10:00','10:00-11:00','11:00-12:00','13:00-14:00','14:00-15:00','15:00-16:00'];

  const save = async () => {
    setError('');
    setMessage('');
    try {
      await api.post('/tutor/availability', { availability });
      setMessage('Availability saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-3xl font-semibold">Availability</h1>
        {message && <div className="text-sm text-emerald-400">{message}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
        <div className="space-y-3">
          {availability.map((day, idx) => (
            <div key={day.day} className="p-4 rounded-xl bg-slate-800 border border-slate-700">
              <p className="font-semibold mb-2">{day.day}</p>
              <div className="flex flex-wrap gap-2">
                {slots.map(slot => {
                  const active = day.slots.includes(slot);
                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(idx, slot)}
                      className={`px-3 py-1 rounded-lg border ${active ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-slate-700'}`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button onClick={save} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Save</button>
      </div>
    </div>
  );
};

export default TutorAvailability;
