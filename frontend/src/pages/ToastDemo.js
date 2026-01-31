import React from 'react';
import { useToast } from '../context/ToastContext';
import { Card, Button } from '../components/ModernComponents';

/**
 * TOAST DEMO PAGE
 * For testing and demonstrating the toast notification system
 * Access at /admin/toast-demo (can remove before production)
 */
const ToastDemo = () => {
  const { success, error, warning, info } = useToast();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Toast Notification Demo
        </h1>
        <p className="text-gray-600 mb-8">
          Click the buttons below to test different toast notification types.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Success Toast */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ✅ Success Toast
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Use for successful operations: exports completed, data saved, actions confirmed.
            </p>
            <Button
              variant="primary"
              onClick={() => success('Operation completed successfully!')}
            >
              Show Success Toast
            </Button>
          </Card>

          {/* Error Toast */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ❌ Error Toast
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Use for failures: network errors, validation errors, permission denied.
            </p>
            <Button
              variant="danger"
              onClick={() => error('Something went wrong. Please try again.')}
            >
              Show Error Toast
            </Button>
          </Card>

          {/* Warning Toast */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⚠️ Warning Toast
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Use for warnings: unsaved changes, approaching limits, deprecated features.
            </p>
            <Button
              variant="warning"
              onClick={() => warning('You have unsaved changes!')}
            >
              Show Warning Toast
            </Button>
          </Card>

          {/* Info Toast */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ℹ️ Info Toast
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Use for informational messages: tips, updates, neutral notifications.
            </p>
            <Button
              variant="secondary"
              onClick={() => info('New features are available!')}
            >
              Show Info Toast
            </Button>
          </Card>
        </div>

        {/* Multiple Toasts Test */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🔢 Multiple Toasts
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Test stacking multiple notifications at once.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                success('First notification');
                setTimeout(() => error('Second notification'), 300);
                setTimeout(() => warning('Third notification'), 600);
                setTimeout(() => info('Fourth notification'), 900);
              }}
            >
              Show Multiple Toasts
            </Button>
          </div>
        </Card>

        {/* Custom Duration Test */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ⏱️ Custom Duration
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Toasts can have custom durations. Default is 5 seconds.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => success('Quick toast (2s)', 2000)}
            >
              2 Second Toast
            </Button>
            <Button
              onClick={() => info('Standard toast (5s)', 5000)}
            >
              5 Second Toast (Default)
            </Button>
            <Button
              onClick={() => warning('Long toast (10s)', 10000)}
            >
              10 Second Toast
            </Button>
          </div>
        </Card>

        {/* Real-World Examples */}
        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            💡 Real-World Examples
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong className="text-green-700">Success Examples:</strong>
              <ul className="list-disc ml-5 text-gray-600 mt-1">
                <li>Students exported successfully!</li>
                <li>Profile updated successfully</li>
                <li>Announcement published</li>
                <li>Course created successfully</li>
              </ul>
            </div>
            <div>
              <strong className="text-red-700">Error Examples:</strong>
              <ul className="list-disc ml-5 text-gray-600 mt-1">
                <li>Export failed: Network error</li>
                <li>Failed to update profile: Invalid email</li>
                <li>Cannot delete: Course has active enrollments</li>
                <li>Upload failed: File too large</li>
              </ul>
            </div>
            <div>
              <strong className="text-yellow-700">Warning Examples:</strong>
              <ul className="list-disc ml-5 text-gray-600 mt-1">
                <li>You have unsaved changes</li>
                <li>Session will expire in 5 minutes</li>
                <li>Storage limit approaching (90% used)</li>
                <li>Some students have incomplete profiles</li>
              </ul>
            </div>
            <div>
              <strong className="text-blue-700">Info Examples:</strong>
              <ul className="list-disc ml-5 text-gray-600 mt-1">
                <li>New course materials available</li>
                <li>System maintenance scheduled for Sunday</li>
                <li>5 new students enrolled this week</li>
                <li>Export completed. Check your downloads folder.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ToastDemo;
