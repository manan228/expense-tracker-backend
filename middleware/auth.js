const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authenticate = async (req, res, next) => {
  console.log(`inside authennticate`);
  const token = req.header("Authorization");

  const { emailId } = jwt.verify(token, process.env.JWT_TOKEN);

  try {
    const response = await User.find({ email: emailId });
    console.log(response[0]);
    req.user = response[0];
    next();
  } catch (err) {
    console.log(err);
  }
};
