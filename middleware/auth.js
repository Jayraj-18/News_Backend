/**
 * Admin Auth Middleware
 *
 * Protects write routes (POST, PUT, DELETE) by checking for a
 * secret token in the request header: `x-admin-token`.
 *
 * Set ADMIN_SECRET_TOKEN in your .env file.
 */
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  const expectedToken = process.env.ADMIN_SECRET_TOKEN;

  if (!expectedToken) {
    console.error('❌ ADMIN_SECRET_TOKEN is not set in .env');
    return res.status(500).json({ success: false, message: 'Server misconfiguration: admin token not set' });
  }

  if (!token || token !== expectedToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid or missing admin token' });
  }

  next();
};

module.exports = { adminAuth };
