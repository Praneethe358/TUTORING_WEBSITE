# Mobile Dashboard CSS Quick Reference

## 🎯 Quick Links
- Main file: `frontend/src/styles/responsive.css`
- Documentation: `MOBILE_DASHBOARD_ENHANCEMENTS.md`
- Visual guide: `MOBILE_VISUAL_CHANGES.md`

## 📱 Mobile Breakpoint
```css
@media (max-width: 768px) {
  /* All mobile enhancements here */
}
```

## 🎨 Design Tokens

### Touch Targets
```css
button { min-height: 44px !important; }
button[primary] { min-height: 48px !important; }
input { min-height: 44px !important; }
checkbox/radio { width: 20px; height: 20px; }
```

### Typography
```css
h1 { font-size: 18px; }  /* Dashboard titles */
h2 { font-size: 16px; }  /* Card headers */
h3 { font-size: 14px; }  /* Section headers */
p { font-size: 13-14px; }  /* Body text */
small { font-size: 11-12px; }  /* Labels, badges */
```

### Spacing Scale
```css
gap: 8px;   /* Tight spacing (button groups) */
gap: 12px;  /* Standard spacing (cards, lists) */
gap: 16px;  /* Generous spacing (sections) */

padding: 12px;  /* Compact (list items) */
padding: 16px;  /* Standard (cards) */

margin-bottom: 8px;   /* List items */
margin-bottom: 12px;  /* Cards in stack */
margin-bottom: 16px;  /* Sections */
```

### Border Radius
```css
border-radius: 6px;   /* Small elements (badges) */
border-radius: 8px;   /* Buttons, inputs */
border-radius: 12px;  /* Cards */
border-radius: 16px;  /* Modals */
```

## 🏗️ Component Patterns

### Stats Grid
```css
.student-stats-grid,
.tutor-stats-grid,
.admin-stats-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
```

### Main Content Grid
```css
.student-main-grid,
.tutor-main-grid,
.admin-main-grid {
  grid-template-columns: 1fr;  /* Single column */
  gap: 16px;
}
```

### Cards
```css
.dashboard-card {
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Buttons
```css
button {
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 8px;
  font-weight: 500;
}

button:active {
  transform: scale(0.98);
  opacity: 0.9;
}
```

### Forms
```css
input, select, textarea {
  width: 100%;
  font-size: 16px;  /* Prevents iOS zoom */
  padding: 12px 14px;
  min-height: 44px;
  border-radius: 8px;
}

