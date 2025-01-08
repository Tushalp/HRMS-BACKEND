
const express = require('express');
const verifyToken = require('../middleware/verifyToken')
const { signUp, employeeLogin, employeeLogout, employeeLeaveReq, employeePersonalDetails, checkLeave ,employeeCount, checkalleavesbyemployee,deleteLeaveByEmployee, deleteUserSignup, forgotPassword, resetPassword, getAllAnnouncementbyEmployee, } = require('../controller/user.controller');
const { getAllAnnouncement } = require('../controller/announcement.controller');
const { validateSignup, validateLogin } = require('../middleware/validation');

const router = express.Router();



router.post("/signUp",signUp);
router.post("/employee/login",employeeLogin);
router.post("/employee/logout",employeeLogout);
router.get('/employeePersonalDetails/:employeeID',employeePersonalDetails);
router.post("/leaveapply",verifyToken,employeeLeaveReq);
router.get("/checkleavestatus/:employeeID",checkLeave);
router.get("/employeeCount",employeeCount);
router.get('/checkallleavesbyemployee/:employeeID',checkalleavesbyemployee)
router.delete('/deleteleavebyemployee/:employeeID',deleteLeaveByEmployee)
router.delete('/deleteUserSignup/:id',deleteUserSignup)
router.get('/getAllAnnouncementbyEmployee',getAllAnnouncementbyEmployee)
router.post('/forgotPassword',forgotPassword);
router.post('/resetPassword/:token',resetPassword)






module.exports = router;   
