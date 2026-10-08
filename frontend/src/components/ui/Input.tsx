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
        aria-required={required}
        aria-describedby={hasError ? `${fieldId}-error` : hint !== undefined && hint !== '' ? `${fieldId}-hint` : undefined}
        required={required}
        {...rest}
      />
      {hasError ? (
        <span id={`${fieldId}-error`} className={styles.error} role="alert">{error}</span>
      ) : hint !== undefined && hint !== '' ? (
        <span id={`${fieldId}-hint`} className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}
