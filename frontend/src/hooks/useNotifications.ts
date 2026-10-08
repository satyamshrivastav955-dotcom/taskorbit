import { useEffect, useState } from 'react';
import { dataStore } from '../services/dataService';
import type { AppNotification } from '../types';

export function useNotifications(userId: string): { data: AppNotification[]; unread: number; reload: () => void } {
  const [, setTick] = useState(0);
  useEffect(() => dataStore.subscribe(() => setTick((value) => value + 1)), []);
  const data = userId === '' ? [] : dataStore.getNotifications(userId);
  return { data: data.slice(0, 10), unread: data.filter((notification) => !notification.read).length, reload: () => setTick((value) => value + 1) };
}
