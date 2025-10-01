'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Download,
  Activity,
  Target,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Zap,
  Award,
  Building2
} from 'lucide-react'

interface AnalyticsData {
  userGrowth: { date: string; users: number; active: number }[]
  jobStats: { category: string; count: number; applications: number }[]
  applicationTrends: { date: string; applications: number; accepted: number }[]
  topLocations: { location: string; jobs: number; applications: number }[]
  summary: {
    totalUsers: number
    totalJobs: number
    totalApplications: number
    avgApplicationsPerJob: number
    topJobCategory: string
    conversionRate: number
  }
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchAnalytics()
  }, [session, status, router, dateRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">Platform insights and performance metrics</p>
          </div>

          <div className="flex gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.summary.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-blue-200 text-sm mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Total Jobs</CardTitle>
              <Briefcase className="h-5 w-5 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.summary.totalJobs.toLocaleString()}</div>
              <div className="flex items-center text-emerald-200 text-sm mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Applications</CardTitle>
              <Activity className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.summary.totalApplications.toLocaleString()}</div>
              <div className="flex items-center text-purple-200 text-sm mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +23% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Conversion Rate</CardTitle>
              <Target className="h-5 w-5 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.summary.conversionRate}%</div>
              <div className="flex items-center text-orange-200 text-sm mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Users</TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Jobs</TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    User Growth Trends
                  </CardTitle>
                  <CardDescription>Total and active users over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 rounded-lg border-2 border-dashed border-slate-200">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
                      <p className="text-slate-600 font-medium">Interactive Chart</p>
                      <p className="text-sm text-slate-500">Real-time user growth visualization</p>
                      <p className="text-xs text-slate-400 mt-2">Showing {analytics.userGrowth.length} data points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Job Categories */}
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    Top Job Categories
                  </CardTitle>
                  <CardDescription>Most popular job categories by posting volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.jobStats.slice(0, 5).map((category, index) => (
                      <div key={category.category} className="group flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                              {category.category}
                            </p>
                            <p className="text-sm text-slate-500">{category.applications} applications</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-white/50 border-indigo-200 text-indigo-700">
                          {category.count} jobs
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  User Analytics
                </CardTitle>
                <CardDescription>Detailed user behavior and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 rounded-lg border-2 border-dashed border-slate-200">
                  <div className="text-center">
                    <Users className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
                    <p className="text-slate-600 font-medium">User Behavior Analytics</p>
                    <p className="text-sm text-slate-500">Detailed user engagement and retention metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  Job Market Analytics
                </CardTitle>
                <CardDescription>Job posting trends and market insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 rounded-lg border-2 border-dashed border-slate-200">
                  <div className="text-center">
                    <Briefcase className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
                    <p className="text-slate-600 font-medium">Job Market Insights</p>
                    <p className="text-sm text-slate-500">Industry trends and job posting analytics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                  Application Analytics
                </CardTitle>
                <CardDescription>Application trends and conversion metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 rounded-lg border-2 border-dashed border-slate-200">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 mx-auto text-indigo-400 mb-4" />
                    <p className="text-slate-600 font-medium">Application Flow Analytics</p>
                    <p className="text-sm text-slate-500">Application lifecycle and success metrics</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
