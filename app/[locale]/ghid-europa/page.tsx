import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, FileText, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function GhidEuropaPage() {
  const t = useTranslations('guide')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">
            {t('pageDescription')}
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">{t('noVisaTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('noVisaDescription')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <CardTitle className="text-lg">{t('cprTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('cprDescription')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <CardTitle className="text-lg">{t('conditionsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('conditionsDescription')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CPR Registration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('cprSectionTitle')}
            </CardTitle>
            <CardDescription>
              {t('cprSectionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">{t('whatIsCpr')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('whatIsCprDescription')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t('cprStructure')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('cprStructureDescription')}
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-800">{t('cprStepsTitle')}</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>{t('cprStep1')}</li>
                <li>{t('cprStep2')}</li>
                <li>{t('cprStep3')}</li>
                <li>{t('cprStep4')}</li>
                <li>{t('cprStep5')}</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Language Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('languageTitle')}
            </CardTitle>
            <CardDescription>
              {t('languageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{t('physicalWork')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('physicalWorkDescription')}
                  </p>
                </div>
                <Badge variant="secondary">{t('physicalLevel')}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{t('serviceWork')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('serviceWorkDescription')}
                  </p>
                </div>
                <Badge variant="secondary">{t('serviceLevel')}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{t('specializedWork')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('specializedWorkDescription')}
                  </p>
                </div>
                <Badge variant="secondary">{t('specializedLevel')}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Conditions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('workingConditionsTitle')}
            </CardTitle>
            <CardDescription>
              {t('workingConditionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t('employeeRightsTitle')}
                </h4>
                <ul className="text-sm space-y-2">
                  {Object.values(t('employeeRights')).map((right: string, index: number) => (
                    <li key={index}>• {right}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  {t('legalObligationsTitle')}
                </h4>
                <ul className="text-sm space-y-2">
                  {Object.values(t('legalObligations')).map((obligation: string, index: number) => (
                    <li key={index}>• {obligation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('assistanceTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">{t('consularAssistance')}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('consularDescription')}
                </p>
                <Button variant="outline" size="sm">
                  {t('contactUs')}
                </Button>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">{t('employmentSupport')}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('employmentDescription')}
                </p>
                <Button variant="outline" size="sm">
                  {t('scheduleConsulting')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
