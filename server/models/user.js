const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING },
    phone_number: { type: DataTypes.STRING },
    profile_pic: { type: DataTypes.STRING },
    admin_access: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'users',
    timestamps: false
  });
  return User;
};
