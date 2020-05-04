const functions = require("firebase-functions");
const express = require("express");
const app = express();

//Route Functions
const { getAllStocks, postStock } = require("./handlers/stocks");
const { getAllStatus, postStatus } = require("./handlers/status");
const { registerUser, loginUser, uploadImage } = require("./handlers/users");

//Authentication Middleware
const FBAuth = require("./utils/fbAuth");

/* Stock Routes */
app.get("/stocks", getAllStocks);
app.post("/stock", FBAuth, postStock);

/* Status Routes */
app.get("/statuses", getAllStatus);
app.post("/status", FBAuth, postStatus);

/* User Routes */
app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/user/image", FBAuth, uploadImage);

// adds /api to base url
//ex: https://baseurl.com/api/stocks
exports.api = functions.region("us-east1").https.onRequest(app);
