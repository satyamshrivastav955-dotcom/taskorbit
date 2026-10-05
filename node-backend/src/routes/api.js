const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const tasks = require('../controllers/tasks');
const exp = require('../controllers/export');

const router = express.Router();
router.use(verifyToken);

router.post('/projects/:projectId/tasks', requireRole('manager'), tasks.createTask);
router.put('/tasks/:id', requireRole('manager'), tasks.updateTask);
router.post('/tasks/:id/reassign', requireRole('manager'), tasks.reassign);
router.delete('/tasks/:id', requireRole('manager'), tasks.deleteTask);
router.post('/tasks/:id/start', requireRole('assignee'), tasks.startTask);
router.post('/tasks/:id/submit', requireRole('assignee'), tasks.submitTask);
router.post('/tasks/:id/open-review', requireRole('reviewer'), tasks.openReview);
router.post('/tasks/:id/review', requireRole('reviewer'), tasks.reviewTask);
router.get('/conflicts', requireRole('manager'), tasks.listConflicts);
router.get('/export/report/:projectId', requireRole('manager'), exp.report);
router.get('/export/all', requireRole('manager'), exp.exportAll);

module.exports = router;
