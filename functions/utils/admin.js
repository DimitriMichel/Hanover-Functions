// Administrator rights from firebase
const admin = require("firebase-admin");

// Start App
admin.initializeApp();

// Administrator Database  Access
const db = admin.firestore();

module.exports = { admin, db };
