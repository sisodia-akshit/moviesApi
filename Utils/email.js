
const nodemailer = require('nodemailer');

const sendEmail = async(option) => {
    // Create a Transporter
    var transport= nodemailer.createTransport({
        host:"sandbox.smtp.mailtrap.io",
        port:2525,
        auth:{
            user:"cc5cce7a5dbfc5",
            pass:"01b1b0a9521d8c"
        }
    })

    // Define Email Options 
    const emailOptions = {
        from:'Ciniflex support<support@ciniflex.com>',
        to: option.email,
        subject: option.subject,
        text: option.message 
    }

    await transport.sendMail(emailOptions);
}
module.exports = sendEmail;