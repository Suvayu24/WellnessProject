const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Note = sequelize.define('Note', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    lecture_id: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'notes',
    timestamps: false
  });
  return Note;
};