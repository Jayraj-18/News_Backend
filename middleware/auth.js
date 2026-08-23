// middleware/auth.js
const { admin } = require('../config/firebase');

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token via Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next(); // Valid token, allow operation
  } catch (error) {
    console.error('Auth Verification Error:', error);
    return res.status(403).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = verifyAdmin;