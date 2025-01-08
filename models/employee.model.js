const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model'); 

const EmployeeDetails = sequelize.define('EmployeeDetails', {
  id: { 
    type: DataTypes.INTEGER,
    primaryKey: true,  
    autoIncrement: true,  
  },
  employeeID: {
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true,
    require:true
  },
  name: { 
    type: DataTypes.STRING,
    allowNull: false,
    require:true
  },
  email: { 
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    validate: {
      isEmail: true, 
    },
  },
  phone: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  technologies: { 
    type: DataTypes.STRING,
    allowNull: false 
},

  salary: {
    type: DataTypes.FLOAT, 
    allowNull: false,
    validate: {
      min: 0, 
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
}, {      
  timestamps: true,        
});


User.hasOne(EmployeeDetails, { foreignKey: 'userId' });
EmployeeDetails.belongsTo(User, { foreignKey: 'userId' });

module.exports = EmployeeDetails;
