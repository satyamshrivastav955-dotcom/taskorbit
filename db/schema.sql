CREATE DATABASE IF NOT EXISTS taskorbit_reports CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskorbit_reports;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  client_id VARCHAR(64),
  manager_id VARCHAR(64),
  status VARCHAR(20) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  start_date DATE,
  deadline DATE
);

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  title VARCHAR(200) NOT NULL,
  assignee_id VARCHAR(64),
  reviewer_id VARCHAR(64),
  start_date DATE,
  deadline DATE,
  priority VARCHAR(20),
  status VARCHAR(20) NOT NULL,
  revision_count INT NOT NULL DEFAULT 0,
  has_conflict TINYINT NOT NULL DEFAULT 0,
  CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  task_id VARCHAR(64) NOT NULL,
  reviewer_id VARCHAR(64),
  decision VARCHAR(20) NOT NULL,
  comments TEXT,
  created_at DATETIME,
  CONSTRAINT fk_reviews_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS report_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS report_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  attachment_path VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Report login seed (JSP + Laravel share report_users).
-- Generate a BCrypt hash for your manager password and uncomment:
-- INSERT INTO report_users (email, password_hash) VALUES
-- ('manager@taskorbit.local', '$2y$10$REPLACE_WITH_BCRYPT_HASH');
