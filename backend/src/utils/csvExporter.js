'use strict';

/**
 * Escape a CSV field value: wrap in quotes if it contains comma, quote, or newline.
 * @param {*} value
 * @returns {string}
 */
function escapeField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Mask Aadhaar: replace first 8 digits with 'XXXX-XXXX-', keep last 4.
 * @param {string} aadhaar
 * @returns {string}
 */
function maskAadhaar(aadhaar) {
  if (!aadhaar) return '';
  const clean = String(aadhaar).replace(/\D/g, '');
  if (clean.length < 4) return aadhaar;
  return 'XXXX-XXXX-' + clean.slice(-4);
}

/**
 * Generate a CSV string from an array of application objects.
 * Columns: Application ID, Citizen Name, Citizen Aadhaar (masked), Scheme Name,
 *          District, Status, Created At, Updated At, Officer Name
 * @param {object[]} applications
 * @returns {string}
 */
function generateCsv(applications) {
  const headers = [
    'Application ID',
    'Citizen Name',
    'Citizen Aadhaar',
    'Scheme Name',
    'District',
    'Status',
    'Created At',
    'Updated At',
    'Officer Name',
  ];

  const rows = applications.map((app) => [
    escapeField(app.id),
    escapeField(app.citizenName),
    escapeField(maskAadhaar(app.citizenAadhaar)),
    escapeField(app.schemeName),
    escapeField(app.district),
    escapeField(app.status),
    escapeField(app.createdAt),
    escapeField(app.updatedAt),
    escapeField(app.officerName),
  ]);

  const lines = [headers.join(','), ...rows.map((r) => r.join(','))];
  return lines.join('\n');
}

module.exports = { generateCsv, maskAadhaar };
