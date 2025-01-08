const ExcelJS = require('exceljs');
const path = require('path');
const xlsx = require('xlsx');
const User = require('../models/user.model');
const Employee = require('../models/employee.model');
const LeaveRequest = require('../models/leave.model');
const BankDetails = require('../models/bankDetails.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const  Sequelize  = require('../config/db');
const { Op } = require('sequelize'); 

const { sendMail } = require('../helper/mailer');
const { signUpMail } = require('../helper/signup.email');


dotenv.config(); 



const adminLogin = async (req, res) => {
  try {
      const { email, password } = req.body;
      console.log(req.body);

      if (!email || !password ) {
          return res.status(400).json({
             message: "All field are required"
             });
      }
    
      
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.status(400).json({
             message: "Invalid email or password"
             });
      }

      if (user.role !== 'Admin') {
        return res.status(404).json({ 
            message: "user not found "
         });
      }
  
      
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
          return res.status(400).json({
             message: "Invalid email or password" 
            });
      }

     
      const token = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET, 
          { expiresIn: '5d' }
      );

      req.session.token = token;

      const { password: _, ...userWithoutPassword } = user.dataValues;

      
      return res.status(200).json({
          message: 'Login successful',
          user: userWithoutPassword,
          token,
      });
  } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({
         message: 'Error in Admin login' 
        });
  }
};
const adminLogout = async(req, res) => {
    try {
        console.log(req);

       await req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                     message: 'Error logging out'
                     });
            }
            console.log("logout succesfully 00000")
            return res.status(200).json({
                 message: 'Logout successful'
                 });
        });
        console.log("logout succesfully")
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({
             message: 'Error in Admin logout'

             });
    }
  };
  

  const addEmployeeDetails = async (req, res) => {
    const t = await Sequelize.transaction();
    try {
        const { employeeID, name, email, phone, dateOfBirth, address, technologies, salary, bankDetails } = req.body;
        console.log("This is a information ",req.body);

        
        if (!employeeID || !name || !email || !phone || !dateOfBirth || !address || !technologies || !salary) {
            await t.rollback();
            return res.status(400).json({ message: "All fields are required" });
        }

      
        const existingChecks = await Employee.findOne({
            where: {
                [Op.or]: [
                    { employeeID },
                    { email }
                ]
            }
        });

        if (existingChecks) {
            await t.rollback();
            return res.status(400).json({
                message: existingChecks.employeeID === employeeID
                    ? 'Employee with this ID already exists'
                    : 'Employee with this email already exists'
            });
        }

   
        const registeredUser = await User.findOne({ where: { email } });
        if (!registeredUser) {
            await t.rollback();
            return res.status(400).json({ message: 'No registered user found with this email' });
        }

      
        const newEmployee = await Employee.create({
            employeeID,
            name,
            email,
            phone,
            dateOfBirth,
            address,
            technologies,
            salary,
            userId: registeredUser.id
        }, { transaction: t });


        if (bankDetails) {
            const { accountNumber, bankName, ifscCode, branchName } = bankDetails;

            if (!accountNumber || !bankName || !ifscCode || !branchName) {
                await t.rollback();
                return res.status(400).json({ message: "All bank details fields are required" });
            }


            const existingBankDetails = await BankDetails.findOne({
                where: {
                    [Op.or]: [
                        { accountNumber },
                        { ifscCode }
                    ]
                }
            });

            if (existingBankDetails) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Bank details already exist'
                });
            }

   
            await BankDetails.create({
                accountNumber,
                bankName,
                ifscCode,
                branchName,
                employeeId: newEmployee.employeeID
            }, { transaction: t });
        }

       
        await t.commit();

        return res.status(201).json({
            message: 'Employee created successfully',
            employee: newEmployee,
            bankDetails: bankDetails ? "Bank details saved" : "No bank details provided"
        });

    } catch (error) {
        await t.rollback();
        console.error('Error in adding employee details:', error);
        return res.status(500).json({
            message: 'Error in adding employee and bank details',
            error: error.message
        });
    }
};





