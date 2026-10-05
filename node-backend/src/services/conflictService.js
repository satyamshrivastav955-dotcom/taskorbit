function toDay(value) {
  let d;
  if (value instanceof Date) {
    d = new Date(value);
  } else if (value !== null && typeof value === 'object' && typeof value.toDate === 'function') {
    d = value.toDate();
  } else if (value !== null && typeof value === 'object' && typeof value.seconds === 'number') {
    d = new Date(value.seconds * 1000);
  } else {
    d = new Date(value);
  }
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function findConflicts(candidateTask, existingTasks) {
  const cStart = toDay(candidateTask.startDate);
  const cEnd = toDay(candidateTask.deadline);
  const out = [];
  for (const t of existingTasks) {
    if (t.id === candidateTask.id) continue;
    if (t.assigneeId !== candidateTask.assigneeId) continue;
    if (t.status === 'approved') continue;
    const s = toDay(t.startDate);
    const e = toDay(t.deadline);
    if (cStart <= e && s <= cEnd) out.push(t.id);
  }
  return out;
}

function overlapRange(a, b) {
  const start = new Date(Math.max(toDay(a.startDate), toDay(b.startDate)));
  const end = new Date(Math.min(toDay(a.deadline), toDay(b.deadline)));
  return { start, end };
}

module.exports = { findConflicts, overlapRange, toDay };
