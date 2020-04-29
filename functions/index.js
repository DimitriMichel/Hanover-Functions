const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// DB Document References
const stocksRef = db.collection("stocks");

// HTTP functions
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello World from Firebase!");
});

exports.getStocks = functions.https.onRequest((request, response) => {
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

exports.pickStock = functions.https.onRequest((request, response) => {
  const newStock = {
    body: request.body.ticker,
    userName: request.body.userName,
    createdAt: admin.firestore.Timestamp.fromDate(new Date()),
  };
    db.collection('stocks').add(newStock).then(ref => {
        response.json({message: 'New stock added to collection!'})
    })

});
