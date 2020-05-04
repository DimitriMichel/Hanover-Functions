const functions = require("firebase-functions");
const express = require("express");
const app = express();

//Route Functions
const { getAllStocks, postStock } = require("./handlers/stocks");
const { registerUser, loginUser } = require("./handlers/users");
const FBAuth = require('./utils/fbAuth');

/* Stock Routes */
app.get("/stocks", getAllStocks);
app.post("/stock", FBAuth, postStock);

//Registration Helpers
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

/* User Routes */
app.post("/register", registerUser);
app.post("/login", loginUser);

// adds /api to base url
//ex: https://baseurl.com/api/stocks
exports.api = functions.region("us-east1").https.onRequest(app);
