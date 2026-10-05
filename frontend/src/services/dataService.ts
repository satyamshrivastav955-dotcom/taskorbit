import type {
  Project,
  Task,
  UserProfile,
  Submission,
  Review,
  AppNotification,
  ActivityLog,
  ConflictDetail,
  Requirement,
} from '../types';

// ==========================================
// 1. INITIAL USERS (Consistent across all views)
// ==========================================
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user-rahul',
    name: 'Rahul Sharma',
    email: 'rahul@taskorbit.com',
    role: 'manager',
    jobTitle: 'UI/UX Designer & Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    department: 'Product Design',
    bio: 'Designer with 4+ years of experience in UI/UX and product design.',
    activeProjectsCount: 3,
    assignedTasksCount: 8,
    workloadPercentage: 80,
    availabilityStatus: 'Overloaded',
    createdAt: '2025-01-10',
  },
  {
    uid: 'user-priya',
    name: 'Priya Mehta',
    email: 'priya@taskorbit.com',
    role: 'assignee',
    jobTitle: 'Frontend Developer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43211',
    department: 'Frontend Engineering',
    bio: 'Passionate React and UI developer specializing in accessible web apps.',
    activeProjectsCount: 4,
    assignedTasksCount: 6,
    workloadPercentage: 61,
    availabilityStatus: 'Busy',
    createdAt: '2025-01-12',
  },
  {
    uid: 'user-arjun',
    name: 'Arjun Kapoor',
    email: 'arjun@taskorbit.com',
    role: 'assignee',
    jobTitle: 'Backend Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43212',
    department: 'Platform Architecture',
    bio: 'Backend systems, cloud scaling, and API design specialist.',
    activeProjectsCount: 3,
    assignedTasksCount: 8,
    workloadPercentage: 91,
    availabilityStatus: 'Busy',
    createdAt: '2025-01-14',
  },
  {
    uid: 'user-neha',
    name: 'Neha Verma',
    email: 'neha@taskorbit.com',
    role: 'reviewer',
    jobTitle: 'Lead Reviewer & Content Strategist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43213',
    department: 'Quality & Design Standards',
    bio: 'Ensuring top quality deliverables, design compliance, and product polish.',
    activeProjectsCount: 2,
    assignedTasksCount: 3,
    workloadPercentage: 43,
    availabilityStatus: 'Available',
    createdAt: '2025-01-15',
  },
  {
    uid: 'user-karan',
    name: 'Karan Sethi',
    email: 'karan@taskorbit.com',
    role: 'assignee',
    jobTitle: 'QA Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43214',
    department: 'Quality Assurance',
    bio: 'End-to-end automation and security test engineer.',
    activeProjectsCount: 2,
    assignedTasksCount: 4,
    workloadPercentage: 50,
    availabilityStatus: 'Available',
    createdAt: '2025-01-20',
  },
  {
    uid: 'user-simran',
    name: 'Simran Kaur',
    email: 'simran@taskorbit.com',
    role: 'assignee',
    jobTitle: 'Graphic Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43215',
    department: 'Brand Design',
    bio: 'Illustrator and motion designer creating engaging visual identities.',
    activeProjectsCount: 2,
    assignedTasksCount: 4,
    workloadPercentage: 45,
    availabilityStatus: 'Available',
    createdAt: '2025-02-01',
  },
  {
    uid: 'user-aditya',
    name: 'Aditya Rao',
    email: 'aditya@taskorbit.com',
    role: 'assignee',
    jobTitle: 'DevOps Engineer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43216',
    department: 'Infrastructure',
    bio: 'CI/CD pipeline and cloud infrastructure maintainer.',
    activeProjectsCount: 1,
    assignedTasksCount: 2,
    workloadPercentage: 30,
    availabilityStatus: 'Available',
    createdAt: '2025-02-10',
  },
  {
    uid: 'user-meera',
    name: 'Meera Iyer',
    email: 'meera@taskorbit.com',
    role: 'manager',
    jobTitle: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43217',
    department: 'Product',
    bio: 'Aligning business priorities with development execution.',
    activeProjectsCount: 3,
    assignedTasksCount: 5,
    workloadPercentage: 70,
    availabilityStatus: 'Busy',
    createdAt: '2025-02-15',
  },
  {
    uid: 'user-client-acme',
    name: 'Acme Corp (Amit Patel)',
    email: 'amit@acme.com',
    role: 'client',
    jobTitle: 'Client Representative',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 555 0192',
    department: 'Client Stakeholder',
    bio: 'VP of Product at Acme Corp.',
    activeProjectsCount: 2,
    assignedTasksCount: 0,
    workloadPercentage: 0,
    availabilityStatus: 'Available',
    createdAt: '2025-01-05',
  },
];

