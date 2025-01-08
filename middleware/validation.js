const { body, param } = require('express-validator');

const validateSignup = [
  body('fullName').isString().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters long'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isStrongPassword().withMessage('Password must include uppercase, number, and special character'),
  body('role').isIn(['Admin', 'Employee', ]).withMessage('Invalid role provided')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isString().withMessage('Password is required')
];

const validateLeaveRequest = [
  body('leaveType').isString().withMessage('Leave type must be a string'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date')
    .custom((endDate, { req }) => new Date(endDate) >= new Date(req.body.startDate))
    .withMessage('End date must be after start date'),
  body('reason').isString().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters long')
];

const validateForgotPassword = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

const validateResetPassword = [
  body('newPassword').isStrongPassword().withMessage('Password must include uppercase, number, and special character'),
  body('confirmPassword').custom((confirmPassword, { req }) => confirmPassword === req.body.newPassword)
    .withMessage('Passwords do not match')
];

module.exports = {
  validateSignup,
  validateLogin,
  validateLeaveRequest,
  validateForgotPassword,
  validateResetPassword
};
