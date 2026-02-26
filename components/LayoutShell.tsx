"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TaskSection } from "@/types/tasks";

const SECTIONS: TaskSection[] = [
  "Dashboard Summary",
  "Marketing Communication",
  "Merchandise",
  "Finance and Legal",
  "School Relationships",
  "Sponsorship"
];

type NavSection = TaskSection | "Settings";

interface LayoutShellProps {
  activeSection: NavSection;
  onSectionChange: (section: TaskSection) => void;
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  activeSection,
  onSectionChange,
  children
}) => {
  const pathname = usePathname();
  const isSettingsActive = pathname === "/settings" || activeSection === "Settings";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-semibold">
              MB
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                MBAT Operations
              </p>
              <p className="text-xs text-gray-500">Internal dashboard</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {SECTIONS.map(section => {
            const isActive = !isSettingsActive && activeSection === section;
            return (
              <button
                key={section}
                onClick={() => onSectionChange(section)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-accent text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{section}</span>
              </button>
            );
          })}
          <Link
            href="/settings"
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition ${
              isSettingsActive
                ? "bg-accent text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile top tabs */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-base font-semibold text-gray-900">
                MBAT Operations
              </p>
              <p className="text-xs text-gray-500">Internal dashboard</p>
            </div>
          </div>
          <div className="flex overflow-x-auto border-t border-gray-100">
            {SECTIONS.map(section => {
              const isActive = !isSettingsActive && activeSection === section;
              return (
                <button
                  key={section}
                  onClick={() => onSectionChange(section)}
                  className={`whitespace-nowrap px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? "border-b-2 border-accent text-accent"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {section}
                </button>
              );
            })}
            <Link
              href="/settings"
              className={`whitespace-nowrap px-4 py-2 text-xs font-medium transition ${
                isSettingsActive
                  ? "border-b-2 border-accent text-accent"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Settings
            </Link>
          </div>
        </div>

        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
};
