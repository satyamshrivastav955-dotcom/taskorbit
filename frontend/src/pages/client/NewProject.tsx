import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { dataStore } from '../../services/dataService';
import { uploadFiles } from '../../services/uploads';
import type { Priority } from '../../types';

export function NewProject(): JSX.Element {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDetails, setReqDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState('');

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (savedProjectId !== '') { nav(`/client/projects/${savedProjectId}`); return; }
    if (title.trim() === '' || startDate === '' || deadline === '') { setError('Title, start date and deadline are required.'); return; }
    if (new Date(deadline) < new Date(startDate)) { setError('Deadline must be on or after start date.'); return; }
    setPending(true);
    setError('');
    try {
      const project = await dataStore.createProject({
        title,
        description,
        priority,
        startDate,
        deadline,
      });
      setSavedProjectId(project.id);
      const uploaded = file === null ? [] : await uploadFiles(
        [file],
        dataStore.getActiveUser().uid,
        `projects/${project.id}/requirements/`,
      );
      if (reqTitle.trim() !== '') {
        await dataStore.addRequirement({
          projectId: project.id,
          title: reqTitle,
          details: reqDetails,
          files: uploaded.map(({ name, storagePath }) => ({ name, storagePath })),
        });
      } else if (uploaded.length > 0) {
        await dataStore.addRequirement({
          projectId: project.id,
          title: 'Project attachments',
          details: reqDetails,
          files: uploaded.map(({ name, storagePath }) => ({ name, storagePath })),
        });
      }
      nav(`/client/projects/${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create project');
    } finally {
      setPending(false);
    }
  }

  return (
    <AppLayout role="client" breadcrumb="Client / New Project">
      <PageContainer>
        <h1>New Project</h1>
        <form onSubmit={onSubmit}>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
            options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
          <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <h2>First requirement</h2>
          <Input label="Requirement title" value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} />
          <TextArea label="Details" value={reqDetails} onChange={(e) => setReqDetails(e.target.value)} />
          <Input label="Attach file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {error !== '' ? <p style={{ color: 'var(--red-500)' }}>{error}</p> : null}
          {savedProjectId !== '' && error !== '' ? <p>Your project is already saved. <Link to={`/client/projects/${savedProjectId}`}>Open the project</Link> to add the remaining requirements or files.</p> : <Button type="submit" pending={pending}>Create project</Button>}
        </form>
      </PageContainer>
    </AppLayout>
  );
}
