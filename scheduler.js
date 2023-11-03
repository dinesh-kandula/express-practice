// This module is used to send scheduled Mail's and SMS
require('dotenv').config(); //dotenv configuration
const express = require('express'); // Express JS
const path = require('path'); //Path 
const mysql = require('mysql2'); //mysql2
const cron = require('node-cron'); // node-corn used for scheduling jobs
const nodemailer = require('nodemailer'); // Email Package Nodemailer

const app = express(); //starting express JS
app.use(express.static(path.join(__dirname, 'TechVedikaClone')));
app.use(express.json());

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'TechVedikaClone', './index.html')); //sending html file page
});

// Create a MySQL connection pool
const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password: 'Techv1@3',
    database: 'dinnu'
});


// Function to execute a MySQL query
function executeQuery(sql, values) {
    return new Promise((resolve, reject) => {
        if(arguments.length == 1){
            pool.query(sql,(error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        }else{
            pool.query(sql, values, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        }
    });
}

// Transporter for sending mail
const transporter = nodemailer.createTransport({
  service: process.env.SERVICE,
  auth: {
    user: process.env.FROM__MAILID,
    pass: process.env.FROM_MAILID_PASSWORD
  }
});

const mailSend =  (to, cc, subject, text) => {
    const mailOptions = 
    {from: process.env.FROM__MAILID, to, cc, subject, text};
    
    return new Promise(async (resolve, reject) => {
        try{
            const info = await transporter.sendMail(mailOptions);
            resolve('Email sent: ' + info.response + '\r\n Emailed To: ' + to);
         }catch (error){ 
            reject(error);
         }
    })

    
}

// Scheduled to send the mail to everyone
cron.schedule('0 16 * * *', async() => {
    const subject = 'Good Evening its 6PM';
    const body = 'Hey guys..!';
    const to = await getAllMailids();
    const cc = await getSpecificMailid(6);
    console.log("Sending Mail");
    mailSend(to, cc, subject, body);
});

cron.schedule('55 17 * * *', async() => {
    const subject = 'Sending Sending....!';
    const body = 'Hey..! Good Evening Sending Sending..';
    const to = await getSpecificMailid(6);
    console.log("Sending Mail");
    mailSend(to, '', subject, body);
});


async function getSpecificMailid(id) {
    const fetchQuery = 'SELECT emailid FROM email WHERE id=?';
    try{
        const result = await executeQuery(fetchQuery, [id]);
        if(result.length === 0) return("")
        else return(result[0].emailid)
    }catch(error){
        console.error('An error occurred:', error);
    } 
}

async function getAllMailids() {
    const fetchQuery = 'SELECT emailid FROM email';
    try{
        const result = await executeQuery(fetchQuery);
        let emailArr = []
        await result.forEach(each => {emailArr.push(each.emailid);});
        const emailString = emailArr.join(",");
        return emailString
    }catch(error){
        console.error('An error occurred:', error);
    } 
}

async function getSpecificMailidByDesignation(designation) {
    const fetchQuery = 'SELECT emailid FROM email WHERE designation=?';
    try{
        const result = await executeQuery(fetchQuery, [designation]);
        let emailArr = []
        await result.forEach(each => {emailArr.push(each.emailid);});
        const emailString = emailArr.join(",");
        return emailString
    }catch(error){
        console.error('An error occurred:', error);
    } 
}

app.post("/mail/:id", async (request, response) => {
    const {id} = request.params;
    const {cc, subject, body} = request.body

    let to;
    if(id === "All" || id === ""){
        to = await getAllMailids();
    }else{
        to = await getSpecificMailid(id)
    }

    if(to){
        try{
            const mailResponse = await mailSend(to, cc, subject, body);
            response.send(mailResponse);
        }catch(error){
            response.status(503).send(error);
        }
    }else{
        response.status(404).send(`Mail id: ${id} (Not found in the Database)`);
    }
})

app.post("/mail/", async (request, response) => {
    const {designation} = request.query;
    const {cc, subject, body} = request.body

    let to = await getSpecificMailidByDesignation(designation);
    
    if(to){
        try{
            const mailResponse = await mailSend(to, cc, subject, body);
            response.send(mailResponse);
        }catch(error){
            response.status(503).send(error);
        }
    }else{
        response.status(404).send(`Mail with designation: ${designation} (Not found in the Database)`);
    }
})






/* ------------ SMS twilio ------------- */

// SMS twilio Package
const client = require('twilio')(process.env.ACCOUNT_SID,  process.env.AUTH_TOKEN);
// sms auth: AHdjRvGbkxanhUylbDK1agINbz5xo45M1_XXWGiF

// Sending SMS
const sendSMS = async (body) => {
    let msgOptions = {
        from : process.env.FROM_NUMBER,
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

app.listen(process.env.PORT, () => { 
    console.log(`Server is running on ${process.env.PORT}...!`);
});
