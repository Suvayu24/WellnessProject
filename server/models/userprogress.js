const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserProgress = sequelize.define('UserProgress', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    lecture_id: { type: DataTypes.INTEGER, allowNull: false },
    watched_seconds: { type: DataTypes.FLOAT, defaultValue: 0 },
    last_watched_time: { type: DataTypes.FLOAT, defaultValue: 0 },
    completed: { type: DataTypes.BOOLEAN, defaultValue: false },
    last_watched_at: { type: DataTypes.DATE }
  }, {
    tableName: 'user_progress',
    timestamps: false
  });
  return UserProgress;
};
