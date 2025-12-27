import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Target, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
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
          <Link href="/meta" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Meta Analysis
          </Link>
          <Link href="/builder" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Team Builder
          </Link>

        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit">
                    <Zap className="w-3 h-3 mr-1" />
                    Powered by AI & Smogon Data
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Master Pokemon VGC with{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                      AI-Powered
                    </span>{" "}
                    Team Analysis
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    Import your teams from Showdown or Pokepaste and get instant strategic feedback. Identify
                    weaknesses, discover threats, and optimize your team composition with AI trained on
                    championship-level VGC data.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/analyzer">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Analyze My Team
                    </Button>
                  </Link>
                  <Link href="/meta">
                    <Button variant="outline" size="lg">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Meta Analysis
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free to use</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Updated daily</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Tournament ready</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-80 bg-gradient-to-br from-blue-400 via-purple-500 to-red-500 rounded-full opacity-20 blur-3xl absolute -top-10 -left-10"></div>
                  <Card className="relative bg-white/80 backdrop-blur-sm border-2 p-10 w-[380px] sm:w-[480px] md:w-[540px] lg:w-[600px] shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-2xl md:text-3xl">
                        <Shield className="w-7 h-7 md:w-9 md:h-9 text-blue-600" />
                        Team Analysis Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 text-lg md:text-xl">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium">Team Synergy</span>
                          <Badge variant="secondary" className="text-lg px-4 py-2">85%</Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 md:h-4 rounded-full"
                            style={{ width: "85%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-lg font-medium">Identified Threats</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="destructive" className="text-base px-3 py-1">Landorus-T</Badge>
                          <Badge variant="destructive" className="text-base px-3 py-1">Incineroar</Badge>
                          <Badge variant="destructive" className="text-base px-3 py-1">Flutter Mane</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-lg font-medium">Recommendations</div>
                        <div className="text-base text-gray-600 space-y-1">
                          <div>• Consider adding Trick Room support</div>
                          <div>• Weak to common Electric moves</div>
                          <div>• Strong late-game potential</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Dominate VGC</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From team analysis to meta insights, we provide comprehensive tools for competitive Pokemon players.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 sm:grid-cols-3 sm:gap-8">
              <Card className="relative overflow-hidden">
                <CardHeader>
                  <Target className="h-10 w-10 text-blue-600" />
                  <CardTitle>Smart Team Analysis</CardTitle>
                  <CardDescription>
                    Import from Showdown or Pokepaste and get instant AI-powered feedback on your team composition.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Identify type coverage gaps</li>
                    <li>• Discover common threats</li>
                    <li>• Get strategic recommendations</li>
                    <li>• Speed tier analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-green-600" />
                  <CardTitle>Live Meta Tracking</CardTitle>
                  <CardDescription>
                    Stay ahead of the competition with real-time meta analysis and usage statistics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Top Pokemon usage rates</li>
                    <li>• Trending strategies</li>
                    <li>• Tournament results</li>
                    <li>• Format-specific insights</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <Users className="h-10 w-10 text-purple-600" />
                  <CardTitle>Team Builder Pro</CardTitle>
                  <CardDescription>
                    Build and optimize teams with our advanced team building tools and suggestions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Drag & drop team builder</li>
                    <li>• Auto-complete suggestions</li>
                    <li>• Synergy calculator</li>
                    <li>• Export to Showdown</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* VGC Strategy Hub */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Your VGC Strategy Hub</h2>
              <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed">
                Everything you need to build, analyze, and master your competitive Pokemon teams.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">Team Analyzer</h3>
                      <p className="text-sm text-gray-600">AI-powered strategic insights</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Meta Analysis</h3>
                      <p className="text-sm text-gray-600">Current tournament trends</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">Team Builder</h3>
                      <p className="text-sm text-gray-600">Create winning combinations</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-semibold">Strategic Planning</h3>
                      <p className="text-sm text-gray-600">Coverage and synergy analysis</p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <h3 className="text-2xl font-bold">Built for VGC Champions</h3>
                <p className="text-gray-600">
                  Our platform combines cutting-edge AI analysis with deep competitive insights to help you understand 
                  your team's strengths, identify weaknesses, and develop winning strategies. From local tournaments 
                  to World Championships, we're here to elevate your competitive game.
                </p>
                <div className="flex gap-2">
                  <Link href="/analyzer">
                    <Button>Start Team Analysis</Button>
                  </Link>
                  <Link href="/meta">
                    <Button variant="outline">View Meta Trends</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-screen py-16 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-red-600">
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center text-white max-w-4xl mx-auto">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl">
                  Ready to Elevate Your VGC Game?
                </h2>
                <p className="max-w-[800px] text-blue-100 text-lg md:text-xl lg:text-2xl leading-relaxed">
                  Join thousands of competitive players who trust PokeChat for their team building and analysis needs.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4">
                <Link href="/analyzer">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                    <Target className="w-5 h-5 mr-2" />
                    Analyze Your Team Now
                  </Button>
                </Link>
                <Link href="/meta">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent text-lg px-8 py-4"
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Explore Meta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
        <p className="text-xs text-gray-600">© 2025 PokeChat. Built for the competitive Pokemon community.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-600">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  )
}