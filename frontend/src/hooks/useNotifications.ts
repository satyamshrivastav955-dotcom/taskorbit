import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { AppNotification } from '../types';

export function useNotifications(userId: string): { data: AppNotification[]; unread: number; reload: () => void } {
  const [data, setData] = useState<AppNotification[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    async function load(): Promise<void> {
      if (userId === '') return;
      const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      if (live) setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppNotification, 'id'>) })));
    }
    void load();
    return () => { live = false; };
  }, [userId, tick]);

  return { data, unread: data.filter((n) => !n.read).length, reload: () => setTick((t) => t + 1) };
}
