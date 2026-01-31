import React, { useEffect, useState } from 'react';
import api from '../lib/api';

/**
 * TUTOR UPLOAD MATERIALS PAGE
 * 
 * Upload and manage study materials for students
 * - File upload interface
 * - Material categories
 * - Visibility controls (public/private)
 * - File list management
 */
const TutorMaterials = () => {
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    visibility: 'public',
    file: null
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials/tutor/materials');
      setMaterials(res.data.materials || []);
      setError(null);
    } catch (err) {
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadError('File size must be less than 50MB');
        return;
      }
      setFormData({ ...formData, file });
      setUploadError(null);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.file) {
      setUploadError('Please fill all required fields');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      uploadFormData.append('visibility', formData.visibility);
      uploadFormData.append('file', formData.file);
      const res = await api.post('/materials/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMaterials(prev => [res.data.material, ...prev]);
      setSuccess(true);
      setUploading(false);
      setFormData({ title: '', description: '', category: '', visibility: 'public', file: null });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload file');
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await api.delete(`/materials/${materialId}`);
      setMaterials(prev => prev.filter(m => m._id !== materialId));
    } catch (err) {
      alert('Failed to delete material');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Materials</h1>
        <p className="text-slate-400 mt-1">Share study resources with your students</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
          Material uploaded successfully!
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Upload New Material</h2>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                placeholder="e.g., Algebra Basics"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
              >
                <option value="">Select category</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">File</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xlsx,.xls,.jpg,.jpeg,.png,.gif"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Max size: 50MB. Supported: PDF, Word, PowerPoint, Excel, Images, Text</p>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the material..."
              rows="3"
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-2">Visibility</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="text-indigo-600 w-4 h-4"
                />
                <span className="text-white">Public (all students)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="text-indigo-600 w-4 h-4"
                />
                <span className="text-white">Private (selected students)</span>
              </label>
            </div>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {uploadError}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition disabled:opacity-50 min-h-[44px]"
          >
            {uploading ? 'Uploading...' : 'Upload Material'}
          </button>
        </form>
      </div>

      {/* Materials List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-700">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Uploaded Materials</h2>
        </div>
        {loading ? (
          <p className="p-6 text-slate-400">Loading materials...</p>
        ) : materials.length === 0 ? (
          <p className="p-6 text-slate-400">No materials uploaded yet. Upload your first material above!</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Size</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Upload Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Visibility</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {materials.map(material => (
                    <tr key={material._id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-sm text-white font-medium">{material.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{(material.fileSize / 1024 / 1024).toFixed(2)}MB</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{material.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(material.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          material.visibility === 'public' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-blue-900 text-blue-300'
                        }`}>
                          {material.visibility}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeleteMaterial(material._id)} className="text-sm text-red-400 hover:text-red-300 transition min-h-[44px]">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-700">
              {materials.map(material => (
                <div key={material._id} className="p-4 hover:bg-slate-700/50">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium flex-1">{material.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      material.visibility === 'public' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-blue-900 text-blue-300'
                    }`}>
                      {material.visibility}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-slate-300">
                    <p><span className="text-slate-400">Category:</span> {material.category}</p>
                    <p><span className="text-slate-400">Size:</span> {(material.fileSize / 1024 / 1024).toFixed(2)}MB</p>
                    <p><span className="text-slate-400">Uploaded:</span> {new Date(material.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteMaterial(material._id)} 
                    className="mt-3 w-full px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-lg text-sm font-medium transition min-h-[44px]"
                  >
                    Delete Material
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TutorMaterials;
