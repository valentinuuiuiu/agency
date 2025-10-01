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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Farm Scraper</h1>
        <p className="text-gray-600">Scrape Danish farm job listings automatically</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
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
              className="w-full"
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
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
                  <div key={job.id} className="p-4 border rounded-lg">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scrapingJobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scrapingJobs.filter(j => j.status === 'RUNNING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Badge className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scrapingJobs.filter(j => j.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
