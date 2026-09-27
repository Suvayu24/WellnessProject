const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const LectureQuiz = sequelize.define('LectureQuiz', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lecture_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'lecture_quizzes',
    timestamps: false,
  })

  return LectureQuiz
}
