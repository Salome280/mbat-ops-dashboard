// Allow access to all HEC email domains

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;

  const normalized = email.trim().toLowerCase();

  return (
    normalized.endsWith("@hec.edu") ||
    normalized.endsWith("@hec.fr")
  );
};