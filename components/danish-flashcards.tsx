'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, RefreshCw, ThumbsDown, ThumbsUp, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Flashcard {
  id: string
  romanian: string
  danish: string
  english: string
  example: string
  score?: number // 0-5 for spaced repetition
}

export default function DanishFlashcards() {
  const t = useTranslations('flashcards')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [shuffledWords, setShuffledWords] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRating, setShowRating] = useState(false)
  const [personalizedTopic, setPersonalizedTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const currentCard = useMemo(() => shuffledWords[currentIndex], [currentIndex, shuffledWords])

  // Load spaced repetition data from localStorage
  const loadSpacedRepetition = (): Record<string, number> => {
    if (typeof window === 'undefined') return {}
    const stored = localStorage.getItem('danishFlashcardsScores')
    return stored ? JSON.parse(stored) : {}
  }

  const saveSpacedRepetition = (scores: Record<string, number>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('danishFlashcardsScores', JSON.stringify(scores))
    }
  }

  const updateCardScore = (cardId: string, rating: number) => {
    const scores = loadSpacedRepetition()
    scores[cardId] = Math.max(0, Math.min(5, (scores[cardId] || 0) + (rating > 0 ? 1 : -1)))
    saveSpacedRepetition(scores)
    setShowRating(false)
    // Re-shuffle to prioritize low-score cards
    const updatedShuffled = [...flashcards].map(card => ({
      ...card,
      score: scores[card.id]
    })).sort((a, b) => (b.score || 0) - (a.score || 0)) // Low score first
    setShuffledWords(updatedShuffled)
  }

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/flashcards')
        if (!res.ok) {
          throw new Error('Failed to fetch flashcards')
        }
        const data = await res.json()
        const loadedFlashcards = (data.flashcards || []).map((card: Omit<Flashcard, 'id' | 'score'> , index: number) => ({
          ...card,
          id: `card-${index}`,
          score: loadSpacedRepetition()[`card-${index}`]
        }))
        setFlashcards(loadedFlashcards)
        // Initial shuffle with spaced repetition priority
        const initialShuffled = [...loadedFlashcards].sort((a, b) => (b.score || 0) - (a.score || 0))
        setShuffledWords(initialShuffled)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcards()
  }, [])

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex(prev => (prev + 1) % shuffledWords.length)
    setShowRating(false)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentIndex(prev => (prev - 1 + shuffledWords.length) % shuffledWords.length)
    setShowRating(false)
  }

  const handleShuffle = () => {
    setIsFlipped(false)
    setCurrentIndex(0)
    setShowRating(false)
    const updatedShuffled = [...flashcards].sort((a, b) => (b.score || 0) - (a.score || 0))
    setShuffledWords(updatedShuffled)
  }

  const generatePersonalized = async () => {
    if (!personalizedTopic.trim()) return
    setGenerating(true)
    try {
      const prompt = `Generate 5 Danish vocab flashcards for job seekers from Romanian on topic "${personalizedTopic}": words for agriculture/farm work. Each flashcard should have:
- Romanian term
- Danish term
- English term
- A simple example sentence in Danish

Format as JSON array of objects. Focus on practical terms. Keep simple.`
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      const newCards = JSON.parse(data.response).map((card: Omit<Flashcard, 'id' | 'score'>, index: number) => ({
        ...card,
        id: `personal-${Date.now()}-${index}`,
        score: 0
      }))
      setFlashcards(prev => [...prev, ...newCards])
      const updatedShuffled = [...flashcards, ...newCards].sort((a, b) => (b.score || 0) - (a.score || 0))
      setShuffledWords(updatedShuffled)
      setPersonalizedTopic('')
      setShowDialog(false)
    } catch {
      setError('Failed to generate personalized cards')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-80 h-52 bg-gray-200 animate-pulse rounded-lg shadow-lg"></div>
        <p>{t('loading')}</p>
      </div>
    )
  }

  if (error || shuffledWords.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-red-600">{t('error', { error: error || 'No flashcards available' })}</p>
        <Button onClick={() => window.location.reload()}>{t('retry')}</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{ perspective: '1000px' }}
        >
          <div className="w-80 h-52 rounded-lg shadow-lg cursor-pointer relative" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
              style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
            >
            {/* Front */}
            <div
              className="absolute w-full h-full flex items-center justify-center rounded-lg backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Card className="w-full h-full flex items-center justify-center">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold">{currentCard.romanian}</p>
                  <p className="text-sm text-gray-500 mt-2">{currentCard.english}</p>
                </CardContent>
              </Card>
            </div>
            {/* Back */}
            <div
              className="absolute w-full h-full flex flex-col items-center justify-center rounded-lg bg-green-100 backface-hidden"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)' 
              }}
            >
              <Card className="w-full h-full">
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-green-800 mb-2">{currentCard.danish}</p>
                  <p className="text-sm italic text-green-700 mb-4">Ex: {currentCard.example}</p>
                  {showRating && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateCardScore(currentCard.id, 1)}>
                        <ThumbsUp className="h-4 w-4" /> {t('easy')}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateCardScore(currentCard.id, -1)}>
                        <ThumbsDown className="h-4 w-4" /> {t('hard')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handlePrev} disabled={loading}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span>{t('progress', { current: currentIndex + 1, total: shuffledWords.length })}</span>
        <Button variant="outline" onClick={handleNext} disabled={loading}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {isFlipped && !showRating && (
        <Button variant="link" onClick={() => setShowRating(true)} className="mt-2">
          {t('rateCard')}
        </Button>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleShuffle}>
          <RefreshCw className="mr-2 h-4 w-4" /> {t('shuffle')}
        </Button>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="secondary">
              <MessageSquare className="mr-2 h-4 w-4" /> {t('personalized')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('generatePersonalized')}</DialogTitle>
              <DialogDescription>{t('enterTopic')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="topic">{t('topic')}</Label>
              <Input
                id="topic"
                value={personalizedTopic}
                onChange={(e) => setPersonalizedTopic(e.target.value)}
                placeholder={t('topicPlaceholder')}
              />
            </div>
            <DialogFooter>
              <Button onClick={generatePersonalized} disabled={!personalizedTopic.trim() || generating}>
                {generating ? t('generating') : t('generate')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
