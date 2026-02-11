const bcrypt = require('bcryptjs');

// Hash the new password
const password = "God'sGift";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }

  // Create the MongoDB document
  const adminDocument = {
    name: "Administrator",
    email: "hopetuitionbygd",
    password: hash,
    role: "admin",
    permissions: [
      "approve_tutors",
      "manage_users",
      "view_payments",
      "moderate_courses"
    ],
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00.000Z")
  };

  console.log('\n' + '='.repeat(70));
  console.log('MONGODB ADMIN DOCUMENT');
  console.log('='.repeat(70));
  console.log(JSON.stringify(adminDocument, null, 2));
  console.log('\n' + '='.repeat(70));
  console.log('LOGIN CREDENTIALS');
  console.log('='.repeat(70));
  console.log(`Email/Username: hopetuitionbygd`);
  console.log(`Password: God'sGift`);
  console.log(`Role: admin`);
  console.log('\n' + '='.repeat(70));
  console.log('MONGODB IMPORT COMMAND');
  console.log('='.repeat(70));
  console.log(`\nFor MongoDB Atlas or local MongoDB, use:\n`);
  console.log(`db.users.insertOne(${JSON.stringify(adminDocument)})`);
  console.log('\n' + '='.repeat(70));
});
