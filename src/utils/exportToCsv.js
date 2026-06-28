import { COLUMNS } from '../hooks/useVirtualGrid';

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
 */
export function exportToCsv(activeViewPool) {
  if (!activeViewPool || activeViewPool.length === 0) return;

  // 1. Generate headers
  const headers = COLUMNS.map(c => escapeCsvValue(c.label)).join(',');

  // 2. Generate rows
  const rows = activeViewPool.map(row => {
    return COLUMNS.map(c => escapeCsvValue(row[c.key])).join(',');
  });

  // 3. Combine
  const csvContent = [headers, ...rows].join('\n');

  // 4. Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rpa_export_${new Date().getTime()}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
