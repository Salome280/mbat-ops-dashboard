// Allow access to HEC domains (including subdomains)

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;

  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");
  if (parts.length !== 2) return false;

  const domain = parts[1];

  return (
    domain === "hec.edu" ||
    domain === "hec.fr" ||
    domain.endsWith(".hec.edu") ||
    domain.endsWith(".hec.fr")
  );
};