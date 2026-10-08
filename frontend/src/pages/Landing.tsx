import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Eye,
  Layers3,
  Menu,
  Network,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useAppSelector } from '../redux/hooks';
import type { Role } from '../types';
import styles from './Landing.module.css';

const HOME: Record<Role, string> = {
  client: '/client',
  manager: '/manager',
  assignee: '/assignee',
  reviewer: '/reviewer',
};

const workflow = [
  { number: '01', title: 'Brief', text: 'A clear starting point for scope, files, requirements, and outcomes.' },
  { number: '02', title: 'Allocate', text: 'Managers turn priorities into ownership, deadlines, and a visible plan.' },
  { number: '03', title: 'Execute', text: 'Assignees always know what is next, what changed, and what needs attention.' },
  { number: '04', title: 'Review', text: 'Feedback and approvals stay attached to the work until delivery.' },
];

const roles = [
  { label: 'Clients', title: 'See progress without chasing updates.', icon: Eye, tone: 'blue' },
  { label: 'Managers', title: 'Keep the whole delivery system in view.', icon: Network, tone: 'teal' },
  { label: 'Assignees', title: 'Do focused work with context attached.', icon: Layers3, tone: 'amber' },
  { label: 'Reviewers', title: 'Approve the right work at the right time.', icon: ShieldCheck, tone: 'green' },
];

function Logo(): JSX.Element {
  return (
    <span className={styles.logo}>
      <span className={styles.logoMark} aria-hidden="true"><span /></span>
      <span>TaskOrbit</span>
    </span>
  );
}

