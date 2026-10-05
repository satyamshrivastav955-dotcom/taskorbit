import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Project } from '../types';

export function useProjects(clientId?: string): { data: Project[]; loading: boolean; error: string; reload: () => void } {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    async function load(): Promise<void> {
      setLoading(true);
      setError('');
      try {
        const ref = collection(db, 'projects');
        const q = clientId !== undefined && clientId !== ''
          ? query(ref, where('clientId', '==', clientId), orderBy('createdAt', 'desc'))
          : query(ref, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        if (live) setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) })));
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : 'Failed to load projects');
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();
    return () => { live = false; };
  }, [clientId, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}
