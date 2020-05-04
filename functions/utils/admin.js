// Administrator Access from firebase
const admin = require("firebase-admin");

// Start App
admin.initializeApp();

// Database Administrator Access
const db = admin.firestore();

// DB Documents Collection References
const stocksRef = db.collection("stocks");
const statusRef = db.collection("status");
const usersRef = db.collection("users");

module.exports = { admin, db, stocksRef, usersRef, statusRef };
