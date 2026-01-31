import React from 'react';
import CourseraNavbar from './CourseraNavbar';
import { colors, typography, spacing } from '../theme/designSystem';

/**
 * Unified Page Layout with Coursera-style design
 * Provides consistent structure and styling across all pages
 */
const CourseraPageLayout = ({ 
  children, 
  showNavbar = true, 
  maxWidth = '1200px',
  backgroundColor = colors.bgSecondary,
  noPadding = false
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: backgroundColor,
      fontFamily: typography.fontFamily.base,
    }}>
      {showNavbar && <CourseraNavbar />}
      
      <main style={{
        maxWidth: maxWidth,
        margin: '0 auto',
        padding: noPadding ? '0' : `${spacing['3xl']} ${spacing.xl}`,
        paddingTop: showNavbar ? `calc(80px + ${spacing['3xl']})` : spacing['3xl'],
      }}>
        {children}
      </main>
    </div>
  );
};

export default CourseraPageLayout;
