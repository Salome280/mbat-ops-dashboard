"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isEmailAllowed } from "@/lib/allowedEmails";
import { listenToAuthChanges } from "@/lib/auth";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(currentUser => {
      setUser(currentUser);
      setInitializing(false);
      if (currentUser && !isEmailAllowed(currentUser.email)) {
        setUnauthorized(true);
      } else {
        setUnauthorized(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      // Not signed in, always send to /login for dashboard routes.
      if (pathname !== "/login") {
        router.replace("/login");
      }
    }
  }, [initializing, user, pathname, router]);

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-sm font-medium text-gray-800">
            Checking your access…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    // While redirecting to /login.
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-sm text-gray-700">
            Redirecting to secure login…
          </p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <h1 className="text-base font-semibold text-gray-900">
            Access not allowed
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            The signed-in account{" "}
            <span className="font-medium text-gray-900">{user.email}</span> is
            not on the approved access list for this internal dashboard.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Please sign out and try again with an allowed email address.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={async () => {
                await signOut(auth);
                router.replace("/login");
              }}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

