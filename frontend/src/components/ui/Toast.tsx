import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastCtx = createContext<ToastContextValue>({ toast: () => undefined });
let _id = 0;

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_id;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    if (type !== 'error') {
      const timer = window.setTimeout(() => dismiss(id), 4500);
      timers.current.push(timer);
    }
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className={styles.portal} aria-live="polite" aria-atomic="false">
          {toasts.map((item) => {
            const Icon = item.type === 'success' ? CheckCircle2 : item.type === 'error' ? CircleAlert : Info;
            return (
              <div key={item.id} className={styles.toast} role={item.type === 'error' ? 'alert' : 'status'}>
                <span className={`${styles.bar} ${styles[item.type]}`} aria-hidden="true" />
                <span className={styles.content}>
                  <Icon size={17} className={`${styles.icon} ${styles[item.type]}`} aria-hidden="true" />
                  <span className={styles.msg}>{item.message}</span>
                </span>
                <button className={styles.close} type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss notification">
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastCtx);
}
