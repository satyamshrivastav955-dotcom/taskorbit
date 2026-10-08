import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CheckSquare2,
  FolderKanban,
  Users,
} from 'lucide-react';
import styles from './Login.module.css';

export function AuthVisual(): JSX.Element {
  return (
    <aside className={styles.panel} aria-hidden="true">
      <svg className={styles.orbitSvg} viewBox="0 0 760 820" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <path d="M 720 60 Q 380 400 140 700" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 600 -40 Q 200 380 80 780" stroke="currentColor" strokeWidth="1" />
        <path d="M 420 240 Q 560 300 680 220" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className={styles.nodeA} />
      <div className={styles.nodeB} />
      <div className={styles.accentDot} />

      <div className={styles.panelContent}>
        <div className={styles.brand}><span className={styles.orbitMark} />TaskOrbit</div>
        <p className={styles.pill}>Role-based project management</p>
        <h1>Bring every<br />handoff into<br /><span className={styles.accent}>focus.</span></h1>
        <p className={styles.lede}>From the first client brief to the final approval, TaskOrbit keeps people, priorities, and progress moving together.</p>

        <ul className={styles.features}>
          <li><CheckCircle2 size={17} /> Role-aware workspaces</li>
          <li><CheckCircle2 size={17} /> Smart deadline signals</li>
          <li><CheckCircle2 size={17} /> Context-rich handoffs</li>
          <li><CheckCircle2 size={17} /> Review-ready delivery</li>
        </ul>

        <div className={styles.preview}>
          <div className={styles.onTrack}>
            <span className={styles.trackIcon}><CheckCircle2 size={14} /></span>
            <div>On track<small>All milestones aligned</small></div>
          </div>
          <div className={styles.miniNav}>
            <div className={`${styles.miniNavItem} ${styles.miniActive}`}><FolderKanban size={13} /> Projects</div>
            <div className={styles.miniNavItem}><CheckSquare2 size={13} /> Tasks</div>
            <div className={styles.miniNavItem}><CalendarDays size={13} /> Timeline</div>
            <div className={styles.miniNavItem}><Users size={13} /> Team</div>
            <div className={styles.miniNavItem}><BarChart3 size={13} /> Reports</div>
          </div>
          <div className={styles.progressCard}>
            <div className={styles.progressTitle}>Project progress</div>
            <div className={styles.ringRow}>
              <div className={styles.ring}><span>72%</span></div>
              <div className={styles.ringBars}><div className={`${styles.bar} ${styles.barFull}`} /><div className={`${styles.bar} ${styles.barShort}`} /></div>
            </div>
            <p className={styles.upcoming}>Upcoming tasks</p>
            <ul className={styles.taskList}>
              <li><i className={styles.dotA} />Design UI screens<b className={styles.taskDue}>Today</b></li>
              <li><i className={styles.dotB} />API integration<b className={styles.taskTomorrow}>Tomorrow</b></li>
              <li><i className={styles.dotC} />Client review<b className={styles.taskDate}>Mar 28</b></li>
            </ul>
          </div>
          <span className={`${styles.previewSignal} ${styles.signalOne}`} />
          <span className={`${styles.previewSignal} ${styles.signalTwo}`} />
        </div>

        <div className={styles.stats}>
          <span><b>4</b>Roles</span>
          <span><b>End-to-end</b>Lifecycle</span>
          <span><b>Live</b>Signals</span>
          <span><b>Clearer</b>Handoffs</span>
        </div>
      </div>
    </aside>
  );
}
