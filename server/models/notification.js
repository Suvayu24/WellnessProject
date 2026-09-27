const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    course_id: { type: DataTypes.INTEGER },
    chapter_id: { type: DataTypes.INTEGER },
    section_id: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, allowNull: false },
    notification_key: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    milestone_percent: { type: DataTypes.INTEGER },
    read_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'notifications',
    timestamps: false,
  })

  return Notification
}
