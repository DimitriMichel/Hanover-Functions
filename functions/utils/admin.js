// Administrator rights from firebase
const admin = require("firebase-admin");

// Start App
admin.initializeApp();

// Administrator Database  Access
const db = admin.firestore();

// DB Documents Collection References
const stocksRef = db.collection("stocks");
const usersRef = db.collection("users");

module.exports = { admin, db, stocksRef, usersRef };
