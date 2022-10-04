const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");
const adminRoutes = require("./routes/admin");

const User = require("./models/user");
const Expense = require("./models/expense");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(adminRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => app.listen(3000))
  .catch((err) => console.log(err));
