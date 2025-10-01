'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Briefcase,
  Brain,
  Globe,
  TrendingUp,
  Star,
  Zap,
  Shield,
  CheckCircle,
  Cpu,
  Target,
  BarChart3
} from 'lucide-react'

export default function PiataAIHomepage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center max-w-6xl">
          <div>
            {/* Main Headline */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl mr-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2">
                AI-MARKET.ONLINE
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {`Europe's Leading`}
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Multi-Industry Recruitment Platform
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Connecting Romanian professionals with premium opportunities across Europe in Construction, Healthcare, IT, Manufacturing, Logistics, Hospitality, and more. AI-powered matching for perfect career alignment.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              {[
                { icon: Users, label: 'Active Candidates', value: '50,000+' },
                { icon: Briefcase, label: 'Jobs Filled', value: '25,000+' },
                { icon: Target, label: 'Placement Rate', value: '95%' },
                { icon: TrendingUp, label: 'Monthly Revenue', value: '€150K+' }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="flex justify-center mb-3">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl">
                <Zap className="mr-2 h-5 w-5" />
                Get AI Matched Jobs
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg font-semibold">
                <Shield className="mr-2 h-5 w-5" />
                Agency Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Revolutionary AI Recruitment Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced artificial intelligence transforms how European companies find and hire the best Romanian talent
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Smart Candidate Scoring',
                description: 'AI analyzes CVs and provides 0-100 fit scores for European job compatibility',
                features: ['Neural Language Analysis', 'Skills Gap Detection', 'Culture Match Prediction']
              },
              {
                icon: Target,
                title: 'Intelligent Matching',
                description: 'ML algorithms find the perfect candidate-job combinations across borders',
                features: ['Multi-dimensional Matching', 'Success Prediction', 'Location Optimization']
              },
              {
                icon: Users,
                title: 'Automated Lead Generation',
                description: 'AI discovers and qualifies European companies actively hiring Romanian talent',
                features: ['Web Scraping Intelligence', 'Company Classification', 'Lead Scoring & Prioritization']
              },
              {
                icon: Cpu,
                title: 'Predictive Analytics',
                description: 'Forecast placement success rates and optimize recruitment strategies',
                features: ['Performance Forecasting', 'Market Trend Analysis', 'Success Rate Optimization']
              },
              {
                icon: Globe,
                title: 'Multi-Language Support',
                description: 'Native support for English, German, French, Dutch, Danish, and Romanian',
                features: ['Automated Translation', 'Cultural Context Awareness', 'Local Market Adaptation']
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Comprehensive dashboards and insights for unprecedented recruitment success',
                features: ['Real-time KPIs', 'Revenue Tracking', 'Performance Analytics']
              }
            ].map((feature, index) => (
              <div key={feature.title}>
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg w-fit mb-4">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* European Coverage Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Pan-European Recruitment Power
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting Romanian talent with opportunities across Europe's most vibrant economies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { country: 'Construction', flag: '🏗️', jobs: '3,200+ Active', specialties: ['General Labor', 'Skilled Trades', 'Project Management'] },
              { country: 'Healthcare', flag: '🏥', jobs: '1,800+ Active', specialties: ['Elder Care', 'Medical Support', 'Therapy'] },
              { country: 'IT & Tech', flag: '💻', jobs: '2,500+ Active', specialties: ['Development', 'Support', 'System Admin'] },
              { country: 'Manufacturing', flag: '🏭', jobs: '4,100+ Active', specialties: ['Assembly', 'Quality Control', 'Maintenance'] },
              { country: 'Romania Source', flag: '🇷🇴', jobs: '25,000+ Candidates', specialties: ['Multi-Skilled', 'EU Ready', 'Experienced'] }
            ].map((market, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
                <div className="text-4xl mb-4">{market.flag}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{market.country}</h3>
                <p className="text-blue-600 font-semibold mb-3">{market.jobs}</p>
                <div className="space-y-1">
                  {market.specialties.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Success Stories Powered by AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real placements, real success, powered by our revolutionary AI recruitment platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                candidate: 'Alexandra Popescu',
                company: 'Berlin Medical Center',
                role: 'Healthcare Assistant',
                salary: '€2,800/month',
                placementTime: '3 days',
                success: 'Perfect German language skills match'
              },
              {
                candidate: 'Mihai Stan',
                company: 'Tech Solutions Nederland',
                role: 'Full-Stack Developer',
                salary: '€4,200/month',
                placementTime: '5 days',
                success: 'AI identified perfect tech stack match'
              },
              {
                candidate: 'Elena Dumitrescu',
                company: 'Amsterdam Logistics Hub',
                role: 'Warehouse Coordinator',
                salary: '€2,900/month',
                placementTime: '2 days',
                success: 'Immediate placement with forklift certification'
              }
            ].map((story) => (
              <div key={story.candidate}>
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{story.candidate}</h3>
                        <p className="text-blue-600 font-semibold">{story.role}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        {story.placementTime}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{story.company}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Monthly Salary:</span>
                        <span className="font-bold text-green-600">{story.salary}</span>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <Star className="h-4 w-4 inline text-yellow-500 mr-1" />
                        <span className="text-sm font-medium text-yellow-800">{story.success}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Recruitment?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Europe's most advanced AI-powered recruitment network.
              Unlimited placements, intelligent matching, guaranteed results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl">
                <Users className="mr-2 h-5 w-5" />
                Find My Perfect Job
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold">
                <Briefcase className="mr-2 h-5 w-5" />
                Start Recruiting with AI
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">PIATA-AI.RO</h3>
                <p className="text-gray-400 text-sm">Europe's AI Recruitment Leader</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">Built with Next.js 16 & PostgreSQL</p>
              <p className="text-gray-400 text-sm">
                {`© ${new Date().getFullYear()} Piata-AI.ro - Transforming European Recruitment`}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
