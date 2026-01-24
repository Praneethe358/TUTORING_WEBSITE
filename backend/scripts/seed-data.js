require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../src/models/Student');
const Tutor = require('../src/models/Tutor');
const Class = require('../src/models/Class');
const Availability = require('../src/models/Availability');
const Attendance = require('../src/models/Attendance');
const Announcement = require('../src/models/Announcement');
const Notification = require('../src/models/Notification');
const Admin = require('../src/models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student-auth';

// Color output
const green = (msg) => console.log('\x1b[32m%s\x1b[0m', msg);
const cyan = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);
const yellow = (msg) => console.log('\x1b[33m%s\x1b[0m', msg);

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    cyan('\n✓ Connected to MongoDB\n');

    // Get or create students
    cyan('1. Creating/Finding Students...');
    let student1 = await Student.findOne({ email: 'test.student@example.com' });
    if (!student1) {
      student1 = await Student.create({
        name: 'Test Student',
        email: 'test.student@example.com',
        password: 'TestPass123',
        enrollmentNumber: 'TEST001',
        department: 'Computer Science',
        semester: 3,
        phone: '1234567890'
      });
    }

    let student2 = await Student.findOne({ email: 'john.student@example.com' });
    if (!student2) {
      student2 = await Student.create({
        name: 'John Doe',
        email: 'john.student@example.com',
        password: 'TestPass123',
        enrollmentNumber: 'TEST002',
        department: 'Mathematics',
        semester: 2,
        phone: '1234567891'
      });
    }
    green(`✓ Students ready: ${student1.name}, ${student2.name}`);

    // Create tutors
    cyan('\n2. Creating Tutors...');
    let tutor1 = await Tutor.findOne({ email: 'math.tutor@example.com' });
    if (!tutor1) {
      tutor1 = await Tutor.create({
        name: 'Dr. Sarah Math',
        email: 'math.tutor@example.com',
        password: 'TutorPass123',
        subjects: ['Mathematics', 'Statistics', 'Calculus'],
        experienceYears: 5,
        qualifications: 'PhD in Mathematics',
        phone: '9876543210',
        status: 'approved',
        isActive: true,
        approvedBy: null,
        approvedAt: new Date()
      });
    }

    let tutor2 = await Tutor.findOne({ email: 'cs.tutor@example.com' });
    if (!tutor2) {
      tutor2 = await Tutor.create({
        name: 'Prof. Alex Code',
        email: 'cs.tutor@example.com',
        password: 'TutorPass123',
        subjects: ['Computer Science', 'Programming', 'Data Structures'],
        experienceYears: 8,
        qualifications: 'MSc in Computer Science',
        phone: '9876543211',
        status: 'approved',
        isActive: true,
        approvedBy: null,
        approvedAt: new Date()
      });
    }
    green(`✓ Tutors ready: ${tutor1.name}, ${tutor2.name}`);

    // Get or create admin
    cyan('\n3. Ensuring Admin exists...');
    let admin = await Admin.findOne({ email: 'admin@tutorplatform.com' });
    if (!admin) {
      admin = await Admin.create({
        name: 'Platform Admin',
        email: 'admin@tutorplatform.com',
        password: 'AdminPass123',
        phone: '9999999999'
      });
    }
    green(`✓ Admin ready: ${admin.name}`);

    // Create availability slots for tutors
    cyan('\n4. Creating Availability Slots...');
    await Availability.deleteMany({ tutor: { $in: [tutor1._id, tutor2._id] } });
    
    const availabilitySlots = [];
    
    // Math tutor - Monday, Wednesday, Friday mornings
    for (let day of [1, 3, 5]) {
      availabilitySlots.push({
        tutor: tutor1._id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '11:00',
        isRecurring: true,
        isActive: true,
        timezone: 'Asia/Kolkata'
      });
      availabilitySlots.push({
        tutor: tutor1._id,
        dayOfWeek: day,
        startTime: '14:00',
        endTime: '16:00',
        isRecurring: true,
        isActive: true,
        timezone: 'Asia/Kolkata'
      });
    }

    // CS tutor - Tuesday, Thursday afternoons
    for (let day of [2, 4]) {
      availabilitySlots.push({
        tutor: tutor2._id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '12:00',
        isRecurring: true,
        isActive: true,
        timezone: 'Asia/Kolkata'
      });
      availabilitySlots.push({
        tutor: tutor2._id,
        dayOfWeek: day,
        startTime: '15:00',
        endTime: '17:00',
        isRecurring: true,
        isActive: true,
        timezone: 'Asia/Kolkata'
      });
    }

    await Availability.insertMany(availabilitySlots);
    green(`✓ Created ${availabilitySlots.length} availability slots`);

    // Create classes
    cyan('\n5. Creating Classes...');
    await Class.deleteMany({ $or: [{ tutor: tutor1._id }, { tutor: tutor2._id }] });

    const now = new Date();
    const classes = [];

    // Past completed classes
    classes.push({
      tutor: tutor1._id,
      student: student1._id,
      topic: 'Calculus 101',
      description: 'Introduction to Calculus - derivatives and limits',
      scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      duration: 60,
      status: 'completed',
      meetingLink: 'https://meet.example.com/calc-001',
      tutorRemarks: 'Great progress on derivatives!',
      notes: 'Covered: limits, derivatives, chain rule',
      completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
    });

    classes.push({
      tutor: tutor2._id,
      student: student2._id,
      topic: 'Data Structures',
      description: 'Advanced data structures and algorithms',
      scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      duration: 90,
      status: 'completed',
      meetingLink: 'https://meet.example.com/ds-001',
      tutorRemarks: 'Excellent understanding of trees and graphs',
      notes: 'Covered: Binary trees, BST, graph traversal',
      completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000)
    });

    // Upcoming classes
    classes.push({
      tutor: tutor1._id,
      student: student1._id,
      topic: 'Linear Algebra',
      description: 'Matrix operations and vector spaces',
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      duration: 60,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/linalg-001',
      notes: 'Topics: Matrix operations, determinants'
    });

    classes.push({
      tutor: tutor2._id,
      student: student1._id,
      topic: 'Algorithms',
      description: 'Sorting and searching algorithms',
      scheduledAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      duration: 90,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/algo-001',
      notes: 'Topics: Sorting algorithms, time complexity'
    });

    classes.push({
      tutor: tutor1._id,
      student: student2._id,
      topic: 'Statistics',
      description: 'Probability theory and distributions',
      scheduledAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
      duration: 60,
      status: 'scheduled',
      meetingLink: 'https://meet.example.com/stats-001',
      notes: 'Topics: Probability, distributions'
    });

    const createdClasses = await Class.insertMany(classes);
    green(`✓ Created ${createdClasses.length} classes`);

    // Create attendance records for completed classes
    cyan('\n6. Creating Attendance Records...');
    const completedClasses = createdClasses.filter(c => c.status === 'completed');
    
    const attendanceRecords = [];
    for (const classItem of completedClasses) {
      attendanceRecords.push({
        class: classItem._id,
        student: classItem.student,
        tutor: classItem.tutor,
        status: 'present',
        markedBy: 'tutor',
        markedAt: classItem.scheduledAt,
        arrivalTime: classItem.scheduledAt,
        minutesLate: 0,
        participationLevel: 'excellent',
        tutorRemarks: 'Active participation, all concepts understood',
        topicsCovered: [classItem.topic],
        attentiveness: 5,
        understanding: Math.floor(Math.random() * 2) + 4, // 4-5
        preparation: Math.floor(Math.random() * 2) + 4, // 4-5
        isVerified: true
      });
    }

    await Attendance.insertMany(attendanceRecords);
    green(`✓ Created ${attendanceRecords.length} attendance records`);

    // Create announcements
    cyan('\n7. Creating Announcements...');
    await Announcement.deleteMany({});

    const announcements = [
      {
        title: 'Welcome to the Tutoring Platform! 🎉',
        content: 'We are excited to have you here. Book your first session with our expert tutors and start your learning journey!',
        targetRole: 'all',
        priority: 'medium',
        status: 'published',
        createdBy: admin._id,
        publishedAt: new Date(),
        category: 'general',
        isPinned: true,
        isActive: true
      },
      {
        title: 'New Math Courses Available',
        content: 'Check out our new advanced mathematics courses including Linear Algebra, Differential Equations, and Real Analysis.',
        targetRole: 'student',
        priority: 'medium',
        status: 'published',
        createdBy: admin._id,
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        category: 'feature',
        isActive: true
      },
      {
        title: 'Tutor Training Session - Next Week',
        content: 'Mandatory training session for all tutors on using the new features. Date: Next Monday, 10 AM.',
        targetRole: 'tutor',
        priority: 'urgent',
        status: 'published',
        createdBy: admin._id,
        publishedAt: new Date(),
        category: 'event',
        isActive: true
      }
    ];

    await Announcement.insertMany(announcements);
    green(`✓ Created ${announcements.length} announcements`);

    // Create notifications
    cyan('\n8. Creating Notifications...');
    
    const notifications = [];
    
    // Notifications for student1
    notifications.push({
      recipient: student1._id,
      recipientRole: 'student',
      title: 'Class Scheduled',
      message: `Your Linear Algebra class with ${tutor1.name} is scheduled for ${new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
      type: 'class_scheduled',
      relatedClass: createdClasses[2]._id,
      actionUrl: '/student/classes',
      actionLabel: 'View Class',
      priority: 'normal',
      channels: ['inApp', 'email']
    });

    notifications.push({
      recipient: student1._id,
      recipientRole: 'student',
      title: 'Upcoming Class Reminder',
      message: `Your Algorithms class is in 4 days with ${tutor2.name}`,
      type: 'class_reminder',
      relatedClass: createdClasses[3]._id,
      actionUrl: '/student/classes',
      actionLabel: 'View Class',
      priority: 'high'
    });

    notifications.push({
      recipient: student1._id,
      recipientRole: 'student',
      title: 'New Announcement',
      message: 'New Math Courses Available',
      type: 'announcement',
      actionUrl: '/announcements',
      actionLabel: 'Read More',
      priority: 'normal'
    });

    // Notifications for student2
    notifications.push({
      recipient: student2._id,
      recipientRole: 'student',
      title: 'Class Scheduled',
      message: `Your Statistics class with ${tutor1.name} is scheduled`,
      type: 'class_scheduled',
      relatedClass: createdClasses[4]._id,
      actionUrl: '/student/classes',
      actionLabel: 'View Class',
      priority: 'normal'
    });

    // Notifications for tutors
    notifications.push({
      recipient: tutor1._id,
      recipientRole: 'tutor',
      title: 'New Class Booked',
      message: `${student1.name} has booked a Linear Algebra session`,
      type: 'booking_confirmed',
      relatedClass: createdClasses[2]._id,
      actionUrl: '/tutor/classes',
      actionLabel: 'View Class',
      priority: 'high'
    });

    notifications.push({
      recipient: tutor2._id,
      recipientRole: 'tutor',
      title: 'Urgent: Training Session',
      message: 'Mandatory training session next Monday at 10 AM',
      type: 'announcement',
      actionUrl: '/announcements',
      actionLabel: 'View Details',
      priority: 'urgent'
    });

    await Notification.insertMany(notifications);
    green(`✓ Created ${notifications.length} notifications`);

    // Summary
    cyan('\n' + '='.repeat(50));
    green('✓ Sample Data Seeded Successfully!');
    cyan('='.repeat(50));
    console.log('\nSummary:');
    console.log(`  - Students: 2`);
    console.log(`  - Tutors: 2`);
    console.log(`  - Admin: 1`);
    console.log(`  - Availability Slots: ${availabilitySlots.length}`);
    console.log(`  - Classes: ${createdClasses.length} (${completedClasses.length} completed, ${createdClasses.length - completedClasses.length} upcoming)`);
    console.log(`  - Attendance Records: ${attendanceRecords.length}`);
    console.log(`  - Announcements: ${announcements.length}`);
    console.log(`  - Notifications: ${notifications.length}`);
    
    console.log('\nTest Accounts:');
    console.log('  Student: test.student@example.com / TestPass123');
    console.log('  Student: john.student@example.com / TestPass123');
    console.log('  Tutor: math.tutor@example.com / TutorPass123');
    console.log('  Tutor: cs.tutor@example.com / TutorPass123');
    console.log('  Admin: admin@tutorplatform.com / AdminPass123');

    await mongoose.connection.close();
    green('\n✓ Database connection closed\n');

  } catch (error) {
    console.error('\n✗ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
