# 🐛 BUG TRACKING & ISSUE LOG

## Quick Reference for Development Team

Last Updated: January 30, 2026

---

## 🔴 CRITICAL BUGS (Fix Immediately)

### BUG-001: No Rate Limiting on Authentication
**Severity:** 🔴 CRITICAL  
**Status:** Open  
**Affected:** All login endpoints  
**Risk:** Brute force attacks, account compromise  
**Reproduction:**
1. Try login with wrong password 100 times
2. No throttling or blocking

**Fix:**
```javascript
// backend/server.js
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, try again later'
});
app.use('/api/*/login', authLimiter);
```
**Estimated Time:** 1 hour  
**Assignee:** Backend Team

---

### BUG-002: File Upload - No Type Validation
**Severity:** 🔴 CRITICAL  
**Status:** Open  
**Affected:** CV upload, image upload, assignment submission  
**Risk:** Malware upload, server compromise  
**Reproduction:**
1. Try uploading .exe file as CV
2. Upload succeeds

**Fix:**
```javascript
// backend/src/middleware/uploadMiddleware.js
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    cv: ['application/pdf'],
    photo: ['image/jpeg', 'image/png', 'image/jpg'],
    submission: ['application/pdf', 'application/msword']
  };
  // Validate based on file.fieldname
};
```
**Estimated Time:** 2 hours  
**Assignee:** Backend Team

---

### BUG-003: Tutor Registration Without CV
**Severity:** 🔴 CRITICAL  
**Status:** Open  
**Affected:** Tutor registration  
**Risk:** Incomplete tutor profiles, verification bypass  
**Reproduction:**
1. Register as tutor
2. Don't upload CV file
3. Registration succeeds

**Fix:**
```javascript
// backend/src/controllers/tutorController.js
if (!req.file || !req.file.path) {
  return res.status(400).json({ message: 'CV is required' });
}
```
**Estimated Time:** 30 minutes  
**Assignee:** Backend Team

---

### BUG-004: SQL Injection/XSS Not Tested
**Severity:** 🔴 CRITICAL  
**Status:** Open  
**Affected:** All input fields  
**Risk:** Data breach, account compromise  
**Action Required:** Security penetration testing  
**Estimated Time:** 4 hours  
**Assignee:** Security Team

---

### BUG-005: No Request Timeout
**Severity:** 🔴 CRITICAL  
**Status:** Open  
**Affected:** All API calls from frontend  
**Risk:** Hanging requests, poor UX  
**Reproduction:**
1. Simulate slow network
2. Make API call
3. Request hangs forever

**Fix:**
```javascript
// frontend/src/lib/api.js
const api = axios.create({
  // ... existing config
  timeout: 30000 // 30 seconds
});
```
**Estimated Time:** 1 hour  
**Assignee:** Frontend Team

---

## 🟡 HIGH PRIORITY BUGS

### BUG-006: Socket.IO No Reconnection
**Severity:** 🟡 HIGH  
**Status:** Open  
**Affected:** Real-time messaging  
**Reproduction:**
1. Open messages page
2. Disconnect internet
3. Reconnect internet
4. Messages stop working

**Fix:** Add reconnection handlers  
**Estimated Time:** 2 hours  
**Assignee:** Frontend Team

---

### BUG-007: No Pagination - Memory Issues
**Severity:** 🟡 HIGH  
**Status:** Open  
**Affected:** Conversations, students list, enrollments  
**Reproduction:**
1. Have 1000+ messages
2. Open conversations
3. Page crashes or freezes

**Fix:** Implement cursor-based pagination  
**Estimated Time:** 4 hours  
**Assignee:** Backend + Frontend Team

---

### BUG-008: Email Notifications Not Sent
**Severity:** 🟡 HIGH  
**Status:** Open  
**Affected:** Tutor approval, password reset  
**Reproduction:**
1. Reset password
2. Check email
3. No email received

**Status:** Email service configured but not called  
**Fix:** Call email functions in controllers  
**Estimated Time:** 3 hours  
**Assignee:** Backend Team

---

### BUG-009: Dashboard Multiple API Calls
**Severity:** 🟡 HIGH  
**Status:** Open  
**Affected:** Student dashboard  
**Performance:** 2.3s load time  
**Issue:** 5 sequential API calls

**Fix:** Parallelize or create aggregate endpoint  
**Estimated Time:** 2 hours  
**Assignee:** Backend + Frontend Team

---

### BUG-010: Timezone Not Handled
**Severity:** 🟡 HIGH  
**Status:** Open  
**Affected:** Tutor availability, class scheduling  
**Reproduction:**
1. Tutor sets availability in EST
2. Student in PST sees EST times
3. Booking confusion

**Fix:** Store UTC, convert on frontend  
**Estimated Time:** 3 hours  
**Assignee:** Backend + Frontend Team

---

## 🟢 MEDIUM PRIORITY BUGS

### BUG-011: No Global Loading Indicator
**Severity:** 🟢 MEDIUM  
**Status:** Open  
**Affected:** All pages  
**Issue:** Users don't know when actions processing  
**Estimated Time:** 2 hours

---

