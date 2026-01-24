# 🎓 Tutoring Platform - Dashboard Panels

## 📁 Folder Structure

```
frontend/src/
├── components/
│   ├── DashboardLayout.js       # Reusable layout wrapper
│   ├── StudentSidebar.js        # Student navigation sidebar
│   ├── TutorSidebar.js          # Tutor navigation sidebar
│   ├── AdminSidebar.js          # Admin navigation sidebar (existing)
│   ├── ProtectedRoute.js        # Student route protection
│   ├── ProtectedTutorRoute.js   # Tutor route protection
│   └── ProtectedAdminRoute.js   # Admin route protection
├── pages/
│   ├── StudentDashboard.js      # Student overview with stats
│   ├── StudentPayments.js       # Payment history
│   ├── StudentMessages.js       # Chat with tutors
│   ├── StudentSettings.js       # Account settings
│   ├── EnhancedTutorDashboard.js # Tutor overview with earnings
│   ├── TutorProfile.js          # Edit tutor profile
│   ├── TutorStudents.js         # View enrolled students
│   ├── TutorSchedule.js         # Class calendar
│   ├── TutorEarnings.js         # Revenue tracking
│   ├── TutorMaterials.js        # Upload study materials
│   ├── TutorMessages.js         # Chat with students
│   ├── TutorSettings.js         # Tutor settings
│   ├── AdminDashboard.js        # Platform analytics
│   ├── AdminTutors.js           # Tutor approval system
│   ├── AdminStudents.js         # Student management
│   ├── AdminBookings.js         # Booking oversight
│   ├── AdminCourses.js          # Course moderation
│   └── AdminAuditLogs.js        # Action history
├── context/
│   ├── AuthContext.js           # Student/Tutor authentication
│   └── AdminContext.js          # Admin authentication
└── lib/
    └── api.js                   # Axios instance with interceptors
```

## 🎨 Features Implemented

### 🎓 Student Panel
- **Dashboard**: Enrolled classes, upcoming sessions, completion stats
- **Find Tutors**: Browse available tutors (existing TutorsList)
- **My Classes**: View bookings (existing StudentBookings)
- **Payments**: Transaction history with search/filter
- **Messages**: Chat interface with tutors (placeholder for WebSocket)
- **Settings**: Notifications, privacy, password change

### 🧑‍🏫 Tutor Panel
- **Dashboard**: Earnings summary, student count, upcoming classes
- **My Profile**: Edit bio, subjects, hourly rate, qualifications
- **Availability**: Manage teaching schedule (existing)
- **My Courses**: Course management (existing)
- **My Students**: List of enrolled students with stats
- **Class Schedule**: Calendar view with filter (upcoming/past/all)
- **Earnings**: Revenue tracking, withdrawal requests, transaction history
- **Upload Materials**: File upload with categories and visibility controls
- **Messages**: Chat with students (placeholder for WebSocket)
- **Settings**: Notification preferences, auto-accept bookings

### 🛠️ Admin Panel
- **Dashboard**: Platform analytics (students, tutors, bookings, courses)
- **Tutors**: Approve/reject/block tutors with audit logging
- **Students**: User management with search and delete
- **Bookings**: View all bookings with cancel functionality
- **Courses**: Approve/reject courses
- **Audit Logs**: Complete action history with 90-day retention

## 🔐 Security Features

### Protected Routes
```javascript
<ProtectedRoute>           // Students only
<ProtectedTutorRoute>      // Tutors only
<ProtectedAdminRoute>      // Admins only
```

### Auto-Logout on 401
- Axios interceptor detects unauthorized responses
- Automatically redirects to appropriate login page
- Clears auth context and local storage

### Role-Based Access
- Student routes: `/student/*`
- Tutor routes: `/tutor/*`
- Admin routes: `/admin/*`

## 🚀 Route Map

### Student Routes
```
/student/dashboard    - Overview with stats
/student/profile      - Edit profile
/student/bookings     - View classes (existing)
/student/payments     - Payment history
/student/messages     - Chat with tutors
/student/settings     - Account settings
/tutors               - Browse tutors (public)
/tutors/:id           - Tutor profile (public)
```

