const functions = require("firebase-functions");
const express = require("express");
const app = express();
const { db } = require("./utils/admin");
//Route Functions
const { getAllStocks, postStock } = require("./handlers/stocks");
const {
  getAllStatus,
  postStatus,
  getStatus,
  commentOnStatus,
  likeStatus,
  unlikeStatus,
  deleteStatus,
} = require("./handlers/status");
const {
  registerUser,
  loginUser,
  uploadImage,
  addUserDetails,
  getUser,
  getAuthenticatedUser,
  markNotificationsRead,
} = require("./handlers/users");

//Authentication Middleware
const FBAuth = require("./utils/fbAuth");

/* Stock Routes */
app.get("/stocks", getAllStocks);
app.post("/stock", FBAuth, postStock);

/* Status Routes */
app.get("/statuses", getAllStatus);
app.get("/status/:statusID", getStatus);
app.post("/status", FBAuth, postStatus);
app.get("/status/:statusID/like", FBAuth, likeStatus);
app.get("/status/:statusID/unlike", FBAuth, unlikeStatus);
app.delete("/status/:statusID/comment", FBAuth, deleteStatus);
app.post("/status/:statusID/comment", FBAuth, commentOnStatus);

/* User Routes */
app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user/:userName", FBAuth, getUser);
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/notifications", FBAuth, markNotificationsRead);
// adds /api to base url
//ex: https://baseurl.com/api/stocks
exports.api = functions.region("us-east1").https.onRequest(app);

/*Notification Triggers*/
//
//Like Notification
//
exports.createLikeNotification = functions
  .region("us-east1")
  .firestore.document("likes/{ID}")
  .onCreate((snapshot) => {
    return db
      .doc(`/status/${snapshot.data().statusID}`)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().userName !== snapshot.data().userName) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userName,
            sender: snapshot.data().userName,
            type: "like",
            read: false,
            statusID: doc.id,
          });
        }
      })
      .catch((err) => console.error(err));
  });
//
//Delete Like Notification // If a user unlikes a status this should delete the corresponding notification.
//
exports.deleteLikeNotification = functions
  .region("us-east1")
  .firestore.document("likes/{ID}")
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((error) => {
        console.error(error);
        return;
      });
  });
//
//Comment Notification
//
exports.createCommentNotification = functions
  .region("us-east1")
  .firestore.document("comments/{ID}")
  .onCreate((snapshot) => {
    return db
      .doc(`/status/${snapshot.data().statusID}`)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().userName !== snapshot.data().userName) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userName,
            sender: snapshot.data().userName,
            type: "comment",
            read: false,
            statusID: doc.id,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        return;
      });
  });
//
//
//
exports.onStatusDelete = functions
  .region("us-east1")
  .firestore.document("/status/{statusID}")
  .onDelete((snapshot, context) => {
    const statusID = context.params.statusID;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("statusID", "==", statusID)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("statusID", "==", statusID).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("statusID", "==", statusID)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((error) => console.error(error));
  });
//
// When a user changes their profile image we change the user image source for all statuses and comments as well.
//
exports.onUserImageChange = functions
  .region("us-east1")
  .firestore.document("/users/{userID}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("Image has changed");
      const batch = db.batch();
      return db
        .collection("status")
        .where("userName", "==", change.before.data().userName)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const status = db.doc(`/status/${doc.id}`);
            batch.update(status, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });
