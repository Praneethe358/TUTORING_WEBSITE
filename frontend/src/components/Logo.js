import React from 'react';
import { colors, typography, spacing } from '../theme/designSystem';

// Uses the exact provided raster logo asset without modification
import hopeLogo from '../pages/TUTORIALLOGO.jpeg';

const Logo = ({ size = 300, withText = false }) => {
  // Mobile: reduce logo size to give more space for text
  const mobileSize = size / 1.5;
  
  return (
    <div className="logo-root flex items-start gap-1 sm:gap-2 md:gap-3 flex-1">
      <img
        src={hopeLogo}
        alt="HOPE"
        className="flex-shrink-0 h-10 sm:h-12 md:h-14 w-auto"
        style={{ minHeight: mobileSize }}
      />

      {withText && (
        <div
          className="logo-text text-left block"
          style={{
            fontSize: '11px',
            lineHeight: '1.15',
            letterSpacing: '-0.2px',
            color: colors.textPrimary,
            fontWeight: 700,
            wordWrap: 'break-word',
            whiteSpace: 'normal',
          }}
        >
          HOPE ONLINE TUTION - Saving Time , Inspiring Mind
        </div>
      )}
    </div>
  );
};

export default Logo;
