'use client'

import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'

interface PageBgConfig {
  opacity: number
  position: string
  gradientOverlay?: string
}

const DEFAULT_CONFIG: PageBgConfig = {
  opacity: 0.14,
  position: 'right bottom',
}

const ROUTE_CONFIGS: Record<string, PageBgConfig> = {
  '/login': {
    opacity: 0.26,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.40), rgba(248, 250, 252, 0.65))',
  },
  '/import': {
    opacity: 0.20,
    position: 'center right',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.30), rgba(248, 250, 252, 0.50))',
  },
  '/dashboard': {
    opacity: 0.16,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.20), rgba(248, 250, 252, 0.40))',
  },
  '/storage': {
    opacity: 0.13,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
  '/storage-analysis': {
    opacity: 0.13,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
  '/cost-analysis': {
    opacity: 0.13,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.20), rgba(248, 250, 252, 0.40))',
  },
  '/recommendations': {
    opacity: 0.14,
    position: 'center right',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.20), rgba(248, 250, 252, 0.40))',
  },
  '/duplicates': {
    opacity: 0.13,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
  '/reports': {
    opacity: 0.11,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
  '/cloud-providers': {
    opacity: 0.13,
    position: 'center right',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.20), rgba(248, 250, 252, 0.40))',
  },
  '/settings': {
    opacity: 0.11,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
  '/admin/dashboard': {
    opacity: 0.11,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
  '/admin/users': {
    opacity: 0.11,
    position: 'center right',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
  '/admin/reports': {
    opacity: 0.10,
    position: 'center center',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
  '/admin/settings': {
    opacity: 0.10,
    position: 'right bottom',
    gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
  },
}

export default function CloudCutBackground() {
  const pathname = usePathname()

  const config = useMemo(() => {
    if (!pathname) return DEFAULT_CONFIG
    if (pathname.startsWith('/admin/users/')) {
      return {
        opacity: 0.12,
        position: 'right bottom',
        gradientOverlay: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.25), rgba(248, 250, 252, 0.45))',
      }
    }
    return ROUTE_CONFIGS[pathname] || DEFAULT_CONFIG
  }, [pathname])

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Base Canvas */}
      <div className="absolute inset-0 bg-[#F8FAFC]" />

      {/* Layer 1: Official CloudCut Cloud Storage Background Image */}
      <div
        className="absolute inset-0 bg-no-repeat transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: "url('/images/cloud-storage-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: config.position,
          opacity: config.opacity,
        }}
      />

      {/* Layer 2: Subtle Readability Gradient Overlay */}
      {config.gradientOverlay && (
        <div
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{ background: config.gradientOverlay }}
        />
      )}
    </div>
  )
}
