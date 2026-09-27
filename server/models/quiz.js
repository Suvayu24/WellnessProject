const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Quiz = sequelize.define('Quiz', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chapter_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'quizzes',
    timestamps: false
  });
  return Quiz;
};
