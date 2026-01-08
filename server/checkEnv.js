require("dotenv").config();

console.log("=== Environment Variables Check ===");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "SET (length: " + process.env.SENDGRID_API_KEY.length + ")" : "NOT SET");
console.log("SENDGRID_SENDER_EMAIL:", process.env.SENDGRID_SENDER_EMAIL || "NOT SET");
console.log("===");

if (!process.env.SENDGRID_API_KEY) {
    console.error("❌ SENDGRID_API_KEY is not set in .env file");
    process.exit(1);
}

if (!process.env.SENDGRID_SENDER_EMAIL) {
    console.error("❌ SENDGRID_SENDER_EMAIL is not set in .env file");
    process.exit(1);
}

console.log("✅ All environment variables are set");
