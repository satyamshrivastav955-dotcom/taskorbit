import React from 'react';
import styles from './Input.module.css';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextArea({ label, error, id, ...rest }: Props): JSX.Element {
  const fieldId = id ?? label.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className={styles.wrap}>
      <label htmlFor={fieldId} className={styles.label}>{label}</label>
      <textarea id={fieldId} className={styles.input} rows={4} {...rest} />
      {error !== undefined && error !== '' ? <span className={styles.error}>{error}</span> : null}
    </div>
  );
}
