import { useEffect, useState } from 'react';
import { dataStore } from '../services/dataService';
import type { ActivityLog } from '../types';

export function useActivity(projectId: string): { data: ActivityLog[]; loading: boolean } {
  const [, setTick] = useState(0);
  useEffect(() => dataStore.subscribe(() => setTick((value) => value + 1)), []);
  return { data: projectId === '' ? [] : dataStore.getActivities(projectId), loading: dataStore.isLoading() };
}
