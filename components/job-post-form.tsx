
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CalendarIcon, Plus, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'

export default function JobPostForm() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    company: '',
    contactEmail: session?.user?.email || '',
    contactPhone: '',
    salary: '',
    workingHours: '37-40 ore/săptămână',
    contractType: 'FULL_TIME',
    languageRequirement: 'BASIC',
    experienceRequired: 'BEGINNER',
    seasonalWork: false,
    housingProvided: false,
    transportProvided: false,
    requirements: '',
    benefits: ''
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const jobData = {
        ...formData,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      })

      if (response.ok) {
        toast({
          title: 'Loc de muncă postat cu succes',
          description: 'Locul de muncă a fost publicat și este acum vizibil candidaților'
        })
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          location: '',
          company: '',
          contactEmail: session?.user?.email || '',
          contactPhone: '',
          salary: '',
          workingHours: '37-40 ore/săptămână',
          contractType: 'FULL_TIME',
          languageRequirement: 'BASIC',
          experienceRequired: 'BEGINNER',
          seasonalWork: false,
          housingProvided: false,
          transportProvided: false,
          requirements: '',
          benefits: ''
        })
        setStartDate(undefined)
        setEndDate(undefined)
      } else {
        const error = await response.json()
        toast({
          title: 'Eroare la postarea locului de muncă',
          description: error.message || 'A apărut o eroare',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error posting job:', error)
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la postarea locului de muncă',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Postează un nou loc de muncă
        </CardTitle>
        <CardDescription>
          Completează formularul pentru a posta un loc de muncă în silvicultură sau agricultură
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informații de bază</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titlul postului *</Label>
                <Input
                  id="title"
                  placeholder="ex. Muncitor în silvicultură"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alege categoria" />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Compania *</Label>
                <Input
                  id="company"
                  placeholder="ex. Danish Agriculture Co."
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Locația *</Label>
                <Input
                  id="location"
                  placeholder="ex. Copenhagen, Danemarca"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrierea postului *</Label>
              <Textarea
                id="description"
                placeholder="Descrie responsabilitățile, activitățile zilnice și ce implică locul de muncă..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Detalii contract</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractType">Tipul contractului</Label>
                <Select value={formData.contractType} onValueChange={(value) => handleInputChange('contractType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Normă întreagă</SelectItem>
                    <SelectItem value="PART_TIME">Program parțial</SelectItem>
                    <SelectItem value="SEASONAL">Sezonier</SelectItem>
                    <SelectItem value="TEMPORARY">Temporar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workingHours">Orele de lucru</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours}
                  onChange={(e) => handleInputChange('workingHours', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salariul (opțional)</Label>
                <Input
                  id="salary"
                  placeholder="ex. 150-180 DKK/oră"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceRequired">Experiența necesară</Label>
                <Select value={formData.experienceRequired} onValueChange={(value) => handleInputChange('experienceRequired', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Începător</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediar</SelectItem>
                    <SelectItem value="ADVANCED">Avansat</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languageRequirement">Cerințe de limbă</Label>
              <Select value={formData.languageRequirement} onValueChange={(value) => handleInputChange('languageRequirement', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Fără cerințe speciale</SelectItem>
                  <SelectItem value="BASIC">Engleza de bază</SelectItem>
                  <SelectItem value="INTERMEDIATE">Engleza intermediară</SelectItem>
                  <SelectItem value="ADVANCED">Engleza avansată</SelectItem>
                  <SelectItem value="NATIVE">Daneza nativă</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Perioada de lucru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de început</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full pl-3 text-left font-normal">
                      {startDate ? format(startDate, "PPP", { locale: ro }) : "Alege data"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date: Date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data de sfârșit (opțional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full pl-3 text-left font-normal">
                      {endDate ? format(endDate, "PPP", { locale: ro }) : "Alege data"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date: Date) => startDate ? date < startDate : date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Beneficii și facilități</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="seasonalWork"
                  checked={formData.seasonalWork}
                  onCheckedChange={(checked) => handleInputChange('seasonalWork', checked)}
                />
                <Label htmlFor="seasonalWork">Muncă sezonieră</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="housingProvided"
                  checked={formData.housingProvided}
                  onCheckedChange={(checked) => handleInputChange('housingProvided', checked)}
                />
                <Label htmlFor="housingProvided">Cazare furnizată</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="transportProvided"
                  checked={formData.transportProvided}
                  onCheckedChange={(checked) => handleInputChange('transportProvided', checked)}
                />
                <Label htmlFor="transportProvided">Transport furnizat</Label>
              </div>
            </div>
          </div>

          {/* Requirements and Benefits */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Cerințe și calificări *</Label>
              <Textarea
                id="requirements"
                placeholder="ex. Experiență în agricultură, permis de conducere, capacitate de lucru fizic..."
                className="min-h-[100px]"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="benefits">Beneficii suplimentare</Label>
              <Textarea
                id="benefits"
                placeholder="ex. Asigurare medicală, masă gratuită, bonus de performanță..."
                className="min-h-[100px]"
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informații de contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de contact *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefon de contact</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+45 12345678"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Se postează...' : 'Postează locul de muncă'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