### BUG-012: Error Messages Not User-Friendly
**Severity:** 🟢 MEDIUM  
**Status:** Open  
**Affected:** All error handling  
**Issue:** Technical errors shown to users  
**Example:** "Cast to ObjectId failed" instead of "Invalid ID"  
**Estimated Time:** 2 hours

---

### BUG-013: Typing Indicator Stuck
**Severity:** 🟢 MEDIUM  
**Status:** Open  
**Affected:** Messaging  
**Reproduction:**
1. Start typing message
2. Stop typing
3. Indicator shows forever

**Fix:** Clear timeout properly  
**Estimated Time:** 1 hour

---

### BUG-014: Module Drag-and-Drop Buggy
**Severity:** 🟢 MEDIUM  
**Status:** Open  
**Affected:** Course module reordering  
**Issue:** Sometimes reorder fails on mobile  
**Estimated Time:** 2 hours

---

### BUG-015: Course Duplication Not Prevented
**Severity:** 🟢 MEDIUM  
**Status:** Open  
**Affected:** Course creation  
**Issue:** Can create same course twice  
**Fix:** Add unique index on title+instructor  
**Estimated Time:** 1 hour

---

## ℹ️ LOW PRIORITY / ENHANCEMENTS

### ENHANCEMENT-001: No Dark Mode
**Severity:** ℹ️ LOW  
**Status:** Open  
**Request:** User requests dark mode  
**Estimated Time:** 8 hours

---

### ENHANCEMENT-002: No Bulk Actions in Admin
**Severity:** ℹ️ LOW  
**Status:** Open  
**Request:** Admin wants to approve multiple tutors at once  
**Estimated Time:** 4 hours

---

### ENHANCEMENT-003: Draft Save for Courses
**Severity:** ℹ️ LOW  
**Status:** Open  
**Request:** Auto-save course while creating  
**Estimated Time:** 3 hours

---

### ENHANCEMENT-004: Code Splitting
**Severity:** ℹ️ LOW  
**Status:** Open  
**Request:** Reduce initial bundle size  
**Estimated Time:** 6 hours

---

## 📊 Bug Statistics

```
Total Bugs Found: 40
├─ 🔴 Critical: 5 (13%)
├─ 🟡 High: 10 (25%)
├─ 🟢 Medium: 15 (37%)
└─ ℹ️ Low: 10 (25%)

Status:
├─ Open: 40 (100%)
├─ In Progress: 0
└─ Fixed: 0

Estimated Fix Time:
├─ Critical: 8-9 hours
├─ High: 18 hours
├─ Medium: 15 hours
└─ Low: 30 hours
Total: 71-72 hours (~2 weeks)
```

---

## 🎯 Sprint Planning Suggestion

### Sprint 1 (Week 1): Critical Security
- BUG-001: Rate limiting ✅
- BUG-002: File validation ✅
- BUG-003: CV requirement ✅
- BUG-004: Security testing ✅
- BUG-005: Request timeout ✅

**Total:** 8-9 hours

### Sprint 2 (Week 2): High Priority UX
- BUG-006: Socket reconnection
- BUG-007: Pagination
- BUG-008: Email notifications
- BUG-009: Dashboard optimization
- BUG-010: Timezone handling

**Total:** 18 hours

### Sprint 3 (Week 3): Polish & Deploy
- BUG-011 to BUG-015: Medium priority
- Testing on staging
- Performance optimization
- Production deployment

---

## 📝 Bug Reporting Template

When reporting new bugs, use this format:

```markdown
### BUG-XXX: [Short Description]
**Severity:** 🔴/🟡/🟢/ℹ️  
**Status:** Open  
**Affected:** [Component/Feature]  
**Reproduction:**
1. Step 1
2. Step 2
3. Expected: X
4. Actual: Y

**Fix:** [Suggested fix or code]  
**Estimated Time:** X hours  
**Assignee:** [Team/Person]
```

---

## 🔍 Testing After Fixes

### Regression Test Checklist
After fixing bugs, test:
- [ ] Original bug is fixed
- [ ] No new bugs introduced
- [ ] Related features still work
- [ ] Performance not degraded
- [ ] Security not compromised

---

## 📱 Contact for Bug Queries

**Backend Issues:**
- Email: backend-team@company.com
- Slack: #backend-bugs

**Frontend Issues:**
- Email: frontend-team@company.com
- Slack: #frontend-bugs

**Security Issues:**
- Email: security@company.com
- Slack: #security (private)

**Urgent (P0/Critical):**
- Call: [Emergency number]
- Escalate immediately to tech lead

---

## 📈 Progress Tracking

Use this section to track fixes:

**Week 1 Progress:**
- [ ] BUG-001 Fixed
- [ ] BUG-002 Fixed
- [ ] BUG-003 Fixed
- [ ] BUG-004 Fixed
- [ ] BUG-005 Fixed

**Week 2 Progress:**
- [ ] BUG-006 Fixed
- [ ] BUG-007 Fixed
- [ ] BUG-008 Fixed
- [ ] BUG-009 Fixed
- [ ] BUG-010 Fixed

---

**Last Updated:** January 30, 2026  
**Next Review:** After Sprint 1 completion  
**Maintained By:** QA Team
