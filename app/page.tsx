import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Gauge,
  Layers,
  LineChart,
  Link2,
  ListOrdered,
  Sparkles,
  Terminal,
  TrendingUp,
} from "lucide-react"
import { QuickAnalyzeDock } from "@/components/quick-analyze-dock"
import { formatBadge, getCurrentFormat, RULESET_SUMMARY } from "@/lib/format"

export default async function HomePage() {
  const format = await getCurrentFormat()
  const badge = formatBadge(format.name)

  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[340px] bg-gradient-to-b from-synergy-cyan/15 via-primary-container/5 to-transparent blur-3xl pointer-events-none" />

        <section className="max-w-[1600px] mx-auto px-margin md:px-margin-desktop pt-space-xl pb-space-2xl w-full relative">
          <div className="inline-flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-surface-card shadow-sm mb-space-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-threat-crimson opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-threat-crimson" />
            </span>
            <span className="font-label-mono text-label-mono uppercase tracking-wider text-text-primary">
              Tracking {format.name} · usage synced from Pikalytics
            </span>
            <span className="font-badge-tag text-badge-tag px-1.5 py-0.5 rounded bg-surface-elevated text-synergy-cyan">
              {badge}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            {/* LEFT: copy + actions */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <div className="font-label-mono text-label-mono uppercase tracking-widest text-synergy-cyan mb-space-xs flex items-center gap-space-xs">
                <Terminal className="w-4 h-4" />
                <span>AI Battle-Room Intelligence</span>
              </div>

              <h1 className="font-headline-xl text-headline-xl text-text-primary tracking-tight mb-space-md leading-tight">
                Master Your VGC Team With AI-Powered Analysis
              </h1>

              <p className="font-body-lg text-body-lg text-text-secondary mb-space-xl max-w-xl">
                Paste a Pokémon Showdown export or a Pokepaste link and get a structured read on your team: overall
                grade, the threats that beat you, what your core does well, and what to change before the next
                tournament.
              </p>

              <div className="flex flex-wrap items-center gap-space-md w-full sm:w-auto">
                <Link
                  href="/analyzer"
                  className="inline-flex items-center justify-center gap-space-sm bg-primary-container text-on-primary-container font-label-md text-label-md px-space-lg py-3 rounded-lg shadow-xl shadow-primary-container/20 hover:brightness-110 transition-all"
                >
                  <span>Analyze My Team</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/meta"
                  className="inline-flex items-center justify-center gap-space-sm bg-surface-card hover:bg-surface-elevated text-text-primary font-label-md text-label-md px-space-lg py-3 rounded-lg shadow-sm transition-all"
                >
                  <LineChart className="w-4 h-4 text-synergy-cyan" />
                  <span>View Meta Trends</span>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-space-md mt-space-2xl pt-space-md w-full max-w-lg bg-surface-card/60 p-space-md rounded-xl backdrop-blur-md">
                <div>
                  <div className="font-badge-tag text-badge-tag text-text-tertiary uppercase">Format</div>
                  <div className="font-stat-metric text-stat-metric text-synergy-cyan mt-0.5">{format.name}</div>
                </div>
                <div>
                  <div className="font-badge-tag text-badge-tag text-text-tertiary uppercase">Ruleset</div>
                  <div className="font-stat-metric text-stat-metric text-gold-tier-s mt-0.5">Bring 6, pick 4</div>
                </div>
                <div>
                  <div className="font-badge-tag text-badge-tag text-text-tertiary uppercase">Engine</div>
                  <div className="font-stat-metric text-stat-metric text-status-grass mt-0.5">Your own API key</div>
                </div>
              </div>
            </div>

            {/* RIGHT: example report card */}
            <div className="lg:col-span-6 w-full">
              <div className="bg-surface-card rounded-xl p-space-lg shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-synergy-cyan via-purple-tier-a to-threat-crimson" />

                <div className="flex items-center justify-between gap-space-md pb-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center">
                      <Layers className="w-5 h-5 text-synergy-cyan" />
                    </div>
                    <div>
                      <div className="font-headline-sm text-headline-sm text-text-primary">Team Report</div>
                      <div className="font-label-mono text-label-mono text-text-tertiary uppercase">
                        Example output · not your team
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-sm bg-surface-elevated px-space-md py-space-xs rounded-xl shadow-inner">
                    <div className="text-right">
                      <div className="font-badge-tag text-badge-tag text-text-tertiary uppercase">Grade</div>
                      <div className="font-stat-metric text-stat-metric text-synergy-cyan">Overall</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center font-headline-md text-headline-md text-primary-container shadow-[0_0_12px_rgba(0,229,255,0.3)]">
                      B
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-space-sm my-space-md">
                  <div className="p-space-md rounded-lg bg-surface-elevated">
                    <div className="flex items-center justify-between text-threat-crimson">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-stat-display text-stat-display leading-none">4</span>
                    </div>
                    <span className="font-label-mono text-label-mono font-semibold text-threat-crimson block mt-2">
                      Threats
                    </span>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-elevated">
                    <div className="flex items-center justify-between text-status-grass">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-stat-display text-stat-display leading-none">6</span>
                    </div>
                    <span className="font-label-mono text-label-mono font-semibold text-status-grass block mt-2">
                      Strengths
                    </span>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-elevated">
                    <div className="flex items-center justify-between text-synergy-cyan">
                      <Brain className="w-5 h-5" />
                      <span className="font-stat-display text-stat-display leading-none">5</span>
                    </div>
                    <span className="font-label-mono text-label-mono font-semibold text-synergy-cyan block mt-2">
                      Coach Tips
                    </span>
                  </div>
                </div>

                <div className="bg-surface-elevated/40 p-space-md rounded-lg mb-space-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-mono text-label-mono text-text-secondary flex items-center gap-1">
                      <Gauge className="w-4 h-4 text-synergy-cyan" />
                      Speed control &amp; pivot coverage
                    </span>
                    <span className="font-stat-metric text-stat-metric text-synergy-cyan">Strong</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-canvas overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-synergy-cyan to-primary-container rounded-full w-[82%]" />
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs">
                  <div className="font-badge-tag text-badge-tag uppercase tracking-wider text-text-tertiary mb-1">
                    Sample findings
                  </div>
                  <div className="flex flex-wrap gap-space-xs">
                    <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded bg-threat-crimson/15 text-threat-crimson font-label-mono text-label-mono">
                      <AlertTriangle className="w-3 h-3" />
                      <span>No answer to Trick Room setup</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded bg-status-grass/15 text-status-grass font-label-mono text-label-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Redirection + Fake Out core intact</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded bg-gold-tier-s/15 text-gold-tier-s font-label-mono text-label-mono">
                      <Sparkles className="w-3 h-3" />
                      <span>Fairy coverage gap</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FEATURE GRID */}
      <section className="w-full bg-surface-canvas py-space-2xl">
        <div className="max-w-[1600px] mx-auto px-margin md:px-margin-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
            <div>
              <div className="font-badge-tag text-badge-tag uppercase tracking-widest text-synergy-cyan mb-space-xs">
                What it does
              </div>
              <h2 className="font-headline-lg text-headline-lg text-text-primary">Built for Champions doubles</h2>
            </div>
            <p className="font-body-md text-body-md text-text-tertiary max-w-md">
              Import a team, read the report, cross-check it against what the ladder is actually playing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            <div className="bg-surface-card p-space-lg rounded-xl shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center text-synergy-cyan mb-space-md shadow-sm">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="font-headline-sm text-headline-sm text-text-primary mb-space-xs">
                  Smart Team Analysis
                </div>
                <p className="font-body-md text-body-md text-text-secondary mb-space-md">
                  Paste a Showdown export and get a graded breakdown: the archetypes that threaten you, the strengths
                  worth protecting, and concrete changes to make.
                </p>
              </div>
              <div className="bg-surface-elevated/60 p-space-md rounded-lg mt-space-sm flex flex-col gap-space-xs font-label-mono text-label-mono">
                <div className="flex items-center justify-between text-text-tertiary">
                  <span>Threats</span>
                  <span className="text-threat-crimson">Ranked by severity</span>
                </div>
                <div className="flex items-center justify-between text-text-tertiary">
                  <span>Strengths</span>
                  <span className="text-status-grass">With reasoning</span>
                </div>
                <div className="flex items-center justify-between text-text-tertiary">
                  <span>Suggestions</span>
                  <span className="text-synergy-cyan">Actionable</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-card p-space-lg rounded-xl shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center text-gold-tier-s mb-space-md shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="font-headline-sm text-headline-sm text-text-primary mb-space-xs">Meta Usage Tracking</div>
                <p className="font-body-md text-body-md text-text-secondary mb-space-md">
                  Full usage rankings for the current format, tiered from S down to B, so you know what your team has to
                  beat on ladder and at events.
                </p>
              </div>
              <div className="bg-surface-elevated/60 p-space-md rounded-lg mt-space-sm">
                <div className="flex items-center justify-between font-label-mono text-label-mono text-text-tertiary pb-1">
                  <span>ACTIVE DATASET</span>
                  <span className="text-gold-tier-s">{badge}</span>
                </div>
                <div className="flex items-center justify-between gap-space-sm bg-surface-canvas p-2 rounded">
                  <span className="font-label-md text-label-md text-text-primary truncate">{format.name}</span>
                  <span className="font-badge-tag text-badge-tag text-synergy-cyan bg-surface-elevated px-2 py-0.5 rounded flex-shrink-0">
                    {RULESET_SUMMARY}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface-card p-space-lg rounded-xl shadow-lg flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center text-purple-tier-a mb-space-md shadow-sm">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="font-headline-sm text-headline-sm text-text-primary mb-space-xs">Team Builder</div>
                <p className="font-body-md text-body-md text-text-secondary mb-space-md">
                  A slot-by-slot builder with coverage and speed-tier feedback as you go. Not shipped yet — the analyzer
                  and meta pages are live today.
                </p>
              </div>
              <div className="bg-surface-elevated/60 p-space-md rounded-lg mt-space-sm">
                <div className="font-badge-tag text-badge-tag text-text-tertiary mb-space-xs uppercase">Status</div>
                <div className="bg-surface-canvas p-2 rounded text-center font-label-mono text-label-mono text-purple-tier-a">
                  In development
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRATEGY HUB */}
      <section className="max-w-[1600px] mx-auto px-margin md:px-margin-desktop py-space-2xl w-full">
        <div className="flex flex-col mb-space-xl">
          <div className="font-badge-tag text-badge-tag uppercase tracking-widest text-synergy-cyan mb-space-xs">
            War room
          </div>
          <h2 className="font-headline-lg text-headline-lg text-text-primary">Your VGC strategy hub</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
          <Link
            href="/analyzer"
            className="bg-surface-card p-space-lg rounded-xl shadow-md flex flex-col justify-between hover:bg-surface-elevated transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated group-hover:bg-primary-container/20 flex items-center justify-center text-synergy-cyan transition-colors">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="font-badge-tag text-badge-tag px-2 py-0.5 rounded bg-surface-canvas text-text-tertiary">
                  ANALYSIS
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-text-primary mb-space-xs">Team Analyzer</div>
              <p className="font-body-sm text-body-sm text-text-secondary mb-space-md">
                Graded report on threats, strengths, weaknesses and fixes for any Showdown export.
              </p>
            </div>
            <div className="bg-surface-canvas p-space-sm rounded-lg font-label-mono text-label-mono flex items-center justify-between">
              <span className="text-text-tertiary">Open</span>
              <span className="text-synergy-cyan font-semibold">Analyzer →</span>
            </div>
          </Link>

          <Link
            href="/meta"
            className="bg-surface-card p-space-lg rounded-xl shadow-md flex flex-col justify-between hover:bg-surface-elevated transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated group-hover:bg-primary-container/20 flex items-center justify-center text-gold-tier-s transition-colors">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <span className="font-badge-tag text-badge-tag px-2 py-0.5 rounded bg-surface-canvas text-text-tertiary">
                  USAGE
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-text-primary mb-space-xs">Meta Rankings</div>
              <p className="font-body-sm text-body-sm text-text-secondary mb-space-md">
                Every tracked Pokémon ranked by usage, with tier bands and distribution.
              </p>
            </div>
            <div className="bg-surface-canvas p-space-sm rounded-lg font-label-mono text-label-mono flex items-center justify-between">
              <span className="text-text-tertiary">Open</span>
              <span className="text-gold-tier-s font-semibold">Meta trends →</span>
            </div>
          </Link>

          <div className="bg-surface-card p-space-lg rounded-xl shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-status-water transition-colors">
                  <Link2 className="w-5 h-5" />
                </div>
                <span className="font-badge-tag text-badge-tag px-2 py-0.5 rounded bg-surface-canvas text-text-tertiary">
                  IMPORT
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-text-primary mb-space-xs">Pokepaste Import</div>
              <p className="font-body-sm text-body-sm text-text-secondary mb-space-md">
                Drop a Pokepaste link and the team is fetched, parsed and validated before analysis.
              </p>
            </div>
            <div className="bg-surface-canvas p-space-sm rounded-lg font-label-mono text-label-mono flex items-center justify-between">
              <span className="text-text-tertiary">Accepts</span>
              <span className="text-status-water font-semibold">pokepast.es links</span>
            </div>
          </div>

          <div className="bg-surface-card p-space-lg rounded-xl shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-purple-tier-a transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="font-badge-tag text-badge-tag px-2 py-0.5 rounded bg-surface-canvas text-text-tertiary">
                  SOON
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-text-primary mb-space-xs">Team Builder</div>
              <p className="font-body-sm text-body-sm text-text-secondary mb-space-md">
                Build a roster slot by slot with live coverage and speed feedback.
              </p>
            </div>
            <div className="bg-surface-canvas p-space-sm rounded-lg font-label-mono text-label-mono flex items-center justify-between">
              <span className="text-text-tertiary">Status</span>
              <span className="text-purple-tier-a font-semibold">In development</span>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA + PASTE DOCK */}
      <section className="w-full bg-surface-canvas py-space-2xl">
        <div className="max-w-[1600px] mx-auto px-margin md:px-margin-desktop">
          <div className="bg-surface-card rounded-xl p-space-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center relative">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-1 font-badge-tag text-badge-tag text-gold-tier-s uppercase tracking-widest mb-space-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Start here</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-text-primary mb-space-sm leading-tight">
                  Paste a team, get a report
                </h2>
                <p className="font-body-md text-body-md text-text-secondary mb-space-lg">
                  Drop your standard Showdown export below. The team is parsed and validated here in the browser, then
                  sent to the analyzer for a full breakdown.
                </p>
                <div className="flex flex-wrap items-center gap-space-md font-label-mono text-label-mono text-text-tertiary">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-synergy-cyan" />
                    <span>Showdown &amp; Pokepaste input</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-tier-s" />
                    <span>Bring your own OpenAI key</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 w-full">
                <QuickAnalyzeDock />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
