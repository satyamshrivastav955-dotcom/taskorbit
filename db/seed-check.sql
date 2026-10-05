USE taskorbit_reports;

SELECT 'users' AS t, COUNT(*) AS c FROM users
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews;

SELECT status, COUNT(*) AS n FROM tasks GROUP BY status;
SELECT has_conflict, COUNT(*) AS n FROM tasks GROUP BY has_conflict;
SELECT id, title, status FROM tasks WHERE has_conflict = 1 LIMIT 20;
