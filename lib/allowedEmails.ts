export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email.toLowerCase().endsWith("@hec.edu");
};
