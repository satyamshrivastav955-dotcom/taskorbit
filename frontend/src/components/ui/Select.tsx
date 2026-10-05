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
  return (
    <div className={styles.wrap}>
      <label htmlFor={fieldId} className={styles.label}>{label}</label>
      <select id={fieldId} className={styles.input} {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error !== undefined && error !== '' ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}
