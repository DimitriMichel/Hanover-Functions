// DB Status Document Collection Reference
const { db, statusRef, commentsRef, likesRef } = require("../utils/admin");
//
//Status Functions
//
//Get list of user status
exports.getAllStatus = (request, response) => {
  statusRef
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      let status = [];
      snapshot.forEach((doc) => {
        status.push({
          statusID: doc.id,
          body: doc.data().body,
          userName: doc.data().userName,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          userImage: doc.data().userImage,
        });
      });
      return response.json(status);
    })
    .catch((error) => console.log(error));
};
//
// Send a Status
//
exports.postStatus = (request, response) => {
  //Parse request body for stock tickers --> "Wow $AMZN looks like a buy!" // $AMZN is added to tickerTags
  const tickerRegex = /(\$[A-Z]{1,5}\b)/g;
  const tickers = request.body.body.match(tickerRegex);
  if (request.body.body.length > 160) {
    return response.json({ error: "Longer than character limit of 160." });
  }
  const newStatus = {
    body: request.body.body,
    userName: request.body.userName,
    userImage: request.user.imageUrl,
    createdAt: new Date().toISOString(),
    tickerTags: tickers,
    likeCount: 0,
    commentCount: 0,
  };
  statusRef
    .add(newStatus)
    .then((doc) => {
      const responseStatus = newStatus;
      responseStatus.statusID = doc.id;
      response.json(responseStatus);
    })
    .catch((error) => {
      response.status(500).json({ error: "Something Went Wrong" });
      console.error(error);
    });
};
//
//Get a Status
//
exports.getStatus = (request, response) => {
  let statusData = {};

  statusRef
    .doc(`${request.params.statusID}`)
    .get()
    .then((doc) => {
      console.log(doc);
      if (!doc.exists) {
        return response.status(404).json({ error: "Status not found" });
      }
      statusData = doc.data();
      statusData.statusID = doc.id;
      return commentsRef
        .orderBy("createdAt", "desc")
        .where("statusID", "==", request.params.statusID)
        .get();
    })
    .then((data) => {
      console.log(data);
      statusData.comments = [];
      data.forEach((doc) => {
        statusData.comments.push(doc.data());
      });
      return response.json(statusData);
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({ error: error.code });
    });
};
//
//Delete a Status
//
exports.deleteStatus = (request, response) => {
  const status = db.doc(`/status/${request.params.statusID}`);
  status
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Status not found" });
      }
      if (doc.data().userName !== request.user.userName) {
        return response.status(403).json({ error: "Unauthorized" });
      } else {
        return status.delete();
      }
    })
    .then(() => {
      response.json({ message: "Status deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: err.code });
    });
};
//
//Comment on a Status
//
exports.commentOnStatus = (request, response) => {
  //Prevent empty strings from going to database
  if (request.body.body.trim() === "")
    return response.status(400).json({ comment: "Cannot not be empty" });
  //Character Limiter
  if (request.body.body.length > 160) {
    return response
      .status(400)
      .json({ comment: "Cannot be longer than than 160 characters." });
  }
  //New Comment request structure
  const newComment = {
    body: request.body.body,
    createdAt: new Date().toISOString(),
    statusID: request.params.statusID,
    userName: request.user.userName,
    userImage: request.user.imageUrl,
  };
  statusRef
    .doc(`${request.params.statusID}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return response.status(404).json({ error: "Status not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return commentsRef.add(newComment);
    })
    .then(() => {
      response.json(newComment);
    })
    .catch((error) => {
      console.log(error);
      response.status(500).json({ error: "Something went wrong" });
    });
};
//
//Like a status
//
exports.likeStatus = (request, response) => {
  const likeDoc = likesRef
    .where("userName", "==", request.user.userName)
    .where("statusID", "==", request.params.statusID)
    .limit(1);

  const statusRef = db.doc(`/status/${request.params.statusID}`);
  let statusData;

  statusRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        statusData = doc.data();
        statusData.statusID = doc.id;
        return likeDoc.get();
      } else {
        return response.status(404).json({ error: "Status not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return likesRef
          .add({
            statusID: request.params.statusID,
            userName: request.user.userName,
          })
          .then(() => {
            statusData.likeCount++;
            return statusRef.update({ likeCount: statusData.likeCount });
          })
          .then(() => {
            return response.json(statusData);
          });
      } else {
        return response.status(400).json({ error: "Status already liked" });
      }
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({ error: error.code });
    });
};
//
//Unlike a status
//
exports.unlikeStatus = (request, response) => {
  const likeDoc = likesRef
    .where("userName", "==", request.user.userName)
    .where("statusID", "==", request.params.statusID)
    .limit(1);

  const statusRef = db.doc(`/status/${request.params.statusID}`);
  let statusData;

  statusRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        statusData = doc.data();
        statusData.statusID = doc.id;
        return likeDoc.get();
      } else {
        return response.status(404).json({ error: "Status not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return response.status(400).json({ error: "Status not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            statusData.likeCount--;
            return statusRef.update({ likeCount: statusData.likeCount });
          })
          .then(() => {
            response.json(statusData);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({ error: error.code });
    });
};
