import React from 'react';
import styles from './Input.module.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export function Input({ label, error, id, required, hint, className, ...rest }: Props): JSX.Element {
  const fieldId = id ?? label.replace(/\s+/g, '-').toLowerCase();
  const hasError = error !== undefined && error !== '';
  return (
    <div className={styles.wrap}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
        {required === true ? <span className={styles.labelRequired}> (required)</span> : null}
      </label>
      <input
        id={fieldId}
        className={`${styles.input} ${hasError ? styles.errorInput : ''} ${className ?? ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {hasError ? (
        <span id={`${fieldId}-error`} className={styles.error} role="alert">{error}</span>
      ) : hint !== undefined && hint !== '' ? (
        <span className={styles.error} style={{ color: 'var(--text-muted)' }}>{hint}</span>
      ) : null}
    </div>
  );
}
