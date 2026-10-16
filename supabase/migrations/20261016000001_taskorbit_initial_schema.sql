-- TaskOrbit — Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Migration: 20261016000001_taskorbit_initial_schema.sql
--
-- SECURITY ARCHITECTURE NOTE:
-- TaskOrbit authenticates users via Firebase Authentication (JWTs with custom role claims).
-- Firebase tokens are verified server-side by the Express API using the Firebase Admin SDK.
-- Direct client requests with the Supabase anon key evaluate as 'anon' under RLS.
-- Therefore, all private reads/writes are mediated by the Express API using the service_role key,
-- or require custom third-party JWT verification if client-direct access is ever configured.
-- Unrestricted public access is strictly disabled.

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. CORE TABLES
-- ============================================================================

-- Users table (matches TaskOrbit role contracts)
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'manager', 'assignee', 'reviewer')),
  job_title VARCHAR(120),
  department VARCHAR(120),
  phone VARCHAR(40),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- User settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  date_format VARCHAR(10) NOT NULL DEFAULT 'in' CHECK (date_format IN ('in', 'us')),
  compact_mode BOOLEAN NOT NULL DEFAULT false,
  email_digests BOOLEAN NOT NULL DEFAULT true,
  review_alerts BOOLEAN NOT NULL DEFAULT true,
  conflict_alerts BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  client_id VARCHAR(64) NOT NULL REFERENCES public.users(id),
  manager_id VARCHAR(64) REFERENCES public.users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'active', 'completed')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  start_date DATE NOT NULL,
  deadline DATE NOT NULL,
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  tasks_completed INT NOT NULL DEFAULT 0,
  total_tasks INT NOT NULL DEFAULT 0,
  member_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_project_dates CHECK (deadline >= start_date)
);

-- Project documents (attachments & specs)
CREATE TABLE IF NOT EXISTS public.project_documents (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  type VARCHAR(100) DEFAULT 'application/octet-stream',
  uploaded_by VARCHAR(64) REFERENCES public.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Project requirements
CREATE TABLE IF NOT EXISTS public.requirements (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  details TEXT DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Under Review', 'Completed')),
  file_urls JSONB DEFAULT '[]'::jsonb,
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  assignee_id VARCHAR(64) NOT NULL REFERENCES public.users(id),
  reviewer_id VARCHAR(64) NOT NULL REFERENCES public.users(id),
  start_date DATE NOT NULL,
  deadline DATE NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'submitted', 'in_review', 'revision', 'approved')),
  conflict_with JSONB DEFAULT '[]'::jsonb,
  revision_count INT NOT NULL DEFAULT 0,
  subtasks JSONB DEFAULT '[]'::jsonb,
  requirement_ids JSONB DEFAULT '[]'::jsonb,
  labels JSONB DEFAULT '[]'::jsonb,
  estimated_hours NUMERIC(8, 2) DEFAULT NULL,
  latest_submission_id VARCHAR(64) DEFAULT NULL,
  submission_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_task_dates CHECK (deadline >= start_date)
);

-- Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id VARCHAR(64) PRIMARY KEY,
  task_id VARCHAR(64) NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id VARCHAR(64) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  submitted_by VARCHAR(64) NOT NULL REFERENCES public.users(id),
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  files JSONB DEFAULT '[]'::jsonb,
  note TEXT DEFAULT '',
  version INT NOT NULL DEFAULT 1,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id VARCHAR(64) PRIMARY KEY,
  task_id VARCHAR(64) NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id VARCHAR(64) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  submission_id VARCHAR(64) REFERENCES public.submissions(id) ON DELETE SET NULL,
  reviewer_id VARCHAR(64) NOT NULL REFERENCES public.users(id),
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('approved', 'rejected')),
  comments TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  project_title VARCHAR(200) NOT NULL,
  task_title VARCHAR(200) DEFAULT 'Project feedback',
  client_id VARCHAR(64) NOT NULL REFERENCES public.users(id),
  comment TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
  replies_count INT NOT NULL DEFAULT 0,
  response TEXT DEFAULT NULL,
  responded_by VARCHAR(64) REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL,
  link VARCHAR(255) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) DEFAULT '',
  actor_id VARCHAR(64) NOT NULL REFERENCES public.users(id),
  actor_name VARCHAR(120) NOT NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(40) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  audience_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON public.projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_reviewer ON public.tasks(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_dates ON public.tasks(start_date, deadline);

CREATE INDEX IF NOT EXISTS idx_submissions_task ON public.submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_reviews_task ON public.reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project ON public.activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- SERVICE ROLE POLICIES (Backend API has full access to manage data)
-- ----------------------------------------------------------------------------
CREATE POLICY "service_role_all_users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_user_settings" ON public.user_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_projects" ON public.projects FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_project_documents" ON public.project_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_requirements" ON public.requirements FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_tasks" ON public.tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_submissions" ON public.submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_reviews" ON public.reviews FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_feedback" ON public.feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_notifications" ON public.notifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_activity_logs" ON public.activity_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- AUTHENTICATED USER POLICIES (Applies if Supabase Auth sessions exist in future)
-- ----------------------------------------------------------------------------
CREATE POLICY "users_select_policy" ON public.users FOR SELECT TO authenticated
USING (id = auth.uid()::text OR (auth.jwt() ->> 'role') = 'manager');

CREATE POLICY "users_update_own_policy" ON public.users FOR UPDATE TO authenticated
USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text);

CREATE POLICY "user_settings_owner_policy" ON public.user_settings FOR ALL TO authenticated
USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "projects_select_policy" ON public.projects FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'role') = 'manager' OR client_id = auth.uid()::text OR member_ids ? auth.uid()::text);

CREATE POLICY "project_documents_select_policy" ON public.project_documents FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_documents.project_id AND ((auth.jwt() ->> 'role') = 'manager' OR p.client_id = auth.uid()::text OR p.member_ids ? auth.uid()::text)));

CREATE POLICY "requirements_select_policy" ON public.requirements FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = requirements.project_id AND ((auth.jwt() ->> 'role') = 'manager' OR p.client_id = auth.uid()::text OR p.member_ids ? auth.uid()::text)));

CREATE POLICY "tasks_select_policy" ON public.tasks FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'role') = 'manager' OR assignee_id = auth.uid()::text OR reviewer_id = auth.uid()::text OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = tasks.project_id AND p.client_id = auth.uid()::text));

CREATE POLICY "submissions_select_policy" ON public.submissions FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'role') = 'manager' OR submitted_by = auth.uid()::text OR EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = submissions.task_id AND (t.assignee_id = auth.uid()::text OR t.reviewer_id = auth.uid()::text)));

CREATE POLICY "reviews_select_policy" ON public.reviews FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'role') = 'manager' OR reviewer_id = auth.uid()::text OR EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = reviews.task_id AND (t.assignee_id = auth.uid()::text OR t.reviewer_id = auth.uid()::text)));

CREATE POLICY "feedback_select_policy" ON public.feedback FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'role') = 'manager' OR client_id = auth.uid()::text);

CREATE POLICY "notifications_owner_policy" ON public.notifications FOR ALL TO authenticated
USING (user_id = auth.uid()::text) WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "activity_logs_select_policy" ON public.activity_logs FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'role') = 'manager' OR actor_id = auth.uid()::text OR audience_ids ? auth.uid()::text);
