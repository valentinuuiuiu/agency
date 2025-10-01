"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useTranslations } from 'next-intl'

export default function ContactForm() {
  const { toast } = useToast()
  const t = useTranslations('contact')

  const formSchema = z.object({
    name: z.string().min(1, t('name')).max(100, t('nameTooLong')),
    email: z.string().email(t('emailInvalid')),
    message: z.string().min(10, t('messageMin')).max(1000, t('messageMax'))
  })

  type FormData = z.infer<typeof formSchema>

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  })

  const onSubmit = async (values: FormData) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (res.ok) {
        toast({
          title: t('successTitle'),
          description: t('success')
        })
        form.reset()
      } else {
        toast({
          variant: 'destructive',
          title: t('errorTitle'),
          description: t('error')
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('error')
      })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t('name')}
        </label>
        <Input
          placeholder={t('namePlaceholder')}
          {...form.register('name')}
          className="w-full"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t('email')}
        </label>
        <Input
          type="email"
          placeholder={t('emailPlaceholder')}
          {...form.register('email')}
          className="w-full"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {t('message')}
        </label>
        <Textarea
          placeholder={t('messagePlaceholder')}
          {...form.register('message')}
          className="w-full min-h-[100px]"
        />
        {form.formState.errors.message && (
          <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t('sending') : t('submit')}
      </Button>
    </form>
  )
}
