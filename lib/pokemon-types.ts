const TYPE_COLORS: Record<string, string> = {
  normal: "bg-surface-variant text-on-surface",
  fire: "bg-threat-crimson/20 text-threat-crimson",
  water: "bg-status-water/20 text-status-water",
  electric: "bg-status-electric/20 text-status-electric",
  grass: "bg-status-grass/20 text-status-grass",
  ice: "bg-synergy-cyan/20 text-synergy-cyan",
  fighting: "bg-threat-crimson/20 text-threat-crimson",
  poison: "bg-purple-tier-a/20 text-purple-tier-a",
  ground: "bg-gold-tier-s/20 text-gold-tier-s",
  flying: "bg-primary-fixed/20 text-primary-fixed",
  psychic: "bg-purple-tier-a/20 text-purple-tier-a",
  bug: "bg-status-grass/20 text-status-grass",
  rock: "bg-gold-tier-s/20 text-gold-tier-s",
  ghost: "bg-purple-tier-a/20 text-purple-tier-a",
  dragon: "bg-secondary-fixed/20 text-secondary-fixed",
  dark: "bg-surface-variant text-text-secondary",
  steel: "bg-outline/20 text-outline",
  fairy: "bg-secondary-fixed-dim/20 text-secondary-fixed-dim",
}

export function typeChipClass(type: string): string {
  return TYPE_COLORS[type.trim().toLowerCase()] ?? "bg-surface-variant text-text-secondary"
}

/** Mega forms are their own Pikalytics entry; keep the exact name for lookups. */
export function pokemonHref(name: string): string {
  return `/pokemon/${encodeURIComponent(name)}`
}
