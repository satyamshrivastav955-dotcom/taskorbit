import { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowRightLeft,
  ArrowUpDown,
  Plus,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  FolderPlus,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import type { Role } from '../../types';
import styles from './ControlPanel.module.css';

interface ControlPanelProps {
  role: Role;
  conflictCount?: number;
}

export function ControlPanel({ role, conflictCount = 0 }: ControlPanelProps): JSX.Element {
  const [positionType, setPositionType] = useState('Relative');
  const [widthVal, setWidthVal] = useState('1fr');
  const [heightVal, setHeightVal] = useState('Auto');
  const [maxWidthVal, setMaxWidthVal] = useState('1200');
  const [direction, setDirection] = useState<'row' | 'column'>('row');
  const [distribute, setDistribute] = useState('End');
  const [activeAlign, setActiveAlign] = useState(1);
  const [density, setDensity] = useState<'compact' | 'studio'>('studio');

  return (
    <aside className={styles.panel} aria-label="Visuvate Studio Control Panel">
      {/* Top alignment toolbar like Visuvate Studio */}
      <div className={styles.alignBar}>
        <button
          className={`${styles.iconBtn} ${activeAlign === 0 ? styles.active : ''}`}
          onClick={() => setActiveAlign(0)}
          title="Align Left"
          aria-label="Align Left"
        >
          <AlignLeft size={14} />
        </button>
        <button
          className={`${styles.iconBtn} ${activeAlign === 1 ? styles.active : ''}`}
          onClick={() => setActiveAlign(1)}
          title="Align Center"
          aria-label="Align Center"
        >
          <AlignCenter size={14} />
        </button>
        <button
          className={`${styles.iconBtn} ${activeAlign === 2 ? styles.active : ''}`}
          onClick={() => setActiveAlign(2)}
          title="Align Right"
          aria-label="Align Right"
        >
          <AlignRight size={14} />
        </button>
        <button
          className={`${styles.iconBtn} ${activeAlign === 3 ? styles.active : ''}`}
          onClick={() => setActiveAlign(3)}
          title="Justify"
          aria-label="Justify"
        >
          <AlignJustify size={14} />
        </button>
        <button
          className={styles.iconBtn}
          title="Distribute Horizontal"
          aria-label="Distribute Horizontal"
        >
          <ArrowRightLeft size={13} />
        </button>
        <button
          className={styles.iconBtn}
          title="Distribute Vertical"
          aria-label="Distribute Vertical"
        >
          <ArrowUpDown size={13} />
        </button>
      </div>

      {/* Position Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Position</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Type</span>
          <input
            className={styles.valueInput}
            value={positionType}
            onChange={(e) => setPositionType(e.target.value)}
            title="Position Type"
          />
        </div>
      </div>

      {/* Size Section with + icon */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Size</span>
          <button className={styles.sectionAction} title="Add property" aria-label="Add size property">
            <Plus size={13} />
          </button>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Width</span>
          <div className={styles.dualControl}>
            <input
              className={styles.dualVal}
              value={widthVal}
              onChange={(e) => setWidthVal(e.target.value)}
            />
            <select className={styles.dualSelect} aria-label="Width Unit">
              <option>Fill ▾</option>
              <option>Fixed ▾</option>
              <option>Fit ▾</option>
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Height</span>
          <div className={styles.dualControl}>
            <input
              className={styles.dualVal}
              value={heightVal}
              onChange={(e) => setHeightVal(e.target.value)}
            />
            <select className={styles.dualSelect} aria-label="Height Unit">
              <option>Fit ▾</option>
              <option>Fill ▾</option>
              <option>Fixed ▾</option>
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Max Width</span>
          <div className={styles.dualControl}>
            <input
              className={styles.dualVal}
              value={maxWidthVal}
              onChange={(e) => setMaxWidthVal(e.target.value)}
            />
            <select className={styles.dualSelect} aria-label="Max Width Unit">
              <option>Fixed ▾</option>
              <option>Fit ▾</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Layout</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Direction</span>
          <div className={styles.segmented} style={{ flex: 1 }}>
            <button
              className={`${styles.segBtn} ${direction === 'row' ? styles.active : ''}`}
              onClick={() => setDirection('row')}
              title="Row"
              aria-label="Row direction"
            >
              <ArrowRightLeft size={13} />
            </button>
            <button
              className={`${styles.segBtn} ${direction === 'column' ? styles.active : ''}`}
              onClick={() => setDirection('column')}
              title="Column"
              aria-label="Column direction"
            >
              <ArrowUpDown size={13} />
            </button>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Distribute</span>
          <select
            className={styles.valueInput}
            value={distribute}
            onChange={(e) => setDistribute(e.target.value)}
            aria-label="Distribute alignment"
          >
            <option>Start ▾</option>
            <option>Center ▾</option>
            <option>End ▾</option>
            <option>Space Between ▾</option>
          </select>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Density</span>
          <div className={styles.segmented} style={{ flex: 1 }}>
            <button
              className={`${styles.segBtn} ${density === 'compact' ? styles.active : ''}`}
              onClick={() => setDensity('compact')}
            >
              Compact
            </button>
            <button
              className={`${styles.segBtn} ${density === 'studio' ? styles.active : ''}`}
              onClick={() => setDensity('studio')}
            >
              Studio
            </button>
          </div>
        </div>
      </div>

      {/* Task Orbit Control / Inspector Engine */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Control Engine</span>
          <Sliders size={13} color="var(--text-muted)" />
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Role</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-400)', textTransform: 'capitalize' }}>
            {role} Studio
          </span>
        </div>

        {/* Real-time Conflict Engine status */}
        <div className={`${styles.statusIndicator} ${conflictCount > 0 ? styles.conflict : ''}`}>
          <span className={`${styles.statusDot} ${conflictCount > 0 ? styles.conflict : ''}`} />
          <span className={styles.statusText}>
            {conflictCount > 0
              ? `${conflictCount} scheduling conflict${conflictCount > 1 ? 's' : ''} detected`
              : 'Conflict Shield: All clear'}
          </span>
        </div>

        <div className={styles.quickActions}>
          <button
            className={styles.actionBtn}
            onClick={() => window.location.href = `/${role}`}
          >
            <CheckCircle2 size={13} color="var(--blue-400)" />
            <span>Overview Dashboard</span>
          </button>
          {role === 'manager' && (
            <button
              className={styles.actionBtn}
              onClick={() => window.location.href = '/manager/projects'}
            >
              <FolderPlus size={13} color="var(--teal-600)" />
              <span>Project Matrix</span>
            </button>
          )}
          {(role === 'manager' || role === 'assignee') && (
            <button
              className={styles.actionBtn}
              onClick={() => window.location.href = `/${role}/timeline`}
            >
              <Calendar size={13} color="var(--cyan-500)" />
              <span>Gantt Timeline</span>
            </button>
          )}
          {conflictCount > 0 && role === 'manager' && (
            <button
              className={`${styles.actionBtn} ${styles.primary}`}
              onClick={() => window.location.href = '/manager/conflicts'}
            >
              <AlertTriangle size={13} />
              <span>Resolve Conflicts ({conflictCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Studio Diagnostics footer */}
      <div style={{ padding: '14px 16px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <ShieldCheck size={13} color="var(--green-500)" />
          <span>TaskOrbit Studio v2.4 · Visuvate Engine</span>
        </div>
      </div>
    </aside>
  );
}
