const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Section = sequelize.define('Section', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chapter_id: { type: DataTypes.INTEGER, allowNull: false },
    section_number: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'sections',
    timestamps: false,
  })

  return Section
}
