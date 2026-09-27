const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const LectureQuizQuestion = sequelize.define('LectureQuizQuestion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    quiz_id: { type: DataTypes.INTEGER, allowNull: false },
    question_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'mcq' },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    question_image_url: { type: DataTypes.STRING },
    options: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    correct_option_ids: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    marks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'lecture_quiz_questions',
    timestamps: false,
  })

  return LectureQuizQuestion
}
