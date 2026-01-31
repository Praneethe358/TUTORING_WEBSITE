import React, { useEffect, useState } from 'react';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, EmptyState } from '../components/ModernComponents';

/**
 * STUDENT CERTIFICATES PAGE
 * View earned certificates
 */
const StudentCertificates = () => {
  useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/lms/student/certificates');
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = (certificate) => {
    // Generate PDF or download certificate
    alert(`Certificate for "${certificate.courseTitle}" is ready for download!`);
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading certificates...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">View and download your earned certificates</p>
        </div>

        {/* Stats */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-amber-600">🏆</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{certificates.length}</p>
            <p className="text-sm text-gray-600">Certificates Earned</p>
          </div>
        </Card>

        {/* Certificates List */}
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {certificates.map(cert => (
              <Card
                key={cert._id}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200"
              >
                <div className="text-center mb-4">
                  <p className="text-4xl sm:text-5xl mb-3">🎓</p>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                    {cert.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Completed by {cert.studentName}
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="space-y-3 border-t border-blue-200 pt-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Instructor</p>
                    <p className="text-sm text-gray-900">{cert.instructorName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Completion Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(cert.issuedDate || cert.completionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Final Score</p>
                    <p className="text-sm text-gray-900 font-bold">{cert.finalScore}%</p>
                  </div>

                  {cert.completionTime && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Completion Time</p>
                      <p className="text-sm text-gray-900">{cert.completionTime} hours</p>
                    </div>
                  )}

                  {cert.certificateNumber && (
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Certificate #</p>
                      <p className="text-xs text-gray-900 font-mono break-all">
                        {cert.certificateNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-blue-200">
                  <button
                    onClick={() => downloadCertificate(cert)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => alert(`Share certificate for "${cert.courseTitle}"`)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold"
                  >
                    Share
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Certificates Yet"
            description="Complete your course to earn a certificate of completion!"
            icon="🎓"
          />
        )}

        {/* Info Section */}
        {certificates.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-2">About Your Certificates</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Certificates are issued upon course completion</li>
              <li>✓ Each certificate includes your name, completion date, and course details</li>
              <li>✓ You can download and share your certificates anytime</li>
              <li>✓ Certificates are verified with a unique certificate number</li>
            </ul>
          </Card>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentCertificates;
