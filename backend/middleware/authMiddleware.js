const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const bearer = token.split(' ')[1]; // Expecting "Bearer <token>"
    const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
    req.user = decoded; // Contains userId and role
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};
