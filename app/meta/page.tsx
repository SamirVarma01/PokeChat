"use client"

import { useState, useEffect, useMemo } from "react"
import { AlertTriangle, BarChart3, Crown, Hash, Layers, Link2, RefreshCw, Search, TrendingUp } from "lucide-react"
import { formatBadge, RULESET_SUMMARY } from "@/lib/format"

interface PokemonUsage {
  name: string
  usage: number
  rank: number
  win_rate?: number | null
  record?: string | null
}

interface TeamCore {
  members: string[]
  teams: number
  usage: number
}

interface MetaResponse {
  format: { name: string; code: string; game: string; data_date: string }
  pokemon: PokemonUsage[]
  cores: TeamCore[]
  source_url: string
}

// Bands are tuned to a top-50 tournament sample, where the leader sits near 35-40%.
const TIERS = [
  { key: "S", label: "S Tier", threshold: 30, range: "30%+", bar: "bg-gold-tier-s", text: "text-gold-tier-s", chip: "bg-gold-tier-s text-surface-deep", glow: "shadow-[0_0_12px_rgba(255,209,102,0.6)]" },
  { key: "A+", label: "A+ Tier", threshold: 20, range: "20 – 29.9%", bar: "bg-purple-tier-a", text: "text-purple-tier-a", chip: "bg-purple-tier-a text-surface-deep", glow: "shadow-[0_0_12px_rgba(168,85,247,0.5)]" },
  { key: "A", label: "A Tier", threshold: 12, range: "12 – 19.9%", bar: "bg-primary-container", text: "text-primary-container", chip: "bg-primary-container text-surface-deep", glow: "shadow-[0_0_10px_rgba(0,229,255,0.4)]" },
  { key: "A-", label: "A- Tier", threshold: 8, range: "8 – 11.9%", bar: "bg-primary-fixed-dim", text: "text-primary-fixed-dim", chip: "bg-primary-fixed-dim text-surface-deep", glow: "" },
  { key: "B+", label: "B+ Tier", threshold: 4, range: "4 – 7.9%", bar: "bg-status-grass", text: "text-status-grass", chip: "bg-status-grass text-surface-deep", glow: "" },
  { key: "B", label: "B Tier", threshold: 0, range: "Under 4%", bar: "bg-text-tertiary", text: "text-text-tertiary", chip: "bg-surface-variant text-on-surface", glow: "" },
] as const

const tierFor = (usage: number) => TIERS.find((tier) => usage >= tier.threshold) ?? TIERS[TIERS.length - 1]

const WIN_RATE_MIN_USAGE = 10

const winRateClass = (winRate?: number | null) => {
  if (winRate == null) return "text-text-tertiary"
  if (winRate >= 51) return "text-status-grass"
  if (winRate < 49) return "text-threat-crimson"
  return "text-text-secondary"
}

