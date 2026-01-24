// Format date with timezone
export const formatWithTimezone = (date, timezone = null) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: userTimezone
    }).format(dateObj);
  } catch (error) {
    // Fallback to local time
    return dateObj.toLocaleString();
  }
};

// Get user's timezone
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

// Convert time to user's timezone
export const convertToTimezone = (date, targetTimezone) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  
  try {
    return dateObj.toLocaleString('en-US', {
      timeZone: targetTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return dateObj.toLocaleString();
  }
};

// Timezone display component
export const TimezoneDisplay = ({ className = '' }) => {
  const timezone = getUserTimezone();
  
  return (
    <div className={`text-sm text-slate-400 ${className}`}>
      🌍 {timezone}
    </div>
  );
};

// Format relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const dateObj = new Date(date);
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return dateObj.toLocaleDateString();
};

export default {
  formatWithTimezone,
  getUserTimezone,
  convertToTimezone,
  TimezoneDisplay,
  getRelativeTime
};
