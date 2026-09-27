const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const NotebookPage = sequelize.define('NotebookPage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    notebook_id: { type: DataTypes.INTEGER, allowNull: false },
    page_number: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'notebook_pages',
    timestamps: false,
  })

  return NotebookPage
}
