import React from 'react';
import styles from './Input.module.css';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, id, ...rest }: Props): JSX.Element {
  const fieldId = id ?? label.replace(/\s+/g, '-').toLowerCase();
  const hasError = error !== undefined && error !== '';
  return (
    <div className={styles.wrap}>
      <label htmlFor={fieldId} className={styles.label}>{label}</label>
      <textarea
        id={fieldId}
        className={`${styles.input} ${hasError ? styles.errorInput : ''}`}
        rows={4}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {hasError ? <span id={`${fieldId}-error`} className={styles.error} role="alert">{error}</span> : null}
    </div>
  );
}
