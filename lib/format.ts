export interface FormatInfo {
  name: string
  code: string
  game: string
  dataDate: string
}

// Used only until the first successful call; the live name comes from Pikalytics.
export const FALLBACK_FORMAT: FormatInfo = {
  name: "Pokémon Champions VGC",
  code: "",
  game: "Pokémon Champions",
  dataDate: "",
}

export const RULESET_SUMMARY = "Doubles · Bring 6, pick 4 · Level 50"

/** "Pokemon Champions VGC 2026 Reg M-C" -> "M-C" */
export function formatBadge(name: string): string {
  const match = name.match(/Reg(?:ulation)?(?:\s+Set)?\s+([A-Za-z](?:-[A-Za-z])?)\b/i)
  return match ? match[1].toUpperCase() : "LIVE"
}

/** Server-side only: the regulation Pikalytics is currently serving. */
export async function getCurrentFormat(): Promise<FormatInfo> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"

  try {
    const response = await fetch(`${backendUrl}/meta`, { next: { revalidate: 21600 } })
    if (!response.ok) return FALLBACK_FORMAT

    const data = await response.json()
    return {
      name: data.format?.name || FALLBACK_FORMAT.name,
      code: data.format?.code || "",
      game: data.format?.game || FALLBACK_FORMAT.game,
      dataDate: data.format?.data_date || "",
    }
  } catch {
    return FALLBACK_FORMAT
  }
}
