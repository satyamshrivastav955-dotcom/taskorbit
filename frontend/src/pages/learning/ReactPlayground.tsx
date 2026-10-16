import React, { useState, useEffect, useRef, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code,
  BookOpen,
  ArrowRight,
  Layers,
  Repeat,
  Send,
  Zap,
  Tag,
  Clock,
  Navigation,
  GitCommit,
  Cpu,
  CheckCircle2,
  FileCode,
  RotateCcw,
  Plus,
  Trash2,
  Home,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  increment,
  decrement,
  resetCounter,
  setMessage,
  addItem,
  removeItem,
} from '../../redux/learningSlice';
import styles from './ReactPlayground.module.css';

// ============================================================================
// TOPIC METADATA DEFINITIONS
// ============================================================================
interface TopicMeta {
  id: string;
  number: number;
  title: string;
  category: string;
  icon: React.ReactNode;
}

const TOPICS: TopicMeta[] = [
  { id: 'jsx-intro', number: 1, title: 'Introduction to React & JSX', category: 'Fundamentals', icon: <Code size={16} /> },
  { id: 'functional-components', number: 2, title: 'Functional Components & Rendering', category: 'Fundamentals', icon: <Layers size={16} /> },
  { id: 'props-state', number: 3, title: 'Component Props & State', category: 'Fundamentals', icon: <Repeat size={16} /> },
  { id: 'composition', number: 4, title: 'Component Composition', category: 'Fundamentals', icon: <Layers size={16} /> },
  { id: 'parent-to-child', number: 5, title: 'Data: Parent to Child', category: 'Data Flow', icon: <ArrowRight size={16} /> },
  { id: 'child-to-parent', number: 6, title: 'Data: Child to Parent (Callbacks)', category: 'Data Flow', icon: <Send size={16} /> },
  { id: 'styling', number: 7, title: 'Component Styling Techniques', category: 'UI & Forms', icon: <Tag size={16} /> },
  { id: 'forms-controlled', number: 8, title: 'Forms & Controlled Inputs', category: 'UI & Forms', icon: <FileCode size={16} /> },
  { id: 'events', number: 9, title: 'Synthetic Events Handling', category: 'UI & Forms', icon: <Zap size={16} /> },
  { id: 'refs', number: 10, title: 'useRef: DOM & Mutable Values', category: 'UI & Forms', icon: <Cpu size={16} /> },
  { id: 'list-keys', number: 11, title: 'Keys in List Rendering', category: 'Lifecycle & Lists', icon: <GitCommit size={16} /> },
  { id: 'lifecycle-effect', number: 12, title: 'Lifecycle & useEffect Cleanup', category: 'Lifecycle & Lists', icon: <Clock size={16} /> },
  { id: 'router-nav', number: 13, title: 'React Router & Client Navigation', category: 'Architecture', icon: <Navigation size={16} /> },
  { id: 'flux-unidirectional', number: 14, title: 'Flux Architecture & Unidirectional Flow', category: 'Architecture', icon: <GitCommit size={16} /> },
  { id: 'redux-toolkit', number: 15, title: 'Redux Concepts & RTK Store', category: 'Architecture', icon: <Cpu size={16} /> },
];

