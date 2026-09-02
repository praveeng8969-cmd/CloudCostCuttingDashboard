'use client'

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'

interface PageBgConfig {
  opacity: number
  position: string
  gradientOverlay?: string
}

// Default fallback for any unrecognised route
const DEFAULT_CONFIG: PageBgConfig = {
  opacity: 0.20,
  position: 'right bottom',
  gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.18), rgba(248, 250, 252, 0.32))',
}

// Per-route fine-tuning
// Opacities bumped ~30% from previous values; overlays reduced from 0.40–0.65 → 0.15–0.50
const ROUTE_CONFIGS: Record<string, PageBgConfig> = {
  '/login': {
    // 26% → 34%  |  overlays 0.40/0.65 → 0.22/0.42
    opacity: 0.34,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.22), rgba(248, 250, 252, 0.42))',
  },
  '/import': {
    // 20% → 28%  |  overlays 0.30/0.50 → 0.18/0.36
    opacity: 0.28,
    position: 'center right',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.18), rgba(248, 250, 252, 0.36))',
  },
  '/dashboard': {
    // 16% → 22%  |  overlays 0.20/0.40 → 0.14/0.28
    opacity: 0.22,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.14), rgba(248, 250, 252, 0.28))',
  },
  '/storage': {
    // 13% → 19%
    opacity: 0.19,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
  '/storage-analysis': {
    opacity: 0.19,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
  '/cost-analysis': {
    // 13% → 19%
    opacity: 0.19,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.14), rgba(248, 250, 252, 0.28))',
  },
  '/recommendations': {
    // 14% → 20%
    opacity: 0.20,
    position: 'center right',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.14), rgba(248, 250, 252, 0.28))',
  },
  '/duplicates': {
    // 13% → 19%
    opacity: 0.19,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
  '/reports': {
    // 11% → 17%
    opacity: 0.17,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
  '/cloud-providers': {
    // 13% → 19%
    opacity: 0.19,
    position: 'center right',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.14), rgba(248, 250, 252, 0.28))',
  },
  '/settings': {
    // 11% → 17%
    opacity: 0.17,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
  '/admin/dashboard': {
    // 11% → 17%  — admin is more data-heavy, keep slightly more restrained
    opacity: 0.17,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
  '/admin/users': {
    // 11% → 17%
    opacity: 0.17,
    position: 'center right',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
  '/admin/reports': {
    // 10% → 16%
    opacity: 0.16,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
  '/admin/settings': {
    // 10% → 16%
    opacity: 0.16,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
  },
}

export default function CloudCutBackground() {
  const pathname = usePathname()

  const config = useMemo(() => {
    if (!pathname) return DEFAULT_CONFIG
    // /admin/users/[id]
    if (pathname.startsWith('/admin/users/')) {
      return {
        opacity: 0.18,
        position: 'right bottom',
        gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.16), rgba(248, 250, 252, 0.30))',
      }
    }
    return ROUTE_CONFIGS[pathname] || DEFAULT_CONFIG
  }, [pathname])

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base Canvas — #F8FAFC neutral slate */}
      <div className="absolute inset-0 bg-[#F8FAFC]" />

      {/* Layer 1 — Official CloudCut cloud-storage artwork */}
      <div
        className="absolute inset-0 bg-no-repeat transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: "url('/images/cloud-storage-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: config.position,
          opacity: config.opacity,
        }}
      />

      {/* Layer 2 — Lightweight readability gradient overlay */}
      {config.gradientOverlay && (
        <div
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{ background: config.gradientOverlay }}
        />
      )}
    </div>
  )
}
