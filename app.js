const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const sequelize = require("./util/database");
const adminRoutes = require('./routes/admin')

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(adminRoutes)

sequelize
//   .sync({force: true})
  .sync()
  .then(() => app.listen(3000))
  .catch((err) => console.log(err));
