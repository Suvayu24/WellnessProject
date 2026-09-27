const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attachment = sequelize.define('Attachment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lecture_id: { type: DataTypes.INTEGER, allowNull: false },
    file_name: { type: DataTypes.STRING, allowNull: false },
    file_url: { type: DataTypes.STRING, allowNull: false },
    file_type: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'attachments',
    timestamps: false
  });
  return Attachment;
};