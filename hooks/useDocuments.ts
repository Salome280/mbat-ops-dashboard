import { useCallback, useEffect, useState } from "react";
import type { DocumentItem, DocumentSection } from "@/types/documents";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const STORAGE_KEY = "mbat_documents_v1";

export function useDocuments() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    setDocs(loadFromStorage<DocumentItem[]>(STORAGE_KEY, []));
  }, []);

  const persist = (next: DocumentItem[]) => {
    setDocs(next);
    saveToStorage(STORAGE_KEY, next);
  };

  const addDocument = useCallback(
    (doc: DocumentItem) => {
      persist([...docs, doc]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [docs]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      persist(docs.filter(d => d.id !== id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [docs]
  );

  const listBySection = useCallback(
    (section: DocumentSection) =>
      docs
        .filter(d => d.section === section)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [docs]
  );

  const listAll = useCallback(
    () =>
      [...docs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [docs]
  );

  return { addDocument, deleteDocument, listBySection, listAll };
}
