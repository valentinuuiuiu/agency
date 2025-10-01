'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Bot, Play, Square, Settings, Activity } from 'lucide-react'

interface ScrapingJob {
  id: string
  name: string
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  progress: number
  totalUrls: number
  scrapedUrls: number
  startTime?: string
  endTime?: string
  error?: string
}

export default function AdminScraperPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [scrapingJobs, setScrapingJobs] = useState<ScrapingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [config, setConfig] = useState({
    urls: '',
    maxPages: 50,
    delay: 1000,
    jobName: 'Farm Scraping Job'
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchScrapingJobs()
  }, [session, status, router])

  const fetchScrapingJobs = async () => {
    try {
      const response = await fetch('/api/admin/scraper/jobs')
      if (response.ok) {
        const data = await response.json()
        setScrapingJobs(data)
      }
    } catch (error) {
      console.error('Failed to fetch scraping jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartScraping = async () => {
    if (!config.urls.trim()) {
      alert('Please enter URLs to scrape')
      return
    }

    setRunning(true)
    try {
      const urls = config.urls.split('\n').filter(url => url.trim())
      const response = await fetch('/api/admin/scraper/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls,
          maxPages: config.maxPages,
          delay: config.delay,
          jobName: config.jobName
        })
      })

      if (response.ok) {
        alert('Scraping job started successfully!')
        fetchScrapingJobs()
      } else {
        alert('Failed to start scraping job')
      }
    } catch (error) {
      console.error('Failed to start scraping:', error)
      alert('Failed to start scraping job')
    } finally {
      setRunning(false)
    }
  }

  const handleStopScraping = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/scraper/stop/${jobId}`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchScrapingJobs()
      }
    } catch (error) {
      console.error('Failed to stop scraping:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading scraper...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-700 bg-clip-text text-transparent mb-2">
            Farm Scraper
          </h1>
          <p className="text-slate-600">Scrape Danish farm job listings automatically</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-indigo-600" />
                Scraping Configuration
              </CardTitle>
              <CardDescription>
                Configure scraping parameters and start new jobs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobName">Job Name</Label>
                <Input
                  id="jobName"
                  value={config.jobName}
                  onChange={(e) => setConfig(prev => ({ ...prev, jobName: e.target.value }))}
                  placeholder="Enter job name..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urls">URLs to Scrape</Label>
                <Textarea
                  id="urls"
                  value={config.urls}
                  onChange={(e) => setConfig(prev => ({ ...prev, urls: e.target.value }))}
                  placeholder="Enter URLs to scrape (one per line)&#10;https://example.com/farm-jobs&#10;https://another-site.com/jobs"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxPages">Max Pages</Label>
                  <Input
                    id="maxPages"
                    type="number"
                    value={config.maxPages}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxPages: parseInt(e.target.value) }))}
                    min="1"
                    max="200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Delay (ms)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={config.delay}
                    onChange={(e) => setConfig(prev => ({ ...prev, delay: parseInt(e.target.value) }))}
                    min="500"
                    max="5000"
                    step="100"
                  />
                </div>
              </div>

              <Button
                onClick={handleStartScraping}
                disabled={running}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {running ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Scraping
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Active Jobs */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-indigo-600" />
                Active Scraping Jobs
              </CardTitle>
              <CardDescription>
                Monitor and manage running scraping jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scrapingJobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No scraping jobs found. Start a new job to begin scraping.
                  </p>
                ) : (
                  scrapingJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg bg-white/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{job.name}</h3>
                          <Badge variant={
                            job.status === 'RUNNING' ? 'default' :
                            job.status === 'COMPLETED' ? 'secondary' :
                            job.status === 'FAILED' ? 'destructive' : 'outline'
                          }>
                            {job.status}
                          </Badge>
                        </div>

                        {job.status === 'RUNNING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStopScraping(job.id)}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            Stop
                          </Button>
                        )}
                      </div>

                      {job.status === 'RUNNING' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{job.scrapedUrls} / {job.totalUrls}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Total URLs: {job.totalUrls}</p>
                        <p>Scraped: {job.scrapedUrls}</p>
                        {job.startTime && (
                          <p>Started: {new Date(job.startTime).toLocaleString()}</p>
                        )}
                        {job.endTime && (
                          <p>Ended: {new Date(job.endTime).toLocaleString()}</p>
                        )}
                        {job.error && (
                          <p className="text-red-600">Error: {job.error}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Jobs</CardTitle>
              <Bot className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{scrapingJobs.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Running</CardTitle>
              <Activity className="h-5 w-5 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {scrapingJobs.filter(j => j.status === 'RUNNING').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Completed Today</CardTitle>
              <Badge className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {scrapingJobs.filter(j => j.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
