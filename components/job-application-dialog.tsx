
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Send, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Upload,
  Eye
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

interface JobApplicationDialogProps {
  job: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplicationSubmitted: () => void
}

export default function JobApplicationDialog({ 
  job, 
  open, 
  onOpenChange, 
  onApplicationSubmitted 
}: JobApplicationDialogProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [resumes, setResumes] = useState([])
  const [hasExistingApplication, setHasExistingApplication] = useState(false)

  useEffect(() => {
    if (open && job) {
      fetchResumes()
      checkExistingApplication()
    }
  }, [open, job])

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resume/list')
      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes || [])
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
    }
  }

  const checkExistingApplication = async () => {
    if (!job?.id) return
    
    try {
      const response = await fetch(`/api/applications/check/${job.id}`)
      if (response.ok) {
        const data = await response.json()
        setHasExistingApplication(data.hasApplied)
      }
    } catch (error) {
      console.error('Error checking application:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedResumeId) {
      toast({
        title: 'CV lipsește',
        description: 'Te rugăm să selectezi un CV pentru această aplicație',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          resumeId: selectedResumeId,
          coverLetter: coverLetter || null
        })
      })

      if (response.ok) {
        toast({
          title: 'Aplicație trimisă cu succes',
          description: 'Recruiterul va evalua aplicația ta și te va contacta în curând'
        })
        onApplicationSubmitted()
        setCoverLetter('')
        setSelectedResumeId('')
      } else {
        const error = await response.json()
        toast({
          title: 'Eroare la trimiterea aplicației',
          description: error.message || 'A apărut o eroare',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la trimiterea aplicației',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Aplică pentru acest post
          </DialogTitle>
          <DialogDescription>
            Completează formularul pentru a aplica la acest loc de muncă
          </DialogDescription>
        </DialogHeader>

        {hasExistingApplication ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ai aplicat deja la acest post
            </h3>
            <p className="text-gray-600 mb-4">
              Aplicația ta este în curs de evaluare. Vei fi contactat de către recruiter în curând.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Închide
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Job Summary */}
            {job && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getCategoryLabel(job.category)}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {job.company} • {job.location}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {job.description}
                  </p>
                  {job.salary && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Salariu:</strong> {job.salary}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resume Selection */}
              <div className="space-y-3">
                <Label>Selectează CV-ul *</Label>
                {resumes?.length === 0 ? (
                  <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-orange-900">Nu ai încărcat încă un CV</h4>
                        <p className="text-sm text-orange-800 mt-1">
                          Pentru a aplica la acest post, trebuie să încarci mai întâi un CV în secțiunea Profil.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alege CV-ul pentru această aplicație" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes?.map((resume: any) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{resume.originalName}</span>
                            <span className="text-xs text-gray-500">
                              ({new Date(resume.uploadedAt).toLocaleDateString('ro-RO')})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Cover Letter */}
              <div className="space-y-3">
                <Label htmlFor="coverLetter">
                  Scrisoare de intenție (opțional)
                </Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Prezintă-te scurt și explică de ce ești potrivit pentru acest post..."
                  className="min-h-[150px]"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  O scrisoare de intenție personalizată poate îmbunătăți șansele tale de a fi selectat.
                </p>
              </div>

              {/* Danish Work Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Informații importante pentru munca în Danemarca
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Ca cetățean UE, nu ai nevoie de viză pentru a lucra în Danemarca</li>
                        <li>• Trebuie să te înregistrezi pentru CPR (număr personal) dacă stai peste 3 luni</li>
                        <li>• Înregistrarea se face la SIRI (Danish Agency for International Recruitment)</li>
                        <li>• Majoritatea posturilor oferă 37-40 ore/săptămână și minimum 5 săptămâni concediu plătit</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 bg-green-600 hover:bg-green-700" 
                  disabled={loading || resumes?.length === 0}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Se trimite...' : 'Trimite aplicația'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Anulează
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
