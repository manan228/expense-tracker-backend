const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const AWS = require("aws-sdk");

const User = require("../models/user");
const Expense = require("../models/expense");
const FileDownloaded = require("../models/fileDownloaded");

const generateAccessToken = (id) => {
  return jwt.sign({ emailId: id }, "abc");
};

const uploadToS3 = (data, filename) => {
  const BUCKET_NAME = "expensetrackingappsharpener";
  const IAM_USER_KEY = "AKIAXVISH54OF5V7M75L";
  const IAM_USER_SECRET = "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";

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
    // Bucket: BUCKET_NAME,
  });

  // s3bucket.createBucket(() => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log(`something went wrong`);
        reject(err);
      } else {
        console.log("success", s3response);
        console.log(s3response.Location);
        resolve(s3response.Location);
      }
    });
  });
  // });
};

const ITEMS_PER_PAGE = 5;

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
            response,
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
  // const { amount, description, category, totalExpense } = req.body;
  const { amount, description, category } = req.body;
  // console.log(totalExpense)
  console.log(`inside postAddExpense`);
  console.log(req.user);
  try {
    const response = await Expense.create({
      amount,
      description,
      category,
      userEmail: req.user.email,
    });

    req.user.totalExpense = amount + req.user.totalExpense;
    console.log(`98765`);
    console.log(req.user);
    await req.user.save();

    console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
};

exports.getExpenses = async (req, res) => {
  console.log("inside getExpense");
  console.log(req.query.page);
  const page = req.query.page;
  const expenseToSkip = (page - 1) * ITEMS_PER_PAGE;

  try {
    // const response = req.user.getExpense();
    const expenseCount = await Expense.count({
      where: { userEmail: req.user.email },
    });

    console.log(`abcdefghij`, expenseCount)
    const response = await Expense.findAll({
      where: { userEmail: req.user.email },
      offset: expenseToSkip,
      limit: ITEMS_PER_PAGE,
    });

    console.log("123", response);

    const dataToFrontEnd = {
      response,
      isPremium: req.user.dataValues.premium,
      paginationData: {
        currentPage: Number(page),
        hasNextPage: ITEMS_PER_PAGE * page < expenseCount,
        hasPreviousPage: page > 1,
        nextPage: Number(page) +  1,
        previousPage: page - 1,
        lastPage: Math.ceil(expenseCount / ITEMS_PER_PAGE),
      },
    };

    res.json(dataToFrontEnd);
  } catch (err) {
    console.log(err);
  }
};

exports.getExpensesPremium = async (req, res) => {
  const userEmail = req.params.userEmail;
  console.log(`get expenses premium called`);

  try {
    const response = await Expense.findAll({
      where: { userEmail },
    });

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

exports.fetchAllUsers = async (req, res) => {
  console.log(`inside fetch all users`);

  try {
    const response = await User.findAll();

    res.json(response);
  } catch (err) {
    console.log(err);
  }
};

exports.forgotPassword = (req, res) => {
  res.json({ msg: "from backend forgot password api called" });
};

exports.downloadExpense = async (req, res) => {
  try {
    const expenses = await req.user.getExpenses();
    console.log(`download`);
    console.log(expenses);

    const userEmail = req.user.email;

    const stringifiedExpenses = JSON.stringify(expenses);

    const filename = `Expenses${userEmail}/${new Date()}.txt`;

    const fileURL = await uploadToS3(stringifiedExpenses, filename);
    console.log(`backend response fileURL`);
    console.log(fileURL);

    const response = await FileDownloaded.create({ url: fileURL, userEmail });

    console.log(response);

    res.json(fileURL);
  } catch (err) {
    console.log(err);
  }
};

exports.getFilesURL = async (req, res) => {
  console.log(req.user);
  const userEmail = req.user.email;

  try {
    const response = await FileDownloaded.findAll({ where: { userEmail } });

    console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }
};
