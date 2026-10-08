import { useEffect, useState } from 'react';
import { dataStore } from '../services/dataService';
import type { Project } from '../types';

export function useProjects(clientId?: string): { data: Project[]; loading: boolean; error: string; reload: () => void } {
  const [, setTick] = useState(0);
  useEffect(() => dataStore.subscribe(() => setTick((value) => value + 1)), []);
  const projects = dataStore.getProjects().filter((project) => clientId === undefined || clientId === '' || project.clientId === clientId);
  return { data: projects, loading: dataStore.isLoading(), error: '', reload: () => setTick((value) => value + 1) };
}
