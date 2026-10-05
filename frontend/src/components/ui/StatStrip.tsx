import styles from './StatStrip.module.css';

export interface StatCell {
  label: string;
  value: number | string;
  context?: string;
  danger?: boolean;
}

export function StatStrip({ cells }: { cells: StatCell[] }): JSX.Element {
  return (
    <div className={styles.strip}>
      {cells.map((c) => (
        <div key={c.label} className={styles.cell}>
          <p className={styles.label}>{c.label}</p>
          <p className={`${styles.value} ${c.danger === true ? styles.danger : ''}`}>{c.value}</p>
          {c.context !== undefined ? <p className={styles.context}>{c.context}</p> : null}
        </div>
      ))}
    </div>
  );
}
