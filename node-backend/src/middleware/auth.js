const { getAdmin } = require('../config/firebase');

function err(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token === '') return err(res, 401, 'unauthenticated', 'Missing ID token');
  try {
    const decoded = await getAdmin().auth().verifyIdToken(token, true);
    req.user = {
      uid: decoded.uid,
      role: decoded.role || '',
      email: decoded.email || '',
      name: decoded.name || decoded.email || '',
    };
    return next();
  } catch {
    return err(res, 401, 'unauthenticated', 'Invalid ID token');
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return err(res, 403, 'forbidden', 'Insufficient role');
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole, err };
