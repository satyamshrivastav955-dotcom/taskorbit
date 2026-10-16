const fs = require('fs');
const path = require('path');

async function testFullFlow() {
  console.log('--- Starting TaskOrbit E2E Verification Script ---');

  const boundary = '----WebKitFormBoundaryTaskOrbitTest';
  const fileContent = 'TaskOrbit requirement document test payload ' + Date.now();

  // Helper to upload files via multipart form data
  async function uploadTestFile(filename, content, pathPrefix, role = 'client') {
    const fileBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="pathPrefix"\r\n\r\n${pathPrefix}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${filename}"\r\nContent-Type: text/plain\r\n\r\n${content}\r\n--${boundary}--\r\n`),
    ]);

    const res = await fetch(`http://localhost:4000/api/uploads?pathPrefix=${encodeURIComponent(pathPrefix)}`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer dev-token:${role}:taskorbit-dev-local-secret-2026`,
      },
      body: fileBody,
    });
    const json = await res.json();
    if (!res.ok || !json.files || json.files.length === 0) {
      throw new Error(`Upload failed for ${filename}: ${JSON.stringify(json)}`);
    }
    return json.files[0];
  }

  // 1. Test Project Creation as Client
  console.log('1. Testing POST /api/projects as Client...');
  const projectPayload = {
    title: 'E2E Test Project ' + Date.now(),
    description: 'Project created during automated verification test.',
    priority: 'high',
    startDate: '2026-10-16',
    deadline: '2026-10-30',
  };

  const createProjRes = await fetch('http://localhost:4000/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-token:client:taskorbit-dev-local-secret-2026',
    },
    body: JSON.stringify(projectPayload),
  });
  const projectJson = await createProjRes.json();
  const projectId = projectJson?.id || projectJson?.project?.id;
  console.log('Project creation status:', createProjRes.status, 'Project ID:', projectId);
  if (!createProjRes.ok || !projectId) {
    throw new Error('Project creation failed: ' + JSON.stringify(projectJson));
  }

  // 2. Upload Project Attachment to Local Storage
  console.log('2. Uploading project requirement attachment to local storage...');
  const uploadedReqFile = await uploadTestFile('specs.txt', fileContent, `projects/${projectId}/`, 'client');
  console.log('Uploaded file URL:', uploadedReqFile.url, 'Storage path:', uploadedReqFile.storagePath);

  // 3. Test Static Serving of Uploaded File
  console.log('3. Testing file download from static /uploads/...');
  const fileFetchUrl = uploadedReqFile.url.startsWith('http') ? uploadedReqFile.url : `http://localhost:4000${uploadedReqFile.url}`;
  const getFileRes = await fetch(fileFetchUrl);
  const fetchedText = await getFileRes.text();
  console.log('Static fetch status:', getFileRes.status, 'Content matches:', fetchedText === fileContent);
  if (fetchedText !== fileContent) {
    throw new Error('File content mismatch');
  }

  // 4. Attach Requirement to Project
  console.log('4. Adding requirement with attachment to project...');
  const addReqRes = await fetch(`http://localhost:4000/api/projects/${projectId}/requirements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-token:client:taskorbit-dev-local-secret-2026',
    },
    body: JSON.stringify({
      title: 'Project Specification Requirement',
      details: 'Attached specification document.',
      files: [
        {
          name: uploadedReqFile.name,
          storagePath: uploadedReqFile.storagePath,
          url: uploadedReqFile.url,
        },
      ],
    }),
  });
  const reqJson = await addReqRes.json();
  console.log('Requirement attachment status:', addReqRes.status, 'Requirement ID:', reqJson?.id);
  if (!addReqRes.ok) {
    throw new Error('Requirement creation with attachment failed: ' + JSON.stringify(reqJson));
  }

  // 5. Test Workspace Fetch as Client
  console.log('5. Testing GET /api/workspace as Client...');
  const clientWorkspaceRes = await fetch('http://localhost:4000/api/workspace', {
    headers: {
      'Authorization': 'Bearer dev-token:client:taskorbit-dev-local-secret-2026',
    },
  });
  const clientWorkspace = await clientWorkspaceRes.json();
  const createdProject = clientWorkspace.projects.find(p => p.id === projectId);
  console.log('Client workspace project found:', !!createdProject, 'Total projects:', clientWorkspace.projects.length);
  if (!createdProject) {
    throw new Error('Created project not found in client workspace');
  }

  // 6. Test Task Creation as Manager
  console.log('6. Testing POST /api/projects/:id/tasks as Manager...');
  const taskPayload = {
    title: 'Initial Development Task ' + Date.now(),
    description: 'Implement core functionality as requested.',
    assigneeId: 'dev-assignee-1',
    reviewerId: 'dev-reviewer-1',
    startDate: '2026-10-17',
    deadline: '2026-10-25',
    priority: 'high',
    subtaskTitles: ['Setup skeleton', 'Implement API', 'Run unit tests'],
    force: true,
  };

  const createTaskRes = await fetch(`http://localhost:4000/api/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-token:manager:taskorbit-dev-local-secret-2026',
    },
    body: JSON.stringify(taskPayload),
  });
  const taskJson = await createTaskRes.json();
  console.log('Task creation status:', createTaskRes.status, 'Task ID:', taskJson?.task?.id);
  if (!createTaskRes.ok || !taskJson?.task?.id) {
    throw new Error('Task creation failed: ' + JSON.stringify(taskJson));
  }
  const taskId = taskJson.task.id;

  // 7. Test Start Task as Assignee
  console.log('7. Testing POST /api/tasks/:id/start as Assignee...');
  const startTaskRes = await fetch(`http://localhost:4000/api/tasks/${taskId}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-token:assignee:taskorbit-dev-local-secret-2026',
    },
  });
  const startJson = await startTaskRes.json();
  console.log('Start task status:', startTaskRes.status, 'Task status:', startJson?.task?.status);

  // 8. Upload Task Deliverable File as Assignee
  console.log('8. Uploading deliverable file as Assignee...');
  const deliverableContent = 'Task submission artifact code build OK';
  const uploadedSubFile = await uploadTestFile(
    'deliverable.zip',
    deliverableContent,
    `projects/${projectId}/submissions/${taskId}/`,
    'assignee'
  );

  // 9. Submit Task Deliverable as Assignee
  console.log('9. Testing POST /api/tasks/:id/submit as Assignee...');
  const submitRes = await fetch(`http://localhost:4000/api/tasks/${taskId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-token:assignee:taskorbit-dev-local-secret-2026',
    },
    body: JSON.stringify({
      note: 'All requirements met and tests passing.',
      files: [
        {
          name: uploadedSubFile.name,
          storagePath: uploadedSubFile.storagePath,
          url: uploadedSubFile.url,
        },
      ],
    }),
  });
  const submitJson = await submitRes.json();
  console.log('Submit task status:', submitRes.status, 'Submission ID:', submitJson?.submissionId);
  if (!submitRes.ok) {
    throw new Error('Task submission failed: ' + JSON.stringify(submitJson));
  }

  // 10. Test Open Review as Reviewer
  console.log('10. Testing POST /api/tasks/:id/open-review as Reviewer...');
  const openRes = await fetch(`http://localhost:4000/api/tasks/${taskId}/open-review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-token:reviewer:taskorbit-dev-local-secret-2026',
    },
  });
  console.log('Open review status:', openRes.status);
  if (!openRes.ok) {
    throw new Error('Open review failed: ' + (await openRes.text()));
  }

  // 10b. Test Review and Approval as Reviewer
  console.log('10b. Testing POST /api/tasks/:id/review (approved) as Reviewer...');
  const reviewRes = await fetch(`http://localhost:4000/api/tasks/${taskId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dev-token:reviewer:taskorbit-dev-local-secret-2026',
    },
    body: JSON.stringify({
      decision: 'approved',
      comments: 'Excellent work, approved for release.',
    }),
  });
  const reviewJson = await reviewRes.json();
  console.log('Review status:', reviewRes.status, 'Reviewed task status:', reviewJson?.task?.status);
  if (!reviewRes.ok || reviewJson?.task?.status !== 'approved') {
    throw new Error('Task review approval failed: ' + JSON.stringify(reviewJson));
  }

  // 11. Verify All 4 Roles Can Fetch Workspace
  console.log('11. Verifying workspace access for all 4 roles...');
  for (const role of ['client', 'manager', 'assignee', 'reviewer']) {
    const wsRes = await fetch('http://localhost:4000/api/workspace', {
      headers: {
        'Authorization': `Bearer dev-token:${role}:taskorbit-dev-local-secret-2026`,
      },
    });
    const wsData = await wsRes.json();
    console.log(`- Role ${role.toUpperCase()}: status ${wsRes.status}, projects: ${wsData.projects?.length}, tasks: ${wsData.tasks?.length}`);
    if (!wsRes.ok) {
      throw new Error(`Workspace fetch failed for role ${role}`);
    }
  }

  console.log('\n--- ALL E2E API VERIFICATIONS PASSED SUCCESSFULLY! ---');
}

testFullFlow().catch(err => {
  console.error('\nE2E VERIFICATION FAILED:', err);
  process.exit(1);
});
