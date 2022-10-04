const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authenticate = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log('inside auth')
  console.log(token);

  const { emailId } = jwt.verify(token, "abc");
  console.log("user Email:", emailId);

  try {
    const response = await User.findByPk(emailId);
    console.log(response)
    req.user = response
    next();
  } catch (err) {
    console.log(err);
  }
};
