import React from 'react';
import { colors, typography, spacing } from '../theme/designSystem';

// Uses the exact provided raster logo asset without modification
import hopeLogo from '../pages/TUTORIALLOGO.jpeg';

const Logo = ({ size = 48, withText = false }) => {
  return (
    <div className="logo-root flex items-center gap-2 sm:gap-3" style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
      <img
        src={hopeLogo}
        alt="HOPE Online Tuitions Logo"
        className="flex-shrink-0"
        style={{ 
          height: size, 
          width: 'auto',
          objectFit: 'contain',
          maxWidth: '100%'
        }}
      />

      {withText && (
        <span
          className="logo-text text-xs sm:text-sm md:text-lg font-bold leading-tight"
          style={{
            letterSpacing: '-0.2px',
            color: colors.textPrimary,
            fontSize: size > 50 ? typography.fontSize.base : typography.fontSize.sm,
            fontWeight: typography.fontWeight.bold,
            whiteSpace: 'nowrap'
          }}
        >
          HOPE Online Tuitions
        </span>
      )}
    </div>
  );
};

export default Logo;