//   const addEmployeeDetails = async (req, res) => {
//     try {
      
//         const { employeeID, name, email, phone, dateOfBirth, address,technologies, salary } = req.body;
//         console.log(req.body);
     
       
//         if (!employeeID || !name || !email || !phone || !dateOfBirth || !address || !technologies || !salary) {
//             return res.status(400).json({
//                 message: "All fields are required"
//             });
//         }

        
//         const existingEmployee = await Employee.findOne({ where: { employeeID } });
//         if (existingEmployee) {
//             return res.status(400).json({
//                 message: 'Employee with this ID already exists'
//             });
//         }

       
//         const registeredUser = await User.findOne({ where: { email } });
//         if (!registeredUser) {
//             return res.status(400).json({
//                 message: 'No registered user found with this email'
//             });
//         }

        
//         const existingEmployeeByEmail = await Employee.findOne({ where: { email } });
//         if (existingEmployeeByEmail) {
//             return res.status(400).json({
//                 message: 'Employee with this email already exists'
//             });
//         }

       
//         const newEmployee = await Employee.create({
//             employeeID,
//             name,
//             email,
//             phone,
//             dateOfBirth,
//             address,
//             technologies,
//             salary,
//             userId: registeredUser.id
//         });

//         return res.status(201).json({
//             message: 'Employee created successfully',
//             employee: newEmployee
//         });
//     } catch (error) {
//         console.error('Error in adding employee details:', error);
//         res.status(500).json({
//             message: 'Error in adding employee details'
//         });
//     }
// };

const getAllEmployee = async(req,res)=>{
    try {
        
        const employees = await Employee.findAll();
        return res.status(200).json({
            message: 'Employees fetched successfully',
            employees
            });
            
    } catch (error) {
        console.log("Error in fetch all employee");
        res.status(400).json({
            message:"Error in fetch all employee data"

        })
    }
}

const admingetEmployee = async (req, res) => {
    try {
        const id = req.params.id; 
        
        const employee = await Employee.findOne({
            where: { id: id } 
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json(employee); 
    } catch (error) {
        console.log("Error in getEmployee:", error);
        res.status(500).json({
            message: "Error fetching employee data"
        });
    }
};



const editEmployee = async (req, res) => {
    const { id } = req.params;
    const {employeeID, name, email, phone, dateOfBirth, address,technologies, salary} = req.body;

    try {
        
        // console.log('Request body:', req.body);

     
        
        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).json({ 
                message: 'Employee not found' 
            });
        }

        
        employee.employeeID = employeeID || employee.employeeID;
        employee.name = name || employee.name;
        employee.email = email || employee.email;
        employee.phone = phone || employee.phone;
        employee.dateOfBirth = dateOfBirth || employee.dateOfBirth;
        employee.address = address || employee.address;
        employee.technologies = technologies || employee.technologies;
        employee.salary = salary || employee.salary;
       

      
        await employee.save();

        res.status(200).json({
            message: 'Employee details updated successfully',
            employee
        });
    } catch (error) {
        console.error('Error in editing employee details:', error);
        res.status(500).json({
            message: 'Error in editing employee details'
        });
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
       
        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).json({
                 message: 'Employee not found' 
                });
        }

        
        await employee.destroy();

        res.status(200).json({
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleting employee:', error);
        res.status(500).json({
            message: 'Error in deleting employee'
        });
    }
};

const checkAllLeaves = async(req,res)=>{

    try {
        const leaveRequests = await LeaveRequest.findAll();
        res.status(200).json({
            leaveRequests
        })
      } catch (error) {
        res.status(500).json({
             error: 'Failed to fetch leave requests' 
            });
      }
    
}

