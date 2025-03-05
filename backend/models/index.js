const sequelize = require("../config/database");
const User = require("./user");

const db = {};
db.sequelize = sequelize;
db.User = User;

module.exports = db;