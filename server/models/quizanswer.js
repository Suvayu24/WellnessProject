const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const QuizAnswer = sequelize.define('QuizAnswer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    attempt_id: { type: DataTypes.INTEGER, allowNull: false },
    question_id: { type: DataTypes.INTEGER, allowNull: false },
    selected_option_ids: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    text_answer: { type: DataTypes.TEXT },
    is_correct: { type: DataTypes.BOOLEAN },
    marks_awarded: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'lecture_quiz_attempt_answers',
    timestamps: false,
  })

  return QuizAnswer
}
