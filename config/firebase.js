const admin = require('firebase-admin');
const path = require('path');

let db;

try {
  let serviceAccount;

  // 1. Check if Render Environment Variable is present
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;
  } else {
    // 2. Fallback to local JSON file for local development
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    serviceAccount = require(serviceAccountPath);
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://news-a218f-default-rtdb.firebaseio.com"
    });
  }

  db = admin.database();
  console.log('✅ Firebase Admin SDK initialized with Realtime Database');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

module.exports = { db, admin };