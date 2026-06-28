// src/utils/exportToCsv.js

const CSV_SCHEMA = [
  'project_id',
  'company_id',
  'project_name',
  'start_date',
  'completion_date',
  'project_status',
  'automation_type',
  'robots_deployed',
  'budget_usd',
  'annual_savings_usd',
  'roi_percent',
  'department',
  'implementation_partner',
  'country',
  'industry',
  'employee_hours_saved',
  'ai_enabled',
  'cloud_deployment'
];

/**
 * Escapes a string for CSV, wrapping in quotes if it contains commas, quotes, or newlines.
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports the activeViewPool (filtered/sorted rows) to a CSV file.
 * Uses native Blob and a hidden <a> tag (no external libraries).
 * Chunks processing using setTimeout to avoid blocking the main thread on large datasets.
 */
export function exportToCsv(activeViewPool) {
  if (!activeViewPool || activeViewPool.length === 0) return;

  const CHUNK_SIZE = 2500; // Process 2500 rows per tick to stay under 16ms frame budget
  const totalRows = activeViewPool.length;
  let currentIndex = 0;
  const csvChunks = [];

  // Generate and push headers first
  csvChunks.push(CSV_SCHEMA.join(','));

  function processChunk() {
    const end = Math.min(currentIndex + CHUNK_SIZE, totalRows);
    
    for (let i = currentIndex; i < end; i++) {
      const row = activeViewPool[i];
      const rowString = CSV_SCHEMA.map(key => escapeCsvValue(row[key])).join(',');
      csvChunks.push(rowString);
    }
    
    currentIndex = end;

    if (currentIndex < totalRows) {
      // Schedule next chunk to allow browser to paint and process other events (like the data stream)
      setTimeout(processChunk, 0);
    } else {
      // Done processing, combine and download
      const csvContent = csvChunks.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      // Use timestamp for filename
      const timestamp = new Date().getTime();
      link.setAttribute('download', `rpa_snapshot_${timestamp}.csv`);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // Start processing chunks
  setTimeout(processChunk, 0);
}
