import React, { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
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

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type !== 'error') {
      setTimeout(() => { dismiss(id); }, 4000);
    }
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className={styles.portal} aria-live="polite" aria-atomic="false">
          {toasts.map((t) => (
            <div key={t.id} className={styles.toast} role="status">
              <span className={`${styles.bar} ${styles[t.type]}`} aria-hidden="true" />
              <span className={styles.content}>
                <span className={styles.msg}>{t.message}</span>
              </span>
              <button className={styles.close} onClick={() => { dismiss(t.id); }} aria-label="Dismiss">
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastCtx);
}
