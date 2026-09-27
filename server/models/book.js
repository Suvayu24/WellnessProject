const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    cover_url: { type: DataTypes.STRING },
    pdf_url: { type: DataTypes.STRING, allowNull: false },
    reader_url: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'books',
    timestamps: false,
  })

  return Book
}
