const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const express = require("express");
const app = express();
const db = admin.firestore();

//Server Error Codes
/*
400 Bad Request.
401 Unauthorized.
403 Forbidden.
404 Not Found.
500 Internal Server Error.
502 Bad Gateway.
503 Service Unavailable.
504 Gateway Timeout.
*/

//DB Document References
const stocksRef = db.collection("stocks");

//Routes
app.get("/stocks", (request, response) => {
  stocksRef
    .get()
    .then((snapshot) => {
      let stocks = [];
      snapshot.forEach((doc) => {
        stocks.push(doc.data());
      });
      return response.json(stocks);
    })
    .catch((err) => console.log(err));
});

app.post("/stock", (request, response) => {
  const newStock = {
    ticker: request.body.ticker,
    userName: request.body.userName,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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

exports.api = functions.https.onRequest(app);
