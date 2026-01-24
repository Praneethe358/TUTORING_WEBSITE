import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
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

  useEffect(() => {
    fetchMaterials();
  }, []);

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

  const filteredMaterials = materials.filter(m => {
    const matchTutor = !filterTutor || m.tutor?.name?.toLowerCase().includes(filterTutor.toLowerCase());
    const matchCategory = !filterCategory || m.category === filterCategory;
    return matchTutor && matchCategory;
  });

  const categories = [...new Set(materials.map(m => m.category))];
  const tutors = [...new Set(materials.map(m => m.tutor?.name))];

  return (
    <DashboardLayout sidebar={StudentSidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Study Materials</h1>
        <p className="text-slate-400 mt-1">Download resources shared by tutors</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Filter by Tutor</label>
            <select
              value={filterTutor}
              onChange={(e) => setFilterTutor(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All tutors</option>
              {tutors.map(tutor => (
                <option key={tutor} value={tutor}>{tutor}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading materials...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No materials available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(material => (
            <div
              key={material._id}
              className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-indigo-500 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{material.title}</h3>
                  <p className="text-sm text-slate-400">{material.tutor?.name}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-900 text-indigo-300 rounded-full text-xs font-medium">
                  {material.category}
                </span>
              </div>

              {material.description && (
                <p className="text-sm text-slate-300 mb-4 line-clamp-3">{material.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>{(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                <span>{new Date(material.createdAt).toLocaleDateString()}</span>
              </div>

              <button
                onClick={() => handleDownload(material._id, material.fileName)}
                disabled={downloading[material._id]}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition disabled:opacity-50"
              >
                {downloading[material._id] ? 'Downloading...' : 'Download'}
              </button>

              {material.downloads > 0 && (
                <p className="text-xs text-slate-500 mt-2 text-center">
                  {material.downloads} {material.downloads === 1 ? 'download' : 'downloads'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentMaterials;
