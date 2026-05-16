const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../lib/mongodb');

async function createDemoUsers() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if demo users already exist
    const adminExists = await User.findOne({ email: 'admin@skytech.com' });
    const userExists = await User.findOne({ email: 'user@skytech.com' });
    const superAdminExists = await User.findOne({ email: 'akashsingh404x@gmail.com' });

    if (adminExists && userExists && superAdminExists) {
      console.log('Demo users already exist');
      return;
    }

    // Create demo admin
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@skytech.com',
        password: adminPassword,
        role: 'admin',
      });
      console.log('Demo admin created:', admin.email);
    }

    // Create demo user
    if (!userExists) {
      const userPassword = await bcrypt.hash('user123', 10);
      const user = await User.create({
        name: 'Demo User',
        email: 'user@skytech.com',
        password: userPassword,
        role: 'user',
      });
      console.log('Demo user created:', user.email);
    }

    // Create super admin (akashsingh404x@gmail.com)
    if (!superAdminExists) {
      const superAdminPassword = await bcrypt.hash('admin123', 10);
      const superAdmin = await User.create({
        name: 'Akash Singh',
        email: 'akashsingh404x@gmail.com',
        password: superAdminPassword,
        role: 'admin',
      });
      console.log('Super admin created:', superAdmin.email);
    }

    console.log('Demo users created successfully');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@skytech.com / admin123');
    console.log('User: user@skytech.com / user123');
    console.log('Super Admin: akashsingh404x@gmail.com / admin123');
  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createDemoUsers();
