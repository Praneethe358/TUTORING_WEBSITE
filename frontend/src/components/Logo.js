import React from 'react';
import { colors, typography, spacing } from '../theme/designSystem';

const Logo = ({ size = 300, withText = false }) => {
  return (
    <div className="logo-root flex items-center gap-2 sm:gap-3">
      <img
        src="/hope-logo.png"
        alt="HOPE Online Tuitions"
        className="flex-shrink-0"
        style={{ height: size, width: 'auto' }}
      />

      {withText && (
        <span
          className="logo-text text-xs sm:text-sm md:text-lg font-bold leading-tight"
          style={{
            letterSpacing: '-0.2px',
            color: colors.textPrimary,
          }}
        >
          HOPE ONLINE TUTION - Saving Time , Inspiring Mind
        </span>
      )}
    </div>
  );
};

export default Logo;
