// const nodemailer = require('nodemailer')
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//     host:process.env.SMTP_HOST,
//     port:process.env.SMTP_PORT,
//     secure:false,
//     requireTLS:true,
//     service: 'gmail',
//     auth:{
//         user:process.env.SMTP_MAIL,
//         pass:process.env.SMTP_PASSWORD
//     }

// });

// const sendMail = async(email,subject,content)=>{

//     try {
//        var  mailOptions={
//             from:process.env.SMTP_MAIL,
//             to:email,
//             subject:subject,
//             html:content
//         };

//         transporter.sendMail(mailOptions,(error,info)=>{
//             if(error){
//                 console.log(error);
//                 return; 
//             }
//             console.log('Mail sent',info.messageId);
//         });
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// module.exports={
//     sendMail
// }






const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  requireTLS: true,
  service: 'gmail',
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async (recipientEmail, subject, leaveDetails, recipientType, employeeDetails, status = 'pending') => {
    try {
        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: recipientEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #0056b3;">
                            ${recipientType === 'Employee' 
                                ? (status === 'approved' ? 'Leave Request Approved' : status === 'rejected' ? 'Leave Request Rejected' : 'Leave Request Submitted')
                                : 'New Leave Request Notification'}
                        </h1>
                        <p style="color: #666; font-size: 14px;">
                            ${recipientType === 'Employee' 
                                ? (status === 'approved' ? 'Your leave request has been approved' 
                                    : status === 'rejected' ? 'Your leave request has been rejected' 
                                    : 'Your leave request has been submitted and is pending approval') 
                                : 'A leave request has been submitted and is pending approval.'}
                        </p>
                    </div>
                    <div>
                        ${recipientType === 'employee' 
                            ? '<p>Dear Employee,</p>' 
                            : `<p>Dear Admin,</p>
                            <p>An employee has submitted a leave request with the following details:</p>
                            <p><strong>Employee Name:</strong> ${employeeDetails.name}</p>
                            <p><strong>Employee Email:</strong> ${employeeDetails.email}</p>`}
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; text-align: left;">
                            <tr>
                                <th style="padding: 10px; background: #f4f4f4; border: 1px solid #ddd;">Field</th>
                                <th style="padding: 10px; background: #f4f4f4; border: 1px solid #ddd;">Details</th>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">Leave Type</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${leaveDetails.leaveType}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">Start Date</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${leaveDetails.startDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">End Date</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${leaveDetails.endDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">Reason</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${leaveDetails.reason}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;">Status</td>
                                <td style="padding: 8px; border: 1px solid #ddd; color: ${status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange'}; font-weight: bold;">
                                    ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending'}
                                </td>
                            </tr>
                        </table>
                        <p style="margin-top: 20px;">
                            ${recipientType === 'employee' 
                                ? 'If you have any questions, feel free to contact HR.' 
                                : 'Please review the request and take appropriate action.'}
                        </p>
                    </div>
                    <footer style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
                        <p>&copy; 2024 Your Company. All rights reserved.</p>
                    </footer>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending mail:', error);
                return;
            }
            console.log('Mail sent:', info);
        });
    } catch (error) {
        console.error('Error in sendMail:', error.message);
    }
};


module.exports={
    sendMail
}