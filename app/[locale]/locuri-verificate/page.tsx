import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Building, DollarSign, Home, Car } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function LocuriVerificatePage() {
  const t = useTranslations('verified')
  
  const verifiedJobs = [
    {
      id: 1,
      title: t('jobs.forestryWorker'),
      company: "Danish Forest Management A/S",
      location: "Jutland, Danemarca",
      salary: "120 DKK/oră",
      accommodation: t('accommodationProvided'),
      transport: t('transportProvided'),
      requirements: t('forestryRequirements'),
      verified: true
    },
    {
      id: 2,
      title: t('jobs.greenhouseOperator'),
      company: "GreenHouse Nordic ApS",
      location: "Fyn, Danemarca",
      salary: "115 DKK/oră",
      accommodation: t('accommodationProvided'),
      transport: t('transportProvided'),
      requirements: t('horticultureRequirements'),
      verified: true
    },
    {
      id: 3,
      title: t('jobs.animalCareSpecialist'),
      company: "Nordic Pig Farm A/S",
      location: "Sjælland, Danemarca",
      salary: "125 DKK/oră",
      accommodation: t('accommodationProvided'),
      transport: t('transportProvided'),
      requirements: t('animalCareRequirements'),
      verified: true
    },
    {
      id: 4,
      title: t('jobs.fruitHarvester'),
      company: "Danish Fruit Gardens",
      location: "Bornholm, Danemarca",
      salary: "110 DKK/oră",
      accommodation: t('accommodationProvided'),
      transport: t('transportProvided'),
      requirements: t('fruitHarvestRequirements'),
      verified: true
    },
    {
      id: 5,
      title: t('jobs.agriculturalWorker'),
      company: "Jutland Cereals Farm",
      location: "Nordjylland, Danemarca",
      salary: "118 DKK/oră",
      accommodation: t('accommodationProvided'),
      transport: t('transportProvided'),
      requirements: t('agricultureRequirements'),
      verified: true
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">
            {t('pageDescription')}
          </p>
        </div>

        {/* Benefits */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Building className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <CardTitle className="text-lg">{t('verifiedCompanies')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('verifiedCompaniesDescription')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">{t('competitiveSalaries')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('competitiveSalariesDescription')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Home className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <CardTitle className="text-lg">{t('accommodationAvailable')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('accommodationDescription')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Car className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <CardTitle className="text-lg">{t('transportProvidedTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('transportDescription')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {verifiedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {job.title}
                      {job.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {t('verifiedBadge')}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <Button>{t('applyNow')}</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{job.salary}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.accommodation}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.transport}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-2">{t('requirements')}:</h4>
                  <p className="text-sm text-muted-foreground">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verification Process */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t('verificationProcessTitle')}</CardTitle>
            <CardDescription>
              {t('verificationProcessDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3">{t('employerVerification')}</h4>
                <ul className="text-sm space-y-2">
                  <li>• {t('cvrVerification')}</li>
                  <li>• {t('licenseConfirmation')}</li>
                  <li>• {t('financialHistoryCheck')}</li>
                  <li>• {t('mandatoryInsuranceConfirmation')}</li>
                  <li>• {t('employeeReferencesCheck')}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">{t('offerVerification')}</h4>
                <ul className="text-sm space-y-2">
                  <li>• {t('contractConfirmation')}</li>
                  <li>• {t('salaryComplianceCheck')}</li>
                  <li>• {t('accommodationConditionsConfirmation')}</li>
                  <li>• {t('transportVerification')}</li>
                  <li>• {t('medicalInsuranceConfirmation')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
