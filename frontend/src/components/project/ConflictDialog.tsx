import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface ConflictItem { taskTitle: string; range: string; }

export function ConflictDialog({
  assignee,
  items,
  onAssign,
  onDates,
  onAssignee,
}: {
  assignee: string;
  items: ConflictItem[];
  onAssign: () => void;
  onDates: () => void;
  onAssignee: () => void;
}): JSX.Element {
  const conflicts = items.map((i) => `'${i.taskTitle}' (${i.range})`).join(', ');

  return (
    <Modal
      title="Scheduling conflict"
      onClose={onDates}
      footer={
        <>
          <Button variant="secondary" onClick={onAssignee}>Pick another assignee</Button>
          <Button variant="secondary" onClick={onDates}>Change dates</Button>
          <Button variant="dangerFilled" onClick={onAssign}>Assign anyway</Button>
        </>
      }
    >
      <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
        {assignee} already has {conflicts}. Assigning anyway will create an overlap.
      </p>
    </Modal>
  );
}
