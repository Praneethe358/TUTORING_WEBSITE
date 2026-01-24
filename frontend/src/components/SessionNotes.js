import React, { useState, useEffect } from 'react';
import api from '../lib/api';

export const SessionNotes = ({ classId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState({ content: '', isPrivate: false });
  const [editingNote, setEditingNote] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (classId) {
      loadNotes();
    }
  }, [classId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/session-notes/class/${classId}`);
      setNotes(res.data.notes || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (e) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;

    try {
      await api.post('/session-notes', {
        classId,
        content: newNote.content,
        isPrivate: newNote.isPrivate
      });
      
      setNewNote({ content: '', isPrivate: false });
      setShowForm(false);
      loadNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
      alert(error.response?.data?.message || 'Failed to create note');
    }
  };

  const updateNote = async (e) => {
    e.preventDefault();
    if (!editingNote) return;

    try {
      await api.put(`/session-notes/${editingNote._id}`, {
        content: editingNote.content,
        isPrivate: editingNote.isPrivate
      });
      
      setEditingNote(null);
      loadNotes();
    } catch (error) {
      console.error('Failed to update note:', error);
      alert(error.response?.data?.message || 'Failed to update note');
    }
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await api.delete(`/session-notes/${noteId}`);
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert(error.response?.data?.message || 'Failed to delete note');
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Session Notes</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm transition"
        >
          {showForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {/* New Note Form */}
      {showForm && (
        <form onSubmit={createNote} className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            placeholder="Write a note about this session..."
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
            required
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={newNote.isPrivate}
                onChange={(e) => setNewNote({ ...newNote, isPrivate: e.target.checked })}
                className="rounded"
              />
              Private (only visible to me)
            </label>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm transition"
            >
              Save Note
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No notes yet</p>
        ) : (
          notes.map(note => (
            <div key={note._id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              {editingNote?._id === note._id ? (
                <form onSubmit={updateNote} className="space-y-3">
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingNote.isPrivate}
                        onChange={(e) => setEditingNote({ ...editingNote, isPrivate: e.target.checked })}
                        className="rounded"
                      />
                      Private
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm transition"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingNote(null)}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{note.author?.name || 'Unknown'}</p>
                      {note.isPrivate && (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">Private</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="text-slate-400 hover:text-indigo-400 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNote(note._id)}
                        className="text-slate-400 hover:text-red-400 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(note.createdAt).toLocaleString()}
                    {note.updatedAt !== note.createdAt && ' (edited)'}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionNotes;
