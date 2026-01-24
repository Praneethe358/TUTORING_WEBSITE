# API Test Commands

## Quick Health Check
```powershell
curl http://localhost:5000/api/health
```

## Test Class Endpoints (requires auth token)

### Get Classes
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/classes
```

### Get Class Stats
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/classes/stats
```

## Test Availability Endpoints

### Get Tutor Schedule (Public - no auth needed)
```powershell
curl http://localhost:5000/api/availability/schedule
```

## Test Admin Analytics (requires admin token)

### Platform Analytics
```powershell
curl -H "Authorization: Bearer ADMIN_TOKEN" "http://localhost:5000/api/admin/analytics/platform?period=30"
```

### Tutor Analytics
```powershell
curl -H "Authorization: Bearer ADMIN_TOKEN" http://localhost:5000/api/admin/analytics/tutors
```

## Test Notifications

### Get Unread Count
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/notifications/unread/count
```

### Get Announcements
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/announcements
```

---

## PowerShell Examples

### 1. Check Server Health
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
```

### 2. Login as Student (get token)
```powershell
$body = @{
    email = "praneeth@gmail.com"
    password = "Praneeth1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/student/login" -Method POST -Body $body -ContentType "application/json" -SessionVariable session

# Token is in cookie, check with:
$session.Cookies.GetCookies("http://localhost:5000")
```

### 3. Get Classes (authenticated)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/classes" -Method GET -WebSession $session
```

### 4. Get Class Stats
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/classes/stats" -Method GET -WebSession $session
```

### 5. Get Notifications
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/notifications" -Method GET -WebSession $session
```

### 6. Get Unread Notification Count
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/notifications/unread/count" -Method GET -WebSession $session
```

---

## Create Sample Data

### Create a Class (as student/tutor/admin)
```powershell
$classData = @{
    tutorId = "TUTOR_ID_HERE"
    studentId = "STUDENT_ID_HERE"
    scheduledAt = "2026-02-15T10:00:00Z"
    duration = 60
    topic = "Math Tutoring - Algebra"
    description = "Introduction to algebraic expressions"
    meetingLink = "https://zoom.us/j/123456789"
    meetingPlatform = "zoom"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/classes" -Method POST -Body $classData -ContentType "application/json" -WebSession $session
```

### Create Availability Slot (as tutor)
```powershell
$availData = @{
    dayOfWeek = 1  # Monday
    startTime = "09:00"
    endTime = "10:00"
    isRecurring = $true
    timezone = "UTC"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/availability" -Method POST -Body $availData -ContentType "application/json" -WebSession $session
```

### Mark Attendance (as tutor)
```powershell
$attendanceData = @{
    classId = "CLASS_ID_HERE"
    studentId = "STUDENT_ID_HERE"
    status = "present"
    tutorRemarks = "Excellent participation and understanding"
    attentiveness = 5
    understanding = 4
    preparation = 5
    participationLevel = "excellent"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/attendance" -Method POST -Body $attendanceData -ContentType "application/json" -WebSession $session
```

---

## Expected Responses

### Health Check
```json
{
  "status": "ok"
}
```

### Class Stats
```json
{
  "success": true,
  "data": {
    "total": 0,
    "upcoming": 0,
    "completed": 0,
    "cancelled": 0,
    "totalHours": 0
  }
}
```

### Notification Count
```json
{
  "success": true,
  "data": {
    "unreadCount": 0
  }
}
```

---

## Troubleshooting

### If you get 401 Unauthorized:
- Make sure you're logged in first
- Check that the cookie is being sent
- Verify the token hasn't expired

### If you get 403 Forbidden:
- Check that you have the correct role (student/tutor/admin)
- Some endpoints are role-specific

### If you get 404 Not Found:
- Verify the endpoint URL is correct
- Check that the server is running on port 5000

### If you get 500 Server Error:
- Check server logs for details
- Verify MongoDB is connected
- Check that required fields are provided
