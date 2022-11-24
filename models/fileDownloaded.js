const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fileDownloadSchema = new Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("fileDownloaded", fileDownloadSchema);

// const Sequelize = require("sequelize");

// const sequelize = require("../util/database");

// const FileDownloaded = sequelize.define("filedownloaded", {
//   url: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     unique: true,
//   },
// });

// module.exports = FileDownloaded;
