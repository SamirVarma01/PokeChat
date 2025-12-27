"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, LinkIcon, Zap, Shield, Target, AlertTriangle, CheckCircle, TrendingUp, ArrowLeft, X, Key } from "lucide-react"
import Link from "next/link"
import { validatePokemonTeam, type PokemonTeam } from "@/lib/team-validation"
import { analyzeTeam, type LLMAnalysisResult } from "@/lib/api"

const API_KEY_STORAGE_KEY = "openai_api_key"

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

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    if (storedKey) {
      setApiKey(storedKey)
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

    if (!apiKey || !apiKey.trim()) {
      setValidationErrors(["Please enter your OpenAI API key to analyze teams"])
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500'
      case 'B': return 'bg-blue-500'
      case 'C': return 'bg-yellow-500'
      case 'D': return 'bg-orange-500'
      case 'F': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
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
          <Link href="/meta" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Meta Analysis
          </Link>
          <Link href="/builder" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Team Builder
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Team Analyzer</h1>
            <p className="text-gray-600">Import your team and get AI-powered strategic analysis</p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                <div className="flex justify-between items-start">
                  <div>
                    <strong>Team Format Issues:</strong>
                    <ul className="mt-2 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">• {error}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearErrors}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Your Team
                </CardTitle>
                <CardDescription>Paste your team from Pokemon Showdown or provide a Pokepaste link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* API Key Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    OpenAI API Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <X className="h-4 w-4" /> : <Key className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your API key is stored locally in your browser and only used to make API calls to OpenAI. It is never stored on our servers. Get your key from{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                </div>
                <Tabs defaultValue="paste" className="w-full" onValueChange={() => clearErrors()}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Team Data</TabsTrigger>
                    <TabsTrigger value="url">Pokepaste URL</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paste" className="space-y-4">
                    <Textarea
                      placeholder="Paste your team export from Pokemon Showdown here..."
                      value={teamData}
                      onChange={(e) => {
                        setTeamData(e.target.value)
                        if (validationErrors.length > 0) {
                          clearErrors()
                        }
                      }}
                      className="min-h-[200px]"
                    />
                  </TabsContent>
                  <TabsContent value="url" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://pokepaste.es/..."
                        value={pasteUrl}
                        onChange={(e) => {
                          setPasteUrl(e.target.value)
                          if (validationErrors.length > 0) {
                            clearErrors()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleFetchFromUrl}
                        disabled={isFetchingUrl || !pasteUrl.trim()}
                        variant="outline"
                      >
                        {isFetchingUrl ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Fetching...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Fetch Team
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {fetchedTeamData && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-green-700">✓ Team fetched successfully!</div>
                        <Textarea
                          value={fetchedTeamData}
                          onChange={(e) => setTeamData(e.target.value)}
                          className="min-h-[150px] text-sm"
                          placeholder="Fetched team data will appear here..."
                        />
                      </div>
                    )}
                    
                    <Alert>
                      <LinkIcon className="h-4 w-4" />
                      <AlertDescription>
                        We'll automatically fetch your team data from the Pokepaste link
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isValidating || (!teamData && !fetchedTeamData) || !apiKey.trim()}
                  className="w-full mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing Team...
                    </>
                  ) : isValidating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Validating Team...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Analyze Team
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  {analysisResult ? "Your team analysis is complete" : "Results will appear here after analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResult ? (
                  <div className="space-y-6">
                    {/* Team Grade */}
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">Team Grade</div>
                      <Badge 
                        className={`text-white text-lg px-4 py-2 ${getGradeColor(analysisResult.grade)}`}
                      >
                        {analysisResult.grade}
                      </Badge>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{analysisResult.threats.length}</div>
                        <div className="text-xs text-red-600">Major Threats</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{analysisResult.strengths.length}</div>
                        <div className="text-xs text-green-600">Key Strengths</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{analysisResult.suggestions.length}</div>
                        <div className="text-xs text-blue-600">Suggestions</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Import your team to see detailed analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          {analysisResult && (
            <div className="mt-8 space-y-6">
              <Tabs defaultValue="threats" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="threats">Threats</TabsTrigger>
                  <TabsTrigger value="strengths">Strengths</TabsTrigger>
                  <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                  <TabsTrigger value="suggestions">Tips</TabsTrigger>
                </TabsList>

                <TabsContent value="threats" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Major Threats to Your Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResult.threats.map((threat, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Badge variant="destructive">
                            High
                          </Badge>
                          <div>
                            <div className="font-medium">{threat.point}</div>
                            <div className="text-sm text-gray-600 mt-1">{threat.reasoning}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="strengths" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Team Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResult.strengths.map((strength, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">{strength.point}</div>
                            <div className="text-sm text-gray-600 mt-1">{strength.reasoning}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="weaknesses" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResult.weaknesses.map((weakness, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">{weakness.point}</div>
                            <div className="text-sm text-gray-600 mt-1">{weakness.reasoning}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Strategic Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">{suggestion.description}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
