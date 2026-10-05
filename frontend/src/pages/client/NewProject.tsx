import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAppSelector } from '../../redux/hooks';
import { AppLayout, PageContainer } from '../../components/layout/AppLayout';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import type { Priority } from '../../types';

export function NewProject(): JSX.Element {
  const nav = useNavigate();
  const uid = useAppSelector((s) => s.session.uid);
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

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (title.trim() === '' || startDate === '' || deadline === '') { setError('Title, start date and deadline are required.'); return; }
    if (new Date(deadline) < new Date(startDate)) { setError('Deadline must be on or after start date.'); return; }
    setPending(true);
    setError('');
    try {
      const proj = await addDoc(collection(db, 'projects'), {
        title, description, clientId: uid, managerId: null,
        status: 'draft', priority, startDate: new Date(startDate), deadline: new Date(deadline), createdAt: new Date(),
      });
      let fileUrls: string[] = [];
      if (file !== null) {
        const r = ref(storage, `projects/${proj.id}/requirements/${Date.now()}-${file.name}`);
        await uploadBytes(r, file);
        fileUrls = [await getDownloadURL(r)];
      }
      if (reqTitle.trim() !== '') {
        await addDoc(collection(db, 'requirements'), {
          projectId: proj.id, title: reqTitle, details: reqDetails, fileUrls, createdAt: new Date(),
        });
      }
      await addDoc(collection(db, 'activityLogs'), {
        projectId: proj.id, actorId: uid, actorName: 'Client',
        action: 'created project', targetType: 'project', targetId: proj.id, createdAt: new Date(),
      });
      nav(`/client/${proj.id}`);
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
          <Button type="submit" pending={pending}>Create project</Button>
        </form>
      </PageContainer>
    </AppLayout>
  );
}
