import React from "react";

interface TJWatermarkProps {
  className?: string;
  size?: number | string;
  opacity?: number;
}

/**
 * A highly polished SVG Monogram of "TJ" representing the official "Tasnim & Jannat" watermark
 * from the user's uploaded letterhead paper. Recreated in pure vector paths for crispy scaling.
 */
export default function TJWatermark({ className = "", size = "100%", opacity = 0.08 }: TJWatermarkProps) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        width={size}
        height={size}
        className="max-w-full max-h-full"
      >
        <g fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
          {/* Main "T" Vertical Stem */}
          <path
            d="M 235 150 L 235 340"
            strokeWidth="20"
            stroke="currentColor"
          />

          {/* "T" Top Bar with Serifs */}
          <path
            d="M 120 150 L 350 150"
            strokeWidth="16"
            stroke="currentColor"
          />
          {/* Left Serif Bracket on Top Bar */}
          <path
            d="M 120 150 L 120 180"
            strokeWidth="12"
            stroke="currentColor"
          />
          {/* Right Serif Bracket on Top Bar */}
          <path
            d="M 350 150 L 350 165"
            strokeWidth="12"
            stroke="currentColor"
          />

          {/* "T" Bottom Base Serif */}
          <path
            d="M 190 340 L 280 340"
            strokeWidth="14"
            stroke="currentColor"
          />

          {/* "J" Swoop & Loop Line:
              Starts on the right side of the T, goes straight down, sweeps underneath, 
              then makes a beautiful giant round circular loop on the left, curving around 
              and crossing in front of the T stem.
          */}
          <path
            d="M 330 150 
               L 330 310 
               C 330 380, 275 425, 215 425 
               C 150 425, 120 370, 120 310 
               C 120 230, 180 185, 235 185
               C 275 185, 305 210, 305 250
               C 305 295, 265 330, 220 330"
            strokeWidth="10"
            stroke="currentColor"
            strokeOpacity="0.85"
            fill="none"
          />
        </g>

        {/* Decorative Watermark Label Ring (Faintly styled) */}
        <text
          x="250"
          y="465"
          textAnchor="middle"
          fill="currentColor"
          fontSize="12"
          fontWeight="bold"
          letterSpacing="6"
          className="uppercase tracking-widest font-sans opacity-60"
        >
          TASNIM & JANNAT KNIT
        </text>

        <text
          x="250"
          y="75"
          textAnchor="middle"
          fill="currentColor"
          fontSize="11"
          fontWeight="extrabold"
          letterSpacing="4"
          className="tracking-widest font-serif opacity-40"
        >
          OFFICIAL WATERMARK
        </text>
      </svg>
    </div>
  );
}
