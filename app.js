const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
// const https = require("https")

dotenv.config();

// const sequelize = require("./util/database");
const adminRoutes = require("./routes/admin");

const User = require("./models/user");
const Expense = require("./models/expense");
const FileDownloaded = require("./models/fileDownloaded");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flag: "a" }
);

const app = express();

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(cors());
app.use(bodyParser.json());

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

app.use(adminRoutes);

// User.hasMany(Expense);
// Expense.belongsTo(User);

// User.hasMany(FileDownloaded);
// FileDownloaded.belongsTo(User);

mongoose
  .connect(
    "mongodb+srv://manan:ev9Zmj6k4COLrT4D@cluster0.ych5lna.mongodb.net/expenses?retryWrites=true&w=majority"
  )
  .then(() => {
    // console.log(`connected`);
    console.log(`connected`);
    app.listen(3000);
    console.log(`listening at port 3000`);
  })
  .catch((err) => {
    console.log(`inside err`);
    console.log(err);
  });

// sequelize
//   // .sync({ force: true })
//   .sync()
//   .then(() => app.listen(3000))
//   .catch((err) => console.log(err));
