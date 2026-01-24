# 🎨 Modern Design System - Quick Visual Guide

## Color Palette

### Primary Colors
```
████ Primary Dark:   #0F172A
████ Primary Light:  #1E293B
████ Accent:         #3B82F6
████ Accent Dark:    #1D4ED8
████ Accent Light:   #60A5FA
████ White:          #FFFFFF
```

### Neutral Gray Scale (Light to Dark)
```
████ Gray 50:   #F9FAFB
████ Gray 100:  #F3F4F6
████ Gray 200:  #E5E7EB
████ Gray 300:  #D1D5DB
████ Gray 400:  #9CA3AF
████ Gray 500:  #6B7280
████ Gray 600:  #4B5563
████ Gray 700:  #374151
████ Gray 800:  #1F2937
████ Gray 900:  #111827
```

### Status Colors
```
████ Success:  #10B981
████ Warning:  #F59E0B
████ Error:    #EF4444
████ Info:     #3B82F6
```

## Typography Scale

```
Heading 1:     48px | Bold | #111827
Heading 2:     36px | Bold | #111827
Heading 3:     30px | Semibold | #111827
Heading 4:     24px | Semibold | #111827
Heading 5:     20px | Semibold | #111827
Heading 6:     18px | Medium | #111827

Body Large:    18px | Normal | #4B5563
Body Base:     16px | Normal | #4B5563
Body Small:    14px | Normal | #4B5563
Caption:       12px | Normal | #9CA3AF
```

## Spacing System

```
XS:   4px   (┆ one eighth of base)
SM:   8px   (┆ one quarter of base)
MD:   12px  (┆ three eighths of base)
LG:   16px  (┆ base unit)
XL:   24px  (┆ 1.5x base)
2XL:  32px  (┆ 2x base)
3XL:  48px  (┆ 3x base)
4XL:  64px  (┆ 4x base)
```

## Component Sizes

### Buttons
```
Small:  32px height | 8px 16px padding
Medium: 40px height | 12px 24px padding
Large:  48px height | 16px 32px padding
```

### Border Radius
```
SM:   4px    (small elements)
MD:   8px    (standard)
LG:   12px   (cards, larger elements)
XL:   16px   (large cards)
2XL:  24px   (hero sections)
Full: 9999px (avatars, badges)
```

### Shadows
```
XS: 0 1px 2px 0 rgba(0,0,0,0.05)
SM: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)
MD: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)
LG: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)
XL: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)
2XL: 0 25px 50px -12px rgba(0,0,0,0.15)
```

## Component Examples

### Button Variants

**Primary Button** (CTA, main actions)
```
Background: #3B82F6
Text: #FFFFFF
Hover: #1D4ED8
Shadow: Medium
```

**Secondary Button** (alternative actions)
```
Background: #F3F4F6
Text: #111827
Hover: #E5E7EB
```

**Ghost Button** (tertiary actions)
```
Background: Transparent
Text: #3B82F6
Hover: #F9FAFB
```

**Danger Button** (destructive actions)
```
Background: #EF4444
Text: #FFFFFF
Hover: #DC2626
```

### Card Design
```
Background: #FFFFFF
Border: 1px solid rgba(0,0,0,0.05)
Padding: 32px
Border Radius: 12px
Shadow: Small (default), Large (hover)
Transition: 0.25s ease-in-out
```

### Badge Design
```
Padding: 4px 12px
Border Radius: 9999px
Font Size: 12px
Font Weight: Semibold
Example variants:
  Primary:   Blue bg, white text
  Success:   Green bg, white text
  Warning:   Amber bg, white text
  Error:     Red bg, white text
  Gray:      Gray-100 bg, primary text
```

## Animations & Transitions

### Timing Functions
```
Fast:  0.15s ease-in-out
Base:  0.25s ease-in-out (default)
Slow:  0.35s ease-in-out
```

### Keyframe Animations
```
Fade In:    opacity 0→1
Slide Up:   opacity 0→1 + translateY 20px→0
Slide In:   opacity 0→1 + translateX -20px→0
Pulse:      opacity 1→0.5→1 (infinite)
Shimmer:    background-position loop
```

### Micro-interactions
```
Hover:      - 2px transform (translateY)
            - Darker shadow
            - Color change

Active:     scale(0.98) transform
            
Focus:      2px solid outline (accent color)
            offset 2px
```

## Responsive Breakpoints

```
Desktop:  1280px+ (3-column layouts)
Tablet:   768px - 1279px (2-column layouts)
Mobile:   320px - 767px (1-column layouts)
```

## Grid System

```
3-Column Desktop:
  - Card width: ~300px
  - Gap: 24px
  - Max width: 1280px

2-Column Tablet:
  - Card width: ~auto
  - Gap: 16px
  - Max width: 768px

1-Column Mobile:
  - Card width: 100%
  - Gap: 16px
  - Max width: 100%
```

## Design Tokens Summary

| Category | Token | Value |
|----------|-------|-------|
| **Colors** | Primary | #0F172A |
| | Accent | #3B82F6 |
| | White | #FFFFFF |
| **Typography** | Font Family | Inter, system fonts |
| | Heading Size | 48px (H1) → 18px (H6) |
| | Body Size | 16px |
| **Spacing** | Base Unit | 4px (xs) |
| | Standard | 16px (lg) |
| | Large | 24-64px (xl-4xl) |
| **Radius** | Standard | 8px |
| | Cards | 12px |
| | Round | 9999px |
| **Shadows** | Standard | 0 4px 6px |
| | Large | 0 10px 15px |
| **Animations** | Duration | 0.25s |
| | Timing | ease-in-out |

## Usage Examples

### Creating a Custom Component
```javascript
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const MyComponent = () => (
  <div style={{
    background: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.md,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    transition: transitions.base,
  }}>
    {/* content */}
  </div>
);
```

### Using Components
```javascript
import { Button, Card, Container, Grid, Badge } from '../components/ModernUI';

const MyPage = () => (
  <Container>
    <Grid cols={3}>
      <Card hover>
        <Badge variant="primary">Featured</Badge>
        <h3>Title</h3>
        <p>Description</p>
        <Button>Action</Button>
      </Card>
    </Grid>
  </Container>
);
```

---

**Last Updated**: January 24, 2026  
**Status**: ✅ Ready for Implementation  
**Version**: 1.0.0
