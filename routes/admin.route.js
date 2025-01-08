
const express = require('express');

const {adminLogin,adminLogout, addEmployeeDetails, editEmployee, getAllEmployee, deleteEmployee, checkAllLeaves, responseLeave, admingetEmployee, checkallLeaveByemployeeID, countAdmin, allEmployeeSalarySum, approveRequestbyAdmin, rejectRequestbyAdmin, exportDataToExcel, importDataToExcel, nodeEmployeeCountAndSalarySum,reactEmployeeCountAndSalarySum,laravelEmployeeCountAndSalarySum,pythonEmployeeCountAndSalarySum,mernEmployeeCountAndSalarySum, nodeEmployeeData, reactEmployeeData,laravelEmployeeData,pythonEmployeeData,mernEmployeeData, employeeCountsByTechnology} = require('../controller/admin.controller')

const { saveAnnouncement, getAllAnnouncement, deleteAnnouncement } = require('../controller/announcement.controller');



const verifyToken = require('../middleware/verifyToken');
const upload = require('../middleware/fileUpload.middleware');

const router = express.Router();

router.post('/login',adminLogin);
router.post('/logout',verifyToken,adminLogout);
router.post('/employeeAlldetails',addEmployeeDetails);
router.get('/getAllEmployee',getAllEmployee);
router.put('/editEmployee/:id',editEmployee);
router.delete('/deleteEmployee/:id',deleteEmployee);
router.get('/adminGetEmployee/:id',admingetEmployee)
router.get('/checkallLeave',checkAllLeaves);
// router.put('/leaveResponse/:employeeID',responseLeave);
router.get('/checkallLeaveByemployeeID/:employeeID',checkallLeaveByemployeeID);
router.get('/countAdmin',countAdmin);
router.get('/allEmployeesalarysum',allEmployeeSalarySum);
router.put('/approveRequestbyAdmin/:id',approveRequestbyAdmin);
router.put('/rejectRequestbyAdmin/:id',rejectRequestbyAdmin);



router.get('/employeeCountsByTechnology',employeeCountsByTechnology)


router.get('/nodeEmployeeData',nodeEmployeeData);
router.get('/reactEmployeeData',reactEmployeeData);
router.get('/laravelEmployeeData',laravelEmployeeData);
router.get('/pythonEmployeeData',pythonEmployeeData);
router.get('/mernEmployeeData',mernEmployeeData);



// excel export & import


router.get('/getemployee/export',exportDataToExcel);

router.post('/import-and-send-emails',upload.single('file'),importDataToExcel);





router.post('/announcementdata/savedata',saveAnnouncement);
router.get('/getallDocument',getAllAnnouncement)
router.delete('/deletedocument/:id',deleteAnnouncement)




module.exports = router;  


