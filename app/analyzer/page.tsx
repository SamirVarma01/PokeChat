"use client"

import { useState, useEffect, useMemo } from "react"
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Link2,
  RotateCcw,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react"
import { validatePokemonTeam, isMegaForm, megaForms, type PokemonTeam } from "@/lib/team-validation"
import { analyzeTeam, type FindingSource, type LLMAnalysisResult } from "@/lib/api"
import { PENDING_TEAM_KEY } from "@/components/quick-analyze-dock"
import { RULESET_SUMMARY } from "@/lib/format"

const API_KEY_STORAGE_KEY = "pokechat_llm_api_key"

const gradeClass = (grade: string) => {
  switch (grade?.charAt(0)?.toUpperCase()) {
    case "A":
      return "text-status-grass"
    case "B":
      return "text-synergy-cyan"
    case "C":
      return "text-gold-tier-s"
    case "D":
      return "text-status-electric"
    default:
      return "text-threat-crimson"
  }
}

type TabKey = "threats" | "strengths" | "weaknesses" | "suggestions"

export default function TeamAnalyzer() {
  const [teamData, setTeamData] = useState("")
  const [pasteUrl, setPasteUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<LLMAnalysisResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [isFetchingUrl, setIsFetchingUrl] = useState(false)
  const [fetchedTeamData, setFetchedTeamData] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [inputMode, setInputMode] = useState<"paste" | "url">("paste")
  const [activeTab, setActiveTab] = useState<TabKey>("threats")

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (storedKey) {
      setApiKey(storedKey)
    }
    const pendingTeam = sessionStorage.getItem(PENDING_TEAM_KEY)
    if (pendingTeam) {
      setTeamData(pendingTeam)
      sessionStorage.removeItem(PENDING_TEAM_KEY)
    }
  }, [])

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    if (value) {
      localStorage.setItem(API_KEY_STORAGE_KEY, value)
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY)
    }
  }

  const liveValidation = useMemo(() => validatePokemonTeam(teamData || fetchedTeamData), [teamData, fetchedTeamData])
  const roster: PokemonTeam[] = liveValidation.team ?? []
  const megaCount = megaForms(roster).length

  const validateTeam = (teamText: string) => {
    setIsValidating(true)
    const validation = validatePokemonTeam(teamText)
    setValidationErrors(validation.errors)
    setIsValidating(false)
    return validation.isValid
  }

  const handleFetchFromUrl = async () => {
    if (!pasteUrl.trim()) {
      setValidationErrors(["Please enter a Pokepaste URL"])
      return
    }

    setIsFetchingUrl(true)
    setValidationErrors([])
    setFetchedTeamData("")

    try {
      // Use backend API instead of direct fetch to avoid CORS issues
      const response = await fetch('/api/fetch-pokepaste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: pasteUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch team')
      }

      const data = await response.json()
      setFetchedTeamData(data.team_data)
      setTeamData(data.team_data) // Also set it in the main team data field
    } catch (error) {
      setValidationErrors([`Failed to fetch team from URL: ${error instanceof Error ? error.message : 'Unknown error'}`])
    } finally {
      setIsFetchingUrl(false)
    }
  }

  const handleAnalyze = async () => {
    const teamToAnalyze = teamData || fetchedTeamData

    if (!teamToAnalyze) {
      setValidationErrors(["Please provide team data to analyze"])
      return
    }

    // Validate team format first
    if (!validateTeam(teamToAnalyze)) {
      return
    }

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      const result = await analyzeTeam(teamToAnalyze, apiKey)
      if (result.error) {
        setValidationErrors([result.error])
        setAnalysisResult(null)
      } else {
        setAnalysisResult(result)
        setValidationErrors([])
        setActiveTab("threats")
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      setValidationErrors(['Failed to analyze team. Please try again.'])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearErrors = () => {
    setValidationErrors([])
    setFetchedTeamData("")
  }

  const resetInput = () => {
    setTeamData("")
    setPasteUrl("")
    setFetchedTeamData("")
    setValidationErrors([])
    setAnalysisResult(null)
  }

  const hasTeamText = Boolean((teamData || fetchedTeamData).trim())

  const tabs: Array<{ key: TabKey; label: string; count: number; color: string; icon: typeof AlertTriangle }> = [
    { key: "threats", label: "Threats", count: analysisResult?.threats.length ?? 0, color: "text-threat-crimson", icon: AlertTriangle },
    { key: "strengths", label: "Strengths", count: analysisResult?.strengths.length ?? 0, color: "text-status-grass", icon: CheckCircle2 },
    { key: "weaknesses", label: "Weaknesses", count: analysisResult?.weaknesses.length ?? 0, color: "text-status-electric", icon: Sparkles },
    { key: "suggestions", label: "Coach Tips", count: analysisResult?.suggestions.length ?? 0, color: "text-synergy-cyan", icon: Brain },
  ]

  return (
    <div className="relative w-full max-w-[1600px] mx-auto px-margin md:px-margin-desktop py-space-lg overflow-hidden">
      <div className="absolute -top-10 left-1/4 w-96 h-96 bg-synergy-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-purple-tier-a/5 rounded-full blur-3xl pointer-events-none" />

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl relative">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs font-label-mono text-label-mono text-text-tertiary uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-synergy-cyan">VGC Team Analyzer</span>
          </div>
          <div className="flex flex-wrap items-center gap-space-md mt-1">
            <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight">
              Competitive Team Analyzer
            </h1>
            <span className="px-space-sm py-1 rounded bg-surface-elevated text-synergy-cyan font-badge-tag text-badge-tag tracking-wider shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-synergy-cyan animate-pulse" />
              {RULESET_SUMMARY}
            </span>
          </div>
        </div>
      </div>

      {/* GLOBAL ERROR BANNER */}
      {validationErrors.length > 0 && (
        <div className="mb-space-lg bg-surface-card rounded-xl p-space-md shadow-lg flex items-start justify-between gap-space-md relative">
          <div className="flex items-start gap-space-sm">
            <AlertTriangle className="w-5 h-5 text-threat-crimson flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-label-md text-label-md text-threat-crimson uppercase tracking-wider">
                Team format issues
              </div>
              <ul className="mt-2 space-y-1 font-label-mono text-label-mono text-text-secondary">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            type="button"
            onClick={clearErrors}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Dismiss errors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter-desktop items-start relative">
        {/* LEFT: IMPORT & CONFIG */}
        <div className="xl:col-span-5 flex flex-col gap-space-lg">
          <div className="bg-surface-card rounded-xl shadow-xl overflow-hidden">
            {/* terminal tabs */}
            <div className="bg-surface-elevated px-space-md py-space-sm flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => { setInputMode("paste"); clearErrors() }}
                  className={`px-space-md py-1.5 rounded font-label-mono text-label-mono flex items-center gap-2 transition-colors ${
                    inputMode === "paste"
                      ? "bg-surface-card text-synergy-cyan shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${inputMode === "paste" ? "bg-synergy-cyan" : "bg-text-tertiary"}`} />
                  Raw Showdown Text
                </button>
                <button
                  type="button"
                  onClick={() => { setInputMode("url"); clearErrors() }}
                  className={`px-space-md py-1.5 rounded font-label-mono text-label-mono transition-colors ${
                    inputMode === "url"
                      ? "bg-surface-card text-synergy-cyan shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Pokepaste URL
                </button>
              </div>
              <button
                type="button"
                onClick={resetInput}
                title="Clear input"
                className="text-text-tertiary hover:text-text-primary transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="p-space-md flex flex-col gap-space-sm">
              {inputMode === "paste" ? (
                <>
                  <span className="font-label-mono text-label-mono text-text-tertiary uppercase tracking-wider">
                    Paste Pokémon Showdown export:
                  </span>
                  <textarea
                    rows={13}
                    spellCheck={false}
                    value={teamData}
                    onChange={(e) => {
                      setTeamData(e.target.value)
                      if (validationErrors.length > 0) clearErrors()
                    }}
                    placeholder={"Incineroar @ Sitrus Berry\nAbility: Intimidate\nLevel: 50\nTera Type: Ghost\nEVs: 252 HP / 68 Atk / 156 Def / 28 SpD / 4 Spe\nCareful Nature\n- Fake Out\n- Knock Off\n- Parting Shot\n- Flare Blitz"}
                    className="w-full bg-surface-canvas rounded p-space-md font-label-mono text-label-mono text-text-primary leading-relaxed placeholder:text-text-tertiary focus:outline-none focus:bg-surface-elevated transition-colors shadow-inner resize-y"
                  />
                </>
              ) : (
                <>
                  <span className="font-label-mono text-label-mono text-text-tertiary uppercase tracking-wider">
                    Fetch team from a Pokepaste link:
                  </span>
                  <div className="flex gap-space-sm">
                    <input
                      type="text"
                      value={pasteUrl}
                      onChange={(e) => {
                        setPasteUrl(e.target.value)
                        if (validationErrors.length > 0) clearErrors()
                      }}
                      placeholder="https://pokepast.es/..."
                      className="flex-1 bg-surface-canvas rounded px-space-md py-2 font-label-mono text-label-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-elevated transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleFetchFromUrl}
                      disabled={isFetchingUrl || !pasteUrl.trim()}
                      className="px-space-md py-2 rounded bg-surface-elevated hover:bg-surface-bright text-text-primary font-label-md text-label-md flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isFetchingUrl ? (
                        <span className="w-4 h-4 rounded-full border-2 border-synergy-cyan border-b-transparent animate-spin" />
                      ) : (
                        <Link2 className="w-4 h-4 text-synergy-cyan" />
                      )}
                      {isFetchingUrl ? "Fetching" : "Fetch"}
                    </button>
                  </div>
                  <textarea
                    rows={11}
                    spellCheck={false}
                    value={teamData}
                    onChange={(e) => setTeamData(e.target.value)}
                    placeholder="Fetched team data will appear here..."
                    className="w-full bg-surface-canvas rounded p-space-md font-label-mono text-label-mono text-text-primary leading-relaxed placeholder:text-text-tertiary focus:outline-none focus:bg-surface-elevated transition-colors shadow-inner resize-y"
                  />
                </>
              )}

              {/* live validation status */}
              <div className="p-space-sm rounded bg-surface-canvas flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        hasTeamText && liveValidation.isValid ? "bg-status-grass" : "bg-text-tertiary"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        hasTeamText && liveValidation.isValid ? "bg-status-grass" : "bg-text-tertiary"
                      }`}
                    />
                  </span>
                  <span
                    className={`font-label-mono text-label-mono font-semibold ${
                      hasTeamText && liveValidation.isValid ? "text-status-grass" : "text-text-tertiary"
                    }`}
                  >
                    {!hasTeamText
                      ? "Waiting for a team export"
                      : liveValidation.isValid
                        ? `${roster.length} Pokémon detected · format looks valid`
                        : liveValidation.errors[0]}
                  </span>
                </div>
                <span className="font-label-mono text-label-mono text-text-tertiary">
                  {hasTeamText ? `${(teamData || fetchedTeamData).trim().split("\n").length} lines` : "—"}
                </span>
              </div>
            </div>

            {/* config + CTA */}
            <div className="p-space-md bg-surface-elevated/40 flex flex-col gap-space-md">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-mono text-label-mono uppercase text-text-secondary flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-synergy-cyan" />
                    Groq API key (optional)
                  </label>
                  <span
                    className={`font-badge-tag text-badge-tag px-1.5 py-0.5 rounded ${
                      apiKey.trim()
                        ? "bg-status-grass/15 text-status-grass"
                        : "bg-surface-canvas text-text-tertiary"
                    }`}
                  >
                    {apiKey.trim() ? "Key saved locally" : "Rules-only mode"}
                  </span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-surface-canvas rounded pl-9 pr-11 py-2 font-label-mono text-label-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface-elevated transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded bg-surface-elevated text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="font-label-mono text-label-mono text-text-tertiary">
                  Coverage, speed and legality are computed for free without a key. Add a free{" "}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-synergy-cyan hover:underline"
                  >
                    Groq key
                  </a>{" "}
                  for written coaching on top. Stored in your browser only.
                </p>
              </div>

              <div className="pt-space-xs flex flex-col gap-space-xs">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isValidating || !hasTeamText}
                  className="w-full py-space-md px-space-lg rounded bg-primary-container text-on-primary-container font-headline-sm text-headline-sm uppercase tracking-wider flex items-center justify-center gap-space-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(0,229,255,0.35)] disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-5 h-5 rounded-full border-2 border-on-primary-container border-b-transparent animate-spin" />
                      <span>Analyzing team...</span>
                    </>
                  ) : (
                    <>
                      <Terminal className="w-5 h-5" />
                      <span>Analyze team structure</span>
                      <Zap className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="xl:col-span-7 flex flex-col gap-space-lg">
          {/* summary banner */}
          <div className="bg-surface-card rounded-xl p-space-lg shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-space-lg">
            <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-synergy-cyan/10 to-transparent pointer-events-none" />

            <div className="flex items-center gap-space-md flex-shrink-0 relative">
              <div className="w-24 h-24 rounded-2xl bg-surface-elevated flex flex-col items-center justify-center shadow-[0_0_24px_rgba(0,242,254,0.2)]">
                <span className={`font-headline-xl text-headline-xl leading-none ${analysisResult?.grade ? gradeClass(analysisResult.grade) : "text-text-tertiary"}`}>
                  {analysisResult?.grade ?? "—"}
                </span>
                <span className="font-badge-tag text-badge-tag text-gold-tier-s tracking-widest mt-1">TEAM GRADE</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-synergy-cyan">Analysis Report</span>
                <span className="font-body-sm text-body-sm text-text-secondary mt-0.5 max-w-xs">
                  {!analysisResult
                    ? "Import a team and run the analyzer to populate this report."
                    : analysisResult.llm_used
                      ? "Computed coverage plus written coaching."
                      : "Computed from live usage data. Add a free Groq key for written coaching and a grade."}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-sm flex-1 w-full relative">
              <div className="p-space-md rounded-lg bg-surface-elevated flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-threat-crimson">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-stat-display text-stat-display leading-none">
                    {analysisResult?.threats.length ?? 0}
                  </span>
                </div>
                <span className="font-label-mono text-label-mono font-semibold text-threat-crimson block mt-2">
                  Threats
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-elevated flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-status-grass">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-stat-display text-stat-display leading-none">
                    {analysisResult?.strengths.length ?? 0}
                  </span>
                </div>
                <span className="font-label-mono text-label-mono font-semibold text-status-grass block mt-2">
                  Strengths
                </span>
              </div>
              <div className="p-space-md rounded-lg bg-surface-elevated flex flex-col justify-between shadow-sm">
                <div className="flex items-center justify-between text-synergy-cyan">
                  <Brain className="w-5 h-5" />
                  <span className="font-stat-display text-stat-display leading-none">
                    {analysisResult?.suggestions.length ?? 0}
                  </span>
                </div>
                <span className="font-label-mono text-label-mono font-semibold text-synergy-cyan block mt-2">
                  Coach Tips
                </span>
              </div>
            </div>
          </div>

          {/* roster ribbon */}
          {roster.length > 0 && (
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center justify-between gap-space-sm px-1">
                <span className="font-label-mono text-label-mono text-text-tertiary uppercase tracking-wider">
                  Parsed roster ({roster.length} slots)
                </span>
                {megaCount > 1 && (
                  <span className="font-label-mono text-label-mono text-status-electric flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {megaCount} Mega forms — only one can Mega Evolve per battle
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm">
                {roster.map((pokemon, index) => (
                  <div
                    key={`${pokemon.name}-${index}`}
                    className="bg-surface-card rounded-lg p-space-sm shadow-md hover:bg-surface-elevated transition-all flex flex-col gap-space-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-badge-tag text-badge-tag text-text-tertiary">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      {isMegaForm(pokemon.name) && (
                        <span className="px-1.5 py-0.5 rounded font-badge-tag text-badge-tag bg-purple-tier-a/20 text-purple-tier-a">
                          MEGA
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-text-primary truncate">
                        {pokemon.name}
                      </span>
                      <span className="font-label-mono text-label-mono text-text-secondary truncate">
                        {pokemon.item ?? "No item"}
                      </span>
                    </div>
                    <div className="text-center font-badge-tag text-badge-tag text-text-tertiary uppercase py-1 bg-surface-canvas rounded truncate">
                      {pokemon.ability ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* tabbed breakdown */}
          <div className="bg-surface-card rounded-xl shadow-xl overflow-hidden flex flex-col">
            <div className="bg-surface-elevated px-space-md py-space-xs flex flex-wrap items-center gap-space-xs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-space-md py-2 rounded font-label-md text-label-md flex items-center gap-2 transition-colors ${
                      isActive ? `bg-surface-card ${tab.color} shadow-sm` : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label} ({tab.count})
                  </button>
                )
              })}
            </div>

            <div className="p-space-lg flex flex-col gap-space-md">
              {!analysisResult ? (
                <div className="text-center py-space-2xl flex flex-col items-center gap-space-sm">
                  <Brain className="w-10 h-10 text-text-tertiary opacity-50" />
                  <p className="font-body-md text-body-md text-text-tertiary">
                    No report yet. Import a team on the left and run the analyzer.
                  </p>
                </div>
              ) : activeTab === "suggestions" ? (
                analysisResult.suggestions.map((suggestion, index) => (
                  <AnalysisCard
                    key={index}
                    accent="text-synergy-cyan"
                    accentBg="bg-synergy-cyan/20"
                    tag={suggestion.priority ? `${suggestion.priority.toUpperCase()} PRIORITY` : "SUGGESTION"}
                    title={suggestion.type || "Coach tip"}
                    body={suggestion.description}
                    source={suggestion.source}
                  />
                ))
              ) : (
                (activeTab === "threats"
                  ? analysisResult.threats
                  : activeTab === "strengths"
                    ? analysisResult.strengths
                    : analysisResult.weaknesses
                ).map((item, index) => (
                  <AnalysisCard
                    key={index}
                    accent={
                      activeTab === "threats"
                        ? "text-threat-crimson"
                        : activeTab === "strengths"
                          ? "text-status-grass"
                          : "text-status-electric"
                    }
                    accentBg={
                      activeTab === "threats"
                        ? "bg-threat-crimson/20"
                        : activeTab === "strengths"
                          ? "bg-status-grass/20"
                          : "bg-status-electric/20"
                    }
                    tag={
                      activeTab === "threats" ? "THREAT" : activeTab === "strengths" ? "STRENGTH" : "WEAKNESS"
                    }
                    title={item.point}
                    body={item.reasoning}
                    source={item.source}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalysisCard({
  accent,
  accentBg,
  tag,
  title,
  body,
  source,
}: {
  accent: string
  accentBg: string
  tag: string
  title: string
  body: string
  source?: FindingSource
}) {
  return (
    <div className="p-space-md rounded-lg bg-surface-elevated/70 hover:bg-surface-elevated transition-colors shadow-sm flex flex-col gap-space-sm">
      <div className="flex flex-wrap items-center gap-space-sm">
        <span className={`px-2 py-0.5 rounded font-badge-tag text-badge-tag tracking-wider ${accentBg} ${accent}`}>
          {tag}
        </span>
        <span className="font-headline-sm text-headline-sm text-text-primary">{title}</span>
        {source && (
          <span
            className={`px-1.5 py-0.5 rounded font-badge-tag text-badge-tag tracking-wider ml-auto ${
              source === "computed" ? "bg-surface-canvas text-synergy-cyan" : "bg-surface-canvas text-text-tertiary"
            }`}
            title={source === "computed" ? "Computed from live usage data" : "Written by the AI coach"}
          >
            {source === "computed" ? "COMPUTED" : "AI"}
          </span>
        )}
      </div>
      {body && <p className="font-body-md text-body-md text-text-secondary leading-relaxed">{body}</p>}
    </div>
  )
}
