import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { getUserTimezone, COMMON_TIMEZONES } from '../utils/timezoneUtils';
import { PageLoader } from '../components/LoadingStates';
import { EnhancedAlert, SectionHeader } from '../components/EnhancedComponents';

const TutorAvailability = () => {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const timeSlots = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
  
  const [availability, setAvailability] = useState(days.map(d => ({ 
    day: d, 
    startTime: '09:00', 
    endTime: '17:00',
    isAvailable: true 
  })));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preset, setPreset] = useState('custom');
  const [timezone, setTimezone] = useState(getUserTimezone());
  const [showTimezoneInfo, setShowTimezoneInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tutor/availability');
      if (res.data.availability) {
        setAvailability(res.data.availability);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch availability');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateDayTime = (dayIndex, field, value) => {
    setAvailability(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  const toggleDayAvailability = (dayIndex) => {
    setAvailability(prev => prev.map((day, idx) => 
      idx === dayIndex ? { ...day, isAvailable: !day.isAvailable } : day
    ));
  };

  const applyPreset = (presetType) => {
    setPreset(presetType);
    const updatedAvailability = availability.map(day => {
      switch(presetType) {
        case '9-5':
          return { ...day, startTime: '09:00', endTime: '17:00', isAvailable: true };
        case 'evenings':
          return { ...day, startTime: '17:00', endTime: '21:00', isAvailable: true };
        case 'weekends':
          return { ...day, isAvailable: day.day === 'Saturday' || day.day === 'Sunday' };
        case 'weekdays':
          return { ...day, isAvailable: day.day !== 'Saturday' && day.day !== 'Sunday', startTime: '09:00', endTime: '17:00' };
        case 'full-time':
          return { ...day, startTime: '07:00', endTime: '21:00', isAvailable: true };
        default:
          return day;
      }
    });
    setAvailability(updatedAvailability);
  };

  const setAllDays = (startTime, endTime) => {
    setAvailability(prev => prev.map(day => ({
      ...day,
      startTime,
      endTime,
      isAvailable: true
    })));
  };

  const save = async () => {
    setError('');
    setMessage('');
    try {
      // Save with timezone information
      const availabilityWithTz = availability.map(slot => ({
        ...slot,
        timezone: timezone
      }));
      await api.post('/tutor/availability', { availability: availabilityWithTz, timezone });
      setMessage('Availability saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const getDayColor = (day) => {
    if (!day.isAvailable) return 'bg-slate-50 opacity-60 border-slate-200';
    return 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:-translate-y-0.5';
  };

  if (loading) {
    return <PageLoader message="Loading availability..." />;
  }

  return (
    <div className="px-3 sm:px-6 py-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        <SectionHeader 
          title="Class Availability" 
          subtitle="Set your available hours for student bookings"
        />
          
        {/* Timezone Selector */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Your Timezone</label>
            <button
              onClick={() => setShowTimezoneInfo(!showTimezoneInfo)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
            >
              {showTimezoneInfo ? 'Hide info' : 'Why this matters?'}
            </button>
          </div>
          <select 
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
          >
            {COMMON_TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
          {showTimezoneInfo && (
            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg animate-slideInUp">
              <p className="text-xs text-indigo-900 font-medium">
                ℹ️ Your availability will be stored with timezone information. Students in different timezones will see times converted to their local time.
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <EnhancedAlert type="success" title="Success">
            {message}
          </EnhancedAlert>
        )}
        {error && (
          <EnhancedAlert type="error" title="Error">
            {error}
          </EnhancedAlert>
        )}

        {/* Quick Presets */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Presets</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
            {[
              { id: '9-5', label: '9 AM - 5 PM' },
              { id: 'evenings', label: 'Evenings (5-9 PM)' },
              { id: 'weekdays', label: 'Weekdays Only' },
              { id: 'weekends', label: 'Weekends Only' },
              { id: 'full-time', label: 'Full Time (7-9)' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-sm min-h-[44px] active:scale-95 ${
                  preset === p.id
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Set All Days</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 sm:flex-none">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time</label>
              <select 
                onChange={(e) => setAllDays(e.target.value, availability[0].endTime)}
                className="w-full sm:w-auto px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 min-h-[44px]"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 sm:flex-none">
              <label className="block text-sm font-semibold text-slate-700 mb-2">End Time</label>
              <select 
                onChange={(e) => setAllDays(availability[0].startTime, e.target.value)}
                className="w-full sm:w-auto px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 min-h-[44px]"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Weekly Schedule</h2>
          <div className="space-y-3 sm:space-y-4">
            {availability.map((day, idx) => (
              <div key={day.day} className={`p-3 sm:p-4 rounded-xl border transition ${getDayColor(day)}`}>
                {/* Mobile Layout - Stacked */}
                <div className="flex flex-col sm:hidden gap-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 text-lg">{day.day}</p>
                    <button
                      onClick={() => toggleDayAvailability(idx)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm min-h-[40px] active:scale-95 ${
                        day.isAvailable
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                          : 'bg-slate-200 border-2 border-slate-300 text-slate-700'
                      }`}
                    >
                      {day.isAvailable ? '✓ Available' : 'Unavailable'}
                    </button>
                  </div>
                  
                  {day.isAvailable && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">From</label>
                        <select 
                          value={day.startTime}
                          onChange={(e) => updateDayTime(idx, 'startTime', e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 min-h-[44px]"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">To</label>
                        <select 
                          value={day.endTime}
                          onChange={(e) => updateDayTime(idx, 'endTime', e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 min-h-[44px]"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {!day.isAvailable && (
                    <p className="text-slate-500 italic text-sm font-medium">Not available this day</p>
                  )}
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-32">
                      <p className="font-bold text-slate-900 text-lg">{day.day}</p>
                    </div>
                    
                    {day.isAvailable ? (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold text-slate-700">From:</label>
                          <select 
                            value={day.startTime}
                            onChange={(e) => updateDayTime(idx, 'startTime', e.target.value)}
                            className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold text-slate-700">To:</label>
                          <select 
                            value={day.endTime}
                            onChange={(e) => updateDayTime(idx, 'endTime', e.target.value)}
                            className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic font-medium">Not available</p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleDayAvailability(idx)}
                    className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 text-sm active:scale-95 ${
                      day.isAvailable
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-slate-200 border-2 border-slate-300 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {day.isAvailable ? '✓ Available' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-900/30 border border-indigo-700 rounded-xl p-3 sm:p-4">
          <p className="text-indigo-300 text-sm leading-relaxed">
            💡 Your availability helps students find slots to book classes with you. Make sure to keep it updated!
          </p>
        </div>

        {/* Save Button */}
        <button 
          onClick={save}
          className="w-full sm:w-auto px-8 py-4 sm:py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium transition text-base min-h-[48px]"
        >
          Save Availability
        </button>
      </div>
    </div>
  );
};

export default TutorAvailability;