### Tutor Routes
```
/tutor/dashboard      - Earnings & classes overview
/tutor/profile        - Edit profile
/tutor/availability   - Manage schedule (existing)
/tutor/courses        - Course management (existing)
/tutor/students       - View enrolled students
/tutor/schedule       - Class calendar
/tutor/earnings       - Revenue tracking
/tutor/materials      - Upload resources
/tutor/messages       - Chat with students
/tutor/settings       - Preferences
```

### Admin Routes
```
/admin/dashboard      - Platform analytics
/admin/tutors         - Tutor approval
/admin/students       - Student management
/admin/bookings       - Booking oversight
/admin/courses        - Course moderation
/admin/audit-logs     - Action history
```

## 🔌 API Integration

All pages use the centralized `api` service:
```javascript
import api from '../lib/api';

// Automatic cookie handling
api.get('/student/profile')
api.get('/tutor/bookings')
api.get('/admin/dashboard-stats')
```

### Existing Backend Endpoints Used
- `/api/student/profile`
- `/api/student/bookings`
- `/api/tutor/profile`
- `/api/tutor/bookings`
- `/api/admin/dashboard-stats`
- `/api/admin/tutors`
- `/api/admin/students`
- `/api/admin/bookings`
- `/api/admin/courses`
- `/api/admin/audit-logs`

## 🎨 Design System

### Colors (Tailwind)
- Background: `bg-slate-900` (dark theme)
- Cards: `bg-slate-800` with `border-slate-700`
- Primary: `bg-indigo-600` hover `bg-indigo-500`
- Success: `bg-green-600`
- Warning: `bg-yellow-600`
- Danger: `bg-red-600`

### Sidebar Layout
- Fixed left sidebar (256px width)
- Active route highlighting
- Icon + label navigation
- Logout button at bottom

### Responsive Design
- Mobile: Sidebar can be enhanced with collapse toggle
- Desktop: Fixed sidebar with main content area

## 🔧 Development Notes

### Messages Feature
Currently placeholders - integrate WebSocket for real-time:
```javascript
// Socket.io integration example
import io from 'socket.io-client';
const socket = io('http://localhost:5000');
```

### File Upload (Materials)
Requires backend endpoint:
```javascript
// Backend: multer middleware for file handling
POST /api/tutor/materials
Content-Type: multipart/form-data
```

### Payment Integration
Placeholder for Stripe/PayPal:
```javascript
// Stripe checkout session
POST /api/payments/create-checkout-session
```

## 📊 State Management

### Context API Usage
```javascript
// Student/Tutor auth
import { useAuth } from '../context/AuthContext';
const { user, role, login, logout } = useAuth();

// Admin auth
import { useAdmin } from '../context/AdminContext';
const { admin, adminLogin, logout } = useAdmin();
```

### Data Fetching Pattern
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await api.get('/endpoint');
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

## ✅ Production Readiness

### Completed
- ✅ Role-based route protection
- ✅ Auto-logout on 401
- ✅ Reusable layout components
- ✅ Sidebar navigation
- ✅ Responsive design foundation
- ✅ Integration with existing backend
- ✅ Clean code with comments
- ✅ Tailwind CSS styling

### TODO for Production
- [ ] WebSocket integration for real-time messages
- [ ] File upload backend endpoint
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Mobile sidebar collapse functionality
- [ ] Loading skeletons for better UX
- [ ] Error boundary components
- [ ] Toast notifications (react-toastify)
- [ ] Form validation library (react-hook-form + yup)
- [ ] Image optimization for tutor profiles
- [ ] PWA configuration

## 🚀 Getting Started

1. **Install dependencies** (if any new ones were added):
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Test the dashboards**:
   - Student: Login at `/login` → redirects to `/student/dashboard`
   - Tutor: Login at `/tutor/login` → redirects to `/tutor/dashboard`
   - Admin: Login at `/admin/login` → redirects to `/admin/dashboard`

## 📝 Code Quality

- **Clean Code**: All files have clear comments explaining purpose
- **Reusable Components**: DashboardLayout, StatCard, SettingToggle
- **Consistent Naming**: Component names match file names
- **Best Practices**: useEffect for data fetching, proper error handling
- **Production Ready**: No console.logs in production, proper loading states

---

**Built with ❤️ using React, Tailwind CSS, and best practices**
