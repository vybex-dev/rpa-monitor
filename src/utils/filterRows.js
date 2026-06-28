// src/utils/filterRows.js
// Pure filter function — applies multi-select categorical filters.
// Never mutates input. Called by useViewPool.
//
// filters shape:
//   {
//     automation_type: Set<string>,   // empty Set = "show all"
//     department:      Set<string>,
//     industry:        Set<string>,
//   }
//
// Note on mutating fields: per the CSV schema, automation_type / department /
// industry are NOT mutated by dataStream.js (only numeric fields are noised).
// So a row that passes the filter at upsert time will always pass it — we
// don't need to re-check filtered-out rows on every batch. The pipeline still
// re-runs on rowMap change (which is a new Map reference), so correctness
// is guaranteed regardless.

/**
 * @param {Object[]} rows
 * @param {{ automation_type: Set, department: Set, industry: Set }} filters
 * @returns {Object[]}
 */
export function filterRows(rows, filters) {
  const { automation_type, department, industry } = filters;

  const noFilters =
    automation_type.size === 0 &&
    department.size === 0 &&
    industry.size === 0;

  if (noFilters) return rows;

  return rows.filter((row) => {
    if (automation_type.size > 0 && !automation_type.has(row.automation_type)) return false;
    if (department.size > 0 && !department.has(row.department)) return false;
    if (industry.size > 0 && !industry.has(row.industry)) return false;
    return true;
  });
}
