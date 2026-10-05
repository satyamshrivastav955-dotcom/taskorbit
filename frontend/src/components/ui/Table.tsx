import React from 'react';
import styles from './Table.module.css';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  emptyText?: string;
  emptyAction?: React.ReactNode;
  rowCount?: number;
}

export function Table({
  headers,
  children,
  toolbar,
  footer,
  emptyText,
  emptyAction,
  rowCount,
}: TableProps): JSX.Element {
  return (
    <div className={styles.wrap}>
      {toolbar !== undefined ? <div className={styles.toolbar}>{toolbar}</div> : null}
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rowCount === 0 && emptyText !== undefined ? (
            <tr className={styles.emptyRow}>
              <td colSpan={headers.length}>
                <span style={{ fontWeight: 500, color: 'var(--text)', fontSize: 14 }}>{emptyText}</span>
                {emptyAction !== undefined ? <span style={{ marginLeft: 8 }}>{emptyAction}</span> : null}
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
      {footer !== undefined ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}
