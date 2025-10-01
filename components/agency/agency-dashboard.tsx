'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BarChart3, Building, MapPin, DollarSign, TrendingUp, UserPlus, Euro } from 'lucide-react'

// Types
interface DashboardData {
  kpis: {
    totalRevenue: number
    totalPlacements: number
    activeClients: number
    monthlyGrowth: number
  }
  revenueByCountry: {
    country: string
    revenue: number
  }[]
  recentPlacements: {
    id: string
    candidateName: string
    companyName: string
    country: string
    placementDate: string
    commission: number
    status: string
  }[]
  leadStats: {
    totalLeads: number
    newLeads: number
    conversionRate: string
  }
}

function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
  trend?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AgencyDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/agency/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        console.error('Failed to load dashboard data:', await response.text())
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading agency dashboard...</div>
  }

  if (!session?.user || session.user.role !== 'AGENCY_OWNER') {
    return <div className="flex items-center justify-center min-h-screen">Please log in as agency owner to access the agency dashboard.</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Agency Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`€${dashboardData?.kpis.totalRevenue.toLocaleString()}`}
          description="This month"
          icon={Euro}
          trend="+15.7%"
        />
        <KPICard
          title="Successful Placements"
          value={dashboardData?.kpis.totalPlacements.toString() || '0'}
          description="Across all countries"
          icon={UserPlus}
        />
        <KPICard
          title="Active Clients"
          value={dashboardData?.kpis.activeClients.toString() || '0'}
          description="Paying clients"
          icon={Building}
        />
        <KPICard
          title="Growth Rate"
          value={`${dashboardData?.kpis.monthlyGrowth}%`}
          description="Month over month"
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue by Country</CardTitle>
                <CardDescription>Your recruitment business across Europe</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="flex-1">Denmark</span>
                    <span className="font-medium">€15,000</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="flex-1">Germany</span>
                    <span className="font-medium">€7,500</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span className="flex-1">Netherlands</span>
                    <span className="font-medium">€2,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Placements</CardTitle>
                <CardDescription>Latest successful recruitments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentPlacements.slice(0, 5).map((placement) => (
                    <div key={placement.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{placement.candidateName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{placement.candidateName}</p>
                        <p className="text-sm text-muted-foreground">{placement.companyName}</p>
                      </div>
                      <div className="ml-auto font-medium">€{placement.commission}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Client Management</h3>
              <p className="text-sm text-muted-foreground">Manage your paying clients and their recruitment needs</p>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Clients</CardTitle>
              <CardDescription>Companies you&apos;ve successfully converted and their placement history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No clients yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Convert leads from your pipeline into paying clients.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Pipeline</CardTitle>
              <CardDescription>Companies discovered through AI web scraping</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Lead generation running</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  N8N is automatically discovering potential clients across Europe.
                </p>
                <div className="mt-6">
                  <Button variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Pipeline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Placement History</CardTitle>
              <CardDescription>Track successful recruitment placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Start your recruitment business</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Place your first Romanian candidates in European jobs.
                </p>
                <div className="mt-6">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Record First Placement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