const checkallLeaveByemployeeID = async(req,res)=>{
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

const responseLeave = async (req, res) => {
    try {
        const { employeeID } = req.params;  
        const { status } = req.body;       

        
        const leaveRequest = await LeaveRequest.findOne({
            where: { employeeID: employeeID } 
        });

        console.log(leaveRequest);

        if (!leaveRequest) {
            return res.status(404).json({ 
                error: 'Leave request not found' 
            });
        }

        
        leaveRequest.status = status;
        await leaveRequest.save();

   
        res.status(200).json({ message: `Leave request ${status}` });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'error! updating the leave request'
        });
    }
}

const countAdmin = async(rea,res)=>{
    try {
        const adminCount = await User.count({ where: { role: 'Admin' } });
        if(!adminCount){
            return res.status(404).json({
                error: 'No admin found'
                });

        }
        res.json({ adminCount });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
}

const allEmployeeSalarySum = async(req,res)=>{
    try {
        const totalSalary = await Employee.sum('salary');
        if(!totalSalary){
            return res.status(404).json({
                 message: 'Error in all Employee Salary Sum ' 
                });
        }
        
        res.status(200).json({
            message: 'Employee salary sum',
            totalSalary
            });
    
      } catch (error) {
        console.log(error);
        res.status(500).json({
             error: error.message
             });
      }
}

const approveRequestbyAdmin = async (req, res) => {
    try {
        const  {id}  = req.params;
        console.log(req.params)
        const leaveRequest = await LeaveRequest.findByPk(id);
       console.log(leaveRequest);
        if (!leaveRequest) {
          return res.status(404).json({
             error: 'Leave request not found'
             });
          
        }
    
        leaveRequest.status = 'approved'; 
        await leaveRequest.save();
    
        const employee = await Employee.findOne({ where: { employeeID: leaveRequest.employeeID } });
        const leaveDetails = {
          leaveType: leaveRequest.leaveType,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          reason: leaveRequest.reason,
        };
        const employeeDetails = { name: employee.name, email: employee.email };
    
    
        await sendMail(employee.email, 'Leave Request Approved', leaveDetails, 'employee', employeeDetails, 'approved');
    
       
        // const adminEmail = process.env.ADMIN_EMAIL;
        // await sendMail(adminEmail, 'Leave Request Approved', leaveDetails, 'admin', employeeDetails, 'approved');
    
        res.status(200).json({ 

            message: 'Leave request approved successfully'
         });
      } catch (error) {
        console.error(error);
        res.status(500).json({
             error: 'Failed to approve leave request'
             });
      }
};
  
  const rejectRequestbyAdmin = async (req, res) => {
    try {
        const { id } = req.params; 
        const leaverquest = await LeaveRequest.findByPk(id);
    
        if (!leaverquest) {
          return res.status(404).json({
             error: 'Leave request not found'
             });
        }
    
        leaverquest.status = 'rejected'; 
        await leaverquest.save();
    
        const employee = await Employee.findOne({ where: { employeeID: leaverquest.employeeID } });
        const leaveDetails = {
          leaveType: leaverquest.leaveType,
          startDate: leaverquest.startDate,
          endDate: leaverquest.endDate,
          reason: leaverquest.reason,
        };
        const employeeDetails = { name: employee.name, email: employee.email };
    
       
        await sendMail(employee.email, 'Leave Request Rejected', leaveDetails, 'Employee', employeeDetails, 'rejected');
    
   
        // const adminEmail = process.env.ADMIN_EMAIL;
        // await sendMail(adminEmail, 'Leave Request Rejected', leaveDetails, 'admin', employeeDetails, 'rejected');
    
        res.status(200).json({
             message: 'Leave request rejected successfully' 
            });
      } catch (error) {
        console.error(error);
        res.status(500).json({
             error: 'Failed to reject leave request'
             });
      }
};

  const exportDataToExcel = async (req, res) => {
      try {
          
          const employees = await Employee.findAll({
              attributes: ['employeeID','name', 'email', 'phone', 'salary', 'address','technologies','dateOfBirth'], 
          });
  
         
          const data = employees.map(emp => ({
              EmployeeID:emp.employeeID,
              Name: emp.name,
              Email: emp.email,
              Phone: emp.phone,
              Salary: emp.salary,
              address: emp.address,
              technologies: emp.technologies,
              DateOfBirth: emp.dateOfBirth,
          }));
  
          
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Employees');
  
          
          worksheet.columns = [
            { header: 'EmployeeID', key: 'EmployeeID', width: 10 },
              { header: 'Name', key: 'Name', width: 25 },
              { header: 'Email', key: 'Email', width: 30 },
              { header: 'Phone', key: 'Phone', width: 15 },
              { header: 'Salary', key: 'Salary', width: 15 },
              { header: 'Address', key: 'address', width: 15 },
              { header: 'Technologies', key: 'technologies', width: 15 },
              { header: 'DateOfBirth', key: 'DateOfBirth', width: 15 },
          ];
  
         
          worksheet.addRows(data);
  
          
          res.setHeader(
              'Content-Type',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
  
          await workbook.xlsx.write(res);
          res.status(200).end();
      } catch (error) {
          console.error('Error exporting data to Excel:', error);
          res.status(500).json({
              error: 'Failed to export data',
          });
      }
};
const importDataToExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const pendingEmails = [];  
        
        const employeeData = [];   
        
      
        
        for (const row of data) {
            const employeeID = row.EmployeeID;
            const email = row.Email;
            const name = row.Name;
            const phone = row.Phone || null;
            const address = row.Address || null;
            const salary = row.Salary || null;
            const technologies = row.Technologies || null;
            const dateOfBirth = row.DateOfBirth || null;

            
            
            if (!employeeID || !email || !name || !dateOfBirth || !address ) {
                console.log(`Invalid row: ${JSON.stringify(row)}`);
                continue;
            }

     
            
            let user = await User.findOne({ where: { email: email } });

            
            
            if (!user) {
                const randomPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, 10); 
                user = await User.create({
                    email: email,
                    fullName: name,
                    password: hashedPassword,
                    role: 'Employee'
                });

                
                
                pendingEmails.push({ email, name, password: randomPassword });
            }

            const userId = user.id;

          
            
            const employeeExists = await Employee.findOne({
                where: { employeeID: employeeID }
            });

            
            
            if (!employeeExists) {
                employeeData.push({
                    employeeID: employeeID,
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    salary: salary,
                    technologies: technologies,
                    dateOfBirth: dateOfBirth,
                    userId: userId
                });
            }
        }

        
        
        if (employeeData.length > 0) {
            await Employee.bulkCreate(employeeData);
        }

        
        
        for (const user of pendingEmails) {
            const { email, name, password } = user; 
            const subject = 'Welcome to the Company!';
            const content = `
                <h1>Welcome, ${name}!</h1>
                <p>Your account has been created successfully.</p>
                <p>Here are your login credentials:</p>
                <ul>
                    <li>Email: ${email}</li>
                    <li>Password: ${password}</li>
                </ul>
                <p>We recommend changing your password before logging in.</p>
                <p>Please use the following link to complete your process: <a href="http://localhost:3000/password">Complete process</a></p>
            `;
        
            await signUpMail(email, subject, content);
        }

      
        
        res.status(200).json({
            success: true,
            message: 'User and Employee data saved successfully',
            pendingEmails: pendingEmails.map(({ email }) => email),
        });
    } catch (error) {
        console.error('Error in importDataToExcel:', error.stack || error);
        res.status(500).json({
            success: false,
            message: 'Error processing data or saving employees',
            error: error.message,
        });
    }
};

