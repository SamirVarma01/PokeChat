"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap } from "lucide-react"
import { formatBadge, type FormatInfo } from "@/lib/format"

export function SiteHeader({ format }: { format: FormatInfo }) {
  const pathname = usePathname()
  const badge = formatBadge(format.name)

  const navItems = [
    { href: "/", label: "Overview", badge: null, badgeClass: "" },
    { href: "/analyzer", label: "Team Analyzer", badge: "AI", badgeClass: "bg-threat-crimson/20 text-threat-crimson" },
    { href: "/meta", label: "Meta Trends", badge, badgeClass: "bg-primary-container/20 text-primary-container" },
    { href: "/teams", label: "Top Teams", badge: null, badgeClass: "" },
  ]

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-card/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      <div className="h-16 max-w-[1600px] mx-auto px-margin md:px-margin-desktop flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-lg min-w-0">
          <Link href="/" className="flex items-center gap-space-sm flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <Zap className="w-5 h-5 text-on-primary-container" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm uppercase tracking-wider text-text-primary leading-none">
                PokeChat
              </span>
              <span className="font-badge-tag text-badge-tag uppercase tracking-widest text-synergy-cyan mt-0.5">
                VGC Tactical HUD
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-space-xs">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`font-label-md text-label-md px-space-md py-space-sm rounded-lg transition-all flex items-center gap-space-xs ${
                    isActive
                      ? "bg-surface-elevated text-synergy-cyan shadow-[0_0_12px_rgba(0,242,254,0.15)]"
                      : "text-on-surface-variant hover:bg-surface-elevated hover:text-on-surface"
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className={`font-badge-tag text-badge-tag px-1.5 py-0.5 rounded ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-space-xs px-space-md py-space-xs rounded bg-surface-canvas flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-status-grass shadow-[0_0_8px_rgba(46,213,115,0.8)]" />
          <span className="font-label-mono text-label-mono uppercase tracking-wider text-text-primary">
            {format.name}
          </span>
        </div>
      </div>
    </header>
  )
}
