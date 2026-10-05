import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { ActivityLog } from '../types';

export function useActivity(projectId: string): { data: ActivityLog[]; loading: boolean } {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    async function load(): Promise<void> {
      if (projectId === '') { setLoading(false); return; }
      const q = query(collection(db, 'activityLogs'), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (live) {
        setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ActivityLog, 'id'>) })));
        setLoading(false);
      }
    }
    void load();
    return () => { live = false; };
  }, [projectId]);

  return { data, loading };
}
