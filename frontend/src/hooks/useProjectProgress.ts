import { useEffect, useState } from 'react';
import { dataStore } from '../services/dataService';
import type { Project } from '../types';

export function useProjectProgress(projects: Project[]): Record<string, number> {
  const [, setTick] = useState(0);
  useEffect(() => dataStore.subscribe(() => setTick((value) => value + 1)), []);
  return Object.fromEntries(projects.map((project) => [project.id, dataStore.getProjectById(project.id)?.progress ?? project.progress]));
}
