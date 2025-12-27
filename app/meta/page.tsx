"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Crown, Zap, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Data structure for Pikalytics integration
interface PokemonUsage {
  name: string
  usage: number
  rank: number
}

export default function MetaAnalysis() {
  const [pokemonData, setPokemonData] = useState<PokemonUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPikalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/pikalytics-usage')
      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }
      
      const data = await response.json()
      setPokemonData(data.pokemon)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPikalyticsData()
  }, [])

  const getTier = (usage: number): string => {
    if (usage >= 40) return "S"
    if (usage >= 25) return "A+"
    if (usage >= 15) return "A"
    if (usage >= 10) return "A-"
    if (usage >= 5) return "B+"
    return "B"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center justify-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            PokeChat
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/analyzer" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Team Analyzer
          </Link>
          <Link href="/builder" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Team Builder
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
                      <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">VGC Meta Analysis</h1>
              <p className="text-gray-600">Current usage statistics and trends from top-level tournament play</p>
            </div>

          <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Meta Analysis</h2>
                <p className="text-gray-600">Current usage statistics from Pikalytics tournament data</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">Error: {error}</p>
              </div>
            )}

            {isLoading && pokemonData.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Pokemon usage data...</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Most Used Pokemon
                  </CardTitle>
                  <CardDescription>Usage rates from recent tournament data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pokemonData.slice(0, 5).map((pokemon: PokemonUsage, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{pokemon.name}</div>
                          <Badge
                            variant={
                              getTier(pokemon.usage) === "S" ? "default" : getTier(pokemon.usage) === "A+" ? "secondary" : "outline"
                            }
                            className="text-xs"
                          >
                            {getTier(pokemon.usage)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pokemon.usage.toFixed(1)}%</span>
                        <span className="text-sm text-gray-500">#{pokemon.rank}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Distribution</CardTitle>
                  <CardDescription>How usage is spread across the meta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>S Tier (40%+ usage)</span>
                      <span>3 Pokemon</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>A+ Tier (25-40%)</span>
                      <span>5 Pokemon</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>A Tier (15-25%)</span>
                      <span>8 Pokemon</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>A- Tier (10-15%)</span>
                      <span>12 Pokemon</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Complete Usage Rankings</CardTitle>
                <CardDescription>Top 50 Pokemon by usage rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pokemonData.map((pokemon: PokemonUsage, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="font-medium">{pokemon.name}</span>
                      </div>
                                              <div className="flex items-center gap-2">
                          <span className="text-sm">{pokemon.usage.toFixed(1)}%</span>
                          <span className="text-xs text-gray-500">#{pokemon.rank}</span>
                        </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