const employeeCountsByTechnology = async (req, res) => {
    try {
        const technologies = ["Node", "React", "Laravel", "Python", "MERN"];
        const counts = {};

        for (const tech of technologies) {
            counts[tech] = await Employee.count({ where: { technologies: tech } });
        }

        return res.status(200).json({
            success: true,
            counts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in fetching data",
        });
    }
};

const nodeEmployeeData = async(req,res)=>{
    try {
        const nodeEmployee = await Employee.findAll({where:{technologies:'Node'}});
        if(!nodeEmployee){
            res.status(404),json({
                success:false,
                message:"no Employee found"
            })
        }
        const nodeEmployeeSalarySum = await Employee.sum('salary', { where: { technologies: 'Node' } });

       
        return res.status(200).json({
            success: true,
            nodeEmployee,
            nodeEmployeeSalarySum,
        });
    } catch (error) {
        console.log(error,"error")
        return res.status(500).json({
            success: false,
            message: 'Error in fetching Node  data',
        })
    }
}

const reactEmployeeData = async(req,res)=>{
    try {
        const reactEmployee = await Employee.findAll({where:{technologies:'React'}});
        if(!reactEmployee){
            res.status(404),json({
                success:false,
                message:"no Employee found"
            })
        }
        const reactEmployeeSalarySum = await Employee.sum('salary', { where: { technologies: 'React' } });
        return res.status(200).json({
            reactEmployee,
            reactEmployeeSalarySum
        })
    } catch (error) {
        console.log(error,"error")
        return res.status(500).json({
            success: false,
            message: 'Error in fetching React   data',
        })
    }
}

