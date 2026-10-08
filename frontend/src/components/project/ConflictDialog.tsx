import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import styles from './ConflictResolutionModal.module.css';

export interface ConflictItem { taskTitle: string; range: string; }
export interface AssigneeOption { id: string; name: string; }

export function ConflictDialog({ assignee, items, assignees, onAssign, onDates, onReassign, pending = false }: {
  assignee: string;
  items: ConflictItem[];
  assignees: AssigneeOption[];
  onAssign: () => void;
  onDates: () => void;
  onReassign: (assigneeId: string) => void;
  pending?: boolean;
}): JSX.Element {
  const [picked, setPicked] = useState('');
  return (
    <Modal title="Resolve schedule overlap" onClose={() => { if (!pending) onDates(); }} pending={pending} wide>
      <p className={styles.warn}><AlertTriangle size={16} strokeWidth={1.75} /> This assignee has work scheduled in the selected dates.</p>
      <div className={styles.details}>
        <p><b>Conflict Type:</b> Overlapping dates</p>
        <p><b>Current Assignee:</b> {assignee}</p>
        <p><b>Overlaps With:</b> {items.map((i) => `${i.taskTitle} (${i.range})`).join(', ')}</p>
      </div>
      <h4>Resolution Options</h4>
      <div className={styles.row}>
        <Button variant="secondary" onClick={onAssign} pending={pending}>Assign anyway</Button>
      </div>
      <div className={styles.row}>
        <Select label="Choose another assignee" value={picked} disabled={pending}
          onChange={(e) => setPicked(e.target.value)}
          options={[{ value: '', label: 'Choose assignee' }, ...assignees.map((a) => ({ value: a.id, label: a.name }))]} />
        <Button variant="secondary" onClick={() => { if (picked !== '') onReassign(picked); }} disabled={picked === '' || pending}>
          Reassign
        </Button>
      </div>
      <div className={styles.row}>
        <Button variant="secondary" onClick={onDates} disabled={pending}>Change dates</Button>
      </div>
    </Modal>
  );
}
