// Whitelist of emails allowed to access the MBAT dashboard.
// Update this list with the internal MBAT / school addresses.
export const allowedEmails: string[] = ["salome.mabuse@hec.edu"];

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return allowedEmails.some(e => e.trim().toLowerCase() === normalized);
};

