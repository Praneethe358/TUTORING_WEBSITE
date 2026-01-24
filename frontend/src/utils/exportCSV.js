// Export data to CSV format
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object keys
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let value = row[header];
      
      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes if contains comma
      const escaped = ('' + value).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    
    csvRows.push(values.join(','));
  }
  
  // Create blob and download
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Export button component
export const ExportCSVButton = ({ data, filename, label = 'Export CSV', className = '' }) => {
  const handleExport = () => {
    exportToCSV(data, filename);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className={`px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      📥 {label}
    </button>
  );
};

export default { exportToCSV, ExportCSVButton };
