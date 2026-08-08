const admin = require('firebase-admin');
const path = require('path');

let db;

try {
  let serviceAccount;

  // Check if environment variable exists (Production / Render)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fallback to local JSON file (Local Development)
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