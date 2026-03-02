import { useCallback, useEffect, useState } from "react";
import type { MeetingMinute, MeetingSection } from "@/types/meetingMinutes";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const STORAGE_KEY = "mbat_meeting_minutes_v1";

export function useMeetingMinutes(section: MeetingSection) {
  const [all, setAll] = useState<MeetingMinute[]>([]);

  useEffect(() => {
    setAll(loadFromStorage<MeetingMinute[]>(STORAGE_KEY, []));
  }, []);

  const persist = (next: MeetingMinute[]) => {
    setAll(next);
    saveToStorage(STORAGE_KEY, next);
  };

  const minutes = all
    .filter(m => m.section === section)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const addMinute = useCallback(
    (draft: Omit<MeetingMinute, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const entry: MeetingMinute = {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };
      persist([...all, entry]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all]
  );

  const updateMinute = useCallback(
    (id: string, patch: Partial<Omit<MeetingMinute, "id" | "section" | "createdAt">>) => {
      persist(
        all.map(m =>
          m.id === id
            ? { ...m, ...patch, updatedAt: new Date().toISOString() }
            : m
        )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all]
  );

  const deleteMinute = useCallback(
    (id: string) => {
      persist(all.filter(m => m.id !== id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all]
  );

  return { minutes, addMinute, updateMinute, deleteMinute };
}
