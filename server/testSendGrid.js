require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: process.env.SENDGRID_SENDER_EMAIL,
    from: process.env.SENDGRID_SENDER_EMAIL,
    subject: "SendGrid Test - Password Reset",
    html: `
    <p>This is a test email from your Task Manager app.</p>
    <p>If you receive this, SendGrid is working correctly!</p>
  `,
};

sgMail
    .send(msg)
    .then(() => {
        console.log("✅ Email sent successfully!");
    })
    .catch((error) => {
        console.error("❌ Error sending email:", error.message);
        if (error.response) {
            console.error("Response body:", error.response.body);
        }
    });
