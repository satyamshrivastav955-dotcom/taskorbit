import { useEffect, useState } from 'react';
import { dataStore } from '../services/dataService';
import type { Task } from '../types';

interface Filter { projectId?: string; assigneeId?: string; reviewerId?: string; }

export function useTasks(filter: Filter): { data: Task[]; loading: boolean; error: string; reload: () => void } {
  const [, setTick] = useState(0);
  useEffect(() => dataStore.subscribe(() => setTick((value) => value + 1)), []);
  const data = dataStore.getTasks(filter);
  return { data, loading: dataStore.isLoading(), error: '', reload: () => setTick((value) => value + 1) };
}