const laravelEmployeeData = async(req,res)=>{

    try {
        const laravelEmployee = await Employee.findAll({where:{technologies:'Laravel'}});
        if(!laravelEmployee){
            res.status(404),json({
                success:false,
                message:"no Employee found"
            })
        }
        const laravelEmployeeSalarySum = await Employee.sum('salary', { where: { technologies: 'Laravel' } });
        return res.status(200).json({
            laravelEmployee,
        laravelEmployeeSalarySum
    })
    } catch (error) {
        console.log(error,"error")
        return res.status(500).json({
            success: false,
            message: 'Error in fetching  data',
        })
    }
}

const pythonEmployeeData = async(req,res)=>{
    try {
        const pythonEmployee = await Employee.findAll({where:{technologies:'Python'}});
        if(!pythonEmployee){
            res.status(404),json({
                success:false,
                message:"no Employee found"
            })
        }
        const pythonEmployeeSalarySum = await Employee.sum('salary', { where: { technologies: 'Python' } });
        return res.status(200).json({
            pythonEmployee,
        pythonEmployeeSalarySum
    })
    } catch (error) {
        console.log(error,"error")
        return res.status(500).json({
            success: false,
            message: 'Error in fetching  data',
        })
    }

}

const mernEmployeeData = async(req,res)=>{

    try {
        const mernEmployee = await Employee.findAll({where:{technologies:'MERN'}});
        if(!mernEmployee){
            res.status(404),json({
                success:false,
                message:"no Employee found"
            })
        }
        const mernEmployeeSalarySum = await Employee.sum('salary', { where: { technologies: 'MERN' } });
        return res.status(200).json({
            mernEmployee,
        mernEmployeeSalarySum
    })
    } catch (error) {
        console.log(error,"error")
        return res.status(500).json({
            success: false,
            message: 'Error in fetching  data',
        })
    }
}
 
module.exports = {
  adminLogin,
  adminLogout,
  addEmployeeDetails,
  getAllEmployee,
  editEmployee,
  deleteEmployee,
  checkAllLeaves,
  responseLeave,
  admingetEmployee,
  checkallLeaveByemployeeID,
  countAdmin,
  allEmployeeSalarySum,
  approveRequestbyAdmin,
  rejectRequestbyAdmin,
  exportDataToExcel,
  importDataToExcel,


  employeeCountsByTechnology,

  nodeEmployeeData,
  reactEmployeeData,
  laravelEmployeeData,
  pythonEmployeeData,
  mernEmployeeData


}
