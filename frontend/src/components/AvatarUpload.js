import React, { useState, useEffect } from 'react';
import api from '../lib/api';

export const AvatarUpload = ({ currentAvatar, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatar || '');

  useEffect(() => {
    setPreview(currentAvatar || '');
  }, [currentAvatar]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploading(true);
      const res = await api.post('/avatar/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (onUploadSuccess) {
        onUploadSuccess(res.data.avatar);
      }
      
      alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.message || 'Failed to upload avatar');
      setPreview(currentAvatar || '');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your profile picture?')) return;

    try {
      setUploading(true);
      await api.delete('/avatar/delete');
      setPreview('');
      
      if (onUploadSuccess) {
        onUploadSuccess('');
      }
      
      alert('Avatar deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert(error.response?.data?.message || 'Failed to delete avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {preview ? (
          <img
            src={preview.startsWith('data:') ? preview : `http://localhost:5000${preview}`}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-700"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-3xl font-bold">
            ?
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium cursor-pointer transition">
          {preview ? 'Change Photo' : 'Upload Photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {preview && (
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition disabled:opacity-50"
          >
            Remove
          </button>
        )}

        <p className="text-xs text-slate-400">
          Max 5MB • JPG, PNG, GIF
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;
