const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const express = require("express");
const app = express();
const db = admin.firestore();

// Initialize Firebase
const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyCdJXERb748VYBpB-xHdSqU-ikqaTvJyWw",
  authDomain: "hanover-c2d8f.firebaseapp.com",
  databaseURL: "https://hanover-c2d8f.firebaseio.com",
  projectId: "hanover-c2d8f",
  storageBucket: "hanover-c2d8f.appspot.com",
  messagingSenderId: "737808202094",
  appId: "1:737808202094:web:e3b6ed58d305d1191ea97f",
  measurementId: "G-HC6247CWMY",
};

firebase.initializeApp(firebaseConfig);


// Server Codes
/*
//Errors
400 Bad Request.
401 Unauthorized.
403 Forbidden.
404 Not Found.
500 Internal Server Error.
502 Bad Gateway.
503 Service Unavailable.
504 Gateway Timeout.
//
//Success
200 Ok.
201 Created.
202 Accepted.
//
*/

// DB Document References
const stocksRef = db.collection("stocks");

// Routes
// Get all user stocks
app.get("/stocks", (request, response) => {
  stocksRef
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      let stocks = [];
      snapshot.forEach((doc) => {
        stocks.push({
          stockID: doc.id,
          ticket: doc.data().ticker,
          userName: doc.data().userName,
          createdAt: doc.data().createdAt,
        });
      });
      return response.json(stocks);
    })
    .catch((err) => console.log(err));
});

//Send new stock
app.post("/stock", (request, response) => {
  const newStock = {
    ticker: request.body.ticker,
    userName: request.body.userName,
    createdAt: new Date().toISOString(),
  };
  stocksRef
    .add(newStock)
    .then((ref) => {
      response.json({ message: `New document ${ref.id} added to collection!` });
    })
    .catch((err) => {
      response.status(500).json({ error: "Something Went Wrong" });
      console.error(err);
    });
});

//User Registration
app.post("/register", (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    userName: request.body.userName,
  };

  //TODO Validate Data
  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((ref) => {
      return response
        .status(201)
        .json({ message: `User ${ref.user.uid} Registration Successful` });
    })
    .catch((err) => {
      response.status(500).json({ error: err.code });
    });
});

//adds /api to base url
//ex: https://baseurl.com/api/stocks
exports.api = functions.region("us-east1").https.onRequest(app);
