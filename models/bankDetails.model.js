const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const EmployeeDetails = require('./employee.model'); 

const BankDetails = sequelize.define('BankDetails', {
  id: { 
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 20], 
    },
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ifscCode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [9,11], 
    },
  },
  branchName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: { 
    type: DataTypes.STRING, 
    allowNull: false,
    references: {
      model: EmployeeDetails,
      key: 'employeeId',
    },
  },
}, {      
  timestamps: true,        
});

EmployeeDetails.hasOne(BankDetails, { foreignKey: 'employeeId' });
BankDetails.belongsTo(EmployeeDetails, { foreignKey: 'employeeId' });

module.exports = BankDetails;
