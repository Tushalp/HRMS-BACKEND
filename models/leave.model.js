const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const EmployeeDetails = require('./employee.model'); 
const User = require('./user.model');  

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: { 
    type: DataTypes.INTEGER,
    primaryKey: true,  
    autoIncrement: true,  
  },
  employeeID: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    references: { 
      model: EmployeeDetails, 
      key: 'employeeID',  
    },
  },
  userId: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',  
    },
  },
  leaveType: { 
    type: DataTypes.STRING, 
    allowNull: false, 
  }, 
  
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false, 
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending', 
    allowNull: false,
  }, 
}, {
  timestamps: true, 
});


EmployeeDetails.hasMany(LeaveRequest, { foreignKey: 'employeeID' });
LeaveRequest.belongsTo(EmployeeDetails, { foreignKey: 'employeeID' });

User.hasMany(LeaveRequest, { foreignKey: 'userId' });
LeaveRequest.belongsTo(User, { foreignKey: 'userId' });

module.exports = LeaveRequest;
