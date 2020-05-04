// DB Stock Document Collection Reference
const { db, admin } = require("../utils/admin");

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

// Upload an image
exports.uploadImage = (request, response) => {
  // Bus Boy upload docs https://github.com/mscdex/busboy#readme
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: request.headers });
  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname);
    console.log(filename);
    console.log(mimetype);
    //Extract image file extension "myImage.jpg" --> "jpg" , "myImage"
    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    // Randomize filename
    const imageFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };

    //Creates file
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on("finish", () => {
    admin
      .storage()
      .bucket(`${firebaseConfig.storageBucket}`)
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${request.user.userName}`).update({ imageUrl });
      })
      .then(() => {
        return response.json({ message: "Image Uploaded" });
      })
      .catch((error) => {
        console.error(error);
        return response.status(500).json({ error: error.code });
      });
  });
};
