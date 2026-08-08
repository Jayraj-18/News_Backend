const admin = require('firebase-admin');
const path = require('path');

// Resolve path to serviceAccountKey.json at root of Backend folder
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

let db;

try {
  const serviceAccount = require(serviceAccountPath);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://news-a218f-default-rtdb.firebaseio.com"
    });
  }

  // Initialize Realtime Database instance
  db = admin.database();
  console.log('✅ Firebase Admin SDK initialized with Realtime Database');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  console.error('👉 Ensure serviceAccountKey.json exists in the Backend root folder.');
  process.exit(1);
}

module.exports = { db, admin };