import { RULESET_SUMMARY, type FormatInfo } from "@/lib/format"

export function SiteFooter({ format }: { format: FormatInfo }) {
  return (
    <footer className="w-full bg-surface-card py-space-lg shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1600px] mx-auto px-margin md:px-margin-desktop flex flex-col md:flex-row md:items-center justify-between gap-space-md text-text-tertiary font-label-mono text-label-mono">
        <div>
          <div className="flex flex-wrap items-center gap-space-sm mb-1">
            <span className="w-2 h-2 rounded-full bg-synergy-cyan shadow-[0_0_6px_rgba(0,242,254,0.6)]" />
            <span className="text-text-primary uppercase tracking-wider font-semibold">{format.name}</span>
            <span className="text-border-neon">|</span>
            <span>{RULESET_SUMMARY}</span>
          </div>
          <p className="font-body-sm text-body-sm text-text-tertiary max-w-xl">
            PokeChat is an analysis suite for Pokémon Champions players. Unaffiliated with Nintendo, Creatures, or Game
            Freak.
          </p>
        </div>
        <div className="flex items-center gap-space-md text-on-surface-variant">
          <span className="text-text-secondary">Usage data:</span>
          <a
            href="https://www.pikalytics.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-synergy-cyan font-stat-metric text-stat-metric hover:underline"
          >
            Pikalytics
          </a>
        </div>
      </div>
    </footer>
  )
}
