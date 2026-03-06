'use client'

import { useTranslations } from 'next-intl'
import { Quote } from 'lucide-react'

import { Badge } from '@/src/shared/ui/badge'
import { Card, CardContent } from '@/src/shared/ui/card'
import { MotionCard, MotionSection, MotionStagger } from '@/src/shared/ui/motion'

interface Testimonial {
  quote: string
  name: string
  roleOrg: string
}

export function TestimonialsSection() {
  const t = useTranslations('landing')

  const testimonials: Testimonial[] = [
    {
      quote: t('testimonials.testimonial1.quote'),
      name: t('testimonials.testimonial1.name'),
      roleOrg: [t('testimonials.testimonial1.role'), t('testimonials.testimonial1.org')].join(
        ' · '
      ),
    },
    {
      quote: t('testimonials.testimonial2.quote'),
      name: t('testimonials.testimonial2.name'),
      roleOrg: [t('testimonials.testimonial2.role'), t('testimonials.testimonial2.org')].join(
        ' · '
      ),
    },
    {
      quote: t('testimonials.testimonial3.quote'),
      name: t('testimonials.testimonial3.name'),
      roleOrg: [t('testimonials.testimonial3.role'), t('testimonials.testimonial3.org')].join(
        ' · '
      ),
    },
  ]

  return (
    <MotionSection className="bg-muted/30 py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-4">
            {t('testimonials.tag')}
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">{t('testimonials.description')}</p>
        </div>

        <MotionStagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <MotionCard key={testimonial.name}>
              <Card className="flex h-full flex-col transition-shadow hover:shadow-lg">
                <CardContent className="flex flex-1 flex-col pt-6">
                  <Quote className="text-primary/30 mb-4 h-8 w-8 shrink-0" />
                  <p className="text-muted-foreground mb-6 flex-1 text-sm italic">
                    {testimonial.quote}
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground text-xs">{testimonial.roleOrg}</p>
                  </div>
                </CardContent>
              </Card>
            </MotionCard>
          ))}
        </MotionStagger>
      </div>
    </MotionSection>
  )
}