export default function MetaAnalysis() {
  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const fetchUsageData = async (refresh = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/pikalytics-usage${refresh ? "?refresh=true" : ""}`)
      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const data = await response.json()
      setMeta(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageData()
  }, [])

  const pokemonData = meta?.pokemon ?? []
  const cores = meta?.cores ?? []
  const formatName = meta?.format?.name ?? "Current regulation"

  const tierCounts = useMemo(
    () =>
      TIERS.map((tier) => ({
        ...tier,
        count: pokemonData.filter((pokemon) => tierFor(pokemon.usage).key === tier.key).length,
      })),
    [pokemonData],
  )

  const maxTierCount = Math.max(1, ...tierCounts.map((tier) => tier.count))
  const topSix = pokemonData.slice(0, 6)
  const leader = pokemonData[0]
  const sTierCount = tierCounts.find((tier) => tier.key === "S")?.count ?? 0
  // Win rate on a thin sample is noise, so only rank Pokemon with real representation.
  const bestWinRate = useMemo(
    () =>
      pokemonData
        .filter((p) => p.usage >= WIN_RATE_MIN_USAGE)
        .reduce<PokemonUsage | null>(
          (best, p) => (p.win_rate != null && (!best || p.win_rate > (best.win_rate ?? 0)) ? p : best),
          null,
        ),
    [pokemonData],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return pokemonData
    return pokemonData.filter((pokemon) => pokemon.name.toLowerCase().includes(needle))
  }, [pokemonData, query])

  return (
    <div className="flex flex-col w-full">
      {/* HEADER STRIP */}
      <section className="w-full bg-surface-canvas/90 backdrop-blur-md px-margin md:px-margin-desktop py-space-lg shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-purple-tier-a/10 blur-3xl pointer-events-none" />

        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-space-md relative">
          <div>
            <div className="flex flex-wrap items-center gap-space-sm mb-space-xs">
              <span className="font-badge-tag text-badge-tag px-space-sm py-0.5 rounded bg-primary-container/20 text-synergy-cyan uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-grass shadow-[0_0_8px_rgba(46,213,115,0.9)] animate-pulse" />
                Live from Pikalytics
              </span>
              <span className="text-text-tertiary font-label-mono text-label-mono uppercase">{RULESET_SUMMARY}</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl tracking-tight text-text-primary">
              {formatName} Metagame
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm font-label-mono text-label-mono">
            <div className="bg-surface-elevated px-space-md py-space-xs rounded flex items-center gap-space-xs text-text-secondary shadow-sm">
              <Layers className="w-4 h-4 text-synergy-cyan" />
              <span>Top {pokemonData.length} by usage</span>
            </div>
            <button
              type="button"
              onClick={() => fetchUsageData(true)}
              disabled={isLoading}
              className="bg-surface-elevated hover:bg-surface-variant text-text-primary px-space-md py-space-xs rounded flex items-center gap-space-xs transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-primary-container ${isLoading ? "animate-spin" : ""}`} />
              <span>Re-sync dataset</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[1600px] w-full mx-auto px-margin md:px-margin-desktop py-space-xl flex flex-col gap-space-2xl">
        {error && (
          <div className="bg-surface-card rounded-xl p-space-md shadow-lg flex items-center gap-space-sm">
            <AlertTriangle className="w-5 h-5 text-threat-crimson" />
            <span className="font-label-mono text-label-mono text-threat-crimson">{error}</span>
          </div>
        )}

        {isLoading && pokemonData.length === 0 ? (
          <div className="py-space-2xl flex flex-col items-center gap-space-md">
            <span className="w-10 h-10 rounded-full border-2 border-synergy-cyan border-b-transparent animate-spin" />
            <p className="font-label-mono text-label-mono text-text-tertiary uppercase tracking-wider">
              Loading usage data
            </p>
          </div>
        ) : (
          <>
            {/* KPI CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              <KpiCard
                label="Most used"
                icon={<Crown className="w-5 h-5 text-gold-tier-s" />}
                value={leader ? `${leader.usage.toFixed(1)}%` : "—"}
                highlight={leader?.name ?? "No data"}
                highlightClass="text-gold-tier-s"
                note="Highest usage in the current sample"
                glow="bg-status-electric/5"
              />
              <KpiCard
                label="Best win rate"
                icon={<TrendingUp className="w-5 h-5 text-status-grass" />}
                value={bestWinRate?.win_rate != null ? `${bestWinRate.win_rate.toFixed(1)}%` : "—"}
                highlight={bestWinRate?.name ?? "No data"}
                highlightClass="text-status-grass"
                note={`Best record among Pokémon above ${WIN_RATE_MIN_USAGE}% usage`}
                glow="bg-status-grass/5"
              />
              <KpiCard
                label={`S tier (${TIERS[0].range})`}
                icon={<Hash className="w-5 h-5 text-synergy-cyan" />}
                value={String(sTierCount)}
                highlight={formatBadge(formatName)}
                highlightClass="text-synergy-cyan"
                note="Pokémon defining the top of the format"
                glow="bg-synergy-cyan/5"
              />
              <KpiCard
                label="Top core"
                icon={<BarChart3 className="w-5 h-5 text-purple-tier-a" />}
                value={cores[0] ? `${cores[0].usage.toFixed(1)}%` : "—"}
                highlight={cores[0]?.members.join(" + ") ?? "No data"}
                highlightClass="text-purple-tier-a"
                note={cores[0] ? `Seen on ${cores[0].teams} sampled teams` : "Awaiting core data"}
                glow="bg-purple-tier-a/5"
              />
            </section>

            {/* TIER DISTRIBUTION + PODIUM */}
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
              <div className="xl:col-span-5 flex flex-col gap-space-lg">
                <div className="bg-surface-card rounded-xl p-space-lg shadow-xl flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-badge-tag text-badge-tag uppercase tracking-widest text-synergy-cyan">
                        Distribution matrix
                      </span>
                      <h2 className="font-headline-md text-headline-md text-text-primary">Tier usage breakdown</h2>
                    </div>
                    <BarChart3 className="w-5 h-5 text-text-tertiary" />
                  </div>

                  <div className="flex flex-col gap-space-md">
                    {tierCounts.map((tier) => (
                      <div key={tier.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between font-label-mono text-label-mono">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded font-bold ${tier.chip}`}>{tier.label}</span>
                            <span className="text-text-secondary">{tier.range}</span>
                          </div>
                          <span className={`${tier.text} font-stat-metric text-stat-metric`}>
                            {tier.count} {tier.count === 1 ? "mon" : "mons"}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-deep overflow-hidden">
                          <div
                            className={`h-full rounded-full ${tier.bar} ${tier.glow}`}
                            style={{ width: tier.count ? `${Math.max(4, (tier.count / maxTierCount) * 100)}%` : "0%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COMMON CORES */}
                <div className="bg-surface-card rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-badge-tag text-badge-tag uppercase tracking-widest text-gold-tier-s">
                        Pair frequency
                      </span>
                      <h2 className="font-headline-md text-headline-md text-text-primary">Most common cores</h2>
                    </div>
                    <Link2 className="w-5 h-5 text-text-tertiary" />
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    {cores.length === 0 && (
                      <span className="font-label-mono text-label-mono text-text-tertiary">No core data available.</span>
                    )}
                    {cores.map((core, index) => (
                      <div
                        key={core.members.join("-")}
                        className="flex items-center justify-between bg-surface-canvas p-space-sm rounded"
                      >
                        <div className="flex items-center gap-space-sm min-w-0">
                          <span className="font-badge-tag text-badge-tag text-text-tertiary">
                            #{String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-label-md text-label-md text-text-primary truncate">
                            {core.members.join(" + ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-sm flex-shrink-0">
                          <span className="font-label-mono text-label-mono text-text-tertiary">{core.teams} teams</span>
                          <span className="font-stat-metric text-stat-metric text-gold-tier-s">
                            {core.usage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-7 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-badge-tag text-badge-tag uppercase tracking-widest text-gold-tier-s">
                      Tournament pillars
                    </span>
                    <h2 className="font-headline-md text-headline-md text-text-primary">Most used Pokémon (top 6)</h2>
                  </div>
                  <span className="font-label-mono text-label-mono text-text-tertiary hidden sm:inline-block">
                    Sorted by usage %
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
                  {topSix.map((pokemon, index) => {
                    const tier = tierFor(pokemon.usage)
                    return (
                      <div
                        key={pokemon.name}
                        className="bg-surface-card rounded-xl p-space-md flex flex-col gap-space-sm shadow-xl hover:-translate-y-1 transition-transform relative overflow-hidden"
                      >
                        <div className={`absolute top-0 right-0 px-3 py-1 font-stat-metric text-xs font-bold rounded-bl-lg shadow-md ${tier.chip}`}>
                          #{index + 1}
                        </div>
                        <div className="flex items-center gap-space-sm pr-10">
                          <div className="w-12 h-12 rounded-lg bg-surface-canvas flex-shrink-0 flex items-center justify-center font-stat-metric text-stat-metric text-text-tertiary">
                            {pokemon.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-headline-sm text-headline-sm text-text-primary truncate">
                              {pokemon.name}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded font-badge-tag text-badge-tag w-fit ${tier.chip}`}>
                              {tier.key}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between pt-space-xs">
                          <div className="flex flex-col">
                            <span className="font-badge-tag text-badge-tag uppercase text-text-tertiary">
                              Usage rate
                            </span>
                            <span className={`font-stat-display text-stat-display ${tier.text}`}>
                              {pokemon.usage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex flex-col text-right font-label-mono text-label-mono">
                            <span className="text-text-tertiary">Win rate</span>
                            <span className={winRateClass(pokemon.win_rate)}>
                              {pokemon.win_rate != null ? `${pokemon.win_rate.toFixed(1)}%` : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* FULL RANKINGS TABLE */}
            <section className="bg-surface-card rounded-xl p-space-lg shadow-xl flex flex-col gap-space-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
                <div>
                  <span className="font-badge-tag text-badge-tag uppercase tracking-widest text-synergy-cyan">
                    Full dataset
                  </span>
                  <h2 className="font-headline-md text-headline-md text-text-primary">Complete usage rankings</h2>
                </div>
                <div className="relative w-full lg:w-96">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter Pokémon by name..."
                    className="w-full bg-surface-canvas rounded-lg pl-9 pr-4 py-2 font-label-mono text-label-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-elevated transition-colors"
                  />
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="font-label-mono text-label-mono text-text-tertiary uppercase bg-surface-elevated/40">
                      <th className="py-3 px-space-md">Rank</th>
                      <th className="py-3 px-space-md">Pokémon</th>
                      <th className="py-3 px-space-md text-center">Tier</th>
                      <th className="py-3 px-space-md">Usage %</th>
                      <th className="py-3 px-space-md">Win rate</th>
                      <th className="py-3 px-space-md hidden lg:table-cell">Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-elevated/30 font-body-sm text-body-sm">
                    {filtered.map((pokemon) => {
                      const tier = tierFor(pokemon.usage)
                      return (
                        <tr key={pokemon.name} className="hover:bg-surface-elevated/50 transition-colors">
                          <td className={`py-3.5 px-space-md font-stat-metric font-bold ${tier.text}`}>
                            #{String(pokemon.rank).padStart(2, "0")}
                          </td>
                          <td className="py-3.5 px-space-md font-headline-sm text-sm text-text-primary font-bold">
                            {pokemon.name}
                          </td>
                          <td className="py-3.5 px-space-md text-center">
                            <span className={`px-2 py-0.5 rounded font-bold font-badge-tag ${tier.chip}`}>
                              {tier.key}
                            </span>
                          </td>
                          <td className="py-3.5 px-space-md">
                            <div className="flex items-center gap-space-sm">
                              <span className="font-stat-metric text-text-primary w-14">
                                {pokemon.usage.toFixed(1)}%
                              </span>
                              <div className="w-24 h-1.5 rounded-full bg-surface-deep hidden md:block overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${tier.bar}`}
                                  style={{ width: `${Math.min(100, pokemon.usage)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className={`py-3.5 px-space-md font-stat-metric ${winRateClass(pokemon.win_rate)}`}>
                            {pokemon.win_rate != null ? `${pokemon.win_rate.toFixed(1)}%` : "—"}
                          </td>
                          <td className="py-3.5 px-space-md font-label-mono text-label-mono text-text-tertiary hidden lg:table-cell">
                            {pokemon.record ?? "—"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="py-space-xl text-center font-label-mono text-label-mono text-text-tertiary">
                    No Pokémon match “{query}”.
                  </div>
                )}
              </div>

              <p className="font-label-mono text-label-mono text-text-tertiary">
                Sampled from recent qualifying tournaments. Source:{" "}
                <a
                  href={meta?.source_url ?? "https://www.pikalytics.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-synergy-cyan hover:underline"
                >
                  Pikalytics
                </a>
                .
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  icon,
  value,
  highlight,
  highlightClass,
  note,
  glow,
}: {
  label: string
  icon: React.ReactNode
  value: string
  highlight: string
  highlightClass: string
  note: string
  glow: string
}) {
  return (
    <div className="bg-surface-card rounded-xl p-space-lg flex flex-col justify-between shadow-xl relative overflow-hidden hover:bg-surface-elevated transition-colors">
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-xl ${glow}`} />
      <div className="flex items-center justify-between mb-space-sm relative">
        <span className="font-label-mono text-label-mono uppercase tracking-wider text-text-tertiary">{label}</span>
        {icon}
      </div>
      <div className="relative">
        <div className="font-stat-display text-stat-display text-text-primary mb-1">{value}</div>
        <div className={`font-body-md text-body-md font-medium truncate ${highlightClass}`}>{highlight}</div>
        <span className="font-label-mono text-label-mono text-text-tertiary">{note}</span>
      </div>
    </div>
  )
}
