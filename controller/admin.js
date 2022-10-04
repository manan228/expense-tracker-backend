const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");

const User = require("../models/user");
const Expense = require("../models/expense");

const generateAccessToken = (id) => {
  return jwt.sign({ emailId: id }, "abc");
};

exports.postUser = (req, res) => {
  const { userName: username, email, password } = req.body;

  bcrypt.hash(password, 10, async (err, hash) => {
    console.log(err);

    try {
      const response = await User.create({
        username,
        email,
        password: hash,
      });

      console.log(response);
      res.json({ success: true });
    } catch (err) {
      console.log(err);
      res.status(422).json(err);
    }
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await User.findByPk(email);

    if (response === null) {
      res.status(404).json({ message: "user does not exist" });
    } else {
      const userPassword = response.dataValues.password;

      console.log(response.dataValues);
      bcrypt.compare(password, userPassword, (err, result) => {
        if (err) {
          throw new Error("Something went wrong");
        }

        if (result) {
          res.json({
            token: generateAccessToken(response.dataValues.email),
          });
        } else {
          res.status(401).json({ success: false });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.postAddExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  console.log(`inside postAddExpense`);
  console.log(req.user);
  try {
    const response = await Expense.create({
      amount,
      description,
      category,
      userEmail: req.user.email,
    });

    console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
};

exports.getExpenses = async (req, res) => {
  console.log("inside getExpense");
  console.log(req.user);
  try {
    // const response = req.user.getExpense();
    const response = await Expense.findAll({
      where: { userEmail: req.user.email },
    });

    console.log(response);
    res.json({ response, isPremium: req.user.dataValues.premium });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteExpense = async (req, res) => {
  const expenseId = req.params.expenseId;

  try {
    const response = await Expense.destroy({ where: { id: expenseId } });

    res.json({ deleted: true });
  } catch (err) {
    console.log(err);
  }
};

exports.buyPremium = async (req, res) => {
  var instance = new Razorpay({
    key_id: "rzp_test_DXYSkf3DFazDzA",
    key_secret: "6ebuPSBPBGv6a4gVxahUmqzy",
  });

  const response = await instance.orders.create({
    amount: 50000,
    currency: "INR",
  });

  console.log("hii", response);
  res.json(response);
};

exports.setPremium = async (req, res) => {
  // const user = req.user;

  try {
    const user = await User.findByPk(req.user.email);
    console.log("123");
    console.log(user);
    user.premium = req.params.orderId;
    console.log(`after`);
    console.log(user);
    const response = await user.save();

    res.json(user);
  } catch (err) {
    console.log(err);
  }
};
