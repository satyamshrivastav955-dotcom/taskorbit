import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Project } from '../types';

export function useProjectProgress(projects: Project[]): Record<string, number> {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const key = projects.map((p) => p.id).join(',');

  useEffect(() => {
    let live = true;
    async function load(): Promise<void> {
      const out: Record<string, number> = {};
      for (const p of projects) {
        try {
          const snap = await getDocs(query(collection(db, 'tasks'), where('projectId', '==', p.id)));
          const list = snap.docs.map((d) => d.data() as { status: string });
          out[p.id] = list.length === 0 ? 0 : list.filter((t) => t.status === 'approved').length / list.length;
        } catch {
          out[p.id] = 0;
        }
      }
      if (live) setProgress(out);
    }
    if (projects.length > 0) void load();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return progress;
}
