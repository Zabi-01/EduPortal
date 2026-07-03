const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

// Student can only access their own data; admin/instructor can access all
function ownDataOrAdmin(req, res, next) {
  const targetId = Number(req.params.studentId || req.params.userId || req.params.id);
  if (req.user.role === 'admin' || req.user.role === 'instructor') return next();
  if (req.user.user_id === targetId) return next();
  return res.status(403).json({ success: false, message: 'Access denied' });
}

module.exports = { authenticate, authorize, ownDataOrAdmin };