// ============================================================================
// TOPIC 1: INTRO TO REACT & JSX
// ============================================================================
function DemoTopic1(): JSX.Element {
  const [userName, setUserName] = useState('TaskOrbit Student');
  const [isHighlight, setIsHighlight] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Syllabus Concept Explanation</div>
        <p className={styles.explanationText}>
          <strong>React</strong> is a declarative, component-based JavaScript library created by Meta for building user interfaces.
          <strong> JSX (JavaScript XML)</strong> is a syntax extension that allows you to write HTML-like structures directly inside JavaScript.
          Behind the scenes, build tools (Babel/Vite) transpile JSX into <code>React.createElement(component, props, ...children)</code> function calls.
        </p>
      </div>

      <div className={styles.codeBox}>{`// 1. JSX with dynamic expressions inside curly braces {}
const greeting = <h2>Hello, {userName}!</h2>;

// 2. Rules of JSX:
// - Return a single root element (or Fragment <></>)
// - Use camelCase for attributes (className instead of class, htmlFor instead of for)
// - Self-close tags that have no children: <img />, <input />`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Playground</div>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
          <input
            className={styles.inputField}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Type your name"
          />
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setIsHighlight(!isHighlight)}
          >
            Toggle Highlight: {isHighlight ? 'ON' : 'OFF'}
          </button>
        </div>

        <div style={{
          padding: '1rem',
          borderRadius: '6px',
          background: isHighlight ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: isHighlight ? '1px solid #38bdf8' : '1px solid #334155'
        }}>
          <h3 style={{ margin: 0, color: isHighlight ? '#38bdf8' : '#fff' }}>
            Welcome to React, {userName || 'Learner'}!
          </h3>
          <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            Rendered inside a React Fragment at timestamp: <strong>{new Date().toLocaleTimeString()} ({currentYear})</strong>
          </p>
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> Browser engines cannot understand JSX natively. The browser receives plain JavaScript transpiled by the bundler into Virtual DOM tree representations.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 2: FUNCTIONAL COMPONENTS & RENDERING
// ============================================================================
function DemoTopic2(): JSX.Element {
  const [renderCount, setRenderCount] = useState(1);
  const [framework, setFramework] = useState('React 18');

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Concept Explanation</div>
        <p className={styles.explanationText}>
          A <strong>Functional Component</strong> is a JavaScript function that accepts a single <code>props</code> object argument and returns React JSX elements.
          React uses a <strong>Virtual DOM</strong>: an in-memory lightweight representation of the real browser DOM.
          When component state changes, React creates a new Virtual DOM tree, performs <em>reconciliation</em> (diffing), and calculates the minimal real DOM updates required.
        </p>
      </div>

      <div className={styles.codeBox}>{`// Modern Functional Component with Type Safety
interface BadgeProps {
  label: string;
  version: string;
}

function TechBadge({ label, version }: BadgeProps) {
  return <span className="badge">{label} (v{version})</span>;
}`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Playground</div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <select
            className={styles.inputField}
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
          >
            <option value="React 18">React 18</option>
            <option value="Next.js 14">Next.js 14</option>
            <option value="Vite 5">Vite 5</option>
          </select>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setRenderCount((c) => c + 1)}
          >
            Trigger Component Re-render
          </button>
        </div>

        <div style={{ padding: '1rem', background: '#090d16', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Current Selected Framework: <strong style={{ color: '#38bdf8' }}>{framework}</strong>
          </p>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Total re-renders triggered: <strong>{renderCount}</strong> (Virtual DOM diff calculates minimal paint)
          </p>
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> Functional components are pure functions with respect to their props: given the exact same props and state, they must return the exact same JSX output.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 3: COMPONENT PROPS & STATE
// ============================================================================
function DemoTopic3(): JSX.Element {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Props vs State</div>
        <p className={styles.explanationText}>
          - <strong>Props (Properties)</strong>: Read-only data passed from parent component to child. A component can never modify its own props.
          <br />
          - <strong>State</strong>: Mutable data owned and maintained internally by the component using the <code>useState</code> Hook. When state changes, a component re-renders.
        </p>
      </div>

      <div className={styles.codeBox}>{`// useState Hook syntax:
const [stateVariable, setStateFunction] = useState(initialValue);

// Functional state update (guarantees latest state in async batches):
setStateFunction(prev => prev + step);`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Counter Playground</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8', minWidth: '80px' }}>
            {count}
          </div>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => setCount((prev) => prev + step)}
          >
            +{step} Increment
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setCount((prev) => prev - step)}
          >
            -{step} Decrement
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setCount(0)}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            Step Size:
            <select
              className={styles.inputField}
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> State updates in React may be batched for performance. Always use the functional form <code>setCount(prev =&gt; prev + 1)</code> when the new state depends on the previous state.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 4: COMPONENT COMPOSITION
// ============================================================================
interface CardContainerProps {
  title: string;
  badgeText: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

function CardContainer({ title, badgeText, children, actions }: CardContainerProps): JSX.Element {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ margin: 0, color: '#fff' }}>{title}</h4>
        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: '#334155', borderRadius: '4px', color: '#38bdf8' }}>
          {badgeText}
        </span>
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: actions ? '1rem' : 0 }}>
        {children}
      </div>
      {actions && <div style={{ borderTop: '1px solid #334155', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>{actions}</div>}
    </div>
  );
}

function DemoTopic4(): JSX.Element {
  const [likes, setLikes] = useState(42);

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Component Composition & Children Prop</div>
        <p className={styles.explanationText}>
          React favors <strong>Composition over Inheritance</strong>. Rather than subclassing components, components can accept arbitrary children
          using the special <code>props.children</code> property, acting as containers/wrappers.
        </p>
      </div>

      <div className={styles.codeBox}>{`// Containment Pattern with props.children:
function Card({ title, children, actions }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="body">{children}</div>
      <div className="footer">{actions}</div>
    </div>
  );
}`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Composition Example</div>
        <CardContainer
          title="TaskOrbit Project Milestone: Sprint 1"
          badgeText="Active Phase"
          actions={
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setLikes((l) => l + 1)}
            >
              Approve Milestone (Endorsements: {likes})
            </button>
          }
        >
          <p style={{ margin: 0 }}>
            This card is a reusable <code>&lt;CardContainer&gt;</code> component. The body text you are reading right now
            was passed as <code>children</code>, and the button below was passed via the <code>actions</code> slot prop.
          </p>
        </CardContainer>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> Composition allows building clean, modular UI hierarchies without coupling container layout logic to specific content components.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 5: PASSING DATA FROM PARENT TO CHILD
// ============================================================================
interface TaskItemProps {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
}

function TaskItemView({ id, title, priority, assignee }: TaskItemProps): JSX.Element {
  const colorMap = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      background: '#090d16',
      borderLeft: `4px solid ${colorMap[priority]}`,
      borderRadius: '4px',
      marginBottom: '0.5rem'
    }}>
      <div>
        <strong style={{ color: '#f8fafc' }}>{title}</strong>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {id} | Assigned to: {assignee}</div>
      </div>
      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: colorMap[priority], fontWeight: 700 }}>
        {priority}
      </span>
    </div>
  );
}

