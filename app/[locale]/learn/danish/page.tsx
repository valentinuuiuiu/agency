import React from 'react'
import DanishFlashcards from '@/components/danish-flashcards'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LearnDanishPage() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <Card className="mb-8 w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Learn Danish with Flashcards</CardTitle>
          <CardDescription>
            Prepare for your new job by learning some basic Danish words.
          </CardDescription>
        </CardHeader>
      </Card>
      <DanishFlashcards />
    </div>
  )
}
