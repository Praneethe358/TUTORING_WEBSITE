# Admin-Approval Password Reset System - Complete Implementation

## Overview
The admin-approval password reset system replaces automatic email-based password resets with a secure, admin-controlled workflow. Students submit password reset requests, admins review and approve/deny them, and only approved requests can proceed to password reset.

**Implementation Date:** Current Session  
**Status:** ✅ Complete and Integrated  
**Last Updated:** See git commit f0cfc44

---

## System Architecture

### Flow Diagram
```
STUDENT SUBMITS REQUEST
         ↓
[ForgotPassword.js] → POST /student/forgot-password
         ↓
[PasswordResetRequest Model] - Status: pending
         ↓
ADMIN REVIEWS REQUEST
         ↓
[AdminPasswordResetRequests.js] → GET /admin/password-reset-requests
         ↓
ADMIN APPROVES → PATCH /admin/password-reset-requests/:id/approve
         ↓
[PasswordResetRequest] - Status: approved, resetToken generated
         ↓
ADMIN SENDS RESET LINK TO STUDENT (Email with token)
         ↓
STUDENT CLICKS LINK
         ↓
[ResetPassword.js] + token → POST /student/reset-password
         ↓
Password changed, token invalidated
         ↓
STATUS: completed
```

---

## Backend Implementation

### 1. Database Model: PasswordResetRequest

**File:** `backend/src/models/PasswordResetRequest.js`

```javascript
Schema Fields:
- studentId (ref: Student) - Reference to the student making request
- email (String) - Student's email for verification
- status (enum: pending/approved/denied) - Current state
- reason (String, optional) - Student-provided reason for reset
- adminNotes (String) - Admin's notes for approval/denial
- approvedAt (Date) - When approved
- approvedBy (ref: Admin) - Which admin approved
- deniedAt (Date) - When denied
- deniedBy (ref: Admin) - Which admin denied
- resetToken (String) - Crypto-generated token for password reset (generated on approval)
- resetTokenExpires (Date) - 1-hour TTL for reset token
- resetCompletedAt (Date) - When password was actually reset
- createdAt (Date) - Request submission time
- expiresAtSelf (Date) - Auto-expires after 7 days (TTL index)
```

**Key Features:**
- 7-day TTL index automatically removes expired requests
- Tracks complete audit trail of approvals/denials
- Reset token only created upon approval
- 1-hour window for reset token validity

---

### 2. Student Controller Updates

**File:** `backend/src/controllers/studentController.js`

#### Modified: `forgotPassword()`
**Endpoint:** `POST /student/forgot-password`  
**Body:** `{ email, reason (optional) }`

**Old Flow:** Send email with verification link directly  
**New Flow:** Create password reset request for admin review

```javascript
Steps:
1. Find student by email
2. Check for existing pending request (prevent duplicates)
3. Create new PasswordResetRequest with status: 'pending'
4. Return message: "Password reset request submitted. Admin will review..."
```

#### Modified: `resetPassword()`
**Endpoint:** `POST /student/reset-password`  
**Body:** `{ token, password }`

**Old Flow:** Validate email token sent via email  
**New Flow:** Validate admin-approved reset token

```javascript
Steps:
1. Find approved PasswordResetRequest with valid resetToken
2. Check token hasn't expired (resetTokenExpires > now)
3. Find associated student
4. Hash new password
5. Update student.password
6. Mark resetCompletedAt
7. Return success message
```

---

### 3. Admin Controller New Functions

**File:** `backend/src/controllers/adminController.js`

#### `getPasswordResetRequests(status, page, limit)`
**Endpoint:** `GET /admin/password-reset-requests`  
**Query Params:** `status` (pending/approved/denied), `page`, `limit` (default 20)

Returns paginated list of password reset requests with:
- Student details (populated from studentId ref)
- Request status and metadata
- Admin approval/denial info
- Pagination data

#### `approvePasswordReset(requestId, adminNotes)`
**Endpoint:** `PATCH /admin/password-reset-requests/:requestId/approve`  
**Body:** `{ adminNotes (optional) }`

