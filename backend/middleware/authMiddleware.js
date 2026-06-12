const { verifyToken } = require('../config/jwtConfig');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ success: false, message: 'Access Denied: Invalid Token Format' });
  }

  const token = tokenParts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Access Denied: Invalid or Expired Token' });
  }

  // Attach token payload to Request object
  req.user = decoded;
  next();
}

module.exports = authMiddleware;
