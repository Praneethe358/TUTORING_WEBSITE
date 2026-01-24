# Google Calendar & Meet Integration Setup Guide

## 📋 Prerequisites

To enable automatic Google Meet link generation, you need to set up Google Cloud Platform credentials.

## 🚀 Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it something like "Tutoring Platform"

### Step 2: Enable APIs

1. Navigate to **APIs & Services** > **Library**
2. Search for and enable:
   - **Google Calendar API**
   - **Google Meet API** (if available)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure consent screen if prompted:
   - User Type: External
   - App name: Tutoring Platform
   - User support email: your email
   - Scopes: Add `calendar` and `calendar.events`
   - Test users: Add tutor email addresses

4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Tutoring Platform OAuth
   - Authorized redirect URIs:
     - `http://localhost:5000/api/tutor/google/callback`
     - `https://yourdomain.com/api/tutor/google/callback` (production)

5. Download the credentials JSON or copy:
   - **Client ID**
   - **Client Secret**

### Step 4: Configure Environment Variables

Update `backend/.env` with your credentials:

```env
# Google OAuth & Calendar API
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/tutor/google/callback
```

### Step 5: Restart Backend Server

```powershell
cd backend
node server.js
```

## 🎯 How It Works

### For Tutors:

1. **Connect Google Account:**
   - Navigate to Profile/Settings page
   - Click "Connect Google Account"
   - Authorize the app to access your calendar
   - You'll be redirected back to the app

2. **Automatic Meet Link Generation:**
   - When creating a new class, a Google Meet link is automatically generated
   - Calendar event is created with the meeting details
   - Student receives email invitation automatically
   - Reminders are set (1 day before + 30 min before)

3. **Calendar Sync:**
   - All scheduled classes appear in your Google Calendar
   - Updates to classes sync automatically
   - Cancellations remove the calendar event

### For Students:

- Receive Google Calendar invitations via email
- Can add classes to their own calendar
- Get automatic reminders
- Click to join Google Meet directly

## 📊 Features

✅ **Automatic Google Meet link generation**
- No manual link creation needed
- Unique link for each class

✅ **Calendar synchronization**
- Classes automatically added to Google Calendar
- Updates reflect immediately

✅ **Email invitations**
- Students automatically invited via email
- Calendar .ics file attached

✅ **Smart reminders**
- 1 day before class (email)
- 30 minutes before class (popup)

✅ **Token refresh**
- Automatic token renewal
- No re-authentication needed

## 🔒 Security & Privacy

- **OAuth 2.0:** Industry-standard secure authentication
- **Refresh tokens:** Stored securely in database
- **Scope limitation:** Only calendar access, no other data
- **User control:** Tutors can disconnect anytime

## 🧪 Testing

1. **Connect Test Account:**
   ```
   Login as tutor: test.tutor@example.com / TestPass123
   Go to Settings > Connect Google Account
   ```

2. **Create Test Class:**
   ```
   Create a new class with a student
   Verify Google Meet link appears automatically
   Check tutor's Google Calendar for the event
   ```

3. **Verify Email:**
   - Check student email for calendar invitation
   - Confirm Meet link is included

## ❗ Troubleshooting

### "Failed to create Google Meet meeting"

**Possible causes:**
- Invalid credentials in `.env`
- Google Calendar API not enabled
- Token expired (should auto-refresh)
- Incorrect redirect URI configuration

**Solutions:**
1. Verify `.env` credentials match Google Cloud Console
2. Check API enablement in Google Cloud Console
3. Disconnect and reconnect Google account
4. Ensure redirect URI matches exactly

### "Authorization code missing"

**Cause:** OAuth callback failed

**Solution:**
- Check redirect URI in Google Cloud Console
- Verify callback route is working: `GET /api/tutor/google/callback`

### Tokens not refreshing

**Cause:** Missing or invalid refresh token

**Solution:**
1. Disconnect Google account
2. Reconnect (ensure `prompt: 'consent'` forces new refresh token)

## 🔧 Manual Testing

Test the OAuth flow directly:

```powershell
# Get auth URL
curl http://localhost:5000/api/tutor/google/connect \
  -H "Cookie: token=<tutor-jwt-token>"

# Check status
curl http://localhost:5000/api/tutor/google/status \
  -H "Cookie: token=<tutor-jwt-token>"
```

## 📝 API Endpoints

### Connect Google
```
GET /api/tutor/google/connect
Returns: { authUrl: "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

### OAuth Callback
```
GET /api/tutor/google/callback?code=...&state=...
Redirects to: /tutor/settings?googleConnected=true
```

### Connection Status
```
GET /api/tutor/google/status
Returns: { isConnected: true, connectedAt: "2026-01-24T..." }
```

### Disconnect
```
POST /api/tutor/google/disconnect
Returns: { message: "Google account disconnected successfully" }
```

## 🎊 Benefits

**For Tutors:**
- ⏱️ Save time - no manual link creation
- 📅 Better organization - all classes in one calendar
- 🔔 Never miss a class - automatic reminders
- 📧 Professional - automated invitations

**For Students:**
- 📨 Receive proper calendar invitations
- ⏰ Get timely reminders
- 🔗 Easy access to meeting links
- 📱 Sync to mobile devices

**For Platform:**
- 🚀 Professional integration
- 💼 Enterprise-ready
- 🎯 Better user experience
- ⭐ Competitive advantage

---

**Status:** ✅ Implementation Complete
**Version:** 1.0
**Date:** January 24, 2026
