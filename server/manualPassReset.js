const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function resetPassword() {
    try {
        console.log("\n--- Manual Password Resetter ---\n");
        console.log("For Security: Passwords are encrypted and cannot be 'seen'.");
        console.log("However, you can overwrite them with a new one.\n");

        console.log("Enter your MongoDB URI (Local or Production).");
        const uri = await askQuestion("Mongo URI (press Enter for local .env or paste URI): ");

        let connectionString = uri.trim();
        if (!connectionString) {
            require('dotenv').config();
            connectionString = process.env.MONGO_URI;
            console.log("Using local .env MONGO_URI...");
        }

        if (!connectionString) {
            console.error("No MongoDB URI found. Exiting.");
            process.exit(1);
        }

        await mongoose.connect(connectionString);
        console.log("✅ Connected to Database.");

        const username = await askQuestion("\nEnter username to reset: ");
        const user = await User.findOne({ username: username.trim() });

        if (!user) {
            console.log(`❌ User "${username}" not found.`);
            process.exit(0);
        }

        const newPass = await askQuestion(`Enter NEW password for ${user.username}: `);
        if (!newPass) {
            console.log("Password cannot be empty.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);
        user.password = hashedPassword;
        await user.save();

        console.log(`\n✅ Password for "${user.username}" has been updated!`);
        console.log(`You can now log in with: ${newPass}`);

    } catch (error) {
        console.error("\n❌ Error:", error.message);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        rl.close();
    }
}

resetPassword();
