import React, { useEffect, useState } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, Button } from '../components/ModernComponents';

/**
 * ADMIN LMS REPORTS PAGE
 * Comprehensive analytics and trends
 */
const AdminLmsReports = () => {
  useAuth();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/lms/admin/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setExportLoading(true);
      if (type === 'grades') {
        const res = await api.get('/lms/admin/export/grades', { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'lms-grades.csv');
        document.body.appendChild(link);
        link.click();
      } else if (type === 'progress') {
        const res = await api.get('/lms/admin/export/progress', { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'lms-progress.csv');
        document.body.appendChild(link);
        link.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">LMS Reports & Analytics</h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">Comprehensive insights and trends</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleExport('grades')}
              disabled={exportLoading}
              className="bg-green-600 text-white hover:bg-green-500 text-xs sm:text-sm min-h-[44px] sm:min-h-[auto] w-full sm:w-auto"
            >
              {exportLoading ? '⏳ Exporting...' : '📥 Grades CSV'}
            </Button>
            <Button
              onClick={() => handleExport('progress')}
              disabled={exportLoading}
              className="bg-indigo-600 text-white hover:bg-indigo-500 text-xs sm:text-sm min-h-[44px] sm:min-h-[auto] w-full sm:w-auto"
            >
              {exportLoading ? '⏳ Exporting...' : '📥 Progress CSV'}
            </Button>
          </div>
        </div>

        {/* Enrollment Trends */}
        {reports?.enrollmentTrend && (
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Enrollment Trend (Last 30 Days)</h2>
            {reports.enrollmentTrend.length > 0 ? (
              <div>
                <div className="flex items-end gap-1 h-40">
                  {reports.enrollmentTrend.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-blue-600 rounded-t hover:bg-blue-700 transition group relative"
                      style={{
                        height: `${(item.count / Math.max(...reports.enrollmentTrend.map(i => i.count))) * 100}%`
                      }}
                      title={`${item._id}: ${item.count} enrollments`}
                    >
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {item._id}: {item.count}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>{reports.enrollmentTrend[0]?._id}</span>
                  <span>{reports.enrollmentTrend[reports.enrollmentTrend.length - 1]?._id}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No enrollment data</p>
            )}
          </Card>
        )}

        {/* Completion Trends */}
        {reports?.completionTrend && (
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Course Completions (Last 30 Days)</h2>
            {reports.completionTrend.length > 0 ? (
              <div>
                <div className="flex items-end gap-1 h-40">
                  {reports.completionTrend.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-green-600 rounded-t hover:bg-green-700 transition group relative"
                      style={{
                        height: `${(item.count / Math.max(...reports.completionTrend.map(i => i.count))) * 100}%`
                      }}
                      title={`${item._id}: ${item.count} completions`}
                    >
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        {item._id}: {item.count}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>{reports.completionTrend[0]?._id}</span>
                  <span>{reports.completionTrend[reports.completionTrend.length - 1]?._id}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No completion data</p>
            )}
          </Card>
        )}

        {/* Category Performance */}
        {reports?.categoryPerformance && (
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Performance by Category</h2>
            <div className="space-y-3">
              {reports.categoryPerformance.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cat._id || 'Uncategorized'}</p>
                    <p className="text-xs text-gray-600">
                      {cat.courseCount} courses • {cat.totalEnrollments} enrollments
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{Math.round(cat.avgProgress || 0)}%</p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.round(cat.avgProgress || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Student Performance Distribution */}
        {reports?.studentPerformance && (
          <Card>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Student Performance Distribution</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {reports.studentPerformance.excellent || 0}
                </p>
                <p className="text-sm text-gray-600">Excellent (90%+)</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {reports.studentPerformance.good || 0}
                </p>
                <p className="text-sm text-gray-600">Good (75-89%)</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.studentPerformance.average || 0}
                </p>
                <p className="text-sm text-gray-600">Average (50-74%)</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {reports.studentPerformance.poor || 0}
                </p>
                <p className="text-sm text-gray-600">Poor (&lt;50%)</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {reports?.enrollmentTrend?.reduce((sum, item) => sum + item.count, 0) || 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total New Enrollments (30d)</p>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {reports?.completionTrend?.reduce((sum, item) => sum + item.count, 0) || 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Total Completions (30d)</p>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">
              {reports?.categoryPerformance?.length || 0}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Active Categories</p>
          </Card>
        </div>

        {/* Export Section */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">Export Reports</h3>
          <p className="text-xs sm:text-sm text-gray-700 mb-4">
            Download comprehensive reports in CSV format for further analysis in Excel or other tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => handleExport('grades')}
              className="bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm min-h-[44px] sm:min-h-[auto] w-full sm:w-auto"
            >
              📊 Export Grades Report
            </Button>
            <Button
              onClick={() => handleExport('progress')}
              className="bg-green-600 text-white hover:bg-green-700 text-xs sm:text-sm min-h-[44px] sm:min-h-[auto] w-full sm:w-auto"
            >
              📊 Export Progress Report
            </Button>
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminLmsReports;
