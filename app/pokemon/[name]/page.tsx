import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, Shield, Swords, Users } from "lucide-react"
import { pokemonHref, typeChipClass } from "@/lib/pokemon-types"

interface UsageEntry {
  name: string
  percent: number
}

interface DexResponse {
  detail: {
    name: string
    weaknesses: string[]
    resistances: string[]
    immunities: string[]
    base_stats: Record<string, number>
    bst: number | null
    common_moves: UsageEntry[]
    common_items: UsageEntry[]
    common_abilities: UsageEntry[]
    common_teammates: UsageEntry[]
  }
  usage: { usage: number; rank: number; win_rate: number | null; record: string | null } | null
  format: { name: string; code: string }
  source_url: string
}

async function getPokemon(name: string): Promise<DexResponse | null> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
  try {
    const response = await fetch(`${backendUrl}/pokemon/${encodeURIComponent(name)}`, {
      next: { revalidate: 21600 },
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

// Highest base stat in the games, so bars stay comparable across Pokemon.
const MAX_BASE_STAT = 180

export default async function PokemonPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const data = await getPokemon(decodeURIComponent(name))

  if (!data) notFound()

  const { detail, usage, format, source_url } = data

  return (
    <div className="relative w-full max-w-[1600px] mx-auto px-margin md:px-margin-desktop py-space-lg overflow-hidden">
      <div className="absolute -top-10 right-1/4 w-96 h-96 bg-synergy-cyan/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-col gap-space-md mb-space-xl relative">
        <Link
          href="/meta"
          className="font-label-mono text-label-mono text-text-tertiary hover:text-synergy-cyan transition-colors flex items-center gap-1.5 w-fit uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to meta rankings
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
          <div>
            <div className="font-badge-tag text-badge-tag uppercase tracking-widest text-synergy-cyan mb-space-xs">
              {format.name}
            </div>
            <h1 className="font-headline-xl text-headline-xl text-text-primary tracking-tight">{detail.name}</h1>
          </div>

          {usage && (
            <div className="flex flex-wrap items-center gap-space-sm">
              <Stat label="Rank" value={`#${usage.rank}`} className="text-gold-tier-s" />
              <Stat label="Usage" value={`${usage.usage.toFixed(1)}%`} className="text-synergy-cyan" />
              <Stat
                label="Win rate"
                value={usage.win_rate != null ? `${usage.win_rate.toFixed(1)}%` : "—"}
                className={usage.win_rate != null && usage.win_rate >= 50 ? "text-status-grass" : "text-threat-crimson"}
              />
              <Stat label="Record" value={usage.record ?? "—"} className="text-text-secondary" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter-desktop items-start relative">
        {/* LEFT: defensive profile + stats */}
        <div className="xl:col-span-5 flex flex-col gap-space-lg">
          <Panel title="Defensive matchups" eyebrow="Type chart" icon={<Shield className="w-5 h-5 text-text-tertiary" />}>
            <TypeRow label="Weak to" types={detail.weaknesses} emptyText="No weaknesses" />
            <TypeRow label="Resists" types={detail.resistances} emptyText="No resistances" />
            <TypeRow label="Immune to" types={detail.immunities} emptyText="No immunities" />
          </Panel>

          <Panel title="Base stats" eyebrow={detail.bst ? `BST ${detail.bst}` : "Stats"} icon={null}>
            <div className="flex flex-col gap-space-sm">
              {Object.entries(detail.base_stats).map(([stat, value]) => (
                <div key={stat} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-label-mono text-label-mono">
                    <span className="text-text-secondary">{stat}</span>
                    <span className="text-text-primary font-stat-metric text-stat-metric">{value}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-deep overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-synergy-cyan to-primary-container"
                      style={{ width: `${Math.min(100, (value / MAX_BASE_STAT) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* RIGHT: usage breakdowns */}
        <div className="xl:col-span-7 flex flex-col gap-space-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            <Panel title="Common moves" eyebrow="Movesets" icon={<Swords className="w-5 h-5 text-text-tertiary" />}>
              <PercentList entries={detail.common_moves} accent="bg-synergy-cyan" />
            </Panel>
            <Panel title="Common items" eyebrow="Held items" icon={null}>
              <PercentList entries={detail.common_items} accent="bg-gold-tier-s" />
            </Panel>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            <Panel title="Common abilities" eyebrow="Abilities" icon={null}>
              <PercentList entries={detail.common_abilities} accent="bg-purple-tier-a" />
            </Panel>
            <Panel title="Common teammates" eyebrow="Pairings" icon={<Users className="w-5 h-5 text-text-tertiary" />}>
              <div className="flex flex-col gap-space-xs">
                {detail.common_teammates.length === 0 && (
                  <span className="font-label-mono text-label-mono text-text-tertiary">No teammate data.</span>
                )}
                {detail.common_teammates.map((mate) => (
                  <Link
                    key={mate.name}
                    href={pokemonHref(mate.name)}
                    className="flex items-center justify-between bg-surface-canvas hover:bg-surface-elevated p-space-sm rounded transition-colors"
                  >
                    <span className="font-label-md text-label-md text-text-primary">{mate.name}</span>
                    <span className="font-stat-metric text-stat-metric text-status-grass">
                      {mate.percent.toFixed(1)}%
                    </span>
                  </Link>
                ))}
              </div>
            </Panel>
          </div>

          <a
            href={source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label-mono text-label-mono text-text-tertiary hover:text-synergy-cyan transition-colors flex items-center gap-1.5 w-fit"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Full data on Pikalytics
          </a>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, className }: { label: string; value: string; className: string }) {
  return (
    <div className="bg-surface-card px-space-md py-space-xs rounded shadow-sm">
      <div className="font-badge-tag text-badge-tag uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className={`font-stat-metric text-stat-metric ${className}`}>{value}</div>
    </div>
  )
}

function Panel({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string
  eyebrow: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface-card rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-badge-tag text-badge-tag uppercase tracking-widest text-synergy-cyan">{eyebrow}</span>
          <h2 className="font-headline-md text-headline-md text-text-primary">{title}</h2>
        </div>
        {icon}
      </div>
      {children}
    </div>
  )
}

function TypeRow({ label, types, emptyText }: { label: string; types: string[]; emptyText: string }) {
  return (
    <div className="flex flex-col gap-space-xs">
      <span className="font-label-mono text-label-mono uppercase tracking-wider text-text-tertiary">{label}</span>
      <div className="flex flex-wrap gap-space-xs">
        {types.length === 0 ? (
          <span className="font-label-mono text-label-mono text-text-tertiary">{emptyText}</span>
        ) : (
          types.map((type) => (
            <span
              key={type}
              className={`px-2 py-1 rounded font-badge-tag text-badge-tag uppercase tracking-wider ${typeChipClass(type)}`}
            >
              {type}
            </span>
          ))
        )}
      </div>
    </div>
  )
}

function PercentList({ entries, accent }: { entries: UsageEntry[]; accent: string }) {
  if (entries.length === 0) {
    return <span className="font-label-mono text-label-mono text-text-tertiary">No data available.</span>
  }

  return (
    <div className="flex flex-col gap-space-sm">
      {entries.slice(0, 8).map((entry) => (
        <div key={entry.name} className="flex flex-col gap-1">
          <div className="flex items-center justify-between font-label-mono text-label-mono">
            <span className="text-text-primary">{entry.name}</span>
            <span className="text-text-secondary">{entry.percent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-deep overflow-hidden">
            <div className={`h-full rounded-full ${accent}`} style={{ width: `${Math.min(100, entry.percent)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
