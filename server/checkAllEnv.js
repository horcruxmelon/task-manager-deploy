require("dotenv").config();

console.log("=== All Environment Variables ===");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ SET" : "❌ NOT SET");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ NOT SET");
console.log("CLIENT_URL:", process.env.CLIENT_URL ? "✅ SET" : "❌ NOT SET");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ SET" : "❌ NOT SET");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ SET" : "❌ NOT SET");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("SENDGRID_SENDER_EMAIL:", process.env.SENDGRID_SENDER_EMAIL ? "✅ SET" : "❌ NOT SET");
console.log("===");
