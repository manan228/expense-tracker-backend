const User = require("../models/user");
const Expense = require("../models/expense");

const bcrypt = require("bcrypt");

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

      bcrypt.compare(password, userPassword, (err, result) => {
        if (err) {
          throw new Error("Something went wrong");
        }

        if (result) {
          res.json({ success: true });
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

  try {
    const response = await Expense.create({
      amount,
      description,
      category,
    });

    console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
};

exports.getExpenses = async (req, res) => {

  try {
    const response = await Expense.findAll();

    console.log(response);
    res.json(response);
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
