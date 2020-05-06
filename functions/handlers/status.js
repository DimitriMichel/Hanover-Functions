// DB Status Document Collection Reference
const { statusRef } = require("../utils/admin");

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
        });
      });
      return response.json(status);
    })
    .catch((error) => console.log(error));
};

// Send one user status to DB
exports.postStatus = (request, response) => {
  //Parse request body for stock tickers --> "Wow $AMZN looks like a buy!" // $AMZN is added to tickerTags
  const tickerRegex = /(\$[A-Z]{1,5}\b)/g;
  const tickers = request.body.body.match(tickerRegex);
  const newStatus = {
    body: request.body.body,
    userName: request.body.userName,
    createdAt: new Date().toISOString(),
    tickerTags: tickers,
  };
  statusRef
    .add(newStatus)
    .then((doc) => {
      response.json({ message: `New document ${doc.id} added to collection!` });
    })
    .catch((error) => {
      response.status(500).json({ error: "Something Went Wrong" });
      console.error(error);
    });
};
