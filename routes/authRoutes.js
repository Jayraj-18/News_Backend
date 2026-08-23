// Backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase.js');


router.post('/login', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'A Firebase ID token is required' });
  }

  try {
    const idToken = authHeader.slice('Bearer '.length);
    const user = await admin.auth().verifyIdToken(idToken);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        uid: user.uid,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
});

module.exports = router;