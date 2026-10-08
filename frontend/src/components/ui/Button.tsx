import React from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'dangerFilled' | 'ghost';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  pending?: boolean;
}

export function Button({
  variant = 'primary',
  pending = false,
  disabled,
  children,
  className,
  ...rest
}: Props): JSX.Element {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${className ?? ''}`}
      disabled={disabled === true || pending}
      aria-disabled={disabled === true || pending}
      aria-busy={pending}
      {...rest}
    >
      {pending ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {pending ? 'Saving…' : children}
    </button>
  );
}
