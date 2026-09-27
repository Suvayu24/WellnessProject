const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const QuizQuestion = sequelize.define('QuizQuestion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quiz_id: { type: DataTypes.INTEGER, allowNull: false },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    options: { type: DataTypes.JSON, allowNull: false },
    correct_answer: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'quiz_questions',
    timestamps: false
  });
  return QuizQuestion;
};
