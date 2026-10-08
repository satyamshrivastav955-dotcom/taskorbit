import React from 'react';
import styles from './Input.module.css';

interface Option { value: string; label: string; }
interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export function Select({ label, options, error, id, ...rest }: Props): JSX.Element {
  const fieldId = id ?? label.replace(/\s+/g, '-').toLowerCase();
  const hasError = error !== undefined && error !== '';
  return (
    <div className={styles.wrap}>
      <label htmlFor={fieldId} className={styles.label}>{label}</label>
      <select
        id={fieldId}
        className={`${styles.input} ${hasError ? styles.errorInput : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${fieldId}-error` : undefined}
        {...rest}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hasError ? <span id={`${fieldId}-error`} className={styles.error} role="alert">{error}</span> : null}
    </div>
  );
}
