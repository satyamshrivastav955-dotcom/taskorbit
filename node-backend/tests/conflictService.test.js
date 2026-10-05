const { findConflicts } = require('../src/services/conflictService');

test('no overlap returns empty', () => {
  const c = { id: 'c', assigneeId: 'a1', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-05' };
  const others = [{ id: 't1', assigneeId: 'a1', status: 'todo', startDate: '2026-10-06', deadline: '2026-10-10' }];
  expect(findConflicts(c, others)).toEqual([]);
});

test('partial overlap conflicts', () => {
  const c = { id: 'c', assigneeId: 'a1', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-05' };
  const others = [{ id: 't1', assigneeId: 'a1', status: 'todo', startDate: '2026-10-04', deadline: '2026-10-08' }];
  expect(findConflicts(c, others)).toEqual(['t1']);
});

test('full containment conflicts', () => {
  const c = { id: 'c', assigneeId: 'a1', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-10' };
  const others = [{ id: 't1', assigneeId: 'a1', status: 'in_progress', startDate: '2026-10-03', deadline: '2026-10-05' }];
  expect(findConflicts(c, others)).toEqual(['t1']);
});

test('touching on the same day conflicts (inclusive)', () => {
  const c = { id: 'c', assigneeId: 'a1', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-05' };
  const others = [{ id: 't1', assigneeId: 'a1', status: 'todo', startDate: '2026-10-05', deadline: '2026-10-09' }];
  expect(findConflicts(c, others)).toEqual(['t1']);
});

test('different assignees ignored', () => {
  const c = { id: 'c', assigneeId: 'a1', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-05' };
  const others = [{ id: 't1', assigneeId: 'a2', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-05' }];
  expect(findConflicts(c, others)).toEqual([]);
});

test('approved tasks ignored', () => {
  const c = { id: 'c', assigneeId: 'a1', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-05' };
  const others = [{ id: 't1', assigneeId: 'a1', status: 'approved', startDate: '2026-10-01', deadline: '2026-10-05' }];
  expect(findConflicts(c, others)).toEqual([]);
});

test('same id ignored', () => {
  const c = { id: 'c', assigneeId: 'a1', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-05' };
  const others = [{ id: 'c', assigneeId: 'a1', status: 'todo', startDate: '2026-10-01', deadline: '2026-10-05' }];
  expect(findConflicts(c, others)).toEqual([]);
});
