const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chapter = sequelize.define('Chapter', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    chapter_number: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'chapters',
    timestamps: false
  });
  return Chapter;
};