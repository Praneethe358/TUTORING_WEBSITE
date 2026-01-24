/**
 * Test real-time notifications via Socket.io
 */

const axios = require('axios');
const baseURL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

async function testRealtimeNotifications() {
  console.log('\n🧪 Testing Real-time Notifications\n');
  console.log('='.repeat(50));

  try {
    // Get a test student from database
    console.log('\n1️⃣  Finding test student in database...');
    const Student = require('../src/models/Student');
    const student = await Student.findOne({ email: 'test.student@example.com' });
    
    if (!student) {
      console.log('❌ Test student not found. Run seed-data.js first.');
      process.exit(1);
    }
    
    const studentId = student._id;
    console.log(`✅ Found student: ${student.name} (ID: ${studentId})`);

    // Get initial notification count
    console.log('\n2️⃣  Checking initial notifications...');
    const Notification = require('../src/models/Notification');
    const initialCount = await Notification.countDocuments({ 
      recipient: studentId, 
      isRead: false 
    });
    console.log(`📬 Current unread notifications: ${initialCount}`);

    // Create a new notification for this student
    console.log('\n3️⃣  Creating a new notification...');
    const newNotif = await Notification.create({
      recipient: studentId,
      recipientRole: 'student',
      title: '🔔 Real-time Test Notification',
      message: 'This notification was created to test Socket.io real-time updates!',
      type: 'system',
      priority: 'high'
    });
    console.log(`✅ Notification created: ${newNotif._id}`);
    console.log(`⏱️  Socket event "notification:new" should have been emitted`);

    // Wait for socket to process
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify the notification count increased
    console.log('\n4️⃣  Verifying notification was saved...');
    const newCount = await Notification.countDocuments({ 
      recipient: studentId, 
      isRead: false 
    });
    console.log(`📬 New unread count: ${newCount}`);
    
    if (newCount > initialCount) {
      console.log('✅ Notification saved correctly!');
    }

    // Create an announcement
    console.log('\n5️⃣  Creating a new announcement...');
    const Announcement = require('../src/models/Announcement');
    const Admin = require('../src/models/Admin');
    const admin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (admin) {
      const announcement = await Announcement.create({
        title: '📢 Real-time Test Announcement',
        content: 'This announcement tests Socket.io broadcasting!',
        targetRole: 'all',
        priority: 'high',
        status: 'published',
        createdBy: admin._id,
        publishedAt: new Date()
      });
      console.log(`✅ Announcement created: ${announcement._id}`);
      console.log(`⏱️  Socket events "announcement:new" and "announcements:updated" emitted`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('\n✨ Real-time test complete!');
    console.log('\n📝 Expected behavior:');
    console.log('   1. NotificationBell should show updated unread count');
    console.log('   2. Browser console should show socket event logs');
    console.log('   3. Bell dropdown should refresh with new notification');
    console.log('   4. Announcements page should show the new announcement');
    console.log('\n💡 Open browser console and check the NotificationBell! 🎉\n');

  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
  }

  process.exit(0);
}

// Connect to MongoDB first
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutoring';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('📦 Connected to MongoDB');
    testRealtimeNotifications();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
