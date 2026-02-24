import {
  ActionCodeSettings,
  User,
  UserCredential,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink
} from "firebase/auth";
import { auth } from "./firebase";

const STORAGE_KEY_EMAIL = "mbat-dashboard-email";

// For this internal tool we always run on localhost.
// Make sure Email/Password and Email link sign-in are enabled
// in the Firebase console for this project.
export const actionCodeSettings: ActionCodeSettings = {
  url: "http://localhost:3000/login",
  handleCodeInApp: true
};

export const sendMagicLink = async (email: string): Promise<void> => {
  const trimmed = email.trim();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY_EMAIL, trimmed);
  }
  await sendSignInLinkToEmail(auth, trimmed, actionCodeSettings);
};

export const isMagicLink = (url: string): boolean => {
  return isSignInWithEmailLink(auth, url);
};

export const completeSignInFromLink = async (
  url: string
): Promise<UserCredential> => {
  let email: string | null = null;
  if (typeof window !== "undefined") {
    email = window.localStorage.getItem(STORAGE_KEY_EMAIL);
  }

  if (!email) {
    // Fallback prompt in case the user opens the link in a different browser.
    // For this internal tool we can show a simple prompt.
    // eslint-disable-next-line no-alert
    email = window.prompt("Confirm your email to complete sign-in") ?? "";
  }

  const credential = await signInWithEmailLink(auth, email, url);

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY_EMAIL);
  }

  return credential;
};

export const listenToAuthChanges = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