// ==========================================
// 2. INITIAL PROJECTS (From Reference Images)
// ==========================================
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Website Redesign',
    description: 'Complete redesign of the company website with modern UI/UX, improved performance, and new content structure.',
    clientId: 'user-client-acme',
    clientName: 'Acme Corp',
    managerId: 'user-rahul',
    status: 'on_track',
    priority: 'high',
    startDate: '2025-01-15',
    deadline: '2025-03-30',
    progress: 72,
    tasksCompleted: 12,
    totalTasks: 17,
    teamIds: ['user-rahul', 'user-priya', 'user-arjun', 'user-neha'],
    milestones: [
      { id: 'm-1', title: 'Planning Complete', date: '2025-03-16', completed: true, phase: 'Planning & Research' },
      { id: 'm-2', title: 'Design Complete', date: '2025-03-23', completed: true, phase: 'Design' },
      { id: 'm-3', title: 'Testing Complete', date: '2025-03-28', completed: false, phase: 'Testing' },
      { id: 'm-4', title: 'Project Launch', date: '2025-03-30', completed: false, phase: 'Review & Launch' },
    ],
    createdAt: '2025-01-10',
  },
  {
    id: 'proj-2',
    title: 'Mobile Application',
    description: 'Cross-platform mobile application for Android and iOS providing real-time client analytics and task tracking.',
    clientId: 'user-client-acme',
    clientName: 'NovaTech',
    managerId: 'user-rahul',
    status: 'at_risk',
    priority: 'high',
    startDate: '2025-02-05',
    deadline: '2025-04-12',
    progress: 48,
    tasksCompleted: 8,
    totalTasks: 17,
    teamIds: ['user-priya', 'user-arjun', 'user-karan', 'user-rahul'],
    milestones: [
      { id: 'm-21', title: 'Core Architecture', date: '2025-02-25', completed: true },
      { id: 'm-22', title: 'Beta Testing', date: '2025-03-25', completed: false },
      { id: 'm-23', title: 'App Store Submission', date: '2025-04-12', completed: false },
    ],
    createdAt: '2025-02-01',
  },
  {
    id: 'proj-3',
    title: 'Marketing Campaign',
    description: 'Comprehensive digital marketing rollout including video promos, social assets, and landing page content.',
    clientId: 'user-client-acme',
    clientName: 'BrightMedia',
    managerId: 'user-meera',
    status: 'on_track',
    priority: 'medium',
    startDate: '2025-02-15',
    deadline: '2025-03-28',
    progress: 86,
    tasksCompleted: 19,
    totalTasks: 22,
    teamIds: ['user-rahul', 'user-neha', 'user-simran'],
    milestones: [
      { id: 'm-31', title: 'Asset Production', date: '2025-03-15', completed: true },
      { id: 'm-32', title: 'Campaign Go-Live', date: '2025-03-28', completed: false },
    ],
    createdAt: '2025-02-10',
  },
  {
    id: 'proj-4',
    title: 'Client Portal',
    description: 'Self-service client portal for document management, progress review, and feedback submissions.',
    clientId: 'user-client-acme',
    clientName: 'Zenith Solutions',
    managerId: 'user-rahul',
    status: 'delayed',
    priority: 'medium',
    startDate: '2025-01-20',
    deadline: '2025-04-25',
    progress: 35,
    tasksCompleted: 7,
    totalTasks: 20,
    teamIds: ['user-arjun', 'user-priya', 'user-aditya'],
    milestones: [
      { id: 'm-41', title: 'Database & Auth', date: '2025-02-28', completed: true },
      { id: 'm-42', title: 'Feature Rollout', date: '2025-04-10', completed: false },
    ],
    createdAt: '2025-01-18',
  },
  {
    id: 'proj-5',
    title: 'Brand Identity',
    description: 'New corporate design system, brand voice guidelines, typography standards, and marketing collateral.',
    clientId: 'user-client-acme',
    clientName: 'Pixel Studio',
    managerId: 'user-meera',
    status: 'on_track',
    priority: 'medium',
    startDate: '2025-03-01',
    deadline: '2025-04-18',
    progress: 60,
    tasksCompleted: 9,
    totalTasks: 15,
    teamIds: ['user-simran', 'user-rahul', 'user-neha'],
    milestones: [
      { id: 'm-51', title: 'Brand Concepts', date: '2025-03-15', completed: true },
      { id: 'm-52', title: 'Final Guidelines', date: '2025-04-18', completed: false },
    ],
    createdAt: '2025-02-28',
  },
  {
    id: 'proj-6',
    title: 'Internal Dashboard',
    description: 'Operations cockpit with team analytics, conflict alerting, and lifecycle milestone tracking.',
    clientId: 'user-client-acme',
    clientName: 'TaskOrbit',
    managerId: 'user-rahul',
    status: 'at_risk',
    priority: 'low',
    startDate: '2025-03-05',
    deadline: '2025-05-10',
    progress: 25,
    tasksCompleted: 5,
    totalTasks: 20,
    teamIds: ['user-arjun', 'user-priya'],
    createdAt: '2025-03-01',
  },
  {
    id: 'proj-7',
    title: 'Product Launch',
    description: 'Public rollout of the new cloud platform, marketing announcement, and onboarding documentation.',
    clientId: 'user-client-acme',
    clientName: 'Orbit Tech',
    managerId: 'user-meera',
    status: 'on_track',
    priority: 'high',
    startDate: '2025-02-01',
    deadline: '2025-03-20',
    progress: 90,
    tasksCompleted: 18,
    totalTasks: 20,
    teamIds: ['user-rahul', 'user-priya', 'user-neha', 'user-aditya'],
    createdAt: '2025-01-25',
  },
  {
    id: 'proj-8',
    title: 'Content Strategy',
    description: 'Editorial calendar, technical whitepapers, and customer case studies for Q2.',
    clientId: 'user-client-acme',
    clientName: 'Sphere Media',
    managerId: 'user-meera',
    status: 'not_started',
    priority: 'low',
    startDate: '2025-04-01',
    deadline: '2025-04-30',
    progress: 0,
    tasksCompleted: 0,
    totalTasks: 12,
    teamIds: ['user-neha', 'user-simran'],
    createdAt: '2025-03-10',
  },
];

