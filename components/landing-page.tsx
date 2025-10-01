'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Briefcase, FileText, Award, Globe, Phone, Mail, ArrowRight, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthDialog from '@/components/auth-dialog'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/language-switcher'
import { useSession, signOut } from 'next-auth/react'

const CONTACT_EMAIL_1 = process.env.NEXT_PUBLIC_CONTACT_EMAIL_1 || 'ionutbaltag3@gmail.com'
const CONTACT_EMAIL_2 = process.env.NEXT_PUBLIC_CONTACT_EMAIL_2 || 'work5@dr.dk'
const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+40786538708'

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const t = useTranslations('landing')
  const tNav = useTranslations('nav')
  const { data: session } = useSession()

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Locuri de Muncă Danemarca</h1>
                <p className="text-sm text-gray-600">Silvicultură & Agricultură</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              {session ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {tNav('hello')}, {session.user?.firstName || session.user?.name}
                  </span>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="mr-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
                        Admin
                      </Button>
                    </Link>
                  )}
                  {session.user.role === 'AGENCY_OWNER' && (
                    <Link href="/agency">
                      <Button variant="outline" size="sm" className="mr-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Agency
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="sm" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">{tNav('logout')}</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline" onClick={() => openAuth('login')}>
                    {tNav('login')}
                  </Button>
                  <Button onClick={() => openAuth('signup')} className="bg-green-600 hover:bg-green-700">
                    {tNav('signup')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {t('title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('description')}
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button 
                  size="lg" 
                  onClick={() => openAuth('signup')} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Users className="mr-2 h-5 w-5" />
                  {t('ctaCandidate')}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => openAuth('signup')} 
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  {t('ctaEmployer')}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white/60">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="text-3xl font-bold text-green-600">28,235</div>
                <div className="text-sm text-gray-600">{t('stats.jobs')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-3xl font-bold text-blue-600">71,204</div>
                <div className="text-sm text-gray-600">{t('stats.candidates')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="text-3xl font-bold text-purple-600">37-40</div>
                <div className="text-sm text-gray-600">{t('stats.hours')}</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="text-3xl font-bold text-orange-600">5</div>
                <div className="text-sm text-gray-600">{t('stats.weeks')}</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {t('features.title')}
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('features.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-blue-100 p-3 rounded-lg w-fit">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>{t('features.cv.title')}</CardTitle>
                    <CardDescription>
                      {t('features.cv.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col">
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li>• {t('features.cv.bullet1')}</li>
                      <li>• {t('features.cv.bullet2')}</li>
                      <li>• {t('features.cv.bullet3')}</li>
                      <li>• {t('features.cv.bullet4')}</li>
                    </ul>
                    <Link href="/evaluare-cv">
                      <Button variant="outline" size="sm" className="w-full">
                        {t('features.cv.cta')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-green-100 p-3 rounded-lg w-fit">
                      <Globe className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>{t('features.guide.title')}</CardTitle>
                    <CardDescription>
                      {t('features.guide.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col">
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li>• {t('features.guide.bullet1')}</li>
                      <li>• {t('features.guide.bullet2')}</li>
                      <li>• {t('features.guide.bullet3')}</li>
                      <li>• {t('features.guide.bullet4')}</li>
                    </ul>
                    <Link href="/ghid-europa">
                      <Button variant="outline" size="sm" className="w-full">
                        {t('features.guide.cta')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="bg-purple-100 p-3 rounded-lg w-fit">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>{t('features.jobs.title')}</CardTitle>
                    <CardDescription>
                      {t('features.jobs.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col">
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li>• {t('features.jobs.bullet1')}</li>
                      <li>• {t('features.jobs.bullet2')}</li>
                      <li>• {t('features.jobs.bullet3')}</li>
                      <li>• {t('features.jobs.bullet4')}</li>
                    </ul>
                    <Link href="/locuri-verificate">
                      <Button variant="outline" size="sm" className="w-full">
                        {t('features.jobs.cta')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Job Categories Section */}
        <section className="py-20 bg-white/60 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {t('categories.title')}
              </h3>
              <p className="text-lg text-gray-600">
                {t('categories.description')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: t('categories.silviculture'), count: '250+', color: 'green' },
                { name: t('categories.agriculture'), count: '180+', color: 'blue' },
                { name: t('categories.greenhouses'), count: '120+', color: 'purple' },
                { name: t('categories.fruitHarvest'), count: '90+', color: 'orange' },
                { name: t('categories.animalCare'), count: '75+', color: 'red' },
                { name: t('categories.treePlanting'), count: '60+', color: 'teal' },
                { name: t('categories.forestry'), count: '45+', color: 'indigo' },
                { name: t('categories.parkMaintenance'), count: '30+', color: 'pink' }
              ].map((category, index) => {
                const badgeClass = clsx('mb-2', {
                  'bg-green-100 text-green-700': category.color === 'green',
                  'bg-blue-100 text-blue-700': category.color === 'blue',
                  'bg-purple-100 text-purple-700': category.color === 'purple',
                  'bg-orange-100 text-orange-700': category.color === 'orange',
                  'bg-red-100 text-red-700': category.color === 'red',
                  'bg-teal-100 text-teal-700': category.color === 'teal',
                  'bg-indigo-100 text-indigo-700': category.color === 'indigo',
                  'bg-pink-100 text-pink-700': category.color === 'pink'
                })
                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Badge variant="secondary" className={badgeClass}>
                          {category.count}
                        </Badge>
                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h3 className="text-2xl font-bold mb-8">{t('contact.title')}</h3>
            <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <a href={`mailto:${CONTACT_EMAIL_1}`} className="underline">{CONTACT_EMAIL_1}</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <a href={`mailto:${CONTACT_EMAIL_2}`} className="underline">{CONTACT_EMAIL_2}</a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <a href={`tel:${CONTACT_PHONE}`} className="underline">{CONTACT_PHONE}</a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <AuthDialog 
        open={showAuth} 
        onOpenChange={setShowAuth} 
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  )
}
