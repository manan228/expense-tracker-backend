const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const FileDownloaded = sequelize.define("filedownloaded", {
  url: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = FileDownloaded;
