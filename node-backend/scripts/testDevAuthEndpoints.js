const http = require('http');

const SECRET = 'taskorbit-dev-local-secret-2026';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- 1. Health check ---');
  const health = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('Health:', health.status, health.body);

  console.log('\n--- 2. Unauthenticated request (Missing ID token) ---');
  const unauth = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/workspace',
    method: 'GET',
    headers: { Origin: 'http://localhost:5174' },
  });
  console.log('Status (expect 401):', unauth.status, unauth.body);

  console.log('\n--- 3. Read workspace with Client dev token ---');
  const clientToken = `Bearer dev-token:client:${SECRET}`;
  const ws1 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/workspace',
    method: 'GET',
    headers: {
      Authorization: clientToken,
      Origin: 'http://localhost:5174',
    },
  });
  console.log('Status (expect 200):', ws1.status);
  console.log('Initial projects count:', ws1.body.projects?.length);

  console.log('\n--- 4. Create Project with Client dev token ---');
  const newProject = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        Authorization: clientToken,
        Origin: 'http://localhost:5174',
        'Content-Type': 'application/json',
      },
    },
    {
      title: 'Orbit Cloud Migration',
      description: 'Migrate microservices to cloud',
      startDate: '2026-10-20',
      deadline: '2026-11-20',
      priority: 'high',
    }
  );
  console.log('Status (expect 201):', newProject.status);
  console.log('Created project ID:', newProject.body.id, 'Title:', newProject.body.title);

  console.log('\n--- 5. Verify Project in Workspace ---');
  const ws2 = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/workspace',
    method: 'GET',
    headers: {
      Authorization: clientToken,
      Origin: 'http://localhost:5174',
    },
  });
  const found = ws2.body.projects?.find((p) => p.id === newProject.body.id);
  console.log('Found newly created project in workspace:', found ? found.title : false);

  console.log('\n--- 6. Role enforcement: Client cannot create task (forbidden) ---');
  const clientTaskAttempt = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/projects/${newProject.body.id}/tasks`,
      method: 'POST',
      headers: {
        Authorization: clientToken,
        Origin: 'http://localhost:5174',
        'Content-Type': 'application/json',
      },
    },
    { title: 'Attempted task creation by client' }
  );
  console.log('Status (expect 403):', clientTaskAttempt.status, clientTaskAttempt.body);

  console.log('\n--- 7. Role enforcement: Manager can create task ---');
  const managerToken = `Bearer dev-token:manager:${SECRET}`;
  const managerTask = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/projects/${newProject.body.id}/tasks`,
      method: 'POST',
      headers: {
        Authorization: managerToken,
        Origin: 'http://localhost:5174',
        'Content-Type': 'application/json',
      },
    },
    {
      title: 'Database indexing',
      description: 'Create composite indexes for queries',
      assigneeId: 'dev-assignee-1',
      reviewerId: 'dev-reviewer-1',
      startDate: '2026-10-21',
      deadline: '2026-10-28',
      priority: 'high',
      force: true,
    }
  );
  console.log('Manager task response body:', managerTask.body);
  const createdTaskId = managerTask.body.task?.id || managerTask.body.id;
  console.log('Status (expect 201):', managerTask.status);
  console.log('Created task ID:', createdTaskId);

  console.log('\n--- 8. Access tasks endpoint ---');
  const tasksRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/workspace',
    method: 'GET',
    headers: {
      Authorization: managerToken,
      Origin: 'http://localhost:5174',
    },
  });
  const taskInWs = tasksRes.body.tasks?.find((t) => t.id === createdTaskId);
  console.log('Found created task in workspace:', taskInWs ? taskInWs.title : false);

  console.log('\n--- 9. Role-restricted route: Manager conflicts endpoint ---');
  const conflictsRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/conflicts',
    method: 'GET',
    headers: {
      Authorization: managerToken,
      Origin: 'http://localhost:5174',
    },
  });
  console.log('Status (expect 200):', conflictsRes.status, 'Conflicts count:', Array.isArray(conflictsRes.body) ? conflictsRes.body.length : conflictsRes.body);

  console.log('\n--- 10. Security: Forged token secret rejected ---');
  const forged = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/workspace',
    method: 'GET',
    headers: {
      Authorization: 'Bearer dev-token:client:wrong-secret',
      Origin: 'http://localhost:5174',
    },
  });
  console.log('Status (expect 401):', forged.status, forged.body);

  console.log('\n--- 11. Security: Untrusted origin rejected ---');
  const untrusted = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/workspace',
    method: 'GET',
    headers: {
      Authorization: clientToken,
      Origin: 'https://evil-site.com',
    },
  });
  console.log('Status (expect 401):', untrusted.status, untrusted.body);

  console.log('\nAll End-to-End checks completed!');
}

run().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
