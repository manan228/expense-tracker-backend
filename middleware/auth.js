const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authenticate = async (req, res, next) => {
  const token = req.header("Authorization");

  const { emailId } = jwt.verify(token, process.env.JWT_TOKEN);

  try {
    const response = await User.findByPk(emailId);
    req.user = response;
    next();
  } catch (err) {
    console.log(err);
  }
};
