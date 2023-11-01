// This module is used to send scheduled Mail's and SMS
// Express 
require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// node-corn used for scheduling jobs
const cron = require('node-cron');

// Email Package Nodemailer
const nodemailer = require('nodemailer');

// Transporter for sending mail
var transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    user: process.env.FROM__MAILID,
    pass: process.env.FROM_MAILID_PASSWORD
  }
});

const mailSend = async (subject, body) => {
    const mailOptions = {
        from: process.env.FROM__MAILID,
        to: process.env.TO_MAILID,
        cc:'dineshkandula007@gmail.com',
        subject,
        text: body
    };

    try{
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    }catch (error){
        console.log(error);
    }

}

// Scheduled to send the mail id at 12:30pm everyday
cron.schedule('0 12 * * *', () => {
    const subject = 'Automatic Mail Scheduler from Node JS';
    const body = 'Hey guys..! I am Dinesh Kumar kandula, Sending you mail from automatic mail scheduler from new project. It\'s Lunch Time';
    console.log("Sending Mail");
    mailSend(subject, body);
    console.log("Mail Sent");
});


// SMS twilio Package
const client = require('twilio')(process.env.ACCOUNT_SID,  process.env.AUTH_TOKEN);
// sms auth: AHdjRvGbkxanhUylbDK1agINbz5xo45M1_XXWGiF

// Sending SMS
const sendSMS = async (body) => {
    let msgOptions = {
        from : '+15677071053',
        to: '+919493606837',
        body
    }
    try{
        const message = await client.messages.create(msgOptions);
        console.log(message);
    }catch (error){
        console.log(error);
    }
}

// Scheduled to send SMS at 8:30am every day
cron.schedule('30 8 * * *', () => {
    console.log("Sending SMS");
    sendSMS('Hey..!  I am Dinesh Kumar kandula, Sending you SMS from automatic message scheduler from new project. It\'s time for Duty');
    console.log("SMS Sent")
});


app.listen(port, () => { 
    console.log(`Server is running...!`);
});