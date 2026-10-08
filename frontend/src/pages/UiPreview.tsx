import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { TextArea } from '../components/ui/TextArea';
import { Table } from '../components/ui/Table';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Skeleton, EmptyState, ErrorState } from '../components/ui/State';

export function UiPreview(): JSX.Element {
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h1>UI Preview</h1>
      <h2>Buttons</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="danger">Danger</Button><Button variant="ghost">Ghost</Button>
      </div>
      <h2>Badges</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['todo', 'in_progress', 'submitted', 'in_review', 'revision', 'approved', 'conflict'].map((s) => <StatusBadge key={s} status={s} />)}
      </div>
      <h2>Card + Table</h2>
      <Card title="Brightline Logistics website">
        <Table headers={['Task', 'Status']}>
          <tr><td>Draft onboarding flow wireframes</td><td><StatusBadge status="in_progress" /></td></tr>
          <tr><td>Set up staging environment</td><td><StatusBadge status="submitted" /></td></tr>
        </Table>
      </Card>
      <h2>Form</h2>
      <Input label="Project title" placeholder="Kulkarni Textiles ERP" />
      <Select label="Priority" options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }]} />
      <TextArea label="Description" placeholder="Scope and milestones" />
      <h2>States</h2>
      <Skeleton rows={2} />
      <EmptyState text="No projects yet." action={<a href="/client/new">Create project</a>} />
      <ErrorState message="Failed to load." onRetry={() => undefined} />
    </div>
  );
}
