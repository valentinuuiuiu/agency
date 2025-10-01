'use client'

import React from 'react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, Star, TrendingUp, AlertCircle } from 'lucide-react'

export default function EvaluareCVPage() {
  const t = useTranslations('cv')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCvFile(file)
    }
  }

  const handleAnalyze = async () => {
    if (!cvFile || !jobDescription.trim()) return

    setIsAnalyzing(true)
    
    // Simulate AI analysis - in real app, this would call your AI service
    setTimeout(() => {
      setAnalysisResult({
        score: 85,
        strengths: [
          "Experiență relevantă în silvicultură și lucrul utilaje grele",
          "Cunoștințe de bază de limba daneză și engleză"
        ],
        improvements: [
          "Dezvoltare abilități de comunicare în daneză avansată",
          "Obținerea certificărilor necesare pentru lucrul în Danemarca"
        ],
        detailedFeedback: "CV-ul tău arată promițător pentru poziții în silvicultură. Experiența ta anterioară în lucrul cu utilaje forestiere este un avantaj major. Recomandăm să continui studiul limbii daneze și să obții certificările necesare pentru a-ți crește șansele de angajare."
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">
            {t('pageDescription')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t('uploadTitle')}
              </CardTitle>
              <CardDescription>
                {t('uploadDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {cvFile ? cvFile.name : t('uploadButton')}
                    </p>
                  </label>
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!cvFile || !jobDescription.trim() || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? t('analyzing') : t('analyzeButton')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Job Description Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('jobDescriptionTitle')}</CardTitle>
              <CardDescription>
                {t('jobDescriptionDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-description">{t('jobDescriptionLabel')}</Label>
                  <Textarea
                    id="job-description"
                    placeholder={t('jobDescriptionPlaceholder')}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setJobDescription('Muncitor silvic cu experiență în tăierea arborilor, operarea drujbei și utilajelor forestiere. Cunoștințe de bază de limba daneză. Disponibilitate deplasare Danemarca.')}
                  className="w-full"
                >
                  {t('useExample')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                {t('resultsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score */}
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {analysisResult.score}/100
                </div>
                <Progress value={analysisResult.score} className="w-full max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  {t('scoreLabel')}
                </p>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  {t('strengthsTitle')}
                </h3>
                <div className="space-y-2">
                  {analysisResult.strengths.map((strength: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {index + 1}
                      </Badge>
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  {t('improvementsTitle')}
                </h3>
                <div className="space-y-2">
                  {analysisResult.improvements.map((improvement: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {index + 1}
                      </Badge>
                      <p className="text-sm">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Feedback */}
              <div>
                <h3 className="font-semibold mb-3">{t('feedbackTitle')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysisResult.detailedFeedback}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
