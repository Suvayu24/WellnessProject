const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Notebook = sequelize.define('Notebook', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    color: { type: DataTypes.STRING, allowNull: false, defaultValue: '#0f766e' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'notebooks',
    timestamps: false,
  })

  return Notebook
}
