const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  premium: {
    type: String,
  },

  totalExpense: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model('User', userSchema)

// const Sequelize = require("sequelize");

// const sequelize = require("../util/database");

// const User = sequelize.define("user", {
//   username: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },

//   email: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     unique: true,
//     primaryKey: true,
//   },

//   password: {
//     type: Sequelize.STRING,
//     allowNull: false,
//   },

//   premium: {
//     type: Sequelize.STRING,
//   },

//   "totalExpense": {
//     type: Sequelize.INTEGER,
//     allowNull: false,
//     defaultValue: 0,
//   },
// });

// module.exports = User;
