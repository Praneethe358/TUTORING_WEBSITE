import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Keyboard shortcuts hook
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if user is typing in input/textarea
      const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      
      // Build key combination string (e.g., "ctrl+s", "shift+n")
      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('ctrl');
      if (e.shiftKey) keys.push('shift');
      if (e.altKey) keys.push('alt');
      keys.push(e.key.toLowerCase());
      
      const combo = keys.join('+');
      
      // Find matching shortcut
      const shortcut = shortcuts.find(s => s.keys === combo);
      
      if (shortcut && (!isTyping || shortcut.allowInInput)) {
        e.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
};

// Common shortcuts for dashboard navigation
export const useDashboardShortcuts = (role) => {
  const navigate = useNavigate();
  
  const shortcuts = [
    // Navigation shortcuts
    { keys: 'ctrl+h', action: () => navigate(`/${role}/dashboard`), description: 'Go to Home' },
    { keys: 'ctrl+m', action: () => navigate(`/${role}/messages`), description: 'Go to Messages' },
    { keys: 'ctrl+p', action: () => navigate(`/${role}/profile`), description: 'Go to Profile' },
    { keys: 'ctrl+s', action: () => navigate(`/${role}/settings`), description: 'Go to Settings' },
    
    // Action shortcuts
    { keys: 'ctrl+/', action: () => showShortcutsModal(), description: 'Show shortcuts' },
    { keys: 'esc', action: () => window.history.back(), description: 'Go back' },
  ];

  // Role-specific shortcuts
  if (role === 'student') {
    shortcuts.push(
      { keys: 'ctrl+f', action: () => navigate('/tutors'), description: 'Find Tutors' },
      { keys: 'ctrl+b', action: () => navigate('/student/bookings'), description: 'My Bookings' }
    );
  } else if (role === 'tutor') {
    shortcuts.push(
      { keys: 'ctrl+c', action: () => navigate('/tutor/manage-classes'), description: 'Manage Classes' },
      { keys: 'ctrl+a', action: () => navigate('/tutor/availability'), description: 'Availability' }
    );
  } else if (role === 'admin') {
    shortcuts.push(
      { keys: 'ctrl+t', action: () => navigate('/admin/tutors'), description: 'Manage Tutors' },
      { keys: 'ctrl+u', action: () => navigate('/admin/students'), description: 'Manage Students' }
    );
  }

  useKeyboardShortcuts(shortcuts);
  
  return shortcuts;
};

// Shortcuts modal display
const showShortcutsModal = () => {
  // Create modal dynamically
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-slate-800 rounded-xl max-w-2xl w-full p-6 border border-slate-700">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-white">⌨️ Keyboard Shortcuts</h2>
        <button onclick="this.closest('.fixed').remove()" class="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="space-y-2">
        <div class="flex justify-between py-2 border-b border-slate-700">
          <span class="text-slate-300">Go to Home</span>
          <kbd class="px-2 py-1 bg-slate-900 rounded text-sm text-slate-400">Ctrl + H</kbd>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-700">
          <span class="text-slate-300">Go to Messages</span>
          <kbd class="px-2 py-1 bg-slate-900 rounded text-sm text-slate-400">Ctrl + M</kbd>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-700">
          <span class="text-slate-300">Go to Profile</span>
          <kbd class="px-2 py-1 bg-slate-900 rounded text-sm text-slate-400">Ctrl + P</kbd>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-700">
          <span class="text-slate-300">Go to Settings</span>
          <kbd class="px-2 py-1 bg-slate-900 rounded text-sm text-slate-400">Ctrl + S</kbd>
        </div>
        <div class="flex justify-between py-2 border-b border-slate-700">
          <span class="text-slate-300">Go Back</span>
          <kbd class="px-2 py-1 bg-slate-900 rounded text-sm text-slate-400">Esc</kbd>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-slate-300">Show this help</span>
          <kbd class="px-2 py-1 bg-slate-900 rounded text-sm text-slate-400">Ctrl + /</kbd>
        </div>
      </div>
      <p class="mt-4 text-xs text-slate-500 text-center">Use Cmd instead of Ctrl on Mac</p>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close on Escape
  const closeOnEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      window.removeEventListener('keydown', closeOnEscape);
    }
  };
  window.addEventListener('keydown', closeOnEscape);
};

export default { useKeyboardShortcuts, useDashboardShortcuts };
