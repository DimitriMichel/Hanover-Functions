const functions = require("firebase-functions");
const express = require("express");
const app = express();

//Route Functions
const { getAllStocks, postStock } = require("./handlers/stocks");
const { getAllStatus, postStatus, getStatus } = require("./handlers/status");
const {
  registerUser,
  loginUser,
  uploadImage,
  addUserDetails,
  getUser,
} = require("./handlers/users");

//Authentication Middleware
const FBAuth = require("./utils/fbAuth");

/* Stock Routes */
app.get("/stocks", getAllStocks);
app.post("/stock", FBAuth, postStock);

/* Status Routes */
app.get("/statuses", getAllStatus);
app.post("/status", FBAuth, postStatus);
app.get("/status/:statusID", getStatus);

// TODO: Delete Status
// TODO: Like Status
// TODO: Unlike Status
// TODO: Comment on Status

/* User Routes */
app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getUser);

// adds /api to base url
//ex: https://baseurl.com/api/stocks
exports.api = functions.region("us-east1").https.onRequest(app);
