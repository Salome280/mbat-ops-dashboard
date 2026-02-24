// Allow access to all HEC email addresses

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;

  const normalized = email.trim().toLowerCase();

  // Allow all @hec.edu emails
  return normalized.endsWith("@hec.edu");
};