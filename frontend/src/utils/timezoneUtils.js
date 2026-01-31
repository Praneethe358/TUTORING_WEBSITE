/**
 * TIMEZONE UTILITY
 * Handles timezone conversions for availability and bookings
 */

// Get user's timezone
export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Convert time string (HH:MM) from one timezone to another
export function convertTimeBetweenTimezones(timeString, date, fromTz, toTz) {
  if (!timeString || !date) return timeString;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Create date in source timezone
    const sourceDate = new Date(date);
    sourceDate.setHours(hours, minutes, 0, 0);
    
    // Convert to ISO string and parse in target timezone
    const isoString = sourceDate.toLocaleString('en-US', { timeZone: fromTz, hour12: false });
    const targetString = new Date(isoString).toLocaleString('en-US', { 
      timeZone: toTz, 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    return targetString;
  } catch (err) {
    console.error('Timezone conversion error:', err);
    return timeString;
  }
}

// Format time for display with timezone
export function formatTimeWithTimezone(timeString, timezone) {
  if (!timeString) return '';
  
  try {
    const abbr = new Date().toLocaleString('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    }).split(' ').pop();
    
    return `${timeString} ${abbr}`;
  } catch (err) {
    return timeString;
  }
}

// Convert UTC timestamp to local time
export function utcToLocal(utcDate, timezone = getUserTimezone()) {
  if (!utcDate) return null;
  
  try {
    const date = new Date(utcDate);
    return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  } catch (err) {
    return new Date(utcDate);
  }
}

// Convert local time to UTC
export function localToUTC(localDate, timezone = getUserTimezone()) {
  if (!localDate) return null;
  
  try {
    const dateStr = localDate.toLocaleString('en-US', { timeZone: timezone });
    return new Date(dateStr);
  } catch (err) {
    return localDate;
  }
}

// Get timezone offset in hours
export function getTimezoneOffset(timezone) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart?.value || 'UTC';
  } catch (err) {
    return 'UTC';
  }
}

// Format availability slot with timezone awareness
export function formatAvailabilitySlot(slot, displayTimezone = null) {
  const tz = displayTimezone || getUserTimezone();
  const storedTz = slot.timezone || 'UTC';
  
  // If timezones match, no conversion needed
  if (tz === storedTz) {
    return {
      ...slot,
      startTime: slot.startTime,
      endTime: slot.endTime,
      displayTimezone: tz
    };
  }
  
  // Convert times
  const date = slot.specificDate || new Date();
  const convertedStart = convertTimeBetweenTimezones(slot.startTime, date, storedTz, tz);
  const convertedEnd = convertTimeBetweenTimezones(slot.endTime, date, storedTz, tz);
  
  return {
    ...slot,
    originalStartTime: slot.startTime,
    originalEndTime: slot.endTime,
    originalTimezone: storedTz,
    startTime: convertedStart,
    endTime: convertedEnd,
    displayTimezone: tz
  };
}

// Prepare availability data for storage (convert to UTC)
export function prepareAvailabilityForStorage(availability, localTimezone = null) {
  const tz = localTimezone || getUserTimezone();
  
  return availability.map(slot => {
    if (slot.timezone === 'UTC' || !slot.startTime || !slot.endTime) return slot;
    
    try {
      const date = slot.specificDate || new Date();
      const utcStart = convertTimeBetweenTimezones(slot.startTime, date, tz, 'UTC');
      const utcEnd = convertTimeBetweenTimezones(slot.endTime, date, tz, 'UTC');
      
      return {
        ...slot,
        startTime: utcStart,
        endTime: utcEnd,
        timezone: 'UTC'
      };
    } catch (err) {
      return slot;
    }
  });
}

// Calculate booking time in user's timezone
export function calculateBookingTime(classDate, classTime, tutorTimezone, userTimezone = null) {
  const tz = userTimezone || getUserTimezone();
  
  if (tutorTimezone === tz) {
    return { date: classDate, time: classTime, timezone: tz };
  }
  
  const converted = convertTimeBetweenTimezones(classTime, classDate, tutorTimezone, tz);
  
  return {
    date: classDate,
    time: converted,
    timezone: tz,
    originalTime: classTime,
    originalTimezone: tutorTimezone
  };
}

// Common timezone list for dropdown
export const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Phoenix', label: 'Arizona' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Athens', label: 'Athens (EET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Shanghai', label: 'China (CST)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' }
];

const timezoneUtils = {
  getUserTimezone,
  convertTimeBetweenTimezones,
  formatTimeWithTimezone,
  utcToLocal,
  localToUTC,
  getTimezoneOffset,
  formatAvailabilitySlot,
  prepareAvailabilityForStorage,
  calculateBookingTime,
  COMMON_TIMEZONES
};

export default timezoneUtils;
