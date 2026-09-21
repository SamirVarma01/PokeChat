export interface PokemonTeam {
  name: string;
  item?: string;
  ability?: string;
  level?: number;
  teraType?: string;
  nature?: string;
  evs: Record<string, number>;
  ivs: Record<string, number>;
  moves: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  team?: PokemonTeam[];
}

export interface AnalysisPoint {
  point: string;
  reasoning: string;
}

export interface LLMAnalysisResult {
  grade: string;
  strengths: AnalysisPoint[];
  weaknesses: AnalysisPoint[];
  threats: AnalysisPoint[];
  suggestions: Array<{
    type: string;
    description: string;
    priority: string;
  }>;
  error?: string;
}

const NATURE_LINE = /^[A-Za-z]+ Nature$/;

/**
 * Validates if the input text follows Pokemon Showdown team format
 */
export function validatePokemonTeam(teamText: string): ValidationResult {
  const errors: string[] = [];
  const lines = teamText.trim().split('\n');
  const team: PokemonTeam[] = [];
  let currentPokemon: Partial<PokemonTeam> | null = null;
  let pokemonCount = 0;

  // Check if we have any content
  if (!teamText.trim()) {
    return {
      isValid: false,
      errors: ["Team data is empty"]
    };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Attribute lines are either "Key: value" or a trailing "<Nature> Nature";
    // anything else at the start of a block names a Pokemon.
    const isAttributeLine = /^[A-Za-z][A-Za-z .]*:/.test(line) || NATURE_LINE.test(line);

    if (!line.startsWith(' ') && !line.startsWith('-') && !isAttributeLine) {

      // Save previous Pokemon if exists
      if (currentPokemon && currentPokemon.name && currentPokemon.moves && currentPokemon.moves.length > 0) {
        team.push(currentPokemon as PokemonTeam);
        pokemonCount++;
      }

      // Parse new Pokemon line
      const parts = line.split(' @ ');
      const name = parts[0].trim();
      const item = parts[1]?.trim();

      // Validate Pokemon name (basic check)
      if (!name || name.length < 2) {
        errors.push(`Line ${i + 1}: Invalid Pokemon name`);
        continue;
      }

      currentPokemon = {
        name,
        item,
        evs: {},
        ivs: {},
        moves: []
      };
    }
    // Ability
    else if (line.startsWith('Ability:')) {
      if (!currentPokemon) {
        errors.push(`Line ${i + 1}: Ability specified without Pokemon`);
        continue;
      }
      currentPokemon.ability = line.replace('Ability:', '').trim();
    }
    // Level
    else if (line.startsWith('Level:')) {
      if (!currentPokemon) {
        errors.push(`Line ${i + 1}: Level specified without Pokemon`);
        continue;
      }
      const levelText = line.replace('Level:', '').trim();
      const level = parseInt(levelText);
      if (isNaN(level) || level < 1 || level > 100) {
        errors.push(`Line ${i + 1}: Invalid level (must be 1-100)`);
      } else {
        currentPokemon.level = level;
      }
    }
    // Tera Type
    else if (line.startsWith('Tera Type:')) {
      if (!currentPokemon) {
        errors.push(`Line ${i + 1}: Tera Type specified without Pokemon`);
        continue;
      }
      currentPokemon.teraType = line.replace('Tera Type:', '').trim();
    }
    // Nature ("Adamant Nature")
    else if (NATURE_LINE.test(line)) {
      if (!currentPokemon) {
        errors.push(`Line ${i + 1}: Nature specified without Pokemon`);
        continue;
      }
      currentPokemon.nature = line.replace(/\s*Nature$/, '').trim();
    }
    // EVs
    else if (line.startsWith('EVs:')) {
      if (!currentPokemon) {
        errors.push(`Line ${i + 1}: EVs specified without Pokemon`);
        continue;
      }
      const evText = line.replace('EVs:', '').trim();
      const evs: Record<string, number> = {};
      
      for (const evPart of evText.split('/')) {
        const trimmed = evPart.trim();
        if (trimmed && trimmed.includes(' ')) {
          const [value, ...statParts] = trimmed.split(' ');
          const stat = statParts.join(' ');
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 252) {
            evs[stat] = numValue;
          }
        }
      }
      currentPokemon.evs = evs;
    }
    // IVs
    else if (line.startsWith('IVs:')) {
      if (!currentPokemon) {
        errors.push(`Line ${i + 1}: IVs specified without Pokemon`);
        continue;
      }
      const ivText = line.replace('IVs:', '').trim();
      const ivs: Record<string, number> = {};
      
      for (const ivPart of ivText.split('/')) {
        const trimmed = ivPart.trim();
        if (trimmed && trimmed.includes(' ')) {
          const [value, ...statParts] = trimmed.split(' ');
          const stat = statParts.join(' ');
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 31) {
            ivs[stat] = numValue;
          }
        }
      }
      currentPokemon.ivs = ivs;
    }
    // Moves
    else if (line.startsWith('-')) {
      if (!currentPokemon) {
        errors.push(`Line ${i + 1}: Move specified without Pokemon`);
        continue;
      }
      const move = line.replace('-', '').trim();
      if (move) {
        currentPokemon.moves.push(move);
      }
    }
  }

  // Add the last Pokemon
  if (currentPokemon && currentPokemon.name && currentPokemon.moves && currentPokemon.moves.length > 0) {
    team.push(currentPokemon as PokemonTeam);
    pokemonCount++;
  }

  // Validation checks
  if (pokemonCount === 0) {
    errors.push("No valid Pokemon found in team data");
  } else if (pokemonCount < 1) {
    errors.push("Team must have at least 1 Pokemon");
  } else if (pokemonCount > 6) {
    errors.push("Team cannot have more than 6 Pokemon");
  }

  // Check if each Pokemon has at least one move
  for (let i = 0; i < team.length; i++) {
    const pokemon = team[i];
    if (!pokemon.moves || pokemon.moves.length === 0) {
      errors.push(`Pokemon ${i + 1} (${pokemon.name}) has no moves`);
    } else if (pokemon.moves.length > 4) {
      errors.push(`Pokemon ${i + 1} (${pokemon.name}) has more than 4 moves`);
    }
  }

  // Species clause
  const seenSpecies = new Set<string>();
  for (const pokemon of team) {
    const species = pokemon.name.toLowerCase();
    if (seenSpecies.has(species)) {
      errors.push(`Duplicate Pokemon: ${pokemon.name} appears more than once`);
    }
    seenSpecies.add(species);
  }

  // Item clause: no two Pokemon may hold the same item
  const seenItems = new Map<string, string>();
  for (const pokemon of team) {
    if (!pokemon.item) continue;
    const item = pokemon.item.toLowerCase();
    const holder = seenItems.get(item);
    if (holder) {
      errors.push(`Item clause: ${pokemon.item} is held by both ${holder} and ${pokemon.name}`);
    } else {
      seenItems.set(item, pokemon.name);
    }
  }

  // The parsed roster is returned even when rules fail, so the UI can show what
  // was read back alongside the error.
  return {
    isValid: errors.length === 0,
    errors,
    team
  };
}

