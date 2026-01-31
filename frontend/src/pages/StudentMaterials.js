import React, { useEffect, useState } from 'react';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';

/**
 * STUDENT MATERIALS PAGE
 * 
 * Browse and download materials from tutors
 * - View all available materials
 * - Filter by tutor and category
 * - Download materials
 * - Track download history
 */
const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTutor, setFilterTutor] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [downloading, setDownloading] = useState({});
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    // Cleanup preview URL when component unmounts or preview changes
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials/student/materials');
      setMaterials(res.data.materials || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialId, fileName) => {
    try {
      setDownloading(prev => ({ ...prev, [materialId]: true }));
      
      const res = await api.get(`/materials/${materialId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download material');
    } finally {
      setDownloading(prev => ({ ...prev, [materialId]: false }));
    }
  };

  const handlePreview = async (material) => {
    try {
      const res = await api.get(`/materials/${material._id}/download`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: material.fileType || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
      setPreviewMaterial(material);
    } catch (err) {
      console.error('Preview failed:', err);
      alert('Failed to preview material. You can try downloading it instead.');
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setPreviewMaterial(null);
  };

  const isPreviewable = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'mp4', 'webm'].includes(ext);
  };

  const filteredMaterials = materials.filter(m => {
    const matchTutor = !filterTutor || m.tutor?.name?.toLowerCase().includes(filterTutor.toLowerCase());
    const matchCategory = !filterCategory || m.category === filterCategory;
    return matchTutor && matchCategory;
  });

  const categories = [...new Set(materials.map(m => m.category).filter(Boolean))];
  const tutors = [...new Set(materials.map(m => m.tutor?.name).filter(Boolean))];

  return (
    <StudentDashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Study Materials</h1>
        <p className="text-sm text-gray-500 mt-1">Download resources shared by tutors</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Filter by Tutor</label>
            <select
              value={filterTutor}
              onChange={(e) => setFilterTutor(e.target.value)}
              className="w-full px-4 py-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            >
              <option value="">All tutors</option>
              {tutors.map(tutor => (
                <option key={tutor} value={tutor}>{tutor}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            >
              <option value="">All categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials List */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading materials...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No materials available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMaterials.map(material => (
            <div
              key={material._id}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:border-indigo-500 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{material.title}</h3>
                  <p className="text-sm text-gray-500">{material.tutor?.name}</p>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex-shrink-0">
                  {material.category}
                </span>
              </div>

              {material.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 sm:line-clamp-3">{material.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <span>{(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                <span>{new Date(material.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                {isPreviewable(material.fileName) && (
                  <button
                    onClick={() => handlePreview(material)}
                    className="flex-1 px-3 sm:px-4 py-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition min-h-[44px]"
                  >
                    Preview
                  </button>
                )}
                <button
                  onClick={() => handleDownload(material._id, material.fileName)}
                  disabled={downloading[material._id]}
                  className={`${isPreviewable(material.fileName) ? 'flex-1' : 'w-full'} px-3 sm:px-4 py-3 sm:py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition disabled:opacity-50 min-h-[44px]`}
                >
                  {downloading[material._id] ? 'Downloading...' : 'Download'}
                </button>
              </div>

              {material.downloads > 0 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {material.downloads} {material.downloads === 1 ? 'download' : 'downloads'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={closePreview}>
          <div className="relative bg-slate-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-white">{previewMaterial.title}</h3>
                <p className="text-sm text-slate-400">{previewMaterial.fileName}</p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-4 overflow-auto max-h-[calc(90vh-140px)]">
              {previewMaterial.fileName?.match(/\.(pdf)$/i) && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0 rounded-lg"
                  title="PDF Preview"
                />
              )}
              {previewMaterial.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) && (
                <img
                  src={previewUrl}
                  alt={previewMaterial.title}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              )}
              {previewMaterial.fileName?.match(/\.(mp4|webm)$/i) && (
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {previewMaterial.fileName?.match(/\.(txt)$/i) && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0 rounded-lg bg-white"
                  title="Text Preview"
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(previewMaterial._id, previewMaterial.fileName)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentDashboardLayout>
  );
};

export default StudentMaterials;
