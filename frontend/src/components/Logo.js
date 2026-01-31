import React from 'react';
import { colors, typography, spacing } from '../theme/designSystem';

// Uses the exact provided raster logo asset without modification
import hopeLogo from '../pages/TUTORIALLOGO.jpeg';

const Logo = ({ size = 300, withText = false }) => {
  return (
    <div className="logo-root flex items-start gap-2 sm:gap-3">
      <img
        src={hopeLogo}
        alt="HOPE"
        className="flex-shrink-0"
        style={{ height: size, width: 'auto' }}
      />

      {withText && (
        <div
          className="logo-text text-xs sm:text-sm md:text-lg font-bold leading-tight text-left"
          style={{
            letterSpacing: '-0.2px',
            color: colors.textPrimary,
            maxWidth: '200px',
          }}
        >
          HOPE ONLINE TUTION - Saving Time , Inspiring Mind
        </div>
      )}
    </div>
  );
};

export default Logo;
