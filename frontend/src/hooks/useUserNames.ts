import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useUserNames(ids: string[]): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});
  const key = [...new Set(ids)].sort().join(',');

  useEffect(() => {
    let live = true;
    async function load(): Promise<void> {
      const unique = [...new Set(key.split(',').filter((x) => x !== ''))];
      const out: Record<string, string> = {};
      for (const id of unique) {
        try {
          const snap = await getDoc(doc(db, 'users', id));
          if (snap.exists()) out[id] = (snap.data() as { name?: string }).name ?? id.slice(0, 6);
        } catch {
          out[id] = id.slice(0, 6);
        }
      }
      if (live) setNames(out);
    }
    if (key !== '') void load();
    return () => { live = false; };
  }, [key]);

  return names;
}
