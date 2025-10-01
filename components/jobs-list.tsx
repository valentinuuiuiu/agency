
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Euro, 
  Calendar, 
  Building,
  Users,
  Heart,
  ExternalLink,
  Send
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import JobApplicationDialog from '@/components/job-application-dialog'

export default function JobsList() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, categoryFilter, locationFilter])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca locurile de muncă',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs.filter((job: any) => {
      const matchesSearch = job?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           job?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                           job?.company?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || job?.category === categoryFilter
      
      const matchesLocation = !locationFilter || 
                             job?.location?.toLowerCase()?.includes(locationFilter?.toLowerCase())
      
      return matchesSearch && matchesCategory && matchesLocation
    })

    setFilteredJobs(filtered)
  }

  const handleApply = (job: any) => {
    setSelectedJob(job)
    setShowApplicationDialog(true)
  }

  const getCategoryLabel = (category: string) => {
    const categories: {[key: string]: string} = {
      'FORESTRY': 'Silvicultură',
      'AGRICULTURE': 'Agricultură',
      'GREENHOUSE': 'Seră',
      'FRUIT_HARVESTING': 'Recoltare fructe',
      'ANIMAL_CARE': 'Îngrijire animale',
      'TREE_PLANTING': 'Plantare arbori',
      'LOGGING': 'Exploatare forestieră',
      'PARK_MAINTENANCE': 'Întreținere parcuri'
    }
    return categories[category] || category
  }

  const getContractTypeLabel = (contractType: string) => {
    const types: {[key: string]: string} = {
      'FULL_TIME': 'Normă întreagă',
      'PART_TIME': 'Program parțial',
      'SEASONAL': 'Sezonier',
      'TEMPORARY': 'Temporar'
    }
    return types[contractType] || contractType
  }

  const getExperienceLabel = (level: string) => {
    const levels: {[key: string]: string} = {
      'BEGINNER': 'Începător',
      'INTERMEDIATE': 'Intermediar',
      'ADVANCED': 'Avansat',
      'EXPERT': 'Expert'
    }
    return levels[level] || level
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
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
    <>
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Caută locuri de muncă
            </CardTitle>
            <CardDescription>
              Găsește oportunități în silvicultură și agricultură în Danemarca
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Caută după titlu, companie sau cuvinte cheie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtrează
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toate categoriile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toate categoriile</SelectItem>
                      <SelectItem value="FORESTRY">Silvicultură</SelectItem>
                      <SelectItem value="AGRICULTURE">Agricultură</SelectItem>
                      <SelectItem value="GREENHOUSE">Seră</SelectItem>
                      <SelectItem value="FRUIT_HARVESTING">Recoltare fructe</SelectItem>
                      <SelectItem value="ANIMAL_CARE">Îngrijire animale</SelectItem>
                      <SelectItem value="TREE_PLANTING">Plantare arbori</SelectItem>
                      <SelectItem value="LOGGING">Exploatare forestieră</SelectItem>
                      <SelectItem value="PARK_MAINTENANCE">Întreținere parcuri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    placeholder="Locația..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{filteredJobs?.length || 0} locuri găsite</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nu s-au găsit locuri de muncă
                </h3>
                <p className="text-gray-600">
                  Încearcă să modifici criteriile de căutare sau să revii mai târziu.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs?.map((job: any) => (
              <Card key={job?.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job?.title}
                        </h3>
                        <Badge variant="secondary">
                          {getCategoryLabel(job?.category)}
                        </Badge>
                        {job?.seasonalWork && (
                          <Badge variant="outline">Sezonier</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{job?.company}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job?.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{getContractTypeLabel(job?.contractType)}</span>
                        </div>
                        {job?.salary && (
                          <div className="flex items-center gap-1">
                            <Euro className="h-4 w-4" />
                            <span>{job?.salary}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {job?.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          <strong>Experiență:</strong> {getExperienceLabel(job?.experienceRequired)}
                        </span>
                        {job?.housingProvided && (
                          <Badge variant="outline" className="text-green-700 border-green-200">
                            Cazare inclusă
                          </Badge>
                        )}
                        {job?.transportProvided && (
                          <Badge variant="outline" className="text-blue-700 border-blue-200">
                            Transport inclus
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col gap-2">
                      <Button 
                        onClick={() => handleApply(job)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Aplică
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Detalii
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Postat la {job?.createdAt ? format(new Date(job.createdAt), "dd MMM yyyy", { locale: ro }) : 'N/A'}
                      {job?.startDate && (
                        <span className="ml-4">
                          • Start: {format(new Date(job.startDate), "dd MMM yyyy", { locale: ro })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{job?._count?.applications || 0} aplicații</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <JobApplicationDialog
        job={selectedJob}
        open={showApplicationDialog}
        onOpenChange={setShowApplicationDialog}
        onApplicationSubmitted={() => {
          setShowApplicationDialog(false)
          toast({
            title: 'Aplicația a fost trimisă',
            description: 'Vei fi contactat în curând de către recruiter'
          })
        }}
      />
    </>
  )
}
