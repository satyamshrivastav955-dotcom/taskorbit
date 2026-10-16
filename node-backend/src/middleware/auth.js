const DEV_AUTH_SECRET = process.env.DEV_AUTH_SECRET || 'taskorbit-dev-local-secret-2026';
const VALID_ROLES = ['client', 'manager', 'assignee', 'reviewer'];

function isLocalOriginOrIp(req) {
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin) {
    const isLocalUrl = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/.test(origin);
    if (!isLocalUrl) return false;
  }
  const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
  const isLocalIp = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '';
  return isLocalIp || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(origin);
}

function err(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token === '') return err(res, 401, 'unauthenticated', 'Missing ID token');

  // Controlled development bypass:
  // Requires:
  // 1. Not running in production (NODE_ENV !== 'production')
  // 2. DEV_AUTH_BYPASS explicitly enabled ('true')
  // 3. Request originates from permitted local development environment
  const isDevBypassEnabled = process.env.NODE_ENV !== 'production' && process.env.DEV_AUTH_BYPASS === 'true';
  if (isDevBypassEnabled && isLocalOriginOrIp(req)) {
    if (token.startsWith('dev-token:')) {
      const parts = token.split(':');
      if (parts.length === 3 && parts[0] === 'dev-token' && parts[2] === DEV_AUTH_SECRET) {
        const requestedRole = parts[1];
        if (VALID_ROLES.includes(requestedRole)) {
          const roleUids = {
            client: 'dev-engineer-1',
            manager: 'dev-manager-1',
            assignee: 'dev-assignee-1',
            reviewer: 'dev-reviewer-1',
          };
          const roleNames = {
            client: 'Test Engineer',
            manager: 'Test Engineer (Manager)',
            assignee: 'Test Engineer (Assignee)',
            reviewer: 'Test Engineer (Reviewer)',
          };
          // Strictly bind identity to verified development user credentials
          req.user = {
            uid: roleUids[requestedRole] || 'dev-engineer-1',
            email: 'engineer1@taskorbit.local',
            name: roleNames[requestedRole] || 'Test Engineer',
            role: requestedRole,
          };
          return next();
        }
      }
      return err(res, 401, 'unauthenticated', 'Invalid development token');
    }
  }

  // Fallback for non-dev token or test token verification
  try {
    const { getAdmin } = require('../config/firebase');
    const admin = getAdmin();
    if (admin && typeof admin.auth === 'function') {
      const decoded = await admin.auth().verifyIdToken(token, true);
      req.user = {
        uid: decoded.uid,
        role: decoded.role || '',
        email: decoded.email || '',
        name: decoded.name || decoded.email || '',
      };
      return next();
    }
  } catch {
    // Falls through to unauthenticated
  }

  return err(res, 401, 'unauthenticated', 'Invalid ID token');
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return err(res, 403, 'forbidden', 'Insufficient role');
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole, err, isLocalOriginOrIp };
