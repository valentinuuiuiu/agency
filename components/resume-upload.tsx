
'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'

export default function ResumeUpload() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resumes, setResumes] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Format neacceptat',
          description: 'Te rugăm să încarci doar fișiere PDF',
          variant: 'destructive'
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'Fișier prea mare',
          description: 'Fișierul nu poate fi mai mare de 10MB',
          variant: 'destructive'
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('resume', selectedFile)

      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          toast({
            title: 'CV încărcat cu succes',
            description: 'CV-ul tău a fost salvat și este gata de utilizare'
          })
          setSelectedFile(null)
          setUploadProgress(0)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          fetchResumes()
        } else {
          const error = JSON.parse(xhr.responseText)
          toast({
            title: 'Eroare la încărcare',
            description: error.message || 'A apărut o eroare la încărcarea CV-ului',
            variant: 'destructive'
          })
        }
        setUploading(false)
      }

      xhr.onerror = () => {
        toast({
          title: 'Eroare de rețea',
          description: 'A apărut o eroare de rețea la încărcarea CV-ului',
          variant: 'destructive'
        })
        setUploading(false)
      }

      xhr.open('POST', '/api/resume/upload')
      xhr.send(formData)

    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare neașteptată',
        variant: 'destructive'
      })
      setUploading(false)
    }
  }

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

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const response = await fetch(`/api/resume/${resumeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'CV șters',
          description: 'CV-ul a fost șters cu succes'
        })
        fetchResumes()
      } else {
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut șterge CV-ul',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la ștergerea CV-ului',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Încarcă CV-ul
          </CardTitle>
          <CardDescription>
            Încarcă CV-ul în format PDF pentru a putea aplica la locurile de muncă. 
            Sistemul nostru AI va evalua automat compatibilitatea cu posturile disponibile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Încarcă CV-ul tău
                </h3>
                <p className="text-gray-600 mb-4">
                  Apasă pentru a selecta un fișier PDF sau trage și lasă aici
                </p>
                <p className="text-sm text-gray-500">
                  Maximum 10MB • Doar format PDF
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeSelectedFile}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-600 text-center">
                      Se încarcă... {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? `Se încarcă... ${uploadProgress}%` : 'Încarcă CV-ul'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Schimbă fișierul
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Resumes */}
      {resumes?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>CV-urile mele</CardTitle>
            <CardDescription>
              CV-urile încărcate și disponibile pentru aplicații
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resumes.map((resume: any) => (
                <div key={resume.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{resume.originalName}</p>
                      <p className="text-sm text-gray-500">
                        Încărcat la {new Date(resume.uploadedAt).toLocaleDateString('ro-RO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Descarcă
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteResume(resume.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Sfaturi pentru un CV de succes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Asigură-te că CV-ul este în română sau engleză</li>
                <li>• Menționează experiența în agricultură sau silvicultură</li>
                <li>• Include informații despre cunoștințele de limbi străine</li>
                <li>• Specifică disponibilitatea pentru muncă în Danemarca</li>
                <li>• Menționează dacă ai permis de conducere</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
