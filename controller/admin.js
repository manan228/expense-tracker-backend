const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const AWS = require("aws-sdk");

const User = require("../models/user");
const Expense = require("../models/expense");
const FileDownloaded = require("../models/fileDownloaded");

const generateAccessToken = (id) => {
  return jwt.sign({ emailId: id }, process.env.JWT_TOKEN);
};

// const uploadToS3 = (data, filename) => {
//   const BUCKET_NAME = process.env.S3_BUCKET_NAME;
//   const IAM_USER_KEY = process.env.IAM_USER_KEY;
//   const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

//   let s3bucket = new AWS.S3({
//     accessKeyId: IAM_USER_KEY,
//     secretAccessKey: IAM_USER_SECRET,
//     // Bucket: BUCKET_NAME,
//   });

//   const params = {
//     Bucket: BUCKET_NAME,
//     Key: filename,
//     Body: data,
//     ACL: "public-read",
//   };

//   return new Promise((resolve, reject) => {
//     s3bucket.upload(params, (err, s3response) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(s3response.Location);
//       }
//     });
//   });
// };

exports.postUser = (req, res) => {
  console.log(`inside post user`);
  const { userName: username, email, password } = req.body;

  bcrypt.hash(password, 10, async (err, hash) => {
    try {
      const newUser = new User({
        username,
        email,
        password: hash,
      });

      console.log(newUser);

      const response = await newUser.save();

      console.log(response);
      // const response = await User.create({
      //   username,
      //   email,
      //   password: hash,
      // });

      res.json({ success: true });
    } catch (err) {
      res.status(422).json(err);
    }
  });
};

