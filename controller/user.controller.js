const express = require('express');
const User = require('../models/user.model');
const Employee = require('../models/employee.model');
const LeaveRequest = require('../models/leave.model');
const Announcelist = require('../models/announcement');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');



dotenv.config(); 


const { sendMail } = require('../helper/mailer');
const {signUpMail} = require('../helper/signup.email');

const signUp = async (req, res) => {
    const { fullName, email, password} = req.body;
    console.log(req.body);

    if (!fullName || !email || !password ) {
        return res.status(400).json({
           message: 'All fields are required' 
          });  
    }   

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({
            message: 'User already exists'
        });
    }
    
   

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role:"Employee",
        });

        const userResponse = { ...newUser.dataValues };
        delete userResponse.password;

        res.status(201).json({
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            message: 'Error creating user'
        });
    }
};


const employeeLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body); 

  
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    });
  }

  try {
        
    const user = await User.findOne({ where: { email } });
    console.log(user)
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    
    if (user.role !== 'Employee') {
      return res.status(404).json({
        message: 'User not found or not an employee',
      });
    }

    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    
    const token = jwt.sign(
      { email: user.email, role: user.role, userId: user.id }, 
      process.env.JWT_SECRET,
      { expiresIn: '5d' }
    );

   
    req.session.token = token;

 
    const employeeData = await Employee.findOne({
      where: { userId: user.id },
    });

    if (!employeeData) {
      return res.status(404).json({
        message: 'Employee details not found',
      });
    }

    
    const userResponse = { ...user.dataValues };
    delete userResponse.password;

    
    res.status(200).json({
      message: 'Login successful',
      // user: userResponse,
      token,
      employeeData: employeeData, 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      message: 'Error in Employee login',
    });
  }
};

const employeeLogout = async (req, res) => {
  try {

    if (!req.session.token) {
      return res.status(400).json({ message: 'You are not logged in' });
  }
  
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
           message: 'Error in logging out'
           });
      }

      res.status(200).json({ 
        message: 'Logged out successfully' 
      });
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      message: 'Error in Employee logout'
    });
  }
};

const employeePersonalDetails = async (req, res) => {
  try {
    const employeeID = req.params.employeeID;  
    console.log("Employee ID:", employeeID);  

    if (!employeeID) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const details = await Employee.findOne({ where: {  employeeID } });
    if (!details) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({
      message:"employee details",
      data: details
     
    });
  } catch (error) {
    console.error("Error in fetching Details", error);
    res.status(400).json({
      message: 'Error in fetching Employee details',
    });
  }
};

const employeeLeaveReq = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const userId = req.userId;
    console.log("userId",userId)
    console.log("req 1111",req)
   
    
    const employee = await Employee.findOne({ where: { userId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const leaveRequest = await LeaveRequest.create({
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending', 
      employeeID: employee.employeeID,
      userId,
    });

    const leaveDetails = { leaveType, startDate, endDate, reason };
    const employeeDetails = { name: employee.name, email: employee.email };

    
    await sendMail(employee.email, 'Leave Request Confirmation', leaveDetails, 'employee', employeeDetails, 'pending');

    
    const adminEmail = process.env.ADMIN_EMAIL;
    await sendMail(adminEmail, 'New Leave Request Notification', leaveDetails, 'admin', employeeDetails, 'pending');

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit leave request' });
  }
};

const checkLeave = async(req,res)=>{
   async (req, res) => {
    try {
      const leaveRequests = await LeaveRequest.findAll({
        where: { employeeID: req.params.employeeID }
      });
      res.status(201).json({
        message: 'All leave request', leaveRequests
        });

    } catch (error) {
      res.status(500).json({
         error: error.message 
        });
    }
   }
  
}

const employeeCount = async(req,res)=>{
  try {
    const employeeCount = await User.count({ where: { role: 'employee' } });
    res.status(200).json({
      message: 'Employee count',employeeCount,
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const checkalleavesbyemployee = async(req,res)=>{
  const {employeeID} = req.params;
  try {
      const leaveRequests = await LeaveRequest.findAll({ where: {employeeID: employeeID }});
      if(!leaveRequests){
          return res.status(404).json({
              message: 'No leave requests found for this employee',
              });

      }
       res.status(200).json({
       leaveRequests
      })
       } catch (error) {
          res.status(500).json({
          error: 'Failed to fetch leave requests by specific employeeID'
          });
       }
           
}

const deleteLeaveByEmployee = async(req,res)=>{
  try {
    
  } catch (error) {
    
  }

}

const deleteUserSignup = async (req, res) => {
  try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' }); 
      }

      await user.destroy();
      return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
      console.error(error);
      if (!res.headersSent) {
          return res.status(500).json({ message: 'Server error' }); 
      }
  }
};



const getAllAnnouncementbyEmployee = async (req, res) => {
  try {
      
      const announcements = await Announcelist.findAll();

      
      if (announcements.length === 0) {
          return res.status(404).json({
              message: "No announcements found",
          });
      }

    
      res.status(200).json({
          message: "All announcements fetched successfully",
          announcements,
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({
          message: "Error in fetching all announcements",
      });
  }
};




const forgotPassword = async (req, res) => { 
  try {
      const { email } = req.body;
   console.log(email)
      if (!email) {
          return res.status(400).json({
              success: false,
              message: 'Please input a valid email',
          });
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'User not found',
          });
      }


      const resetToken = crypto
          .createHash('sha256')
          .update(user.email + user.id + Date.now()) 
          .digest('hex');

   
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000;  
      await user.save();

    
      const resetLink = `http://localhost:3000/newpassword/${resetToken}`;

      const content = `
          <p>Click the following link to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>`;

    
      await signUpMail(user.email, 'Password Reset Request', content);

      return res.status(200).json({
          success: true,
          message: 'Password reset link sent successfully',
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({
          success: false,
          message: 'Error processing request',
      });
  }

}

const resetPassword = async(req,res)=>{


  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try {
     
      if (newPassword !== confirmPassword) {
          return res.status(400).json({
              success: false,
              message: 'Passwords do not match',
          });
      }

      const user = await User.findOne({ where: { resetToken: token } });

      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'Invalid or expired token',
          });
      }

     
      if (Date.now() > user.resetTokenExpiration) {
          return res.status(400).json({
              success: false,
              message: 'Reset token has expired',
          });
      }

     
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      
      user.password = hashedPassword;
      user.resetToken = null; 
      user.resetTokenExpiration = null; 
      await user.save();

      return res.status(200).json({
          success: true,
          message: 'Password has been reset successfully',
      });

  } catch (error) {
      console.error(error);
      return res.status(500).json({
          success: false,
          message: 'Error resetting password',
      });
  }
}


module.exports = {
    signUp,
    employeeLogin,
    employeeLogout,
    employeePersonalDetails,
    employeeLeaveReq,
    checkLeave,
    employeeCount,
    checkalleavesbyemployee,
    deleteLeaveByEmployee,
    getAllAnnouncementbyEmployee,
    deleteUserSignup,
    forgotPassword,
    resetPassword

}
