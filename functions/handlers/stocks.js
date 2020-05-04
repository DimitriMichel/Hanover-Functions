// DB Stock Document Collection Reference
const { stocksRef } = require("../utils/admin");

/*Stock Route Functions*/

//Get list of user selected stocks
exports.getAllStocks = (request, response) => {
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
    .catch((error) => console.log(error));
};

// Send one stock ticker to DB from user
exports.postStock = (request, response) => {
  const newStock = {
    ticker: request.body.ticker,
    userName: request.body.userName,
    createdAt: new Date().toISOString(),
  };
  stocksRef
    .add(newStock)
    .then((doc) => {
      response.json({ message: `New document ${doc.id} added to collection!` });
    })
    .catch((error) => {
      response.status(500).json({ error: "Something Went Wrong" });
      console.error(error);
    });
};
