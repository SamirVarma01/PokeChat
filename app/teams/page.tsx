import Link from "next/link"
import { ExternalLink, Trophy } from "lucide-react"
import { pokemonHref } from "@/lib/pokemon-types"
import { RULESET_SUMMARY } from "@/lib/format"

interface TopTeam {
  rank: number
  author: string
  record: string
  tournament: string
  pokemon: string[]
}

interface MetaResponse {
  format: { name: string; code: string }
  top_teams: TopTeam[]
  source_url: string
}

async function getTopTeams(): Promise<MetaResponse | null> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
  try {
    const response = await fetch(`${backendUrl}/pikalytics-usage`, { next: { revalidate: 21600 } })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

export default async function TopTeamsPage() {
  const data = await getTopTeams()
  const teams = data?.top_teams ?? []
  const formatName = data?.format?.name ?? "Current regulation"

  return (
    <div className="relative w-full max-w-[1600px] mx-auto px-margin md:px-margin-desktop py-space-lg overflow-hidden">
      <div className="absolute -top-10 left-1/3 w-96 h-96 bg-gold-tier-s/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-xl relative">
        <div>
          <div className="flex flex-wrap items-center gap-space-sm mb-space-xs">
            <span className="font-badge-tag text-badge-tag px-space-sm py-0.5 rounded bg-gold-tier-s/20 text-gold-tier-s uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3 h-3" />
              Tournament results
            </span>
            <span className="text-text-tertiary font-label-mono text-label-mono uppercase">{RULESET_SUMMARY}</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-text-primary tracking-tight">
            Recent winning teams
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-space-xs max-w-2xl">
            Rosters that placed in recent {formatName} events. Click any Pokémon for its usage, sets and common
            partners.
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="bg-surface-card rounded-xl p-space-xl shadow-xl text-center">
          <p className="font-label-mono text-label-mono text-text-tertiary uppercase tracking-wider">
            No tournament teams available right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg relative">
          {teams.map((team) => (
            <div
              key={`${team.rank}-${team.author}`}
              className="bg-surface-card rounded-xl p-space-lg shadow-xl flex flex-col gap-space-md hover:bg-surface-elevated/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center font-stat-metric text-stat-metric text-gold-tier-s flex-shrink-0">
                    #{team.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="font-headline-sm text-headline-sm text-text-primary truncate">{team.author}</div>
                    <div className="font-label-mono text-label-mono text-text-tertiary truncate">
                      {team.tournament}
                    </div>
                  </div>
                </div>
                <span className="font-badge-tag text-badge-tag px-2 py-1 rounded bg-status-grass/15 text-status-grass flex-shrink-0">
                  {team.record}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-xs">
                {team.pokemon.map((mon, index) => (
                  <Link
                    key={`${mon}-${index}`}
                    href={pokemonHref(mon)}
                    className="bg-surface-canvas hover:bg-surface-elevated p-space-sm rounded transition-colors flex flex-col gap-0.5"
                  >
                    <span className="font-badge-tag text-badge-tag text-text-tertiary">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-label-md text-label-md text-text-primary truncate">{mon}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <a
        href={data?.source_url ?? "https://www.pikalytics.com/topteams"}
        target="_blank"
        rel="noopener noreferrer"
        className="font-label-mono text-label-mono text-text-tertiary hover:text-synergy-cyan transition-colors flex items-center gap-1.5 w-fit mt-space-lg relative"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Full teamlists on Pikalytics
      </a>
    </div>
  )
}
