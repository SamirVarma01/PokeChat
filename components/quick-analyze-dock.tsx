"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Braces, Zap } from "lucide-react"

export const PENDING_TEAM_KEY = "pokechat_pending_team"

const SAMPLE_TEAM = `Rillaboom @ Miracle Seed
Ability: Grassy Surge
Level: 50
EVs: 252 HP / 196 Atk / 60 SpD
Adamant Nature
- Fake Out
- Grassy Glide
- Wood Hammer
- High Horsepower

Sneasler @ Focus Sash
Ability: Poison Touch
Level: 50
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Fake Out
- Dire Claw
- Close Combat
- Protect

Salamence-Mega @ Salamencite
Ability: Aerilate
Level: 50
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Double-Edge
- Dragon Dance
- Tailwind
- Protect

Incineroar @ Sitrus Berry
Ability: Intimidate
Level: 50
EVs: 252 HP / 4 Atk / 252 SpD
Careful Nature
- Fake Out
- Knock Off
- Parting Shot
- Flare Blitz`

export function QuickAnalyzeDock() {
  const [teamText, setTeamText] = useState("")
  const router = useRouter()

  const handleScan = () => {
    const team = teamText.trim()
    if (!team) return
    sessionStorage.setItem(PENDING_TEAM_KEY, team)
    router.push("/analyzer")
  }

  return (
    <div className="bg-surface-elevated rounded-xl p-space-md shadow-inner flex flex-col gap-space-sm">
      <div className="flex items-center justify-between text-text-tertiary font-label-mono text-label-mono">
        <span className="flex items-center gap-1">
          <Braces className="w-4 h-4 text-synergy-cyan" />
          <span>SHOWDOWN EXPORT DOCK</span>
        </span>
        <button
          type="button"
          onClick={() => setTeamText(SAMPLE_TEAM)}
          className="text-synergy-cyan hover:underline cursor-pointer"
        >
          Load sample paste
        </button>
      </div>

      <textarea
        rows={6}
        value={teamText}
        onChange={(e) => setTeamText(e.target.value)}
        spellCheck={false}
        placeholder={"Rillaboom @ Miracle Seed\nAbility: Grassy Surge\nEVs: 252 HP / 196 Atk / 60 SpD\nAdamant Nature\n- Fake Out\n- Grassy Glide\n- Wood Hammer..."}
        className="w-full bg-surface-canvas text-text-primary font-label-mono text-label-mono p-space-sm rounded-lg placeholder:text-text-tertiary focus:outline-none focus:bg-surface transition-colors resize-none"
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm">
        <span className="font-label-mono text-label-mono text-text-tertiary">
          No signup · Your API key stays in your browser
        </span>
        <button
          type="button"
          onClick={handleScan}
          disabled={!teamText.trim()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-space-sm bg-primary-container text-on-primary-container font-label-md text-label-md px-space-lg py-2.5 rounded-lg shadow-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Scan Team</span>
        </button>
      </div>
    </div>
  )
}
