# Admin Panel Implementation Guide

## Overview
Complete admin panel for the online tutoring platform with full platform control including user management, tutor approval, course moderation, and audit logging.

---

## Backend Setup

### 1. Models Created/Updated

#### **Admin Model** (`src/models/Admin.js`)
```javascript
- name: String (required)
- email: String (required, unique)
- password: String (hashed)
- role: 'admin' | 'super-admin'
- permissions: Array of permission strings
- isActive: Boolean
- lastLogin: Date
```

#### **Tutor Model Updates** 
```javascript
- status: 'pending' | 'approved' | 'rejected' | 'blocked' (replaces isActive)
- approvedBy: ObjectId (reference to Admin)
- approvedAt: Date
- rejectionReason: String
```

#### **AuditLog Model** (`src/models/AuditLog.js`)
- Tracks all admin actions
- Auto-expires after 90 days
- Fields: admin, action, targetType, targetId, targetEmail, details, ipAddress, userAgent

### 2. Admin Controller (`src/controllers/adminController.js`)

**Authentication:**
- `login()` - Admin login with email/password
- `profile()` - Get logged-in admin profile
- `logout()` - Logout

**Dashboard:**
- `dashboardStats()` - Get platform statistics

**Tutor Management:**
- `getTutors()` - List tutors (filtered, paginated, searchable)
- `approveTutor()` - Set status to 'approved' and isActive to true
- `rejectTutor()` - Set status to 'rejected' with reason
- `blockTutor()` - Set status to 'blocked' and isActive to false

**Student Management:**
- `getStudents()` - List students (filtered, paginated)
- `deleteUser()` - Soft/hard delete users

**Booking Management:**
- `getBookings()` - List bookings with filters
- `cancelBooking()` - Cancel booking with reason

**Course Moderation:**
- `getCourses()` - List courses by status
- `approveCourse()` - Approve course
- `rejectCourse()` - Reject course with reason

**Audit:**
- `getAuditLogs()` - View all admin actions

### 3. Admin Routes (`src/routes/adminRoutes.js`)

```
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/profile
GET    /api/admin/dashboard-stats

GET    /api/admin/tutors
PUT    /api/admin/tutors/:id/approve
PUT    /api/admin/tutors/:id/reject
PUT    /api/admin/tutors/:id/block

GET    /api/admin/students
DELETE /api/admin/users/student/:id
DELETE /api/admin/users/tutor/:id

GET    /api/admin/bookings
PUT    /api/admin/bookings/:id/cancel

GET    /api/admin/courses
PUT    /api/admin/courses/:id/approve
PUT    /api/admin/courses/:id/reject

GET    /api/admin/audit-logs
```

### 4. Auth Middleware Updates (`src/middleware/authMiddleware.js`)

```javascript
protectAdmin - Middleware that checks role is 'admin' or 'super-admin'
resolveUser() - Updated to handle Admin model
```

### 5. Initialize Admin User

```bash
cd backend
node scripts/seed-admin.js
```

**Default Credentials:**
- Email: `admin@example.com`
- Password: `Admin@123`

---

## Frontend Setup

### 1. Admin Context (`src/context/AdminContext.js`)
- Manages admin authentication state
- Methods: `adminLogin()`, `logout()`

### 2. Protected Admin Route (`src/components/ProtectedAdminRoute.js`)
- Guards admin pages
- Redirects to `/admin/login` if not authenticated

### 3. Admin Sidebar (`src/components/AdminSidebar.js`)
- Navigation between admin pages
- Logout button

### 4. Admin Pages

| Page | Route | Purpose |
|------|-------|---------|
| Admin Login | `/admin/login` | Admin authentication |
| Dashboard | `/admin/dashboard` | Platform statistics |
| Tutor Management | `/admin/tutors` | Approve/reject/block tutors |
| Student Management | `/admin/students` | View/delete students |
| Booking Management | `/admin/bookings` | Monitor bookings, cancel if needed |
| Course Moderation | `/admin/courses` | Approve/reject tutor courses |
| Audit Logs | `/admin/audit-logs` | View all admin actions |

### 5. App.js Updates
- AdminProvider wraps entire app
- Admin routes added to routing

---

## Tutor Approval Flow

### Tutor Registration
1. Tutor registers → `status: 'pending'`, `isActive: false`
2. Cannot login with "Tutor not approved yet"

### Admin Approval
1. Admin views pending tutors at `/admin/tutors?status=pending`
2. Clicks "Approve" → `status: 'approved'`, `isActive: true`
3. Tutor can now login

### Rejection
1. Admin clicks "Reject" → `status: 'rejected'`
2. Tutor cannot login with "Your registration was rejected"

### Blocking
1. Admin clicks "Block" → `status: 'blocked'`, `isActive: false`
2. Tutor cannot login with "Your account is blocked"

---

## Security Features

✅ **Role-Based Access Control (RBAC)**
- Only admins can access `/api/admin/*`
- Middleware checks `req.authRole === 'admin' || 'super-admin'`

✅ **Audit Logging**
- Every admin action logged with:
  - Admin ID
  - Action type
  - Target user/resource
  - IP address
  - User agent
  - Timestamp

✅ **Protected Routes**
- Frontend: `ProtectedAdminRoute` redirects non-admins
- Backend: `protectAdmin` middleware validates token

✅ **Password Hashing**
- Bcrypt with 10 salt rounds

---

## Usage Examples

### Approve a Tutor
```bash
curl -X PUT http://localhost:5000/api/admin/tutors/{tutorId}/approve \
  -H "Cookie: token={adminToken}"
```

### Get Dashboard Stats
```bash
curl http://localhost:5000/api/admin/dashboard-stats \
  -H "Cookie: token={adminToken}"
```

### Reject a Course
```bash
curl -X PUT http://localhost:5000/api/admin/courses/{courseId}/reject \
  -H "Content-Type: application/json" \
  -H "Cookie: token={adminToken}" \
  -d '{"reason": "Inappropriate content"}'
```

---

## Frontend Admin Flow

1. **Login** → `/admin/login`
   - Enter: admin@example.com / Admin@123
   - Redirects to `/admin/dashboard`

2. **Dashboard** → View platform stats at `/admin/dashboard`

3. **Manage Tutors** → `/admin/tutors`
   - Filter by status (pending, approved, rejected, blocked)
   - Search by name/email
   - Approve/Reject/Block with modal confirmation

4. **Manage Students** → `/admin/students`
   - Search students
   - Delete accounts

5. **Monitor Bookings** → `/admin/bookings`
   - View all bookings
   - Cancel if needed with reason

6. **Moderate Courses** → `/admin/courses`
   - Approve pending courses
   - Reject with reason

7. **Audit Trail** → `/admin/audit-logs`
   - See all admin actions
   - Filter by timestamp

---

## Environment Variables

Add to `.env`:
```
JWT_SECRET=your_jwt_secret
PORT=5000
MONGO_URI=mongodb://localhost:27017/tutoring
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

## Database Indexes

Recommended indexes for performance:
```javascript
Tutor.collection.createIndex({ status: 1 });
Tutor.collection.createIndex({ email: 1 });
Student.collection.createIndex({ email: 1 });
AuditLog.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

---

## Next Steps

1. ✅ Initialize admin with `node scripts/seed-admin.js`
2. ✅ Login at `/admin/login`
3. ✅ Navigate to `/admin/tutors`
4. ✅ Approve pending tutors
5. ✅ Monitor other aspects via sidebar

---

## Support

For issues or questions, check:
- Backend logs: `npm start` output
- Frontend console: F12 → Console
- Audit logs: `/admin/audit-logs`

