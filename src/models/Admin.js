const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

// Hash password before saving
Admin.beforeCreate(async (admin) => {
  admin.password = await bcrypt.hash(admin.password, 10);
});

// Password validation method
Admin.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Hide password in JSON responses
Admin.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};


module.exports = Admin;