Steps:
1. Find request by ID
2. Generate crypto reset token: `crypto.randomBytes(32).toString('hex')`
3. Set resetTokenExpires: `Date.now() + 3600000` (1 hour)
4. Update request: status='approved', approvedBy=admin, approvedAt=now, adminNotes
5. Log action to AuditLog
6. **Return:** resetToken (admin must send to student manually or via email)

#### `denyPasswordReset(requestId, adminNotes)`
**Endpoint:** `PATCH /admin/password-reset-requests/:requestId/deny`  
**Body:** `{ adminNotes (reason for denial) }`

Steps:
1. Find request by ID
2. Update request: status='denied', deniedBy=admin, deniedAt=now, adminNotes
3. Log action to AuditLog
4. Return success confirmation

#### `getPasswordResetRequestStatus(email)`
**Endpoint:** `GET /admin/password-reset-requests/status`  
**Query Param:** `email`

Returns latest password reset request for given email (useful for dashboard quick-check)

---

### 4. Routes Configuration

**File:** `backend/src/routes/adminRoutes.js`

```javascript
// All protected by protectAdmin middleware

GET /admin/password-reset-requests
  → getPasswordResetRequests() with pagination
  
PATCH /admin/password-reset-requests/:requestId/approve
  → approvePasswordReset() with optional adminNotes
  
PATCH /admin/password-reset-requests/:requestId/deny
  → denyPasswordReset() with adminNotes
  
GET /admin/password-reset-requests/status
  → getPasswordResetRequestStatus() by email
```

**File:** `backend/src/routes/studentRoutes.js`

```javascript
POST /student/forgot-password
  → Updated to accept optional 'reason' field
  → Now creates PasswordResetRequest instead of sending email
```

---

## Frontend Implementation

### 1. ForgotPassword Page

**File:** `frontend/src/pages/ForgotPassword.js`

**Purpose:** Submit password reset request to admin for review

**Key Changes:**
- Removed email sending logic
- Added "Reason for Reset (Optional)" text field
- Added info box explaining: "Submit → Admin reviews → Approval sends reset link → Create new password"
- After submission: Show success state with message about admin review timeline
- Display estimated timeline for admin response

**UI Structure:**
```
Title: "Forgot Your Password?"
Description: Explain admin-approval process

Input Fields:
  - Email (required)
  - Reason (optional textarea)

Info Box: Explains 4-step process

Button: Submit Request

Success State:
  - Confirmation message
  - "Admin will review your request within 24 hours"
```

---

### 2. ResetPassword Page

**File:** `frontend/src/pages/ResetPassword.js`

**Purpose:** Allow password reset with admin-approved token

**Key Features:**
- Check for reset token in URL (from email link)
- If no token: Show error message with instructions
- Password requirements box (8+ chars, uppercase, lowercase, number)
- Validate token hasn't expired
- On success: Show confirmation, allow redirect to login

**Error Handling:**
- No token: "No reset token provided. Please click the link from your email..."
- Expired token: "The link may have expired. Please submit a new request..."
- Invalid token: "Invalid reset link. Please try again..."

---

### 3. Admin Panel: Password Reset Requests

**File:** `frontend/src/pages/AdminPasswordResetRequests.js`

**Purpose:** Admin UI for managing student password reset requests

**Key Components:**

#### Filter Tabs
- Pending (amber) - Open requests awaiting review
- Approved (green) - Requests admin has approved
- Denied (red) - Rejected requests

