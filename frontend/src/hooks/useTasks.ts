import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Task } from '../types';

interface Filter { projectId?: string; assigneeId?: string; reviewerId?: string; }

export function useTasks(filter: Filter): { data: Task[]; loading: boolean; error: string; reload: () => void } {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const key = `${filter.projectId ?? ''}|${filter.assigneeId ?? ''}|${filter.reviewerId ?? ''}|${tick}`;

  useEffect(() => {
    let live = true;
    async function load(): Promise<void> {
      setLoading(true);
      setError('');
      try {
        const ref = collection(db, 'tasks');
        const clauses = [];
        if (filter.projectId) clauses.push(where('projectId', '==', filter.projectId));
        if (filter.assigneeId) clauses.push(where('assigneeId', '==', filter.assigneeId));
        if (filter.reviewerId) clauses.push(where('reviewerId', '==', filter.reviewerId));
        const q = query(ref, ...clauses, orderBy('deadline', 'asc'));
        const snap = await getDocs(q);
        if (live) setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) })));
      } catch (e) {
        if (live) setError(e instanceof Error ? e.message : 'Failed to load tasks');
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}
