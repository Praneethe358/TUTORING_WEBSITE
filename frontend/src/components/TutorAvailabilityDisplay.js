import React from 'react';

/**
 * TUTOR AVAILABILITY DISPLAY COMPONENT
 * Used by students and admin to view tutor's availability
 */
const TutorAvailabilityDisplay = ({ tutorId, tutorName, availability }) => {
  if (!availability || availability.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Availability</h3>
        <p className="text-slate-400">No availability information available</p>
      </div>
    );
  }

  const getDayStatus = (day) => {
    if (!day.isAvailable) {
      return { available: false, text: 'Not Available' };
    }
    return { 
      available: true, 
      text: `${day.startTime} - ${day.endTime}` 
    };
  };

  const getHoursPerWeek = () => {
    return availability
      .filter(d => d.isAvailable)
      .reduce((total, d) => {
        const [startH, startM] = d.startTime.split(':').map(Number);
        const [endH, endM] = d.endTime.split(':').map(Number);
        const hours = (endH + endM / 60) - (startH + startM / 60);
        return total + hours;
      }, 0)
      .toFixed(1);
  };

  const getTotalSlots = () => {
    return availability.filter(d => d.isAvailable).length;
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">📅 Class Availability</h3>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Available Days</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{getTotalSlots()}/7</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Hours Per Week</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{getHoursPerWeek()}h</p>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="space-y-2">
          {availability.map((day, idx) => {
            const status = getDayStatus(day);
            return (
              <div 
                key={day.day}
                className={`p-4 rounded-lg border transition ${
                  status.available 
                    ? 'bg-slate-900 border-slate-700' 
                    : 'bg-slate-900/50 border-slate-700/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${status.available ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                    <span className="font-medium text-white w-24">{day.day}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    status.available ? 'text-emerald-300' : 'text-slate-400'
                  }`}>
                    {status.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Info */}
      <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
        <p className="text-indigo-300 text-sm">
          💡 You can book a class during {tutorName}'s available hours. Choose a time slot that works best for you!
        </p>
      </div>
    </div>
  );
};

export default TutorAvailabilityDisplay;