function OrbitBoard(): JSX.Element {
  return (
    <div className={styles.orbitStage} aria-label="Illustration of a TaskOrbit project workspace" role="img">
      <svg className={styles.orbitLines} viewBox="0 0 620 560" fill="none" aria-hidden="true">
        <ellipse cx="310" cy="280" rx="230" ry="118" transform="rotate(-24 310 280)" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="310" cy="280" rx="174" ry="236" transform="rotate(48 310 280)" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="310" cy="280" rx="276" ry="168" transform="rotate(14 310 280)" stroke="currentColor" strokeWidth="1" />
        <path d="M70 406C177 330 270 221 552 130" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
      </svg>
      <span className={`${styles.orbitNode} ${styles.nodeOne}`} aria-hidden="true" />
      <span className={`${styles.orbitNode} ${styles.nodeTwo}`} aria-hidden="true" />
      <span className={`${styles.orbitNode} ${styles.nodeThree}`} aria-hidden="true" />
      <div className={styles.workspacePreview}>
        <div className={styles.previewTopbar}>
          <div className={styles.previewBrand}><span className={styles.miniMark} /> Project workspace</div>
          <div className={styles.previewTopActions}><span /><span /><b>RD</b></div>
        </div>
        <div className={styles.previewBody}>
          <aside className={styles.previewNav}>
            <span className={styles.previewNavActive}><Layers3 size={12} /> Overview</span>
            <span><CircleDot size={12} /> Projects</span>
            <span><CheckCircle2 size={12} /> Tasks</span>
            <span><Clock3 size={12} /> Timeline</span>
            <span><Users size={12} /> Team</span>
          </aside>
          <div className={styles.previewContent}>
            <div className={styles.previewHeading}>
              <div><small>MANAGER WORKSPACE</small><strong>Delivery overview</strong></div>
              <span className={styles.livePill}><i /> Live</span>
            </div>
            <div className={styles.previewStats}>
              <div><small>ACTIVE PROJECTS</small><strong>08</strong><span>+2 this month</span></div>
              <div><small>OPEN TASKS</small><strong>24</strong><span>6 due this week</span></div>
              <div><small>IN REVIEW</small><strong>05</strong><span>2 need feedback</span></div>
            </div>
            <div className={styles.previewPanel}>
              <div className={styles.panelTitle}><strong>Project delivery</strong><span>View timeline <ArrowUpRight size={11} /></span></div>
              <div className={styles.projectLine}><span className={styles.projectDotBlue} /><div><strong>Kulkarni Textiles ERP</strong><small>Manager · Rahul Deshmukh</small></div><b>68%</b><em>On track</em></div>
              <div className={styles.projectLine}><span className={styles.projectDotTeal} /><div><strong>Brightline Logistics</strong><small>Client review · due Friday</small></div><b>84%</b><em>In review</em></div>
              <div className={styles.previewProgress}><span /><span /><span /><span /><span /><span /><span /></div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles.floatingCard} ${styles.statusCard}`}>
        <CheckCircle2 size={16} /><span><strong>Conflict resolved</strong><small>Deadline adjusted · just now</small></span>
      </div>
      <div className={`${styles.floatingCard} ${styles.reviewCard}`}>
        <span className={styles.avatarStack}><b>PN</b><b>AJ</b></span><span><strong>Ready for review</strong><small>2 files submitted</small></span><ArrowRight size={15} />
      </div>
    </div>
  );
}

export function Landing(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const session = useAppSelector((state) => state.session);
  const workspacePath = session.role !== '' ? HOME[session.role] : '/login';
  const primaryPath = session.uid !== '' ? workspacePath : '/register';
  const primaryLabel = session.uid !== '' ? 'Open workspace' : 'Start a workspace';

  useEffect(() => {
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add(styles.revealVisible));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.revealVisible);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -48px' });
      revealTargets.forEach((target, index) => {
        target.classList.add(styles.reveal);
        target.style.setProperty('--reveal-delay', `${Math.min(index * 45, 180)}ms`);
        observer.observe(target);
      });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    let frame = 0;
    function updateScrollProgress(): void {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(scrollableHeight > 0 ? Math.min((window.scrollY / scrollableHeight) * 100, 100) : 0);
        frame = 0;
      });
    }
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  function closeMenu(): void {
    setMenuOpen(false);
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <span className={styles.scrollProgress} style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
        <a href="#top" onClick={closeMenu} aria-label="TaskOrbit home"><Logo /></a>
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Main navigation">
          <a href="#product" onClick={closeMenu}>Product</a>
          <a href="#workflow" onClick={closeMenu}>How it works</a>
          <a href="#roles" onClick={closeMenu}>For teams</a>
          <a href="#team" onClick={closeMenu}>Contact</a>
          <div className={styles.mobileNavActions}>
            <Link to="/login" onClick={closeMenu}>Sign in</Link>
            <Link className={styles.mobileCta} to={primaryPath} onClick={closeMenu}>{primaryLabel} <ArrowUpRight size={15} /></Link>
          </div>
        </nav>
        <div className={styles.navActions}>
          <Link className={styles.signIn} to="/login">Sign in</Link>
          <Link className={styles.navCta} to={primaryPath}>{primaryLabel} <ArrowUpRight size={15} /></Link>
        </div>
        <button className={styles.menuButton} type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={`${styles.heroCopy} ${styles.revealOne}`}>
              <p className={styles.eyebrow}><span className={styles.eyebrowLine} /> Project delivery, re-aligned</p>
              <h1>Every moving part.<br /><em>One clear orbit.</em></h1>
              <p className={styles.heroText}>TaskOrbit brings briefs, people, deadlines, files, and approvals into one calm command center for work that needs to move.</p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButton} to={primaryPath}>{primaryLabel} <ArrowUpRight size={17} /></Link>
                <a className={styles.textButton} href="#product">Explore the system <ArrowDown size={16} /></a>
              </div>
              <p className={styles.heroNote}><Check size={14} /> Four roles. One shared source of truth.</p>
            </div>
            <OrbitBoard />
          </div>
          <a className={styles.scrollCue} href="#product"><span>Scroll to explore</span><ArrowDown size={17} /></a>
        </section>

        <div className={styles.ribbon} aria-label="TaskOrbit workflow">
          <div className={styles.ribbonTrack}><span>BRIEF</span><i>✳</i><span>ALLOCATE</span><i>✳</i><span>EXECUTE</span><i>✳</i><span>REVIEW</span><i>✳</i><span>DELIVER</span><i>✳</i><span>BRIEF</span><i>✳</i><span>ALLOCATE</span><i>✳</i><span>EXECUTE</span><i>✳</i><span>REVIEW</span><i>✳</i><span>DELIVER</span><i>✳</i></div>
        </div>

        <section className={`${styles.section} ${styles.manifesto}`} id="product" data-reveal>
          <div className={styles.sectionLabel}><span>01</span><span>THE SYSTEM</span><span className={styles.labelRule} /></div>
          <div className={styles.manifestoGrid}>
            <h2>Work feels lighter when every handoff is visible.</h2>
            <div className={styles.manifestoCopy}>
              <p>TaskOrbit is the project lifecycle workspace built for teams who are tired of scattered updates and silent blockers.</p>
              <p>Turn the first client brief into a sequence of accountable work. Keep the context close, surface conflicts early, and let every role see the part that matters to them.</p>
              <a className={styles.inlineLink} href="#workflow">See how work moves <ArrowUpRight size={15} /></a>
            </div>
          </div>
          <div className={`${styles.manifestoStats} ${styles.revealChild}`} data-reveal>
            <div><strong>04</strong><span>connected roles</span></div>
            <div><strong>01</strong><span>shared delivery view</span></div>
            <div><strong>∞</strong><span>fewer status meetings</span></div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.capabilities}`} data-reveal>
          <div className={styles.sectionLabel}><span>02</span><span>WHAT CHANGES</span><span className={styles.labelRule} /></div>
          <div className={styles.sectionHeading}><h2>Less coordination tax.<br /><em>More work in motion.</em></h2><p>The details that make a delivery system feel considered: clear ownership, early signals, and feedback that never loses its place.</p></div>
          <div className={`${styles.capabilityGrid} ${styles.revealChild}`} data-reveal>
            <article className={styles.capabilityCard}><div className={styles.iconSquare}><Network size={19} /></div><small>01 / VISIBILITY</small><h3>See the whole picture.</h3><p>Projects, tasks, timelines, and activity live together so decisions are made with the right context.</p><a href="#workflow" aria-label="Learn about visibility"><ArrowUpRight size={17} /></a></article>
            <article className={styles.capabilityCard}><div className={`${styles.iconSquare} ${styles.tealIcon}`}><ShieldCheck size={19} /></div><small>02 / CONTROL</small><h3>Catch friction early.</h3><p>Deadline conflicts and blocked work become visible before they turn into a delivery surprise.</p><a href="#workflow" aria-label="Learn about control"><ArrowUpRight size={17} /></a></article>
            <article className={`${styles.capabilityCard} ${styles.darkCapability}`}><div className={`${styles.iconSquare} ${styles.lightIcon}`}><CheckCircle2 size={19} /></div><small>03 / MOMENTUM</small><h3>Keep every handoff moving.</h3><p>Submission, feedback, revision, and approval form one traceable path from brief to done.</p><a href="#roles" aria-label="Learn about momentum"><ArrowUpRight size={17} /></a></article>
          </div>
        </section>

        <section className={`${styles.section} ${styles.workflowSection}`} id="workflow" data-reveal>
          <div className={styles.sectionLabel}><span>03</span><span>THE FLOW</span><span className={styles.labelRule} /></div>
          <div className={styles.workflowIntro}><h2>From first brief<br /><em>to final sign-off.</em></h2><p>Each step has a home, an owner, and a next move. That is how a complex project stays legible.</p></div>
          <div className={`${styles.workflowLayout} ${styles.revealChild}`} data-reveal>
            <div className={styles.workflowList}>
              {workflow.map((item, index) => (
                <div className={styles.workflowItem} key={item.number}>
                  <span className={styles.workflowNumber}>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><ArrowRight size={17} />
                  {index < workflow.length - 1 ? <span className={styles.workflowConnector} aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
            <div className={styles.activityCard}>
              <div className={styles.activityTop}><span><i /> LIVE ACTIVITY</span><small>Today, 10:42</small></div>
              <div className={styles.activityTitle}><h3>Work that tells you where it is.</h3><p>A small slice of a healthy delivery loop.</p></div>
              <div className={styles.activityList}>
                <div><span className={`${styles.activityIcon} ${styles.blueActivity}`}><Check size={14} /></span><p><strong>Priya Nair</strong> approved <b>homepage review</b><small>2 minutes ago</small></p></div>
                <div><span className={`${styles.activityIcon} ${styles.tealActivity}`}><ArrowUpRight size={14} /></span><p><strong>Amit Joshi</strong> submitted <b>API integration</b><small>18 minutes ago</small></p></div>
                <div><span className={`${styles.activityIcon} ${styles.amberActivity}`}><Clock3 size={14} /></span><p><strong>TaskOrbit</strong> flagged a deadline conflict<small>41 minutes ago</small></p></div>
              </div>
              <div className={styles.activityFooter}><span>PROJECT HEALTH</span><strong><i /> On track</strong></div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.rolesSection}`} id="roles" data-reveal>
          <div className={styles.sectionLabel}><span>04</span><span>BUILT AROUND THE TEAM</span><span className={styles.labelRule} /></div>
          <div className={styles.sectionHeading}><h2>Different roles.<br /><em>One shared rhythm.</em></h2><p>TaskOrbit gives every person a focused workspace without hiding the larger delivery story.</p></div>
          <div className={`${styles.roleGrid} ${styles.revealChild}`} data-reveal>
            {roles.map((role) => {
              const Icon = role.icon;
              return <article className={`${styles.roleCard} ${styles[`${role.tone}Role`]}`} key={role.label}><div className={styles.roleCardTop}><span>{role.label}</span><Icon size={19} /></div><h3>{role.title}</h3><span className={styles.roleArrow}><ArrowUpRight size={16} /></span></article>;
            })}
          </div>
        </section>

        <section className={`${styles.section} ${styles.teamSection}`} id="team" data-reveal>
          <div className={styles.teamOrbit} aria-hidden="true"><span /><span /><span /><span /></div>
          <div className={styles.sectionLabel}><span>05</span><span>THE PEOPLE BEHIND THE WORK</span><span className={styles.labelRule} /></div>
          <div className={`${styles.teamGrid} ${styles.revealChild}`} data-reveal>
            <div><h2>Good work deserves<br /><em>a better rhythm.</em></h2><p>TaskOrbit is being shaped by people who have lived the handoff: the late update, the missed dependency, the review that got lost in a thread.</p><p>We are building a calmer way to move ambitious projects from intention to done.</p><a className={styles.lightLink} href="mailto:hello@taskorbit.app">Start a conversation <ArrowUpRight size={16} /></a></div>
            <div className={styles.contactPanel}><small>LET&apos;S MAKE WORK MOVE</small><a href="mailto:hello@taskorbit.app">hello@taskorbit.app <ArrowUpRight size={16} /></a><div className={styles.contactRule} /><div className={styles.contactDetails}><span>Product questions</span><a href="mailto:support@taskorbit.app">support@taskorbit.app</a></div><div className={styles.contactDetails}><span>Built for modern delivery teams</span><strong>India · Everywhere</strong></div></div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}><a href="#top"><Logo /></a><span>Role-based project lifecycle management.</span><span>© 2026 TaskOrbit</span><a href="#top" className={styles.backTop}>Back to top <ArrowUpRight size={14} /></a></footer>
    </div>
  );
}
