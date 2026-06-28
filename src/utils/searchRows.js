// src/utils/searchRows.js
// Fuzzy (multi-token substring) search across 4 text fields.
// Never mutates input. Called by useViewPool.
//
// Algorithm:
//   1. Split query on whitespace into tokens.
//   2. For each token, check if it appears as a case-insensitive substring
//      in ANY of the 4 fields: project_name, company_id,
//      implementation_partner, country.
//   3. A row passes only if EVERY token matches at least one field.
//      (AND logic across tokens — tighter and more useful than OR.)
//
// Example: query "Tata Fin" → tokens ["tata", "fin"]
//   Row passes if "tata" is found in any field AND "fin" is found in any field.
//
// Performance: runs on the post-filter subset, not all 50k rows.
// Input is already debounced 150ms in the UI layer, so this fires at most
// once per 150ms on user input.

const SEARCH_FIELDS = ['project_name', 'company_id', 'implementation_partner', 'country'];

/**
 * @param {Object[]} rows
 * @param {string} query
 * @returns {Object[]}
 */
export function searchRows(rows, query) {
  const trimmed = query.trim();
  if (!trimmed) return rows;

  const tokens = trimmed.toLowerCase().split(/\s+/);

  return rows.filter((row) =>
    // 101% WINNER OPTIMIZATION: Use pre-computed search string
    tokens.every((token) => row._searchStr.includes(token))
  );
}