// ==========================================
// 3. INITIAL TASKS (With Real Overlap Conflicts!)
// ==========================================
export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    taskIdCode: 'TASK-101',
    projectId: 'proj-1',
    projectName: 'Website Redesign',
    title: 'Homepage UI Design',
    description: 'Create a modern, responsive homepage design for the company website that aligns with the brand guidelines and approved wireframes. Focus on clean UI, clear messaging, and conversion optimization for both desktop and mobile.',
    assigneeId: 'user-rahul',
    reviewerId: 'user-neha',
    startDate: '2025-03-10',
    deadline: '2025-03-16',
    priority: 'high',
    status: 'in_progress',
    conflictWith: [],
    revisionCount: 1,
    progress: 60,
    estimatedHours: 24,
    actualHours: 12,
    labels: ['UI/UX', 'Design'],
    requirementsList: [
      'Use approved brand guidelines',
      'Design for desktop and mobile',
      'Include hero section, features, and testimonials',
      'Follow accessibility best practices',
    ],
    subtasks: [
      { id: 'st-1', title: 'Design hero section', completed: true, dueDate: '2025-03-12', status: 'completed' },
      { id: 'st-2', title: 'Create feature cards', completed: true, dueDate: '2025-03-14', status: 'completed' },
      { id: 'st-3', title: 'Design testimonials section', completed: false, dueDate: '2025-03-16', status: 'in_progress' },
      { id: 'st-4', title: 'Mobile responsive design', completed: false, dueDate: '2025-03-18', status: 'todo' },
    ],
    attachments: [
      { id: 'att-1', name: 'homepage-wireframe.fig', type: 'figma', size: '2.4 MB', url: '#', uploadedAt: '2025-03-10' },
      { id: 'att-2', name: 'brand-guidelines.pdf', type: 'pdf', size: '1.8 MB', url: '#', uploadedAt: '2025-03-10' },
      { id: 'att-3', name: 'hero-section.png', type: 'image', size: '1.2 MB', url: '#', uploadedAt: '2025-03-12' },
      { id: 'att-4', name: 'competitor-examples.zip', type: 'archive', size: '4.6 MB', url: '#', uploadedAt: '2025-03-11' },
    ],
    comments: [
      {
        id: 'c-1',
        userId: 'user-arjun',
        userName: 'Arjun Kapoor',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: "The hero section looks great! Let's also add a subtle animation to make it more engaging.",
        createdAt: '2025-03-12 11:20 AM',
        likes: 2,
      },
      {
        id: 'c-2',
        userId: 'user-priya',
        userName: 'Priya Mehta',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        content: 'Please make sure the mobile version follows the updated spacing guidelines from the brand doc.',
        createdAt: '2025-03-11 03:45 PM',
        likes: 1,
      },
    ],
    dependencies: [
      { id: 'dep-1', title: 'Brand Guidelines', status: 'completed' },
      { id: 'dep-2', title: 'Content Creation', status: 'in_progress' },
    ],
    createdAt: '2025-03-10',
    updatedAt: '2025-03-14',
  },
  {
    id: 'task-video-edit',
    taskIdCode: 'TASK-102',
    projectId: 'proj-3',
    projectName: 'Marketing Campaign',
    title: 'Video Editing',
    description: 'Edit promo teaser videos for social media ads and product announcement showcase.',
    assigneeId: 'user-rahul',
    reviewerId: 'user-neha',
    startDate: '2025-03-10',
    deadline: '2025-03-15',
    priority: 'high',
    status: 'in_progress',
    conflictWith: ['task-thumb-design'], // Overlaps with task-thumb-design for Rahul!
    revisionCount: 0,
    progress: 40,
    labels: ['Video', 'Marketing'],
    requirementsList: ['1080p 60fps', 'Soundtrack synced', 'Call to action card'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-08',
    updatedAt: '2025-03-11',
  },
  {
    id: 'task-thumb-design',
    taskIdCode: 'TASK-103',
    projectId: 'proj-3',
    projectName: 'Marketing Campaign',
    title: 'Thumbnail Design',
    description: 'Design YouTube and social marketing campaign high-CTR cover thumbnails.',
    assigneeId: 'user-rahul',
    reviewerId: 'user-neha',
    startDate: '2025-03-14',
    deadline: '2025-03-18',
    priority: 'medium',
    status: 'todo',
    conflictWith: ['task-video-edit'], // Overlaps with task-video-edit for Rahul!
    revisionCount: 0,
    progress: 0,
    labels: ['Graphics', 'Marketing'],
    requirementsList: ['1280x720', 'High contrast headline text', 'Logo placement in top left'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-09',
    updatedAt: '2025-03-12',
  },
  {
    id: 'task-api-int',
    taskIdCode: 'TASK-201',
    projectId: 'proj-2',
    projectName: 'Mobile Application',
    title: 'API Integration',
    description: 'Integrate client authentication, analytics endpoints, and push notifications with backend service.',
    assigneeId: 'user-priya',
    reviewerId: 'user-rahul',
    startDate: '2025-03-14',
    deadline: '2025-03-22',
    priority: 'high',
    status: 'in_progress',
    conflictWith: ['task-mobile-ui'], // Overlaps with Mobile UI for Priya!
    revisionCount: 0,
    progress: 55,
    labels: ['Frontend', 'API'],
    requirementsList: ['OAuth token refresh handling', 'Offline cache sync', 'Unit test coverage > 80%'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-12',
    updatedAt: '2025-03-14',
  },
  {
    id: 'task-mobile-ui',
    taskIdCode: 'TASK-202',
    projectId: 'proj-2',
    projectName: 'Mobile Application',
    title: 'Mobile UI Screens',
    description: 'Build responsive views for mobile project lists, milestone widgets, and feedback cards.',
    assigneeId: 'user-priya',
    reviewerId: 'user-neha',
    startDate: '2025-03-18',
    deadline: '2025-03-25',
    priority: 'medium',
    status: 'todo',
    conflictWith: ['task-api-int'], // Overlaps with API Integration for Priya!
    revisionCount: 0,
    progress: 10,
    labels: ['Mobile', 'UI'],
    requirementsList: ['iOS Safari & Chrome Android testing', 'Fluid touch response'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-13',
    updatedAt: '2025-03-13',
  },
  {
    id: 'task-db-schema',
    taskIdCode: 'TASK-301',
    projectId: 'proj-4',
    projectName: 'Client Portal',
    title: 'Database Schema',
    description: 'Design relational tables and indexing for client multi-tenancy, documents, and audit trails.',
    assigneeId: 'user-arjun',
    reviewerId: 'user-rahul',
    startDate: '2025-03-20',
    deadline: '2025-03-27',
    priority: 'high',
    status: 'todo',
    conflictWith: ['task-client-review'], // Overlaps with task-client-review for Arjun!
    revisionCount: 0,
    progress: 0,
    labels: ['Database', 'Backend'],
    requirementsList: ['Postgres migrations', 'Foreign key cascade rules', 'Benchmark queries'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-14',
    updatedAt: '2025-03-14',
  },
  {
    id: 'task-client-review',
    taskIdCode: 'TASK-302',
    projectId: 'proj-1',
    projectName: 'Website Redesign',
    title: 'Client Review Preparation',
    description: 'Consolidate staging deliverables, deployment link, and user guides for executive client review.',
    assigneeId: 'user-arjun',
    reviewerId: 'user-rahul',
    startDate: '2025-03-22',
    deadline: '2025-03-28',
    priority: 'medium',
    status: 'in_review',
    conflictWith: ['task-db-schema'], // Overlaps with DB schema for Arjun!
    revisionCount: 0,
    progress: 80,
    labels: ['Review', 'Client'],
    requirementsList: ['Staging link active', 'Demo credentials verified'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-14',
    updatedAt: '2025-03-14',
  },
  {
    id: 'task-content-creation',
    taskIdCode: 'TASK-401',
    projectId: 'proj-3',
    projectName: 'Marketing Campaign',
    title: 'Content Creation',
    description: 'Draft marketing copy, landing page headlines, and client newsletter blast.',
    assigneeId: 'user-neha',
    reviewerId: 'user-rahul',
    startDate: '2025-03-11',
    deadline: '2025-03-16',
    priority: 'medium',
    status: 'in_progress',
    conflictWith: [],
    revisionCount: 0,
    progress: 50,
    labels: ['Copywriting', 'Marketing'],
    requirementsList: ['SEO keywords included', 'Target tone: professional & energetic'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-10',
    updatedAt: '2025-03-13',
  },
  {
    id: 'task-testing-qa',
    taskIdCode: 'TASK-501',
    projectId: 'proj-2',
    projectName: 'Mobile Application',
    title: 'Testing & QA',
    description: 'End-to-end regression testing, load tests on cloud endpoints, and cross-device testing.',
    assigneeId: 'user-karan',
    reviewerId: 'user-rahul',
    startDate: '2025-03-28',
    deadline: '2025-04-05',
    priority: 'medium',
    status: 'todo',
    conflictWith: [],
    revisionCount: 0,
    progress: 0,
    labels: ['QA', 'Testing'],
    requirementsList: ['Bug reports logged in tracking system', 'Zero critical blocker issues'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-14',
    updatedAt: '2025-03-14',
  },
  {
    id: 'task-brand-guidelines',
    taskIdCode: 'TASK-601',
    projectId: 'proj-5',
    projectName: 'Brand Identity',
    title: 'Brand Guidelines',
    description: 'Prepare color palette specifications, font hierarchies, logo usage rules, and export specs.',
    assigneeId: 'user-simran',
    reviewerId: 'user-neha',
    startDate: '2025-03-05',
    deadline: '2025-03-15',
    priority: 'low',
    status: 'approved',
    conflictWith: [],
    revisionCount: 0,
    progress: 100,
    labels: ['Branding', 'Design'],
    requirementsList: ['Export PDF', 'Figma design tokens synced'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-01',
    updatedAt: '2025-03-15',
  },
  {
    id: 'task-user-training',
    taskIdCode: 'TASK-701',
    projectId: 'proj-4',
    projectName: 'Client Portal',
    title: 'User Training & Documentation',
    description: 'Produce quick-start guides and screencast tutorials for client team members.',
    assigneeId: 'user-arjun',
    reviewerId: 'user-neha',
    startDate: '2025-04-05',
    deadline: '2025-04-10',
    priority: 'low',
    status: 'todo',
    conflictWith: [],
    revisionCount: 0,
    progress: 0,
    labels: ['Docs', 'Support'],
    requirementsList: ['Video walk-throughs under 3 minutes', 'Markdown user manual'],
    subtasks: [],
    attachments: [],
    createdAt: '2025-03-14',
    updatedAt: '2025-03-14',
  },
];

// ==========================================
// 4. INITIAL REQUIREMENTS (Client Portal)
// ==========================================
export const INITIAL_REQUIREMENTS: Requirement[] = [
  {
    id: 'req-1',
    projectId: 'proj-1',
    title: 'Homepage Design',
    description: 'Modern and clean homepage design with responsive behavior and brand aesthetic.',
    status: 'In Progress',
    priority: 'high',
    submittedDate: '2025-01-12',
    fileUrls: ['brand_spec.pdf'],
    createdAt: '2025-01-12',
  },
  {
    id: 'req-2',
    projectId: 'proj-1',
    title: 'Contact Us Page',
    description: 'Design contact page with interactive enquiry form and office location map.',
    status: 'Completed',
    priority: 'medium',
    submittedDate: '2025-01-15',
    fileUrls: ['contact_requirements.docx'],
    createdAt: '2025-01-15',
  },
  {
    id: 'req-3',
    projectId: 'proj-1',
    title: 'Service Pages',
    description: 'Create individual service detail pages with client testimonials and pricing tables.',
    status: 'Pending',
    priority: 'medium',
    submittedDate: '2025-01-20',
    fileUrls: [],
    createdAt: '2025-01-20',
  },
  {
    id: 'req-4',
    projectId: 'proj-1',
    title: 'Blog Section',
    description: 'Add blog listing and article detail templates with social sharing buttons.',
    status: 'In Progress',
    priority: 'low',
    submittedDate: '2025-02-01',
    fileUrls: [],
    createdAt: '2025-02-01',
  },
  {
    id: 'req-5',
    projectId: 'proj-1',
    title: 'Mobile Responsive',
    description: 'Ensure mobile compatibility across iOS Safari, iPadOS, and modern Android browsers.',
    status: 'Completed',
    priority: 'high',
    submittedDate: '2025-02-10',
    fileUrls: [],
    createdAt: '2025-02-10',
  },
  {
    id: 'req-6',
    projectId: 'proj-1',
    title: 'SEO Optimization',
    description: 'Basic on-page SEO setup, meta description tags, OpenGraph sharing cards.',
    status: 'Pending',
    priority: 'low',
    submittedDate: '2025-02-16',
    fileUrls: [],
    createdAt: '2025-02-16',
  },
];

// ==========================================
// 5. INITIAL SUBMISSIONS & REVIEWS
// ==========================================
export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    taskId: 'task-1',
    submittedBy: 'user-priya',
    fileUrl: 'https://taskorbit.internal/files/homepage-design-v1.fig',
    fileName: 'homepage-design-v1.fig',
    files: [
      { id: 'f-1', name: 'hero-section-final.fig', type: 'figma', size: '2.4 MB', url: '#', uploadedAt: '2025-03-12' },
      { id: 'f-2', name: 'hero-section-preview.png', type: 'image', size: '1.2 MB', url: '#', uploadedAt: '2025-03-12' },
    ],
    note: 'Initial submission of desktop and mobile mockups for homepage design.',
    version: 1,
    submittedAt: '2025-03-12 10:30 AM',
  },
  {
    id: 'sub-2',
    taskId: 'task-1',
    submittedBy: 'user-priya',
    fileUrl: 'https://taskorbit.internal/files/homepage-design-v2.fig',
    fileName: 'homepage-design-v2.fig',
    files: [
      { id: 'f-3', name: 'homepage-desktop-v2.fig', type: 'figma', size: '3.1 MB', url: '#', uploadedAt: '2025-03-14' },
      { id: 'f-4', name: 'homepage-mobile-v2.png', type: 'image', size: '980 KB', url: '#', uploadedAt: '2025-03-14' },
    ],
    note: 'Updated header spacing and hero headline contrast per reviewer feedback.',
    version: 2,
    submittedAt: '2025-03-14 11:10 AM',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    taskId: 'task-1',
    submissionId: 'sub-1',
    reviewerId: 'user-neha',
    decision: 'rejected',
    comments: 'Looks good overall! Please adjust the spacing on the hero section and ensure mobile button contrast meets WCAG AA standards.',
    checklistResults: [
      { id: 'chk-1', label: 'UI follows brand guidelines', passed: true },
      { id: 'chk-2', label: 'Responsive design implementation', passed: false },
      { id: 'chk-3', label: 'Code quality and structure', passed: true },
      { id: 'chk-4', label: 'All requirements met', passed: true },
    ],
    annotations: [
      { id: 'an-1', number: 1, x: 25, y: 35, comment: 'Use a stronger headline here.', author: 'Neha Verma', createdAt: 'Mar 12, 11:20 AM' },
      { id: 'an-2', number: 2, x: 65, y: 40, comment: 'Change this image to match brand style.', author: 'Neha Verma', createdAt: 'Mar 12, 11:22 AM' },
      { id: 'an-3', number: 3, x: 22, y: 70, comment: 'Adjust spacing between icons.', author: 'Neha Verma', createdAt: 'Mar 12, 11:25 AM' },
    ],
    createdAt: '2025-03-12 11:30 AM',
  },
];

// ==========================================
// 6. INITIAL NOTIFICATIONS
// ==========================================
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-rahul',
    message: 'Priya Mehta mentioned you in a comment on Homepage UI Design',
    type: 'mention',
    link: '/manager/tasks/task-1',
    read: false,
    createdAt: '2025-03-14T10:20:00Z',
    timeAgo: '10 min ago',
  },
  {
    id: 'notif-2',
    userId: 'user-rahul',
    message: 'Task status changed to In Review for Create Feature Cards',
    type: 'status_change',
    link: '/manager/tasks/task-1',
    read: false,
    createdAt: '2025-03-14T09:45:00Z',
    timeAgo: '45 min ago',
  },
  {
    id: 'notif-3',
    userId: 'user-rahul',
    message: 'Neha Verma submitted a revision request on Homepage UI Design',
    type: 'revision',
    link: '/manager/tasks/task-1',
    read: false,
    createdAt: '2025-03-14T08:30:00Z',
    timeAgo: '2 hours ago',
  },
  {
    id: 'notif-4',
    userId: 'user-rahul',
    message: 'Project deadline approaching for Website Redesign (2 days remaining)',
    type: 'deadline',
    link: '/manager/projects/proj-1',
    read: true,
    createdAt: '2025-03-14T07:30:00Z',
    timeAgo: '3 hours ago',
  },
  {
    id: 'notif-5',
    userId: 'user-rahul',
    message: 'Task conflict detected between Video Editing and Thumbnail Design',
    type: 'conflict',
    link: '/manager/conflicts',
    read: false,
    createdAt: '2025-03-14T05:30:00Z',
    timeAgo: '5 hours ago',
  },
];

// ==========================================
// 7. INITIAL ACTIVITY LOGS
// ==========================================
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    projectId: 'proj-2',
    actorId: 'user-priya',
    actorName: 'Priya Mehta',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    action: 'submitted',
    targetType: 'task',
    targetId: 'task-api-int',
    description: 'submitted API Integration for review',
    createdAt: '2025-03-14T10:18:00Z',
    timeAgo: '12 minutes ago',
  },
  {
    id: 'act-2',
    projectId: 'proj-1',
    actorId: 'user-rahul',
    actorName: 'Rahul Sharma',
    actorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    action: 'updated',
    targetType: 'task',
    targetId: 'task-1',
    description: 'changed deadline for Homepage UI Design',
    createdAt: '2025-03-14T09:48:00Z',
    timeAgo: '42 minutes ago',
  },
  {
    id: 'act-3',
    projectId: 'proj-4',
    actorId: 'user-client-acme',
    actorName: 'Acme Corp',
    actorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    action: 'approved',
    targetType: 'requirement',
    targetId: 'req-4',
    description: 'Client approved requirement #04',
    createdAt: '2025-03-14T09:30:00Z',
    timeAgo: '1 hour ago',
  },
  {
    id: 'act-4',
    projectId: 'proj-3',
    actorId: 'system',
    actorName: 'System',
    action: 'conflict_detected',
    targetType: 'task',
    targetId: 'task-video-edit',
    description: 'Task conflict detected between Video Editing and Thumbnail Design',
    createdAt: '2025-03-14T08:30:00Z',
    timeAgo: '2 hours ago',
  },
  {
    id: 'act-5',
    projectId: 'proj-4',
    actorId: 'user-arjun',
    actorName: 'Arjun Kapoor',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    action: 'completed',
    targetType: 'task',
    targetId: 'task-db-schema',
    description: 'completed Database Schema milestone review',
    createdAt: '2025-03-14T07:30:00Z',
    timeAgo: '3 hours ago',
  },
];

// ==========================================
// 8. STORAGE & STATE MANAGEMENT ENGINE
// ==========================================

const STORAGE_KEYS = {
  PROJECTS: 'taskorbit_projects_v2',
  TASKS: 'taskorbit_tasks_v2',
  USERS: 'taskorbit_users_v2',
  REQUIREMENTS: 'taskorbit_requirements_v2',
  SUBMISSIONS: 'taskorbit_submissions_v2',
  REVIEWS: 'taskorbit_reviews_v2',
  NOTIFICATIONS: 'taskorbit_notifications_v2',
  ACTIVITIES: 'taskorbit_activities_v2',
  ACTIVE_USER_ID: 'taskorbit_active_user_id',
};

class DataStore {
  private projects: Project[] = [];
  private tasks: Task[] = [];
  private users: UserProfile[] = [];
  private requirements: Requirement[] = [];
  private submissions: Submission[] = [];
  private reviews: Review[] = [];
  private notifications: AppNotification[] = [];
  private activities: ActivityLog[] = [];
  private activeUserId: string = 'user-rahul';
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.projects = this.load(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    this.tasks = this.load(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    this.users = this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.requirements = this.load(STORAGE_KEYS.REQUIREMENTS, INITIAL_REQUIREMENTS);
    this.submissions = this.load(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    this.reviews = this.load(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.activities = this.load(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITY_LOGS);
    this.activeUserId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || 'user-rahul';

    // Run real-time conflict detector across all tasks
    this.detectConflicts();
  }

  private load<T>(key: string, defaultVal: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored) as T;
    } catch {
      // Fallback
    }
    return defaultVal;
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(this.requirements));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(this.activities));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, this.activeUserId);
    } catch {
      // Storage quota or private mode
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== cb);
    };
  }

  // ========================================================
  // SERVER-SIDE CONFLICT DETECTION FORMULA (Prompt Req #10)
  // Formula: a.start <= b.end && b.start <= a.end
  // Only compare:
  // - tasks belonging to the SAME assignee
  // - active tasks (approved / completed tasks excluded)
  // ========================================================
  public detectConflicts(): void {
    const tasksByAssignee: Record<string, Task[]> = {};
    for (const t of this.tasks) {
      if (t.status === 'approved') {
        t.conflictWith = [];
        continue;
      }
      if (!tasksByAssignee[t.assigneeId]) {
        tasksByAssignee[t.assigneeId] = [];
      }
      tasksByAssignee[t.assigneeId].push(t);
    }

    for (const [_, userTasks] of Object.entries(tasksByAssignee)) {
      for (const t of userTasks) {
        t.conflictWith = [];
      }
      for (let i = 0; i < userTasks.length; i++) {
        for (let j = i + 1; j < userTasks.length; j++) {
          const a = userTasks[i];
          const b = userTasks[j];
          const startA = new Date(a.startDate).getTime();
          const endA = new Date(a.deadline).getTime();
          const startB = new Date(b.startDate).getTime();
          const endB = new Date(b.deadline).getTime();

          // Formula: a.start <= b.end && b.start <= a.end
          if (startA <= endB && startB <= endA) {
            if (!a.conflictWith.includes(b.id)) a.conflictWith.push(b.id);
            if (!b.conflictWith.includes(a.id)) b.conflictWith.push(a.id);
          }
        }
      }
    }
  }

  // ========================================================
  // GETTERS
  // ========================================================
  public getActiveUser(): UserProfile {
    const user = this.users.find((u) => u.uid === this.activeUserId);
    return user || this.users[0];
  }

  public setActiveUser(uid: string) {
    this.activeUserId = uid;
    this.save();
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public getUserById(uid: string): UserProfile | undefined {
    return this.users.find((u) => u.uid === uid);
  }

  public getProjects(): Project[] {
    return [...this.projects];
  }

  public getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public getTasks(filter?: { projectId?: string; assigneeId?: string; reviewerId?: string; status?: string }): Task[] {
    let result = [...this.tasks];
    if (filter?.projectId) result = result.filter((t) => t.projectId === filter.projectId);
    if (filter?.assigneeId) result = result.filter((t) => t.assigneeId === filter.assigneeId);
    if (filter?.reviewerId) result = result.filter((t) => t.reviewerId === filter.reviewerId);
    if (filter?.status) result = result.filter((t) => t.status === filter.status);
    return result;
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  public getRequirements(projectId?: string): Requirement[] {
    if (projectId) return this.requirements.filter((r) => r.projectId === projectId);
    return [...this.requirements];
  }

  public getSubmissions(taskId?: string): Submission[] {
    if (taskId) return this.submissions.filter((s) => s.taskId === taskId);
    return [...this.submissions];
  }

  public getReviews(taskId?: string): Review[] {
    if (taskId) return this.reviews.filter((r) => r.taskId === taskId);
    return [...this.reviews];
  }

  public getNotifications(userId?: string): AppNotification[] {
    if (userId) return this.notifications.filter((n) => n.userId === userId);
    return [...this.notifications];
  }

  public getActivities(projectId?: string): ActivityLog[] {
    if (projectId) return this.activities.filter((a) => a.projectId === projectId);
    return [...this.activities];
  }

  // ========================================================
  // CONFLICTS REPORTING
  // ========================================================
  public getConflicts(): ConflictDetail[] {
    this.detectConflicts();
    const result: ConflictDetail[] = [];
    const seen = new Set<string>();

    for (const t of this.tasks) {
      if (t.status === 'approved') continue;
      for (const otherId of t.conflictWith) {
        const key = [t.id, otherId].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);

        const other = this.tasks.find((x) => x.id === otherId);
        if (!other) continue;

        const assignee = this.users.find((u) => u.uid === t.assigneeId);
        const startA = new Date(t.startDate).getTime();
        const endA = new Date(t.deadline).getTime();
        const startB = new Date(other.startDate).getTime();
        const endB = new Date(other.deadline).getTime();

        const overlapStart = Math.max(startA, startB);
        const overlapEnd = Math.min(endA, endB);
        const days = Math.max(1, Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1);

        const projectA = this.projects.find((p) => p.id === t.projectId)?.title || 'Project';
        const projectB = this.projects.find((p) => p.id === other.projectId)?.title || 'Project';

        result.push({
          id: key,
          assigneeId: t.assigneeId,
          assigneeName: assignee?.name || 'Assignee',
          taskA: {
            id: t.id,
            title: t.title,
            startDate: t.startDate,
            deadline: t.deadline,
            status: t.status,
            projectName: projectA,
          },
          taskB: {
            id: other.id,
            title: other.title,
            startDate: other.startDate,
            deadline: other.deadline,
            status: other.status,
            projectName: projectB,
          },
          overlapDays: days,
          overlapDateRange: `${new Date(overlapStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(overlapEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          resolved: false,
        });
      }
    }
    return result;
  }

  // ========================================================
  // ACTIONS & MUTATIONS
  // ========================================================
  public createProject(project: Omit<Project, 'id' | 'createdAt' | 'progress'>): Project {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      progress: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      createdAt: new Date().toISOString(),
    };
    this.projects.unshift(newProject);
    this.logActivity(newProject.id, `created project '${newProject.title}'`, 'project', newProject.id);
    this.save();
    return newProject;
  }

  public createTask(task: Omit<Task, 'id' | 'conflictWith' | 'revisionCount' | 'createdAt' | 'updatedAt'>): Task {
    const id = `task-${Date.now()}`;
    const newTask: Task = {
      ...task,
      id,
      taskIdCode: `TASK-${Math.floor(100 + Math.random() * 900)}`,
      conflictWith: [],
      revisionCount: 0,
      progress: 0,
      subtasks: task.subtasks || [],
      attachments: task.attachments || [],
      comments: task.comments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.push(newTask);
    this.detectConflicts();

    const assignee = this.getUserById(newTask.assigneeId);
    this.logActivity(newTask.projectId, `created task '${newTask.title}'`, 'task', id);
    if (assignee) {
      this.addNotification(
        assignee.uid,
        `You were assigned '${newTask.title}'`,
        'assigned',
        `/assignee/tasks/${id}`
      );
    }
    if (newTask.conflictWith.length > 0) {
      this.addNotification(
        'user-rahul',
        `Deadline conflict detected for '${newTask.title}'`,
        'conflict',
        '/manager/conflicts'
      );
    }

    // Update project stats
    const p = this.projects.find((proj) => proj.id === newTask.projectId);
    if (p) {
      p.totalTasks = (p.totalTasks || 0) + 1;
    }

    this.save();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = {
      ...this.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.detectConflicts();
    this.save();
    return this.tasks[idx];
  }

  public reassignTask(id: string, newAssigneeId: string): void {
    const task = this.getTaskById(id);
    if (!task) return;
    task.assigneeId = newAssigneeId;
    task.updatedAt = new Date().toISOString();
    this.detectConflicts();

    const newAssignee = this.getUserById(newAssigneeId);
    this.logActivity(task.projectId, `reassigned task '${task.title}' to ${newAssignee?.name || 'new assignee'}`, 'task', id);
    if (newAssignee) {
      this.addNotification(
        newAssignee.uid,
        `Task '${task.title}' was reassigned to you`,
        'assigned',
        `/assignee/tasks/${id}`
      );
    }
    this.save();
  }

  public changeTaskDates(id: string, startDate: string, deadline: string): void {
    const task = this.getTaskById(id);
    if (!task) return;
    task.startDate = startDate;
    task.deadline = deadline;
    task.updatedAt = new Date().toISOString();
    this.detectConflicts();
    this.logActivity(task.projectId, `updated deadline for '${task.title}' to ${deadline}`, 'task', id);
    this.save();
  }

  public resolveConflict(
    conflictKey: string,
    action: 'reassign' | 'reschedule' | 'keep_both',
    payload?: { newAssigneeId?: string; newDeadline?: string; targetTaskId?: string }
  ): void {
    const [taskAId, taskBId] = conflictKey.split('|');
    const targetId = payload?.targetTaskId || taskBId;

    if (action === 'reassign' && payload?.newAssigneeId) {
      this.reassignTask(targetId, payload.newAssigneeId);
    } else if (action === 'reschedule' && payload?.newDeadline) {
      const task = this.getTaskById(targetId);
      if (task) {
        this.changeTaskDates(targetId, payload.newDeadline, payload.newDeadline);
      }
    } else if (action === 'keep_both') {
      const taskA = this.getTaskById(taskAId);
      const taskB = this.getTaskById(taskBId);
      if (taskA) taskA.conflictWith = taskA.conflictWith.filter((x) => x !== taskBId);
      if (taskB) taskB.conflictWith = taskB.conflictWith.filter((x) => x !== taskAId);
    }
    this.detectConflicts();
    this.save();
  }

  public submitTask(taskId: string, submission: { note: string; files: any[] }): Submission {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    const prevSubs = this.getSubmissions(taskId);
    const version = prevSubs.length + 1;

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      taskId,
      submittedBy: this.activeUserId,
      fileUrl: submission.files[0]?.url || 'submission.zip',
      fileName: submission.files[0]?.name || 'submission.zip',
      files: submission.files,
      note: submission.note,
      version,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    this.submissions.push(newSub);
    task.status = 'submitted';
    task.updatedAt = new Date().toISOString();

    this.logActivity(task.projectId, `submitted work for '${task.title}' (v${version})`, 'submission', newSub.id);
    this.addNotification(
      task.reviewerId,
      `Submission received for '${task.title}' (v${version})`,
      'submission',
      `/reviewer/reviews/${task.id}`
    );

    this.save();
    return newSub;
  }

  public reviewTask(taskId: string, decision: 'approved' | 'rejected', comments: string): Review {
    const task = this.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    const subs = this.getSubmissions(taskId);
    const latestSub = subs[subs.length - 1];

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      taskId,
      submissionId: latestSub?.id || '',
      reviewerId: this.activeUserId,
      decision,
      comments,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    this.reviews.push(newRev);

    if (decision === 'approved') {
      task.status = 'approved';
      task.progress = 100;
      task.conflictWith = [];
      this.logActivity(task.projectId, `approved task '${task.title}'`, 'task', taskId);
      this.addNotification(
        task.assigneeId,
        `Your work on '${task.title}' was APPROVED!`,
        'approval',
        `/assignee/tasks/${taskId}`
      );
      this.checkProjectCompletion(task.projectId);
    } else {
      task.status = 'revision';
      task.revisionCount = (task.revisionCount || 0) + 1;
      this.logActivity(task.projectId, `requested revision on '${task.title}'`, 'task', taskId);
      this.addNotification(
        task.assigneeId,
        `Revision requested on '${task.title}': "${comments}"`,
        'revision',
        `/assignee/tasks/${taskId}`
      );
    }

    this.detectConflicts();
    this.save();
    return newRev;
  }

  public checkProjectCompletion(projectId: string) {
    const pTasks = this.getTasks({ projectId });
    if (pTasks.length > 0 && pTasks.every((t) => t.status === 'approved')) {
      const p = this.projects.find((proj) => proj.id === projectId);
      if (p) {
        p.status = 'completed';
        p.progress = 100;
        this.logActivity(projectId, `Project '${p.title}' completed successfully!`, 'project', projectId);
      }
    }
  }

  public toggleSubtask(taskId: string, subtaskId: string): void {
    const task = this.getTaskById(taskId);
    if (!task || !task.subtasks) return;
    const st = task.subtasks.find((s) => s.id === subtaskId);
    if (st) {
      st.completed = !st.completed;
      st.status = st.completed ? 'completed' : 'todo';
      const completedCount = task.subtasks.filter((s) => s.completed).length;
      task.progress = Math.round((completedCount / task.subtasks.length) * 100);
      this.save();
    }
  }

  public addComment(taskId: string, content: string): void {
    const task = this.getTaskById(taskId);
    if (!task) return;
    const user = this.getActiveUser();
    task.comments = task.comments || [];
    task.comments.push({
      id: `c-${Date.now()}`,
      userId: user.uid,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      createdAt: 'Just now',
      likes: 0,
    });
    this.logActivity(task.projectId, `commented on '${task.title}'`, 'task', taskId);
    this.save();
  }

  public addRequirement(req: Omit<Requirement, 'id' | 'createdAt'>): Requirement {
    const newReq: Requirement = {
      ...req,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.requirements.unshift(newReq);
    this.logActivity(newReq.projectId, `added requirement '${newReq.title}'`, 'requirement', newReq.id);
    this.save();
    return newReq;
  }

  public addNotification(userId: string, message: string, type: AppNotification['type'], link: string) {
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId,
      message,
      type,
      link,
      read: false,
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
    });
    this.save();
  }

  public markAllNotificationsRead(userId?: string) {
    this.notifications.forEach((n) => {
      if (!userId || n.userId === userId) n.read = true;
    });
    this.save();
  }

  public logActivity(projectId: string, description: string, targetType: string, targetId: string) {
    const user = this.getActiveUser();
    this.activities.unshift({
      id: `act-${Date.now()}`,
      projectId,
      actorId: user.uid,
      actorName: user.name,
      actorAvatar: user.avatar,
      action: description,
      targetType,
      targetId,
      description,
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
    });
    this.save();
  }

  public resetToDefault() {
    localStorage.clear();
    this.init();
    this.save();
  }
}

export const dataStore = new DataStore();
