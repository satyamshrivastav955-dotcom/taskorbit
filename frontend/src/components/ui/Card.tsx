import React from 'react';
import styles from './Card.module.css';

export function Card({ title, children }: { title?: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className={styles.card}>
      {title !== undefined && title !== '' ? <h3 className={styles.title}>{title}</h3> : null}
      {children}
    </section>
  );
}
