import styles from './Input.module.css';

export function FileUpload({ label, onPick }: { label: string; onPick: (f: File | null) => void }): JSX.Element {
  const fieldId = label.replace(/\s+/g, '-').toLowerCase();
  return (
    <div className={styles.wrap}>
      <label htmlFor={fieldId} className={styles.label}>{label}</label>
      <input
        id={fieldId}
        type="file"
        className={styles.input}
        onChange={(e) => onPick(e.target.files !== null && e.target.files.length > 0 ? e.target.files[0] : null)}
      />
    </div>
  );
}
