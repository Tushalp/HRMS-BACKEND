const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Announcelist = sequelize.define('Announcelist', {
  id: { 
    type: DataTypes.INTEGER,
    primaryKey: true,  
    autoIncrement: true,  
  },
  
  title: { 
    type: DataTypes.STRING, 
    allowNull: false, 
  }, 
  
  conductedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },


  startTime: {
    type: DataTypes.TIME,
    allowNull: false, 
  },

  endTime: {
    type: DataTypes.TIME,
    allowNull: false, 
  }, 
}, {
  timestamps: true, 
});

module.exports = Announcelist;