/** A Mega form, as Champions team lists spell it: "Salamence-Mega", "Raichu-Mega-Y". */
export function isMegaForm(name: string): boolean {
  return /-mega(-[a-z])?$/i.test(name.trim());
}

export function megaForms(team: PokemonTeam[]): PokemonTeam[] {
  return team.filter((pokemon) => isMegaForm(pokemon.name));
}

/**
 * Formats a Pokemon team for display
 */
export function formatTeamForDisplay(team: PokemonTeam[]): string {
  return team.map(pokemon => {
    let formatted = `${pokemon.name}`;
    if (pokemon.item) formatted += ` @ ${pokemon.item}`;
    formatted += '\n';
    
    if (pokemon.ability) formatted += `Ability: ${pokemon.ability}\n`;
    if (pokemon.level) formatted += `Level: ${pokemon.level}\n`;
    if (pokemon.teraType) formatted += `Tera Type: ${pokemon.teraType}\n`;
    if (pokemon.nature) formatted += `Nature: ${pokemon.nature}\n`;
    
    if (Object.keys(pokemon.evs).length > 0) {
      const evString = Object.entries(pokemon.evs)
        .map(([stat, value]) => `${value} ${stat}`)
        .join(' / ');
      formatted += `EVs: ${evString}\n`;
    }
    
    if (Object.keys(pokemon.ivs).length > 0) {
      const ivString = Object.entries(pokemon.ivs)
        .map(([stat, value]) => `${value} ${stat}`)
        .join(' / ');
      formatted += `IVs: ${ivString}\n`;
    }
    
    pokemon.moves.forEach(move => {
      formatted += `- ${move}\n`;
    });
    
    return formatted;
  }).join('\n');
}
