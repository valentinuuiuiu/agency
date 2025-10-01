
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  LogOut, 
  Plus, 
  Briefcase, 
  FileText, 
  Star, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react'
import JobPostForm from '@/components/job-post-form'
import ResumeUpload from '@/components/resume-upload'
import JobsList from '@/components/jobs-list'
import ApplicationsList from '@/components/applications-list'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingReviews: 0,
    acceptedApplications: 0
  })

  useEffect(() => {
    if (session?.user) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isRecruiter = session.user?.role === 'RECRUITER'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Bun venit, {session.user?.firstName || session.user?.name}!
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {isRecruiter ? 'Recruiter' : 'Candidat'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Deconectează-te
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Prezentare generală</TabsTrigger>
            <TabsTrigger value="jobs">{isRecruiter ? 'Locurile mele' : 'Locuri disponibile'}</TabsTrigger>
            <TabsTrigger value="applications">{isRecruiter ? 'Aplicații primite' : 'Aplicațiile mele'}</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {isRecruiter ? 'Locuri postate' : 'Aplicații trimise'}
                    </CardTitle>
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isRecruiter ? stats.totalJobs : stats.totalApplications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {isRecruiter ? 'Aplicații primite' : 'În așteptare'}
                    </CardTitle>
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isRecruiter ? stats.totalApplications : stats.pendingReviews}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {isRecruiter ? 'În evaluare' : 'Acceptate'}
                    </CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{isRecruiter ? stats.pendingReviews : stats.acceptedApplications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {isRecruiter ? 'Acceptate' : 'Scor mediu CV'}
                    </CardTitle>
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isRecruiter ? stats.acceptedApplications : '85'}
                    {!isRecruiter && <span className="text-sm font-normal text-gray-500">/100</span>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acțiuni rapide</CardTitle>
                <CardDescription>
                  {isRecruiter 
                    ? 'Gestionează locurile de muncă și aplicațiile' 
                    : 'Găsește locuri de muncă și aplică'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isRecruiter ? (
                    <>
                      <Button className="h-auto flex flex-col items-center p-6" onClick={() => setActiveTab('jobs')}>
                        <Plus className="h-8 w-8 mb-2" />
                        <span>Postează un loc de muncă</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex flex-col items-center p-6" onClick={() => setActiveTab('applications')}>
                        <Eye className="h-8 w-8 mb-2" />
                        <span>Vezi aplicațiile</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex flex-col items-center p-6">
                        <Download className="h-8 w-8 mb-2" />
                        <span>Exportă raport</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className="h-auto flex flex-col items-center p-6" onClick={() => setActiveTab('jobs')}>
                        <Search className="h-8 w-8 mb-2" />
                        <span>Căută locuri de muncă</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex flex-col items-center p-6" onClick={() => setActiveTab('profile')}>
                        <FileText className="h-8 w-8 mb-2" />
                        <span>Încarcă CV</span>
                      </Button>
                      <Button variant="outline" className="h-auto flex flex-col items-center p-6" onClick={() => setActiveTab('applications')}>
                        <Eye className="h-8 w-8 mb-2" />
                        <span>Vezi aplicațiile mele</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            {isRecruiter ? <JobPostForm /> : <JobsList />}
          </TabsContent>

          <TabsContent value="applications">
            {isRecruiter ? <ApplicationsList isRecruiter={true} /> : <ApplicationsList isRecruiter={false} />}
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informații profil</CardTitle>
                  <CardDescription>Detaliile contului tău</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nume complet</label>
                    <p className="text-gray-900">{session.user?.firstName} {session.user?.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{session.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefon</label>
                    <p className="text-gray-900">{session.user?.phone || 'Necompletat'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rol</label>
                    <Badge variant="outline" className="ml-2">
                      {isRecruiter ? 'Recruiter' : 'Candidat'}
                    </Badge>
                  </div>
                  {!isRecruiter && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nivel experiență</label>
                      <Badge variant="secondary" className="ml-2">
                        {session.user?.experienceLevel === 'BEGINNER' && 'Începător'}
                        {session.user?.experienceLevel === 'INTERMEDIATE' && 'Intermediar'}
                        {session.user?.experienceLevel === 'ADVANCED' && 'Avansat'}
                        {session.user?.experienceLevel === 'EXPERT' && 'Expert'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {!isRecruiter && <ResumeUpload />}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
