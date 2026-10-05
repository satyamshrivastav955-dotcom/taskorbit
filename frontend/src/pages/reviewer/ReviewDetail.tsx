import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  MessageSquare,
  Check,
  Layers,
} from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ReviewDecisionModal } from '../../components/modals/ReviewDecisionModal';
import { dataStore } from '../../services/demoData';
import type { Task, Project, UserProfile } from '../../types';
import styles from './ReviewDetail.module.css';

interface AnnotationPin {
  id: string;
  number: number;
  x: number; // percentage
  y: number; // percentage
  author: string;
  time: string;
  comment: string;
}

export function ReviewDetail(): JSX.Element {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const allTasks: Task[] = dataStore.getTasks();
  const task = allTasks.find((t: Task) => t.id === id) || allTasks.find((t: Task) => t.status === 'in_review') || allTasks[0];
  const allProjects: Project[] = dataStore.getProjects();
  const project = allProjects.find((p: Project) => p.id === task?.projectId);
  const users: UserProfile[] = dataStore.getUsers();
  const assignee = users.find((u: UserProfile) => u.uid === task?.assigneeId);

  const [version, setVersion] = useState<'v2' | 'v1'>('v2');
  const [zoom, setZoom] = useState<number>(100);
  const [activeTool, setActiveTool] = useState<'pin' | 'area' | 'comment'>('pin');
  const [selectedPinId, setSelectedPinId] = useState<string | null>('pin-1');
  const [newCommentText, setNewCommentText] = useState('');

  // Modals
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Color palette complies with WCAG AA contrast standards', checked: true },
    { id: 'c2', label: 'Responsive layout verified across Desktop (1440px) and Mobile (375px)', checked: true },
    { id: 'c3', label: 'Interactive component states (hover, focus, disabled) provided', checked: true },
    { id: 'c4', label: 'Typography matches design tokens and hierarchy', checked: false },
  ]);

  // Visual pins state
  const [pins, setPins] = useState<AnnotationPin[]>([
    {
      id: 'pin-1',
      number: 1,
      x: 34,
      y: 28,
      author: 'Marcus Brody',
      time: '12m ago',
      comment: 'Header text contrast is currently 3.8:1. Needs minimum 4.5:1 for accessibility.',
    },
    {
      id: 'pin-2',
      number: 2,
      x: 72,
      y: 52,
      author: 'Marcus Brody',
      time: '9m ago',
      comment: 'Action button corner radius should be 8px instead of 4px to match design system.',
    },
    {
      id: 'pin-3',
      number: 3,
      x: 48,
      y: 78,
      author: 'Elena Rostova',
      time: '5m ago',
      comment: 'Addressed the data table overflow handling. Scrollbar now appears horizontally.',
    },
  ]);

  const handleToggleChecklist = (checkId: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === checkId ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'pin') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newPin: AnnotationPin = {
      id: `pin-${Date.now()}`,
      number: pins.length + 1,
      x,
      y,
      author: 'Marcus Brody (Reviewer)',
      time: 'Just now',
      comment: 'Click below to write your feedback for this spot.',
    };

    setPins((prev) => [...prev, newPin]);
    setSelectedPinId(newPin.id);
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    if (selectedPinId) {
      setPins((prev) =>
        prev.map((p) =>
          p.id === selectedPinId ? { ...p, comment: newCommentText.trim() } : p
        )
      );
      setNewCommentText('');
    }
  };

  const handleConfirmDecision = (decision: 'approved' | 'revision', feedbackNotes: string) => {
    dataStore.reviewTask(task.id, decision === 'approved' ? 'approved' : 'rejected', feedbackNotes);
    setDecisionModalOpen(false);
    navigate('/reviewer/queue');
  };

  return (
    <AppLayout role="reviewer">
      <div className={styles.container}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <button className={styles.backBtn} onClick={() => navigate('/reviewer/queue')}>
              <ArrowLeft size={16} />
              <span>Back to Queue</span>
            </button>
            <h1 className={styles.taskTitle}>{task?.title || 'Deliverable Review'}</h1>
            <div className={styles.metaChips}>
              <span className={styles.projectChip}>{project?.title || 'Project'}</span>
              <StatusBadge status={task?.status || 'in_review'} />
              <PriorityBadge priority={task?.priority || 'high'} />
            </div>
          </div>

          <div className={styles.actionsArea}>
            <button
              className={styles.btnRevise}
              onClick={() => setDecisionModalOpen(true)}
            >
              <AlertCircle size={16} />
              <span>Request Revision</span>
            </button>
            <button
              className={styles.btnApprove}
              onClick={() => setDecisionModalOpen(true)}
            >
              <CheckCircle2 size={16} />
              <span>Approve Deliverable</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Review Layout */}
        <div className={styles.mainGrid}>
          {/* Left Column: Interactive Deliverable Canvas */}
          <div className={styles.canvasCard}>
            <div className={styles.canvasToolbar}>
              {/* Version Switcher */}
              <div className={styles.versionSelectGroup}>
                <span className={styles.versionLabel}>Version</span>
                <button
                  className={`${styles.versionBtn} ${version === 'v2' ? styles.activeVersionBtn : ''}`}
                  onClick={() => setVersion('v2')}
                >
                  v2 (Current)
                </button>
                <button
                  className={`${styles.versionBtn} ${version === 'v1' ? styles.activeVersionBtn : ''}`}
                  onClick={() => setVersion('v1')}
                >
                  v1 (Initial)
                </button>
              </div>

              {/* Annotation Tools */}
              <div className={styles.toolGroup}>
                <button
                  className={`${styles.toolBtn} ${activeTool === 'pin' ? styles.activeToolBtn : ''}`}
                  onClick={() => setActiveTool('pin')}
                >
                  <MapPin size={14} />
                  <span>Pin Point</span>
                </button>
                <button
                  className={`${styles.toolBtn} ${activeTool === 'comment' ? styles.activeToolBtn : ''}`}
                  onClick={() => setActiveTool('comment')}
                >
                  <MessageSquare size={14} />
                  <span>Comment</span>
                </button>
              </div>

              {/* Zoom Controls */}
              <div className={styles.zoomGroup}>
                <button
                  className={styles.iconBtn}
                  onClick={() => setZoom((z) => Math.max(50, z - 10))}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className={styles.zoomLabel}>{zoom}%</span>
                <button
                  className={styles.iconBtn}
                  onClick={() => setZoom((z) => Math.min(150, z + 10))}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() => setZoom(100)}
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Interactive Viewport Canvas */}
            <div className={styles.canvasArea}>
              <div
                className={styles.previewFrame}
                style={{ transform: `scale(${zoom / 100})` }}
                onClick={handleCanvasClick}
              >
                {/* Simulated deliverable document/mockup */}
                <div className={styles.documentMock}>
                  <div className={styles.docHeader}>
                    <h2 className={styles.docTitle}>
                      {task?.title}: Technical Specification & Mockup
                    </h2>
                    <div className={styles.docSub}>
                      Generated for {project?.title || 'Project'} • Version {version} • Submitted by{' '}
                      {assignee?.name || 'Assignee'}
                    </div>
                  </div>

                  <div className={styles.docBody}>
                    <p>
                      <strong>Summary of Deliverable:</strong> This component implements the
                      unified real-time query interface and conflict prevention flow according to
                      system requirements.
                    </p>

                    <div className={styles.docCodeBlock}>
                      {`// TaskOrbit Conflict Detection Logic\nfunction hasConflict(taskA, taskB) {\n  return taskA.startDate <= taskB.endDate && taskB.startDate <= taskA.endDate;\n}`}
                    </div>

                    <p>
                      Key changes in <strong>{version}</strong>:
                    </p>
                    <ul>
                      <li>Refactored UI badge color weights to improve accessibility.</li>
                      <li>Standardized button paddings across dialog and side drawer views.</li>
                      <li>Added real-time feedback notifications for state transitions.</li>
                    </ul>
                  </div>
                </div>

                {/* Live Placed Pins */}
                {pins.map((pin) => (
                  <div
                    key={pin.id}
                    className={`${styles.pinMarker} ${selectedPinId === pin.id ? styles.activePinMarker : ''}`}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPinId(pin.id);
                    }}
                    title={`Pin #${pin.number}: ${pin.comment}`}
                  >
                    <span className={styles.pinNumber}>{pin.number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Review Checklist, Annotations & Submission Info */}
          <div className={styles.sidePanel}>
            {/* Review Checklist */}
            <div className={styles.panelCard}>
              <div className={styles.panelTitle}>
                <span>Review Checklist</span>
                <span className={styles.badgeCount}>
                  {checklist.filter((c) => c.checked).length}/{checklist.length}
                </span>
              </div>
              <div className={styles.checklist}>
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={styles.checkItem}
                    onClick={() => handleToggleChecklist(item.id)}
                  >
                    <div className={`${styles.checkbox} ${item.checked ? styles.checkedBox : ''}`}>
                      {item.checked && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span className={styles.checkText}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Annotations & Pins */}
            <div className={styles.panelCard}>
              <div className={styles.panelTitle}>
                <span>Annotations & Feedback</span>
                <span className={styles.badgeCount}>{pins.length}</span>
              </div>
              <div className={styles.annotationList}>
                {pins.map((pin) => (
                  <div
                    key={pin.id}
                    className={`${styles.annotationItem} ${selectedPinId === pin.id ? styles.activeAnnotationItem : ''}`}
                    onClick={() => setSelectedPinId(pin.id)}
                  >
                    <div className={styles.itemBadge}>{pin.number}</div>
                    <div className={styles.itemContent}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemAuthor}>{pin.author}</span>
                        <span className={styles.itemTime}>{pin.time}</span>
                      </div>
                      <p className={styles.itemComment}>{pin.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Box */}
              <div className={styles.addCommentBox}>
                <textarea
                  className={styles.commentInput}
                  rows={2}
                  placeholder={
                    selectedPinId
                      ? `Update comment for Pin #${pins.find((p) => p.id === selectedPinId)?.number || ''}...`
                      : 'Select a pin or click the canvas to annotate...'
                  }
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />
                <button
                  className={styles.addPinBtn}
                  onClick={handleAddComment}
                  disabled={!selectedPinId || !newCommentText.trim()}
                >
                  Save Comment
                </button>
              </div>
            </div>

            {/* Submission Info Card */}
            <div className={styles.panelCard}>
              <div className={styles.panelTitle}>
                <span>Submission Details</span>
                <Layers size={16} color="var(--text-muted)" />
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Assignee</span>
                <span className={styles.infoVal}>{assignee?.name || 'Assignee'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Version</span>
                <span className={styles.infoVal}>v2.0 (Latest)</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Submitted Date</span>
                <span className={styles.infoVal}>Today, 10:45 AM</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Deliverable File</span>
                <span className={styles.infoVal}>spec_v2_final.pdf</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decision Modal */}
        {decisionModalOpen && (
          <ReviewDecisionModal
            taskTitle={task?.title || 'Task'}
            onClose={() => setDecisionModalOpen(false)}
            onSubmit={(dec, feedback) =>
              handleConfirmDecision(dec === 'approved' ? 'approved' : 'revision', feedback)
            }
          />
        )}
      </div>
    </AppLayout>
  );
}
