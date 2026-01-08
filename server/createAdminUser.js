// Script to create an admin user or promote an existing user to admin
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createOrPromoteAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if we already have an admin
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log(`Admin already exists: ${existingAdmin.username} (${existingAdmin.email})`);
            process.exit(0);
        }

        // Option 1: Promote first user to admin
        const firstUser = await User.findOne();
        if (firstUser) {
            firstUser.role = 'admin';
            await firstUser.save();
            console.log(`✓ Promoted user "${firstUser.username}" to admin role`);
        } else {
            // Option 2: Create new admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const adminUser = await User.create({
                username: 'admin',
                email: 'admin@taskmanager.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('✓ Created new admin user:');
            console.log('  Username: admin');
            console.log('  Email: admin@taskmanager.com');
            console.log('  Password: admin123');
            console.log('  ⚠️  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN!');
        }

        // Update all other users to have 'member' role by default
        const updateResult = await User.updateMany(
            { role: { $exists: false } },
            { $set: { role: 'member' } }
        );
        console.log(`✓ Updated ${updateResult.modifiedCount} users to 'member' role`);

        await mongoose.connection.close();
        console.log('\n✓ Admin setup complete!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createOrPromoteAdmin();