exports.postLogin = async (req, res) => {
  console.log(`inside login`);
  const { email, password } = req.body;

  try {
    const response = await User.find({ email });

    console.log(response);
    if (response.length === 0) {
      res.status(404).json({ message: "user does not exist" });
    } else {
      const userPassword = response[0].password;

      // console.log(userPassword)

      bcrypt.compare(password, userPassword, (err, result) => {
        if (err) {
          throw new Error("Something went wrong");
        }

        if (result) {
          res.json({
            response,
            token: generateAccessToken(response[0].email),
          });
        } else {
          res.status(401).json({ success: false });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }

  // try {
  //   const response = await User.findById(email);

  //   console.log(response)
  // if (response === null) {
  //   res.status(404).json({ message: "user does not exist" });
  // } else {
  //   const userPassword = response.dataValues.password;

  //   bcrypt.compare(password, userPassword, (err, result) => {
  //     if (err) {
  //       throw new Error("Something went wrong");
  //     }

  //     if (result) {
  //       res.json({
  //         response,
  //         token: generateAccessToken(response.dataValues.email),
  //       });
  //     } else {
  //       res.status(401).json({ success: false });
  //     }
  //   });
  // }
  // } catch (err) {
  //   console.log(err);
  // }
};

exports.postAddExpense = async (req, res) => {
  console.log(`inside add expense`);
  const { amount, description, category } = req.body;

  console.log(req.user);

  try {
    const expense = new Expense({
      amount,
      description,
      category,
      userId: req.user._id,
    });

    const response = await expense.save();

    console.log(`after expense save`, response);

    req.user.totalExpense = amount + req.user.totalExpense;

    await req.user.save();

    res.json(response);
  } catch (err) {
    console.log(err);
  }

  // try {
  //   const response = await Expense.create({
  //     amount,
  //     description,
  //     category,
  //     userEmail: req.user.email,
  //   });

  //   req.user.totalExpense = amount + req.user.totalExpense;

  //   await req.user.save();
  //   res.json(response);
  // } catch (err) {
  //   console.log(err);
  // }
};

exports.getExpenses = async (req, res) => {
  const ITEMS_PER_PAGE = Number(req.header("itemsPerPage"));
  const page = req.query.page;
  const expenseToSkip = (page - 1) * ITEMS_PER_PAGE;

  console.log(ITEMS_PER_PAGE);

  try {
    const expenseCount = await Expense.count({ userId: req.user._id });

    console.log(expenseCount);

    const response = await Expense.find({ userId: req.user._id })
      .skip(expenseToSkip)
      .limit(ITEMS_PER_PAGE);

    console.log(`hi`, response);

    console.log(`hello`, req.user);

    const dataToFrontEnd = {
      response,
      isPremium: req.user.premium,
      paginationData: {
        currentPage: Number(page),
        hasNextPage: ITEMS_PER_PAGE * page < expenseCount,
        hasPreviousPage: page > 1,
        nextPage: Number(page) + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(expenseCount / ITEMS_PER_PAGE),
      },
    };

    res.json(dataToFrontEnd);
  } catch (err) {
    console.log(err);
  }

  // try {
  //   const expenseCount = await Expense.count({
  //     where: { userEmail: req.user.email },
  //   });

  //   const response = await Expense.findAll({
  //     where: { userEmail: req.user.email },
  //     offset: expenseToSkip,
  //     limit: ITEMS_PER_PAGE,
  //   });

  //   const dataToFrontEnd = {
  //     response,
  //     isPremium: req.user.dataValues.premium,
  //     paginationData: {
  //       currentPage: Number(page),
  //       hasNextPage: ITEMS_PER_PAGE * page < expenseCount,
  //       hasPreviousPage: page > 1,
  //       nextPage: Number(page) + 1,
  //       previousPage: page - 1,
  //       lastPage: Math.ceil(expenseCount / ITEMS_PER_PAGE),
  //     },
  //   };

  //   res.json(dataToFrontEnd);
  // } catch (err) {
  //   console.log(err);
  // }
};

exports.getExpensesPremium = async (req, res) => {
  console.log(`inside get expense premium`, req.params.userId);
  const userId = req.params.userId;

  try {
    const response = await Expense.find({ userId });

    res.json(response);
  } catch (err) {
    console.log(err);
  }
};

exports.deleteExpense = async (req, res) => {
  console.log(`inside delete expense`);
  const expenseId = req.params.expenseId;

  try {
    const response = await Expense.findByIdAndRemove(expenseId);

    res.json({ deleted: true });
  } catch (err) {
    console.log(err);
  }

  // try {
  //   const response = await Expense.destroy({ where: { id: expenseId } });

  //   res.json({ deleted: true });
  // } catch (err) {
  //   console.log(err);
  // }
};

exports.buyPremium = async (req, res) => {
  var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const response = await instance.orders.create({
    amount: 50000,
    currency: "INR",
  });

  res.json(response);
};

exports.setPremium = async (req, res) => {
  console.log(req.user);
  try {
    const user = await User.findById(req.user._id);

    user.premium = req.params.orderId;
    const response = await user.save();

    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

exports.fetchAllUsers = async (req, res) => {
  console.log(`fetch all users`);

  try {
    const response = await User.find({});

    console.log(response);
    res.json(response);
  } catch (err) {
    console.log(err);
  }

  // try {
  //   const response = await User.findAll();

  //   res.json(response);
  // } catch (err) {
  //   console.log(err);
  // }
};

exports.forgotPassword = (req, res) => {
  res.json({ msg: "from backend forgot password api called" });
};

// exports.downloadExpense = async (req, res) => {
//   try {
//     const expenses = await req.user.getExpenses();

//     const userEmail = req.user.email;
//     const stringifiedExpenses = JSON.stringify(expenses);
//     const filename = `Expenses${userEmail}/${new Date()}.txt`;

//     const fileURL = await uploadToS3(stringifiedExpenses, filename);

//     const response = await FileDownloaded.create({ url: fileURL, userEmail });

//     res.json(fileURL);
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.getFilesURL = async (req, res) => {
  console.log(`inside get file url`);
  const { _id: userId } = req.user;

  try {
    const response = await FileDownloaded.find({ userId });

    res.json(response);
  } catch (err) {
    console.log(err);
  }

  // try {
  //   const response = await FileDownloaded.findAll({ where: { userEmail } });

  //   res.json(response);
  // } catch (err) {
  //   console.log(err);
  // }
};