function DemoTopic5(): JSX.Element {
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const parentTasks: TaskItemProps[] = [
    { id: 'T-101', title: 'Implement React Syllabus UI', priority: 'high', assignee: 'Alex Lead' },
    { id: 'T-102', title: 'Connect Supabase PostgreSQL', priority: 'high', assignee: 'Dev Engineer' },
    { id: 'T-103', title: 'Review PHP Unit Tests', priority: 'medium', assignee: 'QA Reviewer' },
    { id: 'T-104', title: 'Documentation & Exam Notes', priority: 'low', assignee: 'Tech Writer' },
  ];

  const filteredTasks = selectedPriority === 'all'
    ? parentTasks
    : parentTasks.filter((t) => t.priority === selectedPriority);

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Unidirectional Data Flow (Parent to Child)</div>
        <p className={styles.explanationText}>
          In React, data flows in one direction: <strong>downward from parent to child via props</strong>.
          The parent holds the source of truth, filters or computes data, and delivers it to presentation children.
        </p>
      </div>

      <div className={styles.codeBox}>{`// Parent passes individual props to child:
<TaskItemView
  id={task.id}
  title={task.title}
  priority={task.priority}
  assignee={task.assignee}
/>`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Props Demonstration</div>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Filter by priority in Parent:</span>
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              type="button"
              className={selectedPriority === p ? styles.btnPrimary : styles.btnSecondary}
              onClick={() => setSelectedPriority(p)}
              style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {p}
            </button>
          ))}
        </div>

        <div>
          {filteredTasks.map((t) => (
            <TaskItemView key={t.id} id={t.id} title={t.title} priority={t.priority} assignee={t.assignee} />
          ))}
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> Props are immutable to the child. If a child needs to request a change, it must invoke a callback passed down by the parent.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 6: PASSING DATA FROM CHILD TO PARENT (CALLBACKS)
// ============================================================================
interface RatingPickerProps {
  onSelectRating: (rating: number) => void;
}

function RatingPicker({ onSelectRating }: RatingPickerProps): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onSelectRating(star)}
          className={styles.btnSecondary}
          style={{ width: '36px', height: '36px', padding: 0 }}
        >
          {star}★
        </button>
      ))}
    </div>
  );
}

