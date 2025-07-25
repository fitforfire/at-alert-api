require('dotenv').config();
const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SERVER,
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export function sendMailAboutNewAlerts(data){


    let html = "<h2>New AT-Alerts:</h2>";

    // last call date
    html += `<p>New alerts in the time between ${data.lastCallDate.toLocaleString()} and ${data.currentCallDate.toLocaleString()}</p>`;

    // format as table
    html += `<table style="border-collapse: collapse;">
        <tr>
            <th style="border: 1px solid #000; padding: 4px;">Title</th>
            <th style="border: 1px solid #000; padding: 4px;">Description</th>
        </tr>`;
    data.alerts.forEach((alert) => {
        html += `<tr>
            <td style="border: 1px solid #000; padding: 4px;">${alert.title}</td>
            <td style="border: 1px solid #000; padding: 4px;">${alert.info_description}</td>
        </tr>`;
    });
    html += "</table>";


    transporter.sendMail({
        from: 'at-alert@lagekarte.info',
        to: process.env.MAIL_RECIPIENT,
        subject: "🚨 New AT-Alerts 🚨",
        html, // HTML body
    });
}