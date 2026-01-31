import React, { useState, useRef } from 'react';
import { Button } from './ModernUI';
import { colors, typography, spacing, shadows, borderRadius } from '../theme/designSystem';
import api from '../lib/api';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoUpdate, userType = 'student' }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(
    currentPhoto && currentPhoto.startsWith('http') 
      ? currentPhoto 
      : currentPhoto 
        ? `http://localhost:5000${currentPhoto}` 
        : null
  );
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('photo', file);

      const endpoint = userType === 'student' 
        ? '/upload/student/photo' 
        : '/upload/tutor/photo';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.avatar) {
        const fullUrl = response.data.avatar.startsWith('http') 
          ? response.data.avatar 
          : `http://localhost:5000${response.data.avatar}`;
        setPreview(fullUrl);
        onPhotoUpdate(fullUrl);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload photo');
      setPreview(currentPhoto);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    try {
      setUploading(true);
      setError('');

      const endpoint = userType === 'student' 
        ? '/upload/student/photo' 
        : '/upload/tutor/photo';

      await api.delete(endpoint);

      setPreview(null);
      onPhotoUpdate(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete photo');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: spacing.lg,
    }}>
      {/* Photo Preview */}
      <div style={{
        position: 'relative',
        width: '150px',
        height: '150px',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: preview 
            ? `url(${preview}) center/cover no-repeat` 
            : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.white,
          boxShadow: shadows.lg,
          border: `4px solid ${colors.white}`,
        }}>
          {!preview && getInitials(currentPhoto)}
        </div>

        {uploading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.white}`,
              borderTop: `4px solid transparent`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: colors.error + '15',
          border: `1px solid ${colors.error}`,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          color: colors.error,
          fontSize: typography.fontSize.sm,
          textAlign: 'center',
          width: '100%',
          maxWidth: '300px',
        }}>
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: spacing.md,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="photo-upload-input"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          size="sm"
        >
          {preview ? '📷 Change Photo' : '📷 Upload Photo'}
        </Button>

        {preview && (
          <Button
            onClick={handleDelete}
            disabled={uploading}
            variant="secondary"
            size="sm"
          >
            🗑️ Remove Photo
          </Button>
        )}
      </div>

      <p style={{
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        textAlign: 'center',
        margin: 0,
        maxWidth: '300px',
      }}>
        Accepted formats: JPEG, PNG, GIF, WebP<br/>
        Maximum file size: 5MB
      </p>
    </div>
  );
};

export default ProfilePhotoUpload;
