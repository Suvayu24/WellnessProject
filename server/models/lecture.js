const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lecture = sequelize.define('Lecture', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chapter_id: { type: DataTypes.INTEGER, allowNull: false },
    section_id: { type: DataTypes.INTEGER, allowNull: false },
    lecture_number: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    video_id: { type: DataTypes.STRING, allowNull: false },
    start_timestamp: { type: DataTypes.INTEGER, allowNull: true },
    end_timestamp: { type: DataTypes.INTEGER, allowNull: true },
    thumbnail: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'lectures',
    timestamps: false
  });
  return Lecture;
};
