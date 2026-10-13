import React from 'react';

interface TrophyIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * High-fidelity Filled Trophy SVG styled with golden/amber radiance,
 * faceted 3D metal gradients, gleaming handles, cybernetic star sparkle,
 * and ambient neon glow to match the visual quality of the ShardIcon.
 */
export const TrophyIcon: React.FC<TrophyIconProps> = ({
  className = 'w-3.5 h-3.5',
  size,
  glow = true,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${glow ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.65)]' : ''} ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* Ambient Warm Golden Halo */}
        <radialGradient id="trophy-halo" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>

        {/* Cup Cup Left Shaded Facet */}
        <linearGradient id="trophy-cup-left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Cup Right Highlight Facet */}
        <linearGradient id="trophy-cup-right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Handles Gradient */}
        <linearGradient id="trophy-handle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Pedestal Gradient */}
        <linearGradient id="trophy-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
      </defs>

      {/* Ambient warm glow aura */}
      <circle cx="12" cy="10" r="10" fill="url(#trophy-halo)" />

      {/* Outer Left Handle */}
      <path
        d="M6.5 4.5H4C3.17 4.5 2.5 5.17 2.5 6C2.5 8.76 4.5 11 7 11.4V9.8C5.35 9.45 4 8.2 4 6.5H6.5V4.5Z"
        fill="url(#trophy-handle)"
      />

      {/* Outer Right Handle */}
      <path
        d="M17.5 4.5H20C20.83 4.5 21.5 5.17 21.5 6C21.5 8.76 19.5 11 17 11.4V9.8C18.65 9.45 20 8.2 20 6.5H17.5V4.5Z"
        fill="url(#trophy-handle)"
      />

      {/* Trophy Stem & Neck */}
      <path
        d="M10.8 12.8H13.2V16.5C13.2 16.8 13.5 17.2 14 17.5H10C10.5 17.2 10.8 16.8 10.8 16.5V12.8Z"
        fill="url(#trophy-base)"
      />

      {/* Trophy Tiered Plinth / Base */}
      {/* Upper plinth disc */}
      <rect x="8.5" y="17.5" width="7" height="1.5" rx="0.75" fill="#FBBF24" />
      {/* Main weighted plinth */}
      <path
        d="M6 19.5C6 19.2 6.3 19 6.7 19H17.3C17.7 19 18 19.2 18 19.5L18.5 21.5C18.5 21.8 18.2 22 17.8 22H6.2C5.8 22 5.5 21.8 5.5 21.5L6 19.5Z"
        fill="url(#trophy-base)"
      />
      {/* Plinth front highlight bezel */}
      <line x1="7" y1="19.5" x2="17" y2="19.5" stroke="#FEF08A" strokeWidth="0.6" strokeLinecap="round" />

      {/* Left Trophy Cup Facet */}
      <path
        d="M6 3.5H12V13C9 13 6 10.5 6 7V3.5Z"
        fill="url(#trophy-cup-left)"
      />

      {/* Right Trophy Cup Facet */}
      <path
        d="M12 3.5H18V7C18 10.5 15 13 12 13V3.5Z"
        fill="url(#trophy-cup-right)"
      />

      {/* Top Rim Bevel of Cup */}
      <ellipse cx="12" cy="3.5" rx="6" ry="1.2" fill="#FEF08A" />
      <ellipse cx="12" cy="3.5" rx="4.8" ry="0.75" fill="#F59E0B" />

      {/* Center Ridge Seam Line for 3D Faceting */}
      <line x1="12" y1="4.2" x2="12" y2="13" stroke="#FEF08A" strokeWidth="0.75" strokeOpacity="0.9" />

      {/* Subtle Cup Contour Stroke */}
      <path
        d="M6 3.5H18V7C18 10.5 15 13 12 13C9 13 6 10.5 6 7V3.5Z"
        stroke="#FEF08A"
        strokeWidth="0.5"
        strokeOpacity="0.8"
        fill="none"
      />

      {/* Gleam Sparkle Star on Upper Left Chest */}
      <polygon
        points="9.5,5.5 10.2,7 11.7,7.7 10.2,8.4 9.5,9.9 8.8,8.4 7.3,7.7 8.8,7"
        fill="#FFFFFF"
        fillOpacity="0.95"
      />
      <circle cx="9.5" cy="7.7" r="0.65" fill="#FFFFFF" />
    </svg>
  );
};
