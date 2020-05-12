// DB Document References
const {admin, usersRef} = require("./admin");

//Authentication Middleware
module.exports = (request, response, next) => {
    let idToken;
    if (
        request.headers.authorization &&
        request.headers.authorization.startsWith("Bearer ")
    ) {
        idToken = request.headers.authorization.split("Bearer ")[1];
    } else {
        console.log("Token Not Found");
        return response.status(403).json({ error: "Unauthorized" });
    }
    // Locate specific user by userID from decoded token
    admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
            request.user = decodedToken;
            return usersRef.where("userID", "==", request.user.uid).limit(1).get();
        })
        .then((ref) => {
            request.user.userName = ref.docs[0].data().userName;
            request.user.imageUrl = ref.docs[0].data().imageUrl;
            return next(); // proceed past authorization to request ex (app.get("/stocks)) --> Auth --> "/stocks" endpoint
        })
        .catch((error) => {
            console.error("Error while verifying token", error);
            return response.status(403).json(error);
        });
};
