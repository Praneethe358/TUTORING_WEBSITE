require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../src/models/Student');
const Tutor = require('../src/models/Tutor');
const Admin = require('../src/models/Admin');

const createDemoAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Create Admin Account
    const adminExists = await Admin.findOne({ email: 'admin@demo.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      await Admin.create({
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: hashedPassword
      });
      console.log('✅ Admin account created: admin@demo.com / Admin123!');
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    // Create Student Account
    const studentExists = await Student.findOne({ email: 'student@demo.com' });
    if (!studentExists) {
      const hashedPassword = await bcrypt.hash('Student123!', 10);
      await Student.create({
        name: 'Demo Student',
        email: 'student@demo.com',
        password: hashedPassword,
        phone: '1234567890'
      });
      console.log('✅ Student account created: student@demo.com / Student123!');
    } else {
      console.log('ℹ️  Student account already exists');
    }

    // Create Tutor Account (Auto-approved)
    const tutorExists = await Tutor.findOne({ email: 'tutor@demo.com' });
    if (!tutorExists) {
      const hashedPassword = await bcrypt.hash('Tutor123!', 10);
      await Tutor.create({
        name: 'Demo Tutor',
        email: 'tutor@demo.com',
        password: hashedPassword,
        qualifications: 'M.Sc. in Mathematics, B.Ed.',
        subjects: ['Mathematics', 'Physics', 'Calculus'],
        experienceYears: 5,
        phone: '0987654321',
        status: 'approved',
        isActive: true
      });
      console.log('✅ Tutor account created: tutor@demo.com / Tutor123!');
    } else {
      console.log('ℹ️  Tutor account already exists');
    }

    console.log('\n📋 Demo Accounts Summary:');
    console.log('================================');
    console.log('Admin:   admin@demo.com / Admin123!');
    console.log('Student: student@demo.com / Student123!');
    console.log('Tutor:   tutor@demo.com / Tutor123!');
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating demo accounts:', error);
    process.exit(1);
  }
};

createDemoAccounts();
