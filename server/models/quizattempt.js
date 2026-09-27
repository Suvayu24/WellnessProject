const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const QuizAttempt = sequelize.define('QuizAttempt', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    quiz_id: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    max_score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    attempt_number: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'lecture_quiz_attempts',
    timestamps: false,
  })

  return QuizAttempt
}
