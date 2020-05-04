// DB Stock Document Collection Reference
const { usersRef, db } = require("../utils/admin");


// Initialize Firebase
const firebaseConfig = require("../utils/config");
const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const {
  validateRegistrationData,
  validateLoginData,
} = require("../utils/validators");
/*User Route Functions*/

//Register A New User
exports.registerUser = (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    userName: request.body.userName,
    holdings: [],
  };

  // New User Parameters Validation --> Email, Password
  const { valid, errors } = validateRegistrationData(newUser);
  if (!valid) return response.status(400).json(errors);

  // Obtain Authentication Token After Registration
  let token, userID;
  db.doc(`/users/${newUser.userName}`)
    .get()
    .then((doc) => {
      console.log(doc);
      if (doc.exists) {
        return response
          .status(400)
          .json({ userName: "This username is taken." });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((ref) => {
      userID = ref.user.uid;
      return ref.user.getIdToken();
    })
    .then((token) => {
      token = token;
      const userCredentials = {
        userName: newUser.userName,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userID,
      };
      db.doc(`users/${newUser.userName}`).set(userCredentials);
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch((error) => {
      if (error.code === "auth/email-already-in-use") {
        return response
          .status(400)
          .json({ email: "This email is already in use." });
      } else {
        return response.status(500).json({ error: error.code });
      }
    });
};

//Login User
exports.loginUser = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  // New User Parameters Validation --> Email, Password
  const { valid, errors } = validateLoginData(user);
  if (!valid) return response.status(400).json(errors);

  //Authenticate User in Firebase
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((ref) => {
      return ref.user.getIdToken();
    })
    .then((token) => {
      return response.json({ token });
    })
    .catch((error) => {
      console.log(error);
      if (error.code === "auth/wong-password") {
        return response.status(500).json({ general: "Wrong credentials." });
      } else {
        return response.status(500).json({ error: error.code });
      }
    });
};