function DemoTopic6(): JSX.Element {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);

  const handleRatingFromChild = (rating: number): void => {
    setSelectedRating(rating);
    setHistory((prev) => [rating, ...prev.slice(0, 4)]);
  };

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Lifting State Up via Callbacks</div>
        <p className={styles.explanationText}>
          To send data <strong>upward from a child component to its parent</strong>, the parent passes a function (callback) as a prop.
          When an event happens inside the child, it invokes this function and passes arguments back up to the parent.
        </p>
      </div>

      <div className={styles.codeBox}>{`// 1. Parent defines handler & passes callback:
function Parent() {
  const handleRating = (stars) => setRating(stars);
  return <Child onSelectRating={handleRating} />;
}

// 2. Child invokes parent's function with data payload:
function Child({ onSelectRating }) {
  return <button onClick={() => onSelectRating(5)}>5 Stars</button>;
}`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Callback Playground</div>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Child Component (<code>&lt;RatingPicker&gt;</code>): Click a star to send rating up to Parent:
        </p>
        <RatingPicker onSelectRating={handleRatingFromChild} />

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#090d16', borderRadius: '6px' }}>
          <p style={{ margin: 0 }}>
            Parent Component State: <strong>{selectedRating ? `${selectedRating} Stars Selected` : 'No rating chosen yet'}</strong>
          </p>
          {history.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.4rem' }}>
              Recent child-to-parent transmissions: {history.join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> This pattern is known as <em>Lifting State Up</em>. Whenever two sibling components need to share data, move their shared state to their closest common ancestor.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 7: COMPONENT STYLING
// ============================================================================
function DemoTopic7(): JSX.Element {
  const [accent, setAccent] = useState<'blue' | 'purple' | 'emerald'>('blue');

  const inlineStyles: Record<string, React.CSSProperties> = {
    blue: { background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', color: '#38bdf8' },
    purple: { background: 'rgba(168, 85, 247, 0.1)', border: '1px solid #a855f7', color: '#c084fc' },
    emerald: { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#34d399' },
  };

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Component Styling Paradigms</div>
        <p className={styles.explanationText}>
          React supports multiple styling strategies:
          <br />
          1. <strong>Inline Styles</strong>: JavaScript object using camelCase keys (e.g. <code>style={'{'} backgroundColor: 'red' {'}'}</code>).
          <br />
          2. <strong>CSS Modules</strong>: Locally scoped CSS classes generated automatically (e.g. <code>import styles from './MyComponent.module.css'</code>).
          <br />
          3. <strong>Global CSS</strong>: Traditional classes declared in global stylesheets.
        </p>
      </div>

      <div className={styles.codeBox}>{`// 1. Inline Styles (JavaScript object, camelCase properties):
<div style={{ padding: '1rem', borderRadius: '8px' }}>Content</div>

// 2. CSS Modules (Locally scoped, zero naming collisions):
import styles from './Button.module.css';
<button className={styles.primary}>Submit</button>`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Style Switcher</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {(['blue', 'purple', 'emerald'] as const).map((color) => (
            <button
              key={color}
              type="button"
              className={styles.btnSecondary}
              onClick={() => setAccent(color)}
              style={{ textTransform: 'capitalize' }}
            >
              Select {color}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.25rem', borderRadius: '8px', ...inlineStyles[accent] }}>
          <h4 style={{ margin: 0 }}>Styling Paradigm: Dynamic Inline Style Object</h4>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>
            Active border and background colors are dynamically injected from the JavaScript state object.
          </p>
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> CSS Modules prevent global namespace pollution by hashing class names at compile time (e.g., <code>Button_primary__23x8A</code>).
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 8: FORMS AND CONTROLLED INPUTS
// ============================================================================
function DemoTopic8(): JSX.Element {
  const [formData, setFormData] = useState({
    taskTitle: 'Integrate Supabase Auth',
    role: 'assignee',
    isUrgent: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    const name = target.name;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Controlled Components Concept</div>
        <p className={styles.explanationText}>
          In HTML, form elements like <code>&lt;input&gt;</code> typically maintain their own state.
          In a <strong>Controlled Component</strong>, the form input&apos;s value is driven by React component state.
          Every state mutation has an associated handler function, making React the &quot;single source of truth&quot;.
        </p>
      </div>

      <div className={styles.codeBox}>{`// Controlled Input pattern:
<input
  name="taskTitle"
  value={formData.taskTitle}
  onChange={handleChange}
/>`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Controlled Form</div>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'grid', gap: '0.75rem', maxWidth: '450px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Task Title (Controlled Text Input):
            </label>
            <input
              className={styles.inputField}
              name="taskTitle"
              value={formData.taskTitle}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Role Selection (Controlled Select):
            </label>
            <select
              className={styles.inputField}
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              <option value="client">Client</option>
              <option value="manager">Manager</option>
              <option value="assignee">Assignee</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isUrgent"
              checked={formData.isUrgent}
              onChange={handleChange}
            />
            Mark as Urgent Milestone (Controlled Checkbox)
          </label>
        </form>

        <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#090d16', borderRadius: '6px' }}>
          <strong style={{ fontSize: '0.85rem', color: '#38bdf8' }}>Live React State Snapshot (JSON):</strong>
          <pre style={{ margin: '0.25rem 0 0', color: '#a5f3fc', fontSize: '0.8rem' }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> Controlled inputs allow instant validation, conditional submit button disabling, and enforce format constraints before saving.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 9: EVENTS HANDLING
// ============================================================================
function DemoTopic9(): JSX.Element {
  const [eventLog, setEventLog] = useState<string[]>([]);

  const recordEvent = (type: string, detail: string): void => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog((prev) => [`[${timestamp}] ${type}: ${detail}`, ...prev.slice(0, 4)]);
  };

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> SyntheticEvent in React</div>
        <p className={styles.explanationText}>
          React wraps native browser events in a cross-browser instance called <strong>SyntheticEvent</strong>.
          It has the same interface as the browser&apos;s native event (including <code>stopPropagation()</code> and <code>preventDefault()</code>),
          working identically across all browsers. React events are named using camelCase (e.g. <code>onClick</code>, <code>onKeyDown</code>).
        </p>
      </div>

      <div className={styles.codeBox}>{`// SyntheticEvent handling with preventDefault:
function handleSubmit(e: React.FormEvent) {
  e.preventDefault(); // Prevents full-page HTML reload
  console.log("Form submitted cleanly via React event system");
}`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Event Trigger Pad</div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => recordEvent('onClick', 'Primary Button Pressed')}
          >
            Click Me
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onMouseEnter={() => recordEvent('onMouseEnter', 'Mouse Entered Button Boundary')}
          >
            Hover Me
          </button>

          <input
            className={styles.inputField}
            placeholder="Type here for onKeyDown..."
            onKeyDown={(e) => recordEvent('onKeyDown', `Key: "${e.key}" (Code: ${e.code})`)}
            style={{ width: '240px' }}
          />

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setEventLog([])}
          >
            Clear Log
          </button>
        </div>

        <div style={{ padding: '0.75rem', background: '#090d16', borderRadius: '6px', minHeight: '80px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Recent Synthetic Events:</span>
          {eventLog.length === 0 ? (
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>Interact with the controls above to observe event logs...</p>
          ) : (
            eventLog.map((log, index) => (
              <div key={index} style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> In standard HTML, you return <code>false</code> to prevent default behavior. In React, you must explicitly call <code>e.preventDefault()</code>.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 10: REFS (useRef)
// ============================================================================
function DemoTopic10(): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const clickCountRef = useRef(0);
  const [renderTrigger, setRenderTrigger] = useState(0);

  const focusInput = (): void => {
    inputRef.current?.focus();
    if (inputRef.current) {
      inputRef.current.style.borderColor = '#38bdf8';
    }
  };

  const incrementRefSilently = (): void => {
    clickCountRef.current += 1;
    // Note: Mutating clickCountRef DOES NOT trigger a re-render!
  };

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> useRef: DOM Access & Persistent Values</div>
        <p className={styles.explanationText}>
          <code>useRef</code> returns a mutable object with a <code>.current</code> property. It serves two distinct purposes:
          <br />
          1. <strong>Direct DOM Access</strong>: Focus inputs, scroll positions, measuring elements without querying document.getElementById.
          <br />
          2. <strong>Mutable Value Storage</strong>: Holds a value that persists across renders <em>without triggering a re-render</em> when modified.
        </p>
      </div>

      <div className={styles.codeBox}>{`// 1. Direct DOM node reference:
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />
inputRef.current?.focus();

// 2. Mutable variable that does NOT re-render:
const timerId = useRef<number | null>(null);`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive useRef Demonstration</div>

        {/* DOM Reference demo */}
        <div style={{ marginBottom: '1.25rem' }}>
          <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>1. DOM Node Focus:</strong>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input ref={inputRef} className={styles.inputField} placeholder="Target for programmatic focus" />
            <button type="button" className={styles.btnPrimary} onClick={focusInput}>
              Trigger inputRef.current.focus()
            </button>
          </div>
        </div>

        {/* Mutable Reference without Re-rendering */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
          <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
            2. Mutable Ref value (clickCountRef: {clickCountRef.current}):
          </strong>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button type="button" className={styles.btnSecondary} onClick={incrementRefSilently}>
              Increment Ref Silently (No Re-render)
            </button>
            <button type="button" className={styles.btnPrimary} onClick={() => setRenderTrigger((t) => t + 1)}>
              Force Component Re-render (Trigger: {renderTrigger})
            </button>
          </div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Clicking &quot;Increment Ref Silently&quot; updates the internal value, but UI will not update until a state re-render occurs.
          </p>
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> Modifying <code>ref.current</code> does not trigger a re-render. If you need UI changes in response to data updates, use <code>useState</code> instead.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 11: KEYS WHEN RENDERING LISTS
// ============================================================================
interface StudentItem {
  id: string;
  name: string;
  role: string;
}

function DemoTopic11(): JSX.Element {
  const [students, setStudents] = useState<StudentItem[]>([
    { id: 'S-1', name: 'Alice Sharma', role: 'Assignee' },
    { id: 'S-2', name: 'Bob Verma', role: 'Reviewer' },
    { id: 'S-3', name: 'Charlie Patel', role: 'Client' },
  ]);
  const [newStudentName, setNewStudentName] = useState('');

  const addStudentToTop = (): void => {
    if (!newStudentName.trim()) return;
    const newEntry: StudentItem = {
      id: `S-${Date.now().toString().slice(-4)}`,
      name: newStudentName.trim(),
      role: 'Assignee',
    };
    setStudents([newEntry, ...students]);
    setNewStudentName('');
  };

  const removeStudent = (id: string): void => {
    setStudents(students.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Why Keys Matter in React</div>
        <p className={styles.explanationText}>
          Keys give elements a stable identity across renders. When a list changes, React uses keys to match existing elements with new elements in the Virtual DOM.
          Without unique keys (or when using array indices), reordering or prepending items causes React to inefficiently re-render or incorrectly preserve state in wrong children.
        </p>
      </div>

      <div className={styles.codeBox}>{`// Correct Key Usage (Stable Unique ID):
{students.map((student) => (
  <StudentRow key={student.id} data={student} />
))}

// Anti-pattern to avoid for dynamic lists:
// <StudentRow key={index} data={student} />`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive List Manipulation</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            className={styles.inputField}
            placeholder="Student Name to Prepend"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
          />
          <button type="button" className={styles.btnPrimary} onClick={addStudentToTop}>
            <Plus size={14} /> Prepend to List
          </button>
        </div>

        <div>
          {students.map((student) => (
            <div
              key={student.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.6rem 0.75rem',
                background: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                marginBottom: '0.4rem',
              }}
            >
              <div>
                <strong style={{ color: '#f8fafc' }}>{student.name}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.75rem' }}>
                  Role: {student.role} | Key: <code style={{ color: '#38bdf8' }}>{student.id}</code>
                </span>
              </div>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => removeStudent(student.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> Keys must be unique among siblings. They do not need to be globally unique across the entire application.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 12: LIFECYCLE CONCEPTS (useEffect & CLEANUP)
// ============================================================================
function TimerWidget(): JSX.Element {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Mounting Phase: Start interval timer
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    // Unmounting Phase: Cleanup function to avoid memory leaks
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ padding: '0.75rem', background: '#090d16', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Clock size={18} color="#38bdf8" />
      <span>Timer running: <strong style={{ color: '#38bdf8' }}>{seconds}s</strong></span>
    </div>
  );
}

function DemoTopic12(): JSX.Element {
  const [isWidgetActive, setIsWidgetActive] = useState(true);

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Component Lifecycle & useEffect</div>
        <p className={styles.explanationText}>
          Component lifecycle consists of 3 phases:
          <br />
          1. <strong>Mounting</strong>: Inserted into the DOM (<code>useEffect(..., [])</code>).
          <br />
          2. <strong>Updating</strong>: Re-rendering due to state/prop changes (<code>useEffect(..., [deps])</code>).
          <br />
          3. <strong>Unmounting</strong>: Removed from DOM. Cleanup functions returned from <code>useEffect</code> run here to clear timers, sockets, or listeners.
        </p>
      </div>

      <div className={styles.codeBox}>{`useEffect(() => {
  const id = setInterval(() => tick(), 1000); // Setup on mount

  return () => {
    clearInterval(id); // Cleanup on unmount (prevents memory leak!)
  };
}, []);`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Lifecycle Mount / Unmount</div>
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className={isWidgetActive ? styles.btnDanger : styles.btnPrimary}
            onClick={() => setIsWidgetActive(!isWidgetActive)}
          >
            {isWidgetActive ? 'Unmount Timer Widget' : 'Mount Timer Widget'}
          </button>
        </div>

        {isWidgetActive ? (
          <TimerWidget />
        ) : (
          <p style={{ margin: 0, color: '#f87171', fontSize: '0.85rem' }}>
            Timer widget unmounted. The <code>return () =&gt; clearInterval(...)</code> cleanup function was executed.
          </p>
        )}
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> In class components, lifecycle methods were <code>componentDidMount</code>, <code>componentDidUpdate</code>, and <code>componentWillUnmount</code>. In modern React, <code>useEffect</code> unifies all three.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 13: REACT ROUTER & NAVIGATION
// ============================================================================
function DemoTopic13(): JSX.Element {
  const navigate = useNavigate();
  const [targetPath, setTargetPath] = useState('/client');

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Client-Side Routing (CSR)</div>
        <p className={styles.explanationText}>
          Traditional web applications make a new HTTP request to the server on every link click, reloading the entire page.
          <strong> React Router</strong> enables Client-Side Routing: it intercepts link clicks, updates the browser URL using the HTML5 History API,
          and renders the corresponding component hierarchy instantly without page refresh.
        </p>
      </div>

      <div className={styles.codeBox}>{`// 1. Route declaration in AppRoutes.tsx:
<Routes>
  <Route path="/client" element={<ClientOverview />} />
  <Route path="/learning/react" element={<ReactPlayground />} />
</Routes>

// 2. Programmatic Navigation:
const navigate = useNavigate();
navigate("/manager");`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Route Simulator</div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className={styles.inputField}
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
          >
            <option value="/client">/client (Client Dashboard)</option>
            <option value="/manager">/manager (Manager Dashboard)</option>
            <option value="/assignee">/assignee (Assignee Dashboard)</option>
            <option value="/reviewer">/reviewer (Reviewer Dashboard)</option>
            <option value="/landing">/landing (Public Landing Page)</option>
          </select>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => navigate(targetPath)}
          >
            Execute navigate(&quot;{targetPath}&quot;)
          </button>
        </div>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
          Clicking above navigates dynamically within the existing React Router instance.
        </p>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> <code>&lt;Link to=&quot;...&quot;&gt;</code> replaces standard <code>&lt;a href=&quot;...&quot;&gt;</code> tags to prevent browser full-page reload cycles.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 14: FLUX ARCHITECTURE & UNIDIRECTIONAL FLOW
// ============================================================================
function DemoTopic14(): JSX.Element {
  const [fluxStep, setFluxStep] = useState(0);

  const steps = [
    { title: '1. Action', desc: 'User triggers an event (e.g., button click). An action object is dispatched containing type & payload.' },
    { title: '2. Dispatcher', desc: 'Central hub that receives all actions and broadcasts them to registered Stores.' },
    { title: '3. Store', desc: 'Holds application state and business logic. Updates state in response to received action.' },
    { title: '4. View (React)', desc: 'Listens to Store updates, re-renders with fresh data, and displays output to the user.' },
  ];

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Flux Architecture Concept</div>
        <p className={styles.explanationText}>
          <strong>Flux</strong> is an application architecture design pattern created by Facebook to enforce strict <strong>unidirectional data flow</strong>.
          In traditional MVC (Model-View-Controller), multiple models could trigger updates in multiple views and vice-versa, creating cascading updates and unpredictability.
          Flux mandates: <code>Action &rarr; Dispatcher &rarr; Store &rarr; View</code>.
        </p>
      </div>

      <div className={styles.codeBox}>{`// Flux Unidirectional Pipeline:
[ USER INTERACTION ]
       │
       ▼
 [ 1. ACTION ]    ──► { type: "COMPLETE_TASK", payload: { id: "T-101" } }
       │
       ▼
[ 2. DISPATCHER ] ──► Central registry for action routing
       │
       ▼
  [ 3. STORE ]    ──► State updated immutably
       │
       ▼
  [ 4. VIEW ]     ──► React components re-render with fresh state`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Interactive Flux Pipeline Step-Through</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {steps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className={fluxStep === idx ? styles.btnPrimary : styles.btnSecondary}
              onClick={() => setFluxStep(idx)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        <div style={{ padding: '1rem', background: '#090d16', border: '1px solid #1e293b', borderRadius: '6px' }}>
          <strong style={{ color: '#38bdf8' }}>{steps[fluxStep].title}</strong>
          <p style={{ margin: '0.4rem 0 0', color: '#cbd5e1', fontSize: '0.85rem' }}>
            {steps[fluxStep].desc}
          </p>
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> Flux differs from MVC by eliminating bidirectional updates. Data can never flow backwards from View to Store directly.
      </div>
    </div>
  );
}

// ============================================================================
// TOPIC 15: REDUX CONCEPTS & REDUX TOOLKIT
// ============================================================================
function DemoTopic15(): JSX.Element {
  const dispatch = useAppDispatch();
  const learningState = useAppSelector((state) => state.learning);
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newItemText.trim()) {
      dispatch(addItem(newItemText.trim()));
      setNewItemText('');
    }
  };

  return (
    <div>
      <div className={styles.sectionBlock}>
        <div className={styles.sectionTitle}><BookOpen size={16} /> Redux & Redux Toolkit (RTK)</div>
        <p className={styles.explanationText}>
          <strong>Redux</strong> is a predictable state container for JavaScript apps based on Flux.
          <strong> Redux Toolkit (RTK)</strong> is the official, opinionated standard for writing modern Redux.
          It includes utilities like <code>configureStore</code>, <code>createSlice</code> (auto-generating action creators and action types),
          and built-in Immer support for safe mutable-style updates.
        </p>
      </div>

      <div className={styles.codeBox}>{`// 1. Redux Toolkit createSlice:
const slice = createSlice({
  name: 'learning',
  initialState: { counter: 0 },
  reducers: {
    increment(state) { state.counter += 1; }
  }
});

// 2. Dispatching from components:
const dispatch = useAppDispatch();
dispatch(increment());`}</div>

      <div className={styles.playgroundBox}>
        <div className={styles.interactiveLabel}><Zap size={14} /> Live Redux Store Demonstration (Connected to RTK Store)</div>

        {/* Global Counter in Redux */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem' }}>Redux Store Counter:</span>
          <strong style={{ fontSize: '1.5rem', color: '#38bdf8' }}>{learningState.counter}</strong>
          <button type="button" className={styles.btnPrimary} onClick={() => dispatch(increment())}>
            dispatch(increment())
          </button>
          <button type="button" className={styles.btnSecondary} onClick={() => dispatch(decrement())}>
            dispatch(decrement())
          </button>
          <button type="button" className={styles.btnSecondary} onClick={() => dispatch(resetCounter())}>
            dispatch(resetCounter())
          </button>
        </div>

        {/* Dynamic Item List in Redux */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              className={styles.inputField}
              placeholder="New Redux Item..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className={styles.btnPrimary}>
              dispatch(addItem())
            </button>
          </form>

          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Items stored in Redux State Tree:</span>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0' }}>
            {learningState.items.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.4rem 0.6rem',
                  background: '#090d16',
                  borderRadius: '4px',
                  marginBottom: '0.3rem',
                  fontSize: '0.85rem',
                }}
              >
                <span>{item}</span>
                <button
                  type="button"
                  className={styles.btnDanger}
                  onClick={() => dispatch(removeItem(idx))}
                  style={{ padding: '0.2rem 0.5rem' }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
            Last Dispatched Action: <code style={{ color: '#c084fc' }}>{learningState.lastAction}</code>
          </div>
        </div>
      </div>

      <div className={styles.examNote}>
        <strong>Exam / Viva Tip:</strong> The 3 Core Principles of Redux are: 1) Single source of truth, 2) State is read-only (mutated only via actions), 3) Changes are made with pure functions (reducers).
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PLAYGROUND COMPONENT
// ============================================================================
export function ReactPlayground(): JSX.Element {
  const [activeTopicId, setActiveTopicId] = useState('jsx-intro');
  const navigate = useNavigate();

  const activeTopic = TOPICS.find((t) => t.id === activeTopicId) ?? TOPICS[0];

  const renderActiveDemo = (): JSX.Element => {
    switch (activeTopicId) {
      case 'jsx-intro': return <DemoTopic1 />;
      case 'functional-components': return <DemoTopic2 />;
      case 'props-state': return <DemoTopic3 />;
      case 'composition': return <DemoTopic4 />;
      case 'parent-to-child': return <DemoTopic5 />;
      case 'child-to-parent': return <DemoTopic6 />;
      case 'styling': return <DemoTopic7 />;
      case 'forms-controlled': return <DemoTopic8 />;
      case 'events': return <DemoTopic9 />;
      case 'refs': return <DemoTopic10 />;
      case 'list-keys': return <DemoTopic11 />;
      case 'lifecycle-effect': return <DemoTopic12 />;
      case 'router-nav': return <DemoTopic13 />;
      case 'flux-unidirectional': return <DemoTopic14 />;
      case 'redux-toolkit': return <DemoTopic15 />;
      default: return <DemoTopic1 />;
    }
  };

  const categories = Array.from(new Set(TOPICS.map((t) => t.category)));

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>
            <Code color="#38bdf8" size={24} />
            Unit II: React Concepts Playground
            <span className={styles.badge}>Web Technology Syllabus</span>
          </h1>
          <p className={styles.subtitle}>
            Interactive, syllabus-aligned demonstrations of core React concepts, hooks, lifecycle, routing, and Redux Toolkit.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate('/login')}
          >
            <Home size={15} />
            Back to Login / Roles
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className={styles.mainLayout}>
        {/* Topic Navigation Sidebar */}
        <aside className={styles.sidebar}>
          {categories.map((category) => (
            <div key={category} className={styles.categoryGroup}>
              <div className={styles.categoryTitle}>{category}</div>
              <ul className={styles.topicList}>
                {TOPICS.filter((t) => t.category === category).map((topic) => (
                  <li key={topic.id} className={styles.topicItem}>
                    <button
                      type="button"
                      className={`${styles.topicBtn} ${activeTopicId === topic.id ? styles.topicBtnActive : ''}`}
                      onClick={() => setActiveTopicId(topic.id)}
                    >
                      {topic.icon}
                      <span>{topic.number}. {topic.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* Content & Interactive Playground Area */}
        <main className={styles.contentArea}>
          {/* Unit I Banner connecting to PHP/Laravel syllabus module */}
          <div className={styles.phpBanner}>
            <div className={styles.phpBannerText}>
              <h3>Unit I: PHP & Laravel Syllabus Module Available</h3>
              <p>
                12 runnable standalone PHP scripts, MySQL prepared statement CRUD, and Laravel MVC controllers are created in <code>php-laravel/unit1_php/</code>.
              </p>
            </div>
            <div className={styles.phpCliCommand}>
              php php-laravel/unit1_php/run_all.php
            </div>
          </div>

          {/* Active Demonstration Card */}
          <div className={styles.topicCard}>
            <div className={styles.topicHeader}>
              <h2>Topic {activeTopic.number}: {activeTopic.title}</h2>
              <span className={styles.badge}>{activeTopic.category}</span>
            </div>

            {renderActiveDemo()}
          </div>
        </main>
      </div>
    </div>
  );
}
export default ReactPlayground;
