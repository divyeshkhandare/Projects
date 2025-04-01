const Sequelize = require("sequelize");

const db = new Sequelize("expense_tracker", "root", "Divyesh", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = db;
