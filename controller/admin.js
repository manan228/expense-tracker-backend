const User = require("../models/user");

exports.postUser = async (req, res) => {
  const userName = req.body.userName;
  //   console.log(userName)
  const email = req.body.email;
  const password = req.body.password;

  try {
    const response = await User.create({
      username: userName,
      email,
      password,
    });

    console.log(response);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(422).json(err);
  }
};

exports.postLogin = async (req, res) => {
  //   console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  try {
    const response = await User.findByPk(email);

    if (response === null) {
      res.status(404).json({ message: "user does not exist" });
    } else {
      const userPassword = response.dataValues.password;

      if (password === userPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ success: false });
      }
    }
  } catch (err) {
    console.log(err);
  }
};
