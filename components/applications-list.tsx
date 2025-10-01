
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Download, User, MapPin, Calendar, Star, TrendingUp, TrendingDown, Award } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Progress } from '@/components/ui/progress'

interface ApplicationsListProps {
  isRecruiter: boolean
}

export default function ApplicationsList({ isRecruiter }: ApplicationsListProps) {
  // session is intentionally unused here; keep the hook in case we need auth state later
  useSession()
  const { toast } = useToast()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [scoringProgress, setScoringProgress] = useState<{[key: string]: number}>({})

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const endpoint = isRecruiter ? '/api/applications/received' : '/api/applications/sent'
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca aplicațiile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast({
          title: 'Status actualizat',
          description: 'Statusul aplicației a fost actualizat cu succes'
        })
        fetchApplications()
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza statusul',
        variant: 'destructive'
      })
    }
  }

  const scoreApplication = async (applicationId: string) => {
    setScoringProgress(prev => ({ ...prev, [applicationId]: 0 }))
    
    try {
      const response = await fetch(`/api/applications/${applicationId}/score`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Scoring failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
  // streaming buffer intentionally unused after rewrite; keep placeholder in case of streaming changes
  let _buffer = ''
      let partialRead = ''

      while (true) {
        const { done, value } = await reader?.read() || { done: true, value: undefined }
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setScoringProgress(prev => ({ ...prev, [applicationId]: 100 }))
              fetchApplications()
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.status === 'processing') {
                setScoringProgress(prev => ({ 
                  ...prev, 
                  [applicationId]: Math.min((prev[applicationId] || 0) + 10, 90) 
                }))
              } else if (parsed.status === 'completed') {
                setScoringProgress(prev => ({ ...prev, [applicationId]: 100 }))
                fetchApplications()
                toast({
                  title: 'Evaluare completă',
                  description: `CV-ul a fost evaluat cu scorul ${parsed.result?.overallScore || 'N/A'}`
                })
                return
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Scoring failed')
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Eroare la evaluare',
        description: 'Nu s-a putut evalua CV-ul',
        variant: 'destructive'
      })
      setScoringProgress(prev => ({ ...prev, [applicationId]: 0 }))
    }
  }

  const getStatusLabel = (status: string) => {
    const statuses: {[key: string]: string} = {
      'PENDING': 'În așteptare',
      'REVIEWING': 'În evaluare',
      'INTERVIEWED': 'Intervievat',
      'ACCEPTED': 'Acceptat',
      'REJECTED': 'Respins',
      'WITHDRAWN': 'Retras'
    }
    return statuses[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: {[key: string]: string} = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'REVIEWING': 'bg-blue-100 text-blue-800',
      'INTERVIEWED': 'bg-purple-100 text-purple-800',
      'ACCEPTED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'WITHDRAWN': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredApplications = applications?.filter((app: any) => 
    statusFilter === 'all' || app?.status === statusFilter
  ) || []

  const renderScoreInfo = (score: any) => {
    if (!score) return null

    return (
      <div className="bg-gray-50 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Evaluare AI</h4>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-lg font-bold text-gray-900">{score.overallScore}/100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Puncte forte
            </h5>
            <ul className="space-y-1">
              {score.pros?.map((pro: string, index: number) => (
                <li key={index} className="text-sm text-gray-700">• {pro}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-red-700 mb-2 flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Zone de îmbunătățire
            </h5>
            <ul className="space-y-1">
              {score.cons?.map((con: string, index: number) => (
                <li key={index} className="text-sm text-gray-700">• {con}</li>
              ))}
            </ul>
          </div>
        </div>

        {score.feedback && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">{score.feedback}</p>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isRecruiter ? 'Aplicații primite' : 'Aplicațiile mele'}
          </CardTitle>
          <CardDescription>
            {isRecruiter 
              ? 'Gestionează aplicațiile primite pentru locurile de muncă postate'
              : 'Vezi statusul aplicațiilor tale la locurile de muncă'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toate statusurile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate statusurile</SelectItem>
                <SelectItem value="PENDING">În așteptare</SelectItem>
                <SelectItem value="REVIEWING">În evaluare</SelectItem>
                <SelectItem value="INTERVIEWED">Intervievat</SelectItem>
                <SelectItem value="ACCEPTED">Acceptat</SelectItem>
                <SelectItem value="REJECTED">Respins</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              {filteredApplications?.length || 0} aplicații
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredApplications?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nu există aplicații
              </h3>
              <p className="text-gray-600">
                {isRecruiter 
                  ? 'Nu ai primit încă aplicații pentru locurile de muncă postate.'
                  : 'Nu ai aplicat încă la niciun loc de muncă.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredApplications?.map((application: any) => (
            <Card key={application?.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {isRecruiter ? application?.candidate?.firstName + ' ' + application?.candidate?.lastName : application?.job?.title}
                      </h3>
                      <Badge className={getStatusColor(application?.status)}>
                        {getStatusLabel(application?.status)}
                      </Badge>
                      {application?.score && (
                        <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                          <Star className="mr-1 h-3 w-3" />
                          {application?.score?.overallScore}/100
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {isRecruiter ? (
                        <>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{application?.candidate?.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Pentru: {application?.job?.title}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{application?.job?.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application?.job?.location}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Aplicat la {application?.appliedAt ? format(new Date(application.appliedAt), "dd MMM yyyy", { locale: ro }) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {application?.coverLetter && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Scrisoare de intenție</h4>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Scoring Progress */}
                    {scoringProgress[application?.id] > 0 && scoringProgress[application?.id] < 100 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Evaluare în progres...
                          </span>
                          <span className="text-sm text-gray-500">
                            {scoringProgress[application?.id]}%
                          </span>
                        </div>
                        <Progress value={scoringProgress[application?.id]} className="w-full" />
                      </div>
                    )}

                    {renderScoreInfo(application?.score)}
                  </div>

                  {isRecruiter && (
                    <div className="ml-6 flex flex-col gap-2">
                      {!application?.score && (
                        <Button 
                          size="sm"
                          onClick={() => scoreApplication(application?.id)}
                          disabled={scoringProgress[application?.id] > 0}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Award className="mr-2 h-4 w-4" />
                          {scoringProgress[application?.id] > 0 ? 'Evaluez...' : 'Evaluează CV'}
                        </Button>
                      )}
                      
                      <Select 
                        value={application?.status} 
                        onValueChange={(value) => updateApplicationStatus(application?.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">În așteptare</SelectItem>
                          <SelectItem value="REVIEWING">În evaluare</SelectItem>
                          <SelectItem value="INTERVIEWED">Intervievat</SelectItem>
                          <SelectItem value="ACCEPTED">Acceptat</SelectItem>
                          <SelectItem value="REJECTED">Respins</SelectItem>
                        </SelectContent>
                      </Select>

                      {application?.resume && (
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Descarcă CV
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
