// Administrator Access from firebase
const admin = require("firebase-admin");

// Start App
admin.initializeApp();

// Database Administrator Access
const db = admin.firestore();

// DB Documents Collection References
const stocksRef = db.collection("stocks");
const usersRef = db.collection("users");
const statusRef = db.collection("status");
const likesRef = db.collection("likes");
const commentsRef = db.collection("comments");
module.exports = { admin, db, stocksRef, usersRef, statusRef, likesRef, commentsRef };
