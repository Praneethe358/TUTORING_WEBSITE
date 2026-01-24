# Quick Testing Guide - Features Walkthrough

## 🎯 Quick Start

**Backend**: http://localhost:5000  
**Frontend**: http://localhost:3000

---

## 📋 Feature Testing Steps

### 1. Theme Toggle (Dark/Light Mode)
1. Look for theme toggle button in the top-right corner
2. Click to switch between dark and light modes
3. Refresh page - theme should persist (localStorage)

**Expected**: Background, text, and component colors change smoothly

---

### 2. Browse Tutors & Favorites
1. Navigate to **Find Tutors** or `/tutors`
2. See tutor cards with **subject/experience filters**
3. Click the **❤️ heart icon** on any tutor card to add to favorites
4. Heart fills with color when favorited
5. Click again to remove from favorites

**Expected**: Heart icon toggles between empty and filled states

---

### 3. View Favorites Page
1. Click **"❤️ Favorites"** in the student sidebar
2. See all your favorited tutors displayed in a grid
3. You can unfavorite tutors from this page

**Expected**: Only favorited tutors appear here

---

### 4. Tutor Profile & Sharing
1. From tutor list, click on a tutor card or **"View Profile"** button
2. See tutor profile with details, courses, and booking form
3. Click **Share button** (↗️ icon) to see sharing options
4. Choose sharing method:
   - **Twitter**: Opens Twitter with pre-filled text
   - **Facebook**: Opens Facebook share dialog
   - **LinkedIn**: Opens LinkedIn share
   - **WhatsApp**: Opens WhatsApp with link
   - **Copy Link**: Copies profile URL to clipboard
   - **More Options**: Uses browser's native share (if available)

**Expected**: Sharing works for different platforms

---

### 5. Profile Picture Upload
1. Go to **Settings** (both Student and Tutor can do this)
2. Find **Avatar Upload** section
3. Either:
   - **Drag & drop** an image onto the upload area
   - **Click** to select from computer
4. See preview of selected image
5. Click **Upload** button
6. Avatar should appear in your profile

**Expected**: Image validates (must be under 5MB, must be image format)

---

### 6. Keyboard Shortcuts
1. Press **Ctrl + /** (Ctrl + Slash) to see shortcuts modal
2. Modal shows all available shortcuts:
   - Ctrl+H: Home
   - Ctrl+M: Messages
   - Ctrl+P: Profile
   - Ctrl+S: Settings
   - Ctrl+/: Show this help

**Expected**: Modal appears with list of shortcuts

---

### 7. Session Notes (If in a Class)
1. Join or create a class/session
2. Look for **Session Notes** section
3. Click **Add Note** button
4. Type your notes (max 2000 characters)
5. Toggle **"Make Private"** to hide notes from others (or leave public)
6. Click **Save**
7. Notes appear with author name and timestamp

**Expected**: Notes save and display with proper privacy settings

---

### 8. File Preview
1. In a class or course with materials
2. Find a file (PDF, image, video, audio, etc.)
3. Click on it
4. File opens in a **modal preview window**
5. Click **Download** button to save file
6. Click **X** or outside to close

**Expected**: Different file types preview correctly

---

### 9. CSV Export
1. Go to a page with data tables (bookings, attendance, etc.)
2. Look for **Export** button (usually with 📥 icon)
3. Click **Export to CSV**
4. File downloads as `.csv` file
5. Open in Excel or Google Sheets

**Expected**: Data exports cleanly with proper formatting

---

### 10. Timezone Display
1. In your profile or any tutor profile
2. See times/dates with **timezone info** next to them
3. Times adjust based on your system timezone
4. Shows relative time like "2 hours ago"

**Expected**: All times display in your local timezone

---

## 🔍 What to Check

### Visual Feedback
- ✓ Buttons respond to clicks
- ✓ Loading skeletons appear when fetching data
- ✓ Hover effects on interactive elements
- ✓ Icons change state (heart fills, etc.)

### Functionality
- ✓ Data persists (favorites, settings)
- ✓ No errors in browser console
- ✓ API calls complete successfully
- ✓ Real-time updates work (if testing with Socket.io)

### Performance
- ✓ Pages load quickly
- ✓ Transitions are smooth
- ✓ No lag when clicking buttons
- ✓ Images load properly

---

## ❌ Common Issues & Solutions

### Issue: Heart icon not saving
**Solution**: 
- Check browser console for errors (F12)
- Ensure you're logged in
- Verify backend is running on port 5000

### Issue: Theme not persisting
**Solution**:
- Clear browser cache
- Check localStorage is enabled
- Try incognito/private window

### Issue: Avatar upload fails
**Solution**:
- Check file size (must be under 5MB)
- Use common image formats (JPG, PNG, GIF, WebP)
- Check backend `/uploads` folder exists

### Issue: Sharing not working
**Solution**:
- Social platforms may require popups to be enabled
- Copy Link always works as fallback
- Browser native share only works on some devices

### Issue: "Failed to compile" error
**Solution**:
- Frontend should auto-recover
- If not, restart: `npx react-scripts start`
- Check for syntax errors in editor

---

## 📞 Quick Troubleshooting

### Backend Issues
```bash
# Check if running
curl http://localhost:5000/api/health

# Restart backend
cd backend
node server.js
```

### Frontend Issues
```bash
# Check if running
curl http://localhost:3000

# Restart frontend
cd frontend
npx react-scripts start
```

### Clear Cache
```bash
# Frontend: Ctrl+Shift+R (hard refresh)
# Or: Clear browser cache manually
```

---

## 📊 Quick Test Report Template

```
Tested By: [Your Name]
Date: [Today's Date]

✓ Feature Name: [PASS/FAIL]
✓ Theme Toggle: [PASS/FAIL]
✓ Browse Tutors: [PASS/FAIL]
✓ Favorites: [PASS/FAIL]
✓ Tutor Profile: [PASS/FAIL]
✓ Social Sharing: [PASS/FAIL]
✓ Profile Picture: [PASS/FAIL]
✓ Keyboard Shortcuts: [PASS/FAIL]
✓ Session Notes: [PASS/FAIL]
✓ File Preview: [PASS/FAIL]
✓ CSV Export: [PASS/FAIL]
✓ Timezone: [PASS/FAIL]

Issues Found:
1. [Issue description]
2. [Issue description]

Notes:
- Overall system works well
- Performance is good
- UI is responsive
```

---

## 🎬 Demo Script (For Showing Others)

1. **Start**: "Let me show you the new features we added"
2. **Theme**: Toggle dark mode "See how the entire app adapts"
3. **Tutors**: Browse tutors "Search and filter by subject"
4. **Favorite**: Add a tutor to favorites "Personal bookmarking"
5. **Share**: Share on social media "Easy collaboration"
6. **Profile**: Upload a profile picture "Personalization"
7. **Settings**: Show keyboard shortcuts "Power user features"
8. **End**: "All these features integrate seamlessly!"

---

## ✅ Success Criteria

- All 10 features work without errors
- UI is responsive and looks good
- No console errors
- Data persists across sessions
- API calls complete successfully
- Performance is acceptable (< 2 second loads)

---

**Ready to test!** 🚀  
Questions? Check the terminal output or browser console for more details.
