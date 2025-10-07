// src/components/AnimatedBlobs.jsx
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Seeded PRNG for stable positions (no random jumps)
function mulberry32(seed) {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgba(hex, alpha = 0.25) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * AnimatedBlobs (brand-ready)
 * - Professional subtle blobs, optional grid + vignette overlays to match site vibe
 * - Seeded positions, reduced-motion support, SSR-safe
 */
export default function AnimatedBlobs({
  // Behavior
  seed = 2025,
  count = 6,
  drift = 22, // px
  speedMin = 8,
  speedMax = 14,

  // Colors
  brand = true, // when true, use brand pairs (accent pink)
  colorPairs = [
    ["#6366f1", "#a855f7"], // fallback pairs (indigo -> fuchsia)
    ["#d946ef", "#ec4899"], // fuchsia -> pink
    ["#38bdf8", "#60a5fa"], // sky -> blue
  ],
  // Brand palette (accent pink + soft purples)
  brandPairs = [
    ["#ff2d55", "#ff6a89"], // accent -> lighter accent
    ["#8b5cf6", "#a78bfa"], // violet -> soft violet
    ["#22d3ee", "#38bdf8"], // cyan -> sky
  ],
  alpha = 0.18, // opacity of blobs (subtle for charcoal bg)

  // Size
  minSize = 90,
  maxSize = 160,

  // Visual tweaks
  blurClass = "blur-3xl",
  mixBlend = "normal", // try "screen" for brighter overlays

  // Overlays to match Projects vibe
  showGrid = true,
  gridSize = 22, // px
  gridOpacity = 0.18,
  showVignette = true,
  vignetteStrength = 0.6, // 0..1

  // Mask fade for blobs themselves (keeps center clean)
  maskBlobs = true,

  className = "",
  style = {},
}) {
  const prefersReducedMotion = useReducedMotion();

  // Slightly reduce density on small screens (SSR-safe)
  const effectiveCount = useMemo(() => {
    try {
      const isSmall =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(max-width: 640px)").matches;
      return isSmall ? Math.max(2, Math.round(count * 0.6)) : count;
    } catch {
      return count;
    }
  }, [count]);

  const pairs = brand ? brandPairs : colorPairs;

  const blobs = useMemo(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: effectiveCount }).map((_, i) => {
      const size = rand() * (maxSize - minSize) + minSize;
      const top = rand() * 85 + 5; // keep away from edges
      const left = rand() * 85 + 5;
      const duration = rand() * (speedMax - speedMin) + speedMin;
      const xRange = (rand() * 2 - 1) * drift;
      const yRange = (rand() * 2 - 1) * drift;
      const pair = pairs[i % pairs.length];
      const start = hexToRgba(pair[0], alpha);
      const end = hexToRgba(pair[1], alpha);
      return { id: i, size, top, left, duration, xRange, yRange, start, end };
    });
  }, [
    seed,
    effectiveCount,
    minSize,
    maxSize,
    speedMin,
    speedMax,
    drift,
    pairs,
    alpha,
  ]);

  // Mask the blob layer so edges fade, center stays clean
  const blobMaskStyle =
    maskBlobs
      ? {
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)",
          maskImage:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)",
        }
      : {};

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none ${className}`}
      style={{ ...style }}
    >
      {/* Subtle grid (same as Projects/Experience vibe) */}
      {showGrid && (
        <div
          className="absolute inset-0"
          style={{
            opacity: gridOpacity,
            backgroundImage:
              "radial-gradient(rgba(148,163,184,0.12) 1px, transparent 1px)",
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}

      {/* Blobs layer */}
      <div className="absolute inset-0" style={blobMaskStyle}>
        {blobs.map((b, idx) => (
          <motion.div
            key={b.id}
            className={`absolute rounded-full ${blurClass} will-change-transform transform-gpu`}
            style={{
              width: b.size,
              height: b.size,
              top: `${b.top}%`,
              left: `${b.left}%`,
              background: `radial-gradient(circle at 30% 30%, ${b.start}, ${b.end})`,
              mixBlendMode: mixBlend,
            }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.26 }
                : {
                    x: [0, b.xRange, 0],
                    y: [0, b.yRange, 0],
                    opacity: [0.18, 0.42, 0.18],
                    scale: [1, 1.03 + (idx % 3) * 0.01, 1],
                  }
            }
            transition={{
              duration: b.duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Soft vignette (center focus) */}
      {showVignette && (
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage:
              `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) ${Math.round(
                vignetteStrength * 100
              )}%, rgba(0,0,0,0) 100%)`,
            maskImage:
              `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) ${Math.round(
                vignetteStrength * 100
              )}%, rgba(0,0,0,0) 100%)`,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent, rgba(255,255,255,0.05))",
          }}
        />
      )}
    </div>
  );
}