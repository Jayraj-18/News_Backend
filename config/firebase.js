const admin = require('firebase-admin');
const path = require('path');

let db;

try {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse JSON from environment variable
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;

    // Fix formatting for escaped newline characters in private_key
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } else {
    // Fallback to local file for development
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    try {
      serviceAccount = require(serviceAccountPath);
    } catch (err) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is missing on Render and serviceAccountKey.json was not found locally.");
    }
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