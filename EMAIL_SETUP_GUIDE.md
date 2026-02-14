# 📧 Email Configuration Setup Guide

## **Overview**
Your HOPE Tuitions system needs email setup to send:
- ✅ Password reset links
- ✅ Tutor application status notifications
- ✅ Admin notifications

---

## **⚙️ Email Service Options**

### **Option 1: Gmail SMTP** (Simplest for small projects) ⭐
**Best for:** Starting out, testing, small volume

### **Option 2: SendGrid** (Best for production)
**Best for:** Production, high volume, reliability

### **Option 3: AWS SES**
**Best for:** AWS users, enterprise

### **Option 4: Other Services** (Mailgun, Brevo, etc.)
**Best for:** Various needs

---

## **🔧 Configuration - Step by Step**

### **STEP 1: Choose Email Service**

---

## **OPTION 1: Gmail SMTP Setup** ⭐ (Recommended for Starting)

### **Step 1.1: Create Google App Password**

1. Go to: https://myaccount.google.com
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Click **App passwords** (appears after 2FA is enabled)
5. Select: **Mail** → **Windows Computer** (or your OS)
6. Google generates a 16-character password
7. **Copy this password** (you'll need it)

### **Step 1.2: Set Environment Variables**

In your `.env` file (create if doesn't exist in `backend/` folder):

```env
# Email Configuration - Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hopetuitionbygd@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=hopetuitionbygd@gmail.com
CLIENT_URL=https://hope-tuitions-frontend.onrender.com

# Database
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

**Important:** Replace `xxxx xxxx xxxx xxxx` with your actual Google App Password

### **Step 1.3: Test Gmail Connection**

Run this command:
```bash
cd backend
npm run test-email
```

If successful, you'll see:
```
✅ Email configuration is working!
✅ Password reset emails will work
```

---

## **OPTION 2: SendGrid Setup** (Production Recommended)

### **Step 2.1: Create SendGrid Account**

1. Go to: https://sendgrid.com
2. Sign up (free tier available: 100 emails/day)
3. Verify email
4. Go to: Settings → API Keys
5. Click **Create API Key**
6. Copy the API Key

### **Step 2.2: Set Environment Variables**

In `.env`:

```env
# Email Configuration - SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=hopetuitionbygd@gmail.com
CLIENT_URL=https://hope-tuitions-frontend.onrender.com

# Or use SMTP if preferred:
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=hopetuitionbygd@gmail.com
```

---

## **OPTION 3: AWS SES Setup**

### **Step 3.1: AWS Account & SES**

1. Create AWS account: https://aws.amazon.com
2. Go to SES (Simple Email Service)
3. Verify email: hopetuitionbygd@gmail.com
4. Request production access (to remove sandbox restrictions)
5. Create SMTP credentials:
   - Go to: SMTP Settings
   - Click **Create SMTP Credentials**
   - Download credentials

### **Step 3.2: Set Environment Variables**

In `.env`:

```env
# Email Configuration - AWS SES
SMTP_HOST=email-smtp.[region].amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_smtp_user
SMTP_PASS=your_aws_smtp_password
EMAIL_FROM=hopetuitionbygd@gmail.com
```

---

## **📝 Environment Variables Explained**

| Variable | Purpose | Example |
|----------|---------|---------|
| `SMTP_HOST` | Email server address | smtp.gmail.com |
| `SMTP_PORT` | Email server port | 587 (TLS) or 465 (SSL) |
| `SMTP_USER` | Login username | hopetuitionbygd@gmail.com |
| `SMTP_PASS` | Login password/app password | xxxx xxxx xxxx xxxx |
| `EMAIL_FROM` | Sender email address | hopetuitionbygd@gmail.com |
| `CLIENT_URL` | Your frontend URL | https://hope-tuitions-frontend.onrender.com |

---

## **🚀 Deployment - Render.com**

### **Step 1: Add Environment Variables to Render**

1. Go to: https://dashboard.render.com
2. Select your **backend service**
3. Click: **Environment** (in settings)
4. Add all variables from `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=hopetuitionbygd@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   EMAIL_FROM=hopetuitionbygd@gmail.com
   CLIENT_URL=https://hope-tuitions-frontend.onrender.com
   ```
5. Click **Save**
6. Render will auto-redeploy

### **Step 2: Verify It Works**

After deployment, test by:
1. Admin approves a password reset request
2. Check if email is sent (might take 30 seconds)
3. Check email inbox

---

## **🔍 Troubleshooting**

### **Problem: "No module nodemailer"**

**Solution:**
```bash
cd backend
npm install nodemailer
```

### **Problem: "Cannot read SMTP_HOST"**

**Solution:**
- Ensure `.env` file exists in `backend/` folder
- Restart server after adding `.env`
- Check variable names match exactly

### **Problem: "Gmail says 'Less secure apps'"**

**Solution:**
- Don't use regular Gmail password
- Use **Google App Password** (16 characters)
- Enable 2FA first

### **Problem: "Connection timeout"**

**Solution:**
- Check firewall/VPN isn't blocking port 587
- Try port 465 with `secure: true`
- Use SendGrid (more reliable)

### **Problem: "Email sent but student didn't receive"**

**Solution:**
- Check spam folder
- Verify `EMAIL_FROM` matches authorized sender
- Check `CLIENT_URL` is correct

### **Problem: Error on production but works locally**

**Solution:**
- Verify all environment variables are set on Render
- Check SMTP_PASS doesn't have special characters (or use quotes)
- Restart the service

---

## **✅ Email Features Implemented**

Your system will send emails for:

### **1️⃣ Password Reset (Admin Approves)**
```
To: student.contactEmail or admin-generated temp password
Subject: Password Reset Request - HOPE Online Tuitions
Content: Reset link or temp password instructions
```

### **2️⃣ Tutor Application Status**
```
To: tutor email
Subject: Your Tutor Application Has Been [Approved/Rejected]
Content: Status + reason + login instructions
```

### **3️⃣ Future: Course Enrollment**
```
To: student email
Subject: Enrollment Confirmation
Content: Course details + access instructions
```

---

## **📊 Gmail Quota**

- **Free tier**: Limited
- **Recommended**: Use SendGrid (free tier: 100 emails/day)

If using Gmail and hitting limits:
1. Upgrade to SendGrid (recommended for production)
2. Or upgrade Gmail account to GWorkspace

---

## **🎯 Quick Setup (Gmail - 5 minutes)**

1. **Get Google App Password:**
   - Account → Security → App passwords
   - Copy 16-character password

2. **Create `.env` in backend folder:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=hopetuitionbygd@gmail.com
   SMTP_PASS=paste_16_char_password_here
   EMAIL_FROM=hopetuitionbygd@gmail.com
   CLIENT_URL=https://hope-tuitions-frontend.onrender.com
   ```

3. **Test it:**
   ```
   npm run test-email
   ```

4. **Deploy to Render:**
   - Add same variables to Render Environment
   - Redeploy

5. **Done!** ✅

---

## **🚀 Production Checklist**

- [ ] Email service configured (Gmail/SendGrid/AWS)
- [ ] Environment variables set locally (`.env`)
- [ ] Environment variables set on Render (dashboard)
- [ ] Test email sent successfully
- [ ] Gmail/service provider verified sender email
- [ ] Password reset tested end-to-end
- [ ] Tutor approval emails tested
- [ ] Rate limiting prevents email spam
- [ ] Error handling for failed emails

---

## **📧 Sample Email Templates**

### **Password Reset Email**
```
Subject: Password Reset Request - HOPE Online Tuitions

Dear [Student Name],

Your admin has approved your password reset request. 
Click the button below to set a new password:

[Reset Password Button]

This link will expire in 1 hour.

---

If you didn't request this, please ignore this email.

HOPE Online Tuitions
hopetuitionbygd@gmail.com
+91-8807717477
```

### **Tutor Status Email**
```
Subject: Your Tutor Application Has Been Approved

Dear [Tutor Name],

Congratulations! Your tutor application has been approved.

You can now log in and start teaching:
[Login Link]

---

HOPE Online Tuitions
hopetuitionbygd@gmail.com
```

---

## **🔐 Security Notes**

1. **Never commit `.env` to Git**
   - Add to `.gitignore`
   - Only share via secure channels

2. **App Passwords vs Regular Passwords**
   - Always use **App Passwords** for apps
   - More secure than storing regular password

3. **Render Secrets**
   - Use Render's Environment tab (not in code)
   - Render encrypts all environment variables

4. **Email Privacy**
   - Don't log full email content
   - Don't expose SMTP credentials in errors

---

## **📞 Support**

If email setup fails:

1. Check error in server logs (Render.com → Logs)
2. Verify all environment variables exact match
3. Try simpler service first (Gmail)
4. Check firewall/VPN not blocking port 587

---

## **Next Steps**

✅ **Step 1:** Choose email service (Gmail recommended to start)
✅ **Step 2:** Get credentials (App Password for Gmail)
✅ **Step 3:** Create `.env` file with credentials
✅ **Step 4:** Test locally: `npm run test-email`
✅ **Step 5:** Deploy to Render with environment variables
✅ **Step 6:** Test on production

---

**Email setup is NOW READY!** 📧✨

Once configured, your system will:
- Send password reset links to students
- Notify tutors of application status
- Send all important notifications automatically

Let me know if you need help with any step!
