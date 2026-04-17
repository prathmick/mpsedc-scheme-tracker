/**
 * Format an ISO date string to a human-readable date/time.
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Mask Aadhaar: show only last 4 digits.
 * @param {string} aadhaar
 * @returns {string}
 */
export function maskAadhaar(aadhaar) {
  if (!aadhaar) return '—';
  const clean = String(aadhaar).replace(/\D/g, '');
  return 'XXXX-XXXX-' + clean.slice(-4);
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago").
 * @param {string} isoString
 * @returns {string}
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}
