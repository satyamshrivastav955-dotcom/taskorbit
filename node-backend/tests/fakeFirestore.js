/* Minimal in-memory Firestore lookalike used by regression tests so they run
 * without live Firebase credentials or an emulator. Supports doc(), chained
 * where(), and get() on both collections and queries. */
function createFakeFirestore() {
  const data = new Map();
  const ensure = (name) => { if (!data.has(name)) data.set(name, new Map()); return data.get(name); };
  const ref = (name, id) => {
    const r = { __kind: 'doc', collectionName: name, id, path: `${name}/${id}` };
    r.get = () => snap(r);
    r.set = (value) => { ensure(name).set(id, { ...value }); return r; };
    r.update = (value) => { const previous = ensure(name).get(id) || {}; ensure(name).set(id, { ...previous, ...value }); return r; };
    r.delete = () => { ensure(name).delete(id); return r; };
    return r;
  };
  const snap = (target) => ({
    exists: ensure(target.collectionName).has(target.id),
    id: target.id,
    ref: target,
    data: () => ensure(target.collectionName).get(target.id),
  });
  const match = (record, conditions) => conditions.every((c) => {
    if (c.operator === '==') return record[c.field] === c.value;
    return true;
  });
  const makeQuery = (name, conditions) => {
    const q = { __kind: 'query', collectionName: name, conditions: conditions || [] };
    q.where = (field, operator, value) => makeQuery(name, [...q.conditions, { field, operator, value }]);
  q.get = () => {
    const docs = [...ensure(name).entries()]
      .filter(([, record]) => match(record, q.conditions))
      .map(([id]) => snap(ref(name, id)));
    return { docs, size: docs.length, empty: docs.length === 0 };
  };
    return q;
  };
  const batchOps = [];
  const batch = {
    set: (target, value) => { batchOps.push({ kind: 'set', target, value: { ...value } }); },
    update: (target, value) => { batchOps.push({ kind: 'update', target, value: { ...value } }); },
    delete: (target) => { batchOps.push({ kind: 'delete', target }); },
    commit: async () => {
      for (const op of batchOps) {
        const map = ensure(op.target.collectionName);
        if (op.kind === 'set') map.set(op.target.id, { ...op.value });
        else if (op.kind === 'delete') map.delete(op.target.id);
        else { const previous = map.get(op.target.id) || {}; map.set(op.target.id, { ...previous, ...op.value }); }
      }
      batchOps.length = 0;
    },
  };
  const collection = (name) => {
    const map = ensure(name);
    const col = {
      doc: (id) => ref(name, id || `${name}-${Math.random().toString(36).slice(2, 8)}`),
      where: (field, operator, value) => makeQuery(name, [{ field, operator, value }]),
      get: () => {
        const docs = [...map.entries()].map(([id]) => snap(ref(name, id)));
        return { docs, size: docs.length, empty: docs.length === 0 };
      },
    };
    return col;
  };
  const db = {
    collection,
    runTransaction: async (callback) => callback({
      get: async (target) => target.__kind === 'query' ? target.get() : snap(target),
      set: (target, value) => { ensure(target.collectionName).set(target.id, { ...value }); },
      update: (target, value) => { const previous = ensure(target.collectionName).get(target.id) || {}; ensure(target.collectionName).set(target.id, { ...previous, ...value }); },
      delete: (target) => { ensure(target.collectionName).delete(target.id); },
      batch: () => batch,
    }),
    batch: () => batch,
  };
  db.seed = (name, id, value) => ensure(name).set(id, { ...value });
  db.read = (name, id) => ensure(name).get(id);
  db.readAll = (name) => [...ensure(name).values()];
  db.clear = () => data.clear();
  return db;
}

module.exports = { createFakeFirestore };
