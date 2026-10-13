import React from 'react';

interface ShardIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

/**
 * Authentic Crystal Shard SVG matching the exact in-game collectible:
 * 3D diamond faceted crystal with cyan/core teal tones, specular gleam, and ambient aura.
 */
export const ShardIcon: React.FC<ShardIconProps> = ({
  className = 'w-3.5 h-3.5',
  size,
  glow = true,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${glow ? 'drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]' : ''} ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* Ambient Outer Halo */}
        <radialGradient id="shard-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </radialGradient>

        {/* Left Shaded Facet: Deep Oceanic Cyan (#0284C7 to #0891B2) */}
        <linearGradient id="shard-left-facet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Right Highlight Facet: Luminous Neon Cyan / Teal (#67E8F9 to #22D3EE) */}
        <linearGradient id="shard-right-facet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="50%" stopColor="#67E8F9" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Subtle outer glow disc */}
      <circle cx="12" cy="12" r="10" fill="url(#shard-halo)" />

      {/* Left Crystal Facet (Deep teal/cyan shaded side) */}
      <polygon points="12,2 4,12 12,22" fill="url(#shard-left-facet)" />

      {/* Right Crystal Facet (Bright cyan neon highlighted side) */}
      <polygon points="12,2 20,12 12,22" fill="url(#shard-right-facet)" />

      {/* Center Ridge Seam Line */}
      <line x1="12" y1="2" x2="12" y2="22" stroke="#E0F2FE" strokeWidth="0.8" strokeOpacity="0.85" />

      {/* Outer Sharp Crystal Edge Contour */}
      <polygon
        points="12,2 20,12 12,22 4,12"
        stroke="#67E8F9"
        strokeWidth="0.75"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Core Prismatic Specular Gleam / In-game spark */}
      <polygon points="12,6 14,12 12,14 10,12" fill="#FFFFFF" fillOpacity="0.95" />
      <circle cx="12" cy="11.5" r="1.2" fill="#FFFFFF" />
    </svg>
  );
};