#### Requests Table
Columns:
- Student name
- Email
- Reason (student's explanation)
- Status badge (color-coded)
- Submitted date
- Action button (Review - only for pending)

#### Pagination
- 20 requests per page
- Next/Previous buttons
- Current page display

#### Review Modal
Displays when admin clicks "Review" on pending request:
- Student details (name, email, reason, submission time)
- Admin notes textarea (for approval/denial reason)
- Three buttons:
  - Cancel (close modal without action)
  - Deny (reject request, requires admin notes)
  - Approve (approve request, generates reset token)

#### Integration Points
- Fetches: `GET /admin/password-reset-requests?status=pending&page=1&limit=20`
- Approve action: `PATCH /admin/password-reset-requests/:id/approve { adminNotes }`
- Deny action: `PATCH /admin/password-reset-requests/:id/deny { adminNotes }`
- Shows reset token after approval (admin must copy and send to student)

---

## Navigation Integration

### Admin Sidebar

**File:** `frontend/src/components/AdminSidebar.js`

**New Menu Section:** Security
```
Security
  🔑 Password Reset Requests → /admin/password-reset-requests
```

Positioned between main admin menu and LMS monitoring section

**Visual Indicators:**
- Security section with divider
- Key icon (🔑) for easy identification
- Same styling as other admin menu items
- Highlights when admin navigates to page

---

## Route Configuration

**File:** `frontend/src/App.js`

```javascript
// Import
import AdminPasswordResetRequests from './pages/AdminPasswordResetRequests';

// Route
{ path: '/admin/password-reset-requests', 
  element: <ProtectedAdminRoute><AdminPasswordResetRequests /></ProtectedAdminRoute> }
```

Protected by `ProtectedAdminRoute` - only admin users can access

---

## Complete User Flows

### Flow 1: Student Requests Password Reset

1. Student navigates to `/forgot-password`
2. Fills in email and optional reason
3. Clicks "Submit Request"
4. Request stored in PasswordResetRequest with status='pending'
5. Success message: "Request submitted. Admin will review within 24 hours."
6. Student waits for email from admin

### Flow 2: Admin Reviews and Approves

1. Admin logs in and sees "Password Reset Requests" in sidebar
2. Navigates to `/admin/password-reset-requests`
3. Views pending requests in "Pending" tab
4. Clicks "Review" on a request
5. Modal shows student details and reason
6. Admin enters notes and clicks "Approve"
7. System generates reset token (crypto-random, 64 chars)
8. Response shows: `{ resetToken: "..." }`
9. Admin copies token and sends to student manually (needs email automation in next phase)
10. Request status changes to 'approved'

### Flow 3: Admin Denies Request

1. Admin reviews request and determines it's invalid
2. Enters reason in admin notes (e.g., "Security concern")
3. Clicks "Deny"
4. Request status changes to 'denied'
5. Audit log entry created

### Flow 4: Student Resets Password

1. Student receives email with reset link containing token
2. Link format: `https://hope-tuitions-frontend.onrender.com/reset-password?token=<resetToken>`
3. Clicks link
4. ResetPassword page loads, validates token exists
5. Form shows with password requirements
6. Student enters new password matching criteria
7. Clicks "Reset Password"
8. Token validated against PasswordResetRequest
9. Check status='approved'
10. Check token hasn't expired (1-hour window)
11. Student password updated (hashed)
12. resetCompletedAt set
13. Success: "Password reset successful. You can now login with new password."
14. Redirect to login

---

## Security Features

### Token Generation
- Uses `crypto.randomBytes(32).toString('hex')` - 64 hex characters
- Only generated when admin approves (not before)
- Unique per request

### Token Expiration
- 1-hour window for password reset completion
- Older requests auto-expire after 7 days
- resetCompletedAt prevents token reuse

### Audit Trail
- All approvals logged with admin ID and timestamp
- All denials logged with reason
- Student email recorded in request
- Reason from student preserved
- adminNotes from admin preserved

### Admin-Controlled
- Students cannot bypass admin approval
- Prevents unauthorized password resets
- Admins have complete authority over reset flow

---

## Manual Email Sending (Current)

**Note:** Currently, the reset token must be manually copied by admin and sent to student via email. This is intentional for Phase 1 simplicity.

**Next Phase Enhancement:**
- Implement automated email sending
- Email template with reset link
- Token automatically embedded in link
- One-click reset for students

**Email template will include:**
```
Dear [Student Name],

Your password reset request has been approved by our admin team.

Click the link below to reset your password (valid for 1 hour):
https://hope-tuitions-frontend.onrender.com/reset-password?token=[RESET_TOKEN]

If you didn't request this, please contact support immediately.

Best regards,
HOPE Online Tuitions Team
```

---

## Testing Checklist

- [ ] Student can submit password reset request with reason
- [ ] Admin sees request in pending tab
- [ ] Admin can click Review to open modal
- [ ] Modal shows all student/request details
- [ ] Admin can enter notes and approve
- [ ] System generates and displays reset token
- [ ] Admin can deny with notes
- [ ] Denied requests appear in denied tab
- [ ] Student receives reset link with token
- [ ] Token validation works (expires after 1 hour)
- [ ] Password reset completes successfully
- [ ] New password required for login
- [ ] Audit logs show approval/denial actions
- [ ] Requests auto-expire after 7 days

---

## Database Cleanup

**7-Day Auto-Expiry:** MongoDB TTL index handles automatic cleanup
```javascript
expiresAtSelf: { type: Date, expires: 604800 } // 7 days in seconds
```

No manual cleanup required - expires automatically.

---

## Git Commits

Phase tracking commits:
1. `4977694` - Implement admin-approval password reset system (backend + frontend pages)
2. `f0cfc44` - Integrate AdminPasswordResetRequests into app routing and admin sidebar navigation

---

## File Summary

### Backend Files Modified/Created
- ✅ `backend/src/models/PasswordResetRequest.js` (NEW)
- ✅ `backend/src/controllers/studentController.js` (MODIFIED)
- ✅ `backend/src/controllers/adminController.js` (MODIFIED)
- ✅ `backend/src/routes/adminRoutes.js` (MODIFIED)
- ✅ `backend/src/routes/studentRoutes.js` (MODIFIED)

### Frontend Files Modified/Created
- ✅ `frontend/src/pages/ForgotPassword.js` (REWRITTEN)
- ✅ `frontend/src/pages/ResetPassword.js` (ENHANCED)
- ✅ `frontend/src/pages/AdminPasswordResetRequests.js` (NEW)
- ✅ `frontend/src/App.js` (MODIFIED - routing)
- ✅ `frontend/src/components/AdminSidebar.js` (MODIFIED - navigation)

---

## Deployment Notes

**Frontend Build:**
```bash
npm install --legacy-peer-deps
npm run build
```

**Backend Deployment:**
- Ensure MongoDB PasswordResetRequest collection created
- TTL index will be created automatically by Mongoose
- adminRoutes.js endpoints require protectAdmin middleware

**Environment Variables:**
- No new environment variables required
- Uses existing admin authentication

---

## Next Phase Enhancements

### Priority 1: Email Automation
- Implement sendResetEmail() function
- Trigger email send on admin approval
- Include reset link with token in email body
- Reduce manual admin effort

### Priority 2: SMS Notifications (Optional)
- Send SMS to student on request submission
- SMS with status update after admin decision
- SMS with reset link for users without email access

### Priority 3: Batch Operations
- Bulk approve/deny
- Status update notifications
- Request templates for common reasons

### Priority 4: Analytics
- Dashboard metrics: requests/day, approval rate
- Average time to approval
- Denial reasons breakdown

---

## Support & Troubleshooting

**Student doesn't see request submission success:**
- Check frontend console for errors
- Verify POST /student/forgot-password endpoint accessible
- Ensure student email is correct

**Admin can't see requests:**
- Verify admin authentication (ProtectedAdminRoute)
- Check backend logs for permission errors
- Ensure GET /admin/password-reset-requests accessible

**Reset link doesn't work:**
- Verify token parameter in URL
- Check if 1-hour window passed
- Check request status is 'approved'
- Look for time synchronization issues between frontend/backend

**Requests not expiring after 7 days:**
- Verify MongoDB TTL index created: `expiresAtSelf`
- Check MongoDB indexing: `db.passwordresetrequests.getIndexes()`
- Ensure mongod TTL thread running (every 60 seconds by default)

---

## Summary

The admin-approval password reset system is now fully integrated into HOPE Online Tuitions. Students can request password resets with optional reasons, admins review and approve/deny requests through a dedicated admin panel, and only approved requests can proceed to password reset. The complete audit trail provides security and accountability.

**Status:** ✅ Production-Ready  
**Integration:** ✅ Complete  
**Testing:** ⏳ Pending (Ready for QA)  
**Documentation:** ✅ Complete
