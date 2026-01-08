const mongoose = require('mongoose');
const User = require('./models/User');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function promoteOnProd() {
    try {
        console.log("\n--- Production Admin Promoter ---\n");
        console.log("I promoted you on your LOCAL database, but we need to do it for the LIVE website too.");
        console.log("Please paste your PRODUCTION MongoDB Connection String (MONGO_URI) below.");
        console.log("(It usually starts with 'mongodb+srv://...')\n");

        const manualUri = await askQuestion("Enter Prod MONGO_URI: ");

        if (!manualUri) {
            console.log("No URI provided. Exiting.");
            process.exit(0);
        }

        console.log("\nConnecting to Production usage...");
        await mongoose.connect(manualUri.trim());
        console.log("Connected!");

        const username = await askQuestion("Enter the username to promote (e.g., melon): ");
        const user = await User.findOne({ username: username.trim() });

        if (user) {
            console.log(`\nFound user: ${user.username} (Current Limit: ${user.role})`);
            user.role = 'admin';
            await user.save();
            console.log(`\n✅ SUCCESS! ${user.username} is now an ADMIN on the live site.`);
            console.log("👉 Go to your Vercel site, LOG OUT, and LOG BACK IN to see the changes.");
        } else {
            console.log(`\n❌ User "${username}" not found in this database.`);
        }

        await mongoose.connection.close();
        rl.close();
    } catch (error) {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    }
}

promoteOnProd();