label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
}
```

### Tables
```css
table {
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

th:first-child,
td:first-child {
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 5;
}
```

### Modals
```css
.modal {
  width: 95%;
  max-height: 90vh;
  border-radius: 16px;
}

.modal-header {
  position: sticky;
  top: 0;
  padding: 16px;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

.modal-footer {
  position: sticky;
  bottom: 0;
  padding: 16px;
}
```

## 🔧 Common Patterns

### Vertical Button Stack
```css
.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.button-group button {
  width: 100%;
}
```

### Card List Items
```css
.dashboard-card ul li {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.02);
}
```

### Admin Actions
```css
.admin-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-actions button {
  width: 100%;
  font-size: 11px;
  padding: 6px 10px;
  min-height: 36px;
}
```

### Profile Header
```css
.dashboard-header {
  padding: 16px;
  border-radius: 12px;
}

.dashboard-header img {
  width: 48px;
  height: 48px;
}

.dashboard-header h1 {
  font-size: 18px;
  line-height: 1.4;
}

.dashboard-header p {
  font-size: 13px;
  line-height: 1.5;
}
```

## ✅ Mobile Checklist

### New Component? Apply These:
- [ ] Min touch target: 44x44px
- [ ] Font size: 13-16px (body text)
- [ ] Padding: 12-16px (cards/sections)
- [ ] Border radius: 8-12px
- [ ] Active state: scale(0.98)
- [ ] Width: 100% (buttons, inputs)
- [ ] Gap: 8-16px (consistent spacing)

### Form Inputs?
- [ ] Font size: 16px (prevents iOS zoom)
- [ ] Min height: 44px
- [ ] Padding: 12-14px
- [ ] Width: 100%

### Tables?
- [ ] Overflow-x: auto
- [ ] Sticky header
- [ ] Sticky first column (if admin)
- [ ] Momentum scrolling

### Modals?
- [ ] Width: 95%
- [ ] Max height: 90vh
- [ ] Sticky header & footer
- [ ] Scrollable body
- [ ] Full-width buttons

## 🚫 What NOT to Do

❌ Don't use touch targets < 44px  
❌ Don't use font-size < 16px for inputs (iOS zoom)  
❌ Don't stack more than 2 columns in stats grid  
❌ Don't use horizontal button groups  
❌ Don't use fixed widths (use 100% or max-width)  
❌ Don't forget active states on touchable elements  
❌ Don't use hover-only interactions  

## 🎨 Utility Classes

```css
/* Visibility */
.mobile-hide { display: none; }
.mobile-show { display: block; }

/* Alignment */
.mobile-center { text-align: center; }
.mobile-full-width { width: 100%; }

/* Spacing */
.mobile-no-padding { padding: 0; }
.mobile-small-padding { padding: 8px; }
```

## 📊 Responsive Grid Examples

### 2-Column Stats
```html
<div class="student-stats-grid">
  <StatCard label="Total" value="12" />
  <StatCard label="Upcoming" value="5" />
  <StatCard label="Completed" value="8" />
  <StatCard label="Pending" value="3" />
</div>
```

### Single Column Content
```html
<div class="student-main-grid">
  <Card title="Upcoming Classes">...</Card>
  <Card title="Recent Assignments">...</Card>
  <Card title="Progress">...</Card>
</div>
```

## 🔍 Testing

### Chrome DevTools
```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or "Galaxy S20"
4. Refresh page
5. Test touch targets (at least 44x44px)
```

### iOS Safari (Real Device)
```
1. Connect iPhone via USB
2. Safari > Develop > [Device Name]
3. Test input focus (should NOT zoom if 16px)
4. Test touch targets (easy to tap?)
5. Test scrolling (smooth momentum?)
```

## 📏 Viewport Sizes to Test

| Device | Width | Height | Notes |
|--------|-------|--------|-------|
| iPhone SE | 375px | 667px | Smallest modern iPhone |
| iPhone 12/13 | 390px | 844px | Most common |
| Galaxy S20 | 360px | 800px | Common Android |
| iPad Mini | 768px | 1024px | Tablet breakpoint |

## 🐛 Common Issues & Fixes

### Input Zooms on iOS
```css
/* ❌ Wrong */
input { font-size: 14px; }

/* ✅ Correct */
input { font-size: 16px; }
```

### Button Too Small to Tap
```css
/* ❌ Wrong */
button { padding: 8px; }

/* ✅ Correct */
button { 
  min-height: 44px;
  padding: 12px 16px;
}
```

### Table Overflow Hidden
```css
/* ❌ Wrong */
table { width: 100%; }

/* ✅ Correct */
table { 
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

### Modal Too Tall
```css
/* ❌ Wrong */
.modal { height: 100%; }

/* ✅ Correct */
.modal { 
  max-height: 90vh;
  overflow-y: auto;
}
```

---

## 📚 Additional Resources

- [MOBILE_DASHBOARD_ENHANCEMENTS.md](MOBILE_DASHBOARD_ENHANCEMENTS.md) - Full documentation
- [MOBILE_VISUAL_CHANGES.md](MOBILE_VISUAL_CHANGES.md) - Visual before/after
- [Apple HIG - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/inputs/touchscreen-gestures)
- [Material Design - Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)

---

**Quick Start**: All mobile styles are in `frontend/src/styles/responsive.css` under `@media (max-width: 768px)` queries. Follow the patterns above for consistency.
