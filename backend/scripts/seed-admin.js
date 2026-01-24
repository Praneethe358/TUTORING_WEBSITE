/**
 * ADMIN SEED SCRIPT
 * 
 * Usage:
 *  node scripts/seed-admin.js
 * 
 * Creates a default admin user. Change the credentials before deploying to production.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../src/models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutoring';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create admin
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await Admin.create({
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      permissions: ['approve_tutors', 'manage_users', 'view_payments', 'moderate_courses'],
      isActive: true
    });

    console.log('✅ Admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
    console.log('\n⚠️  Change this password after first login!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
