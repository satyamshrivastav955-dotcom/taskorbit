import { useEffect, useState } from 'react';
import { dataStore } from '../services/dataService';
import { ROLE_PROFILES } from '../services/devAuth';
import type { Role } from '../types';

export function useUserNames(ids: string[]): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});
  const key = [...new Set(ids)].sort().join(',');

  useEffect(() => {
    const unique = [...new Set(key.split(',').filter((x) => x !== ''))];
    const out: Record<string, string> = {};
    for (const id of unique) {
      const storeUser = dataStore.getUserById(id);
      if (storeUser && storeUser.name) {
        out[id] = storeUser.name;
        continue;
      }
      // Check dev role profiles
      const devProfile = Object.values(ROLE_PROFILES).find((p) => p.uid === id);
      if (devProfile) {
        out[id] = devProfile.name;
        continue;
      }
      out[id] = id.slice(0, 6);
    }
    setNames(out);
  }, [key]);

  return names;
}
