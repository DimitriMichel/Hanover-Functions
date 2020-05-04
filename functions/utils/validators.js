//Registration Helpers
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

//Registration Validator
exports.validateRegistrationData = (data) => {
  //Validators & Errors Object
  const errors = {};
  if (isEmpty(data.userName)) {
    errors.userName = "Cannot be empty.";
  }
  if (isEmpty(data.email)) {
    errors.email = "Cannot be empty.";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }
  if (isEmpty(data.password)) {
    errors.password = "Cannot be empty.";
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  //Check for any sign up errors in Errors object
  if (Object.keys(errors).length > 0) {
    return response.status(400).json(errors);
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

//Login Validator
exports.validateLoginData = (data) => {
  //Check for any login errors in Errors object
  let errors = {};
  if (isEmpty(data.email)) {
    errors.email = "Cannot be empty";
  }
  if (isEmpty(data.password)) {
    errors.password = "Cannot be empty";
  }
  if (Object.keys(errors) > 0) {
    return response.status(400).json(errors);
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};
