import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Banknote,
  BookOpen,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Gift,
  Layers,
  Lightbulb,
  Percent,
  Settings,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { requireAdminHRWithOrg } from '@/src/shared/lib/auth/session'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'

interface RatesGuideProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: RatesGuideProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'adminHR.rates.guide' })
  return {
    title: `${t('title')} | VITA`,
  }
}

const FIXED_COMPONENTS = ['BASE_SALARY', 'PER_SHIFT', 'SHIFT_COMPLETION_BONUS'] as const
const FIXED_KEYS = ['baseSalary', 'perShift', 'completionBonus'] as const

const TIME_COMPONENTS = ['PER_MINUTE', 'PER_HOUR'] as const
const TIME_KEYS = ['perMinute', 'perHour'] as const

const BONUS_COMPONENTS = [
  'NIGHT_SHIFT_BONUS',
  'WEEKEND_BONUS',
  'HOLIDAY_BONUS',
  'SENIORITY_BONUS',
  'PERFORMANCE_BONUS',
  'AREA_BONUS',
  'EMERGENCY_BONUS',
  'ON_CALL_BONUS',
] as const
const BONUS_KEYS = ['night', 'weekend', 'holiday', 'seniority', 'performance', 'area', 'emergency', 'onCall'] as const

const MULTIPLIER_COMPONENTS = [
  'WEEKEND_MULTIPLIER',
  'HOLIDAY_MULTIPLIER',
  'IRRENUNCIABLE_MULTIPLIER',
  'NIGHT_MULTIPLIER',
  'OVERTIME_MULTIPLIER',
] as const
const MULTIPLIER_KEYS = ['weekend', 'holiday', 'irrenunciable', 'night', 'overtime'] as const

const PERIODIC_UNITS = ['MONTHLY', 'BIWEEKLY', 'WEEKLY', 'DAILY'] as const
const EVENT_UNITS = ['PER_SHIFT', 'PER_MINUTE', 'PER_HOUR'] as const
const CALCULATED_UNITS = ['PERCENTAGE', 'MULTIPLIER', 'FIXED_AMOUNT'] as const

const CONDITIONS = [
  { key: 'ALWAYS', tKey: 'always', variant: 'default' as const },
  { key: 'WEEKDAY_ONLY', tKey: 'weekday', variant: 'outline' as const },
  { key: 'WEEKEND_ONLY', tKey: 'weekend', variant: 'outline' as const },
  { key: 'HOLIDAY_ONLY', tKey: 'holiday', variant: 'outline' as const },
  { key: 'IRRENUNCIABLE_ONLY', tKey: 'irrenunciable', variant: 'outline' as const },
  { key: 'OVERTIME_ONLY', tKey: 'overtime', variant: 'outline' as const },
  { key: 'SPECIFIC_SHIFT_TYPE', tKey: 'shiftType', variant: 'outline' as const },
] as const

const EXAMPLE_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-violet-500',
] as const

const CONCEPT_COLORS = {
  template: 'bg-primary',
  component: 'bg-chart-2',
  contract: 'bg-chart-4',
} as const

export default async function RatesGuidePage({ params }: RatesGuideProps) {
  const { locale } = await params
  const [, t, tf] = await Promise.all([
    requireAdminHRWithOrg(locale),
    getTranslations('adminHR.rates.guide'),
    getTranslations('adminHR.rates.componentForm'),
  ])

  return (
    <div className="space-y-12 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen className="text-primary h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">{t('subtitle')}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${locale}/dashboard/rates`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToRates')}
          </Link>
        </Button>
      </div>

      <section className="space-y-6">
        <SectionHeader icon={Layers} title={t('overview.title')} />
        <p className="text-muted-foreground max-w-3xl">{t('overview.description')}</p>

        <div className="grid gap-4 md:grid-cols-3">
          <ConceptCard
            icon={<FileText className="h-6 w-6" />}
            title={t('overview.template')}
            description={t('overview.templateDesc')}
            colorClass={CONCEPT_COLORS.template}
          />
          <ConceptCard
            icon={<Settings className="h-6 w-6" />}
            title={t('overview.component')}
            description={t('overview.componentDesc')}
            colorClass={CONCEPT_COLORS.component}
          />
          <ConceptCard
            icon={<Users className="h-6 w-6" />}
            title={t('overview.contract')}
            description={t('overview.contractDesc')}
            colorClass={CONCEPT_COLORS.contract}
          />
        </div>

        <div className="hidden items-center justify-center gap-2 md:flex">
          <Badge variant="outline" className="px-3 py-1">
            <FileText className="mr-1 h-3 w-3" />
            {t('overview.template')}
          </Badge>
          <ArrowRight className="text-muted-foreground h-4 w-4" />
          <Badge variant="outline" className="px-3 py-1">
            <Settings className="mr-1 h-3 w-3" />
            {t('overview.component')}
          </Badge>
          <ArrowRight className="text-muted-foreground h-4 w-4" />
          <Badge variant="outline" className="px-3 py-1">
            <Users className="mr-1 h-3 w-3" />
            {t('overview.contract')}
          </Badge>
          <ArrowRight className="text-muted-foreground h-4 w-4" />
          <Badge variant="outline" className="px-3 py-1">
            <Calculator className="mr-1 h-3 w-3" />
            <Banknote className="h-3 w-3" />
          </Badge>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader icon={TrendingUp} title={t('flow.title')} />

        <div className="grid gap-6 md:grid-cols-4">
          {[
            { num: 1, icon: <FileText className="h-5 w-5" /> },
            { num: 2, icon: <Settings className="h-5 w-5" /> },
            { num: 3, icon: <UserPlus className="h-5 w-5" /> },
            { num: 4, icon: <Calculator className="h-5 w-5" /> },
          ].map((step) => {
            const stepKey = `step${step.num}` as const
            return (
              <StepCard
                key={step.num}
                number={step.num}
                title={t(`flow.${stepKey}.title`)}
                description={t(`flow.${stepKey}.description`)}
                icon={step.icon}
              />
            )
          })}
        </div>
      </section>

      <ComponentTypesSection t={t} tf={tf} />
      <UnitsSection t={t} tf={tf} />

      <section className="space-y-6">
        <SectionHeader icon={Calendar} title={t('conditions.title')} />
        <p className="text-muted-foreground max-w-3xl">{t('conditions.description')}</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONDITIONS.map((cond) => (
            <ConditionCard
              key={cond.key}
              label={tf(`conditions.${cond.key}`)}
              description={t(`conditions.${cond.tKey}`)}
              variant={cond.variant}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader icon={Lightbulb} title={t('example.title')} />
        <p className="text-muted-foreground max-w-3xl">{t('example.description')}</p>

        <Card className="border-primary/20 overflow-hidden">
          <div className="bg-primary/5 border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="text-primary h-5 w-5" />
              <h3 className="text-lg font-semibold">{t('example.templateName')}</h3>
            </div>
          </div>
          <CardContent className="space-y-3 p-6">
            {EXAMPLE_COLORS.map((color, i) => {
              const num = i + 1
              return <ExampleRow key={num} number={num} text={t(`example.component${num}`)} colorClass={color} />
            })}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowDown className="text-primary h-4 w-4" />
              {t('example.resultTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <ResultLine key={num} text={t(`example.resultLine${num}`)} />
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <SectionHeader icon={Lightbulb} title={t('tips.title')} />

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((num) => (
            <TipCard
              key={num}
              number={num}
              title={t(`tips.tip${num}.title`)}
              description={t(`tips.tip${num}.description`)}
            />
          ))}
        </div>
      </section>

      <div className="flex justify-center pt-4">
        <Button asChild size="lg">
          <Link href={`/${locale}/dashboard/rates`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToRates')}
          </Link>
        </Button>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
        <Icon className="text-primary h-4 w-4" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
    </div>
  )
}

function ConceptCard({
  icon,
  title,
  description,
  colorClass,
}: {
  icon: React.ReactNode
  title: string
  description: string
  colorClass: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`${colorClass} absolute top-0 right-0 left-0 h-1`} />
      <CardHeader className="pb-2 pt-5">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="bg-primary text-primary-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
        {number}
      </div>
      <div className="text-primary mb-2">{icon}</div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  )
}

function ComponentItem({ label, description }: { label: string; description: string }) {
  return (
    <li className="flex items-start gap-2">
      <Badge variant="outline" className="mt-0.5 shrink-0 font-mono text-[10px]">
        {label}
      </Badge>
      <span className="text-muted-foreground text-sm">{description}</span>
    </li>
  )
}

function ConditionCard({
  label,
  description,
  variant,
}: {
  label: string
  description: string
  variant: 'default' | 'outline'
}) {
  return (
    <div className="bg-card flex items-start gap-3 rounded-lg border p-3">
      <Badge variant={variant} className="mt-0.5 shrink-0 font-mono text-[10px]">
        {label}
      </Badge>
      <span className="text-muted-foreground text-sm">{description}</span>
    </div>
  )
}

function ExampleRow({ number, text, colorClass }: { number: number; text: string; colorClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`${colorClass} flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white`}
      >
        {number}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

function ResultLine({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
      <span className="text-sm">{text}</span>
    </li>
  )
}

function TipCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <Card className="bg-muted/20">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          {number}
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ComponentTypesSection({ t, tf }: { t: (key: string) => string; tf: (key: string) => string }) {
  return (
    <section className="space-y-6">
      <SectionHeader icon={Sparkles} title={t('componentTypes.title')} />
      <p className="text-muted-foreground max-w-3xl">{t('componentTypes.description')}</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">{t('componentTypes.fixed.title')}</CardTitle>
            </div>
            <CardDescription>{t('componentTypes.fixed.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {FIXED_COMPONENTS.map((comp, i) => (
                <ComponentItem key={comp} label={tf(`types.${comp}`)} description={t(`componentTypes.fixed.${FIXED_KEYS[i]}`)} />
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              <CardTitle className="text-lg">{t('componentTypes.timeBased.title')}</CardTitle>
            </div>
            <CardDescription>{t('componentTypes.timeBased.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {TIME_COMPONENTS.map((comp, i) => (
                <ComponentItem key={comp} label={tf(`types.${comp}`)} description={t(`componentTypes.timeBased.${TIME_KEYS[i]}`)} />
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">{t('componentTypes.bonuses.title')}</CardTitle>
            </div>
            <CardDescription>{t('componentTypes.bonuses.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {BONUS_COMPONENTS.map((comp, i) => (
                <ComponentItem key={comp} label={tf(`types.${comp}`)} description={t(`componentTypes.bonuses.${BONUS_KEYS[i]}`)} />
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-violet-500" />
              <CardTitle className="text-lg">{t('componentTypes.multipliers.title')}</CardTitle>
            </div>
            <CardDescription>{t('componentTypes.multipliers.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {MULTIPLIER_COMPONENTS.map((comp, i) => (
                <ComponentItem
                  key={comp}
                  label={tf(`types.${comp}`)}
                  description={t(`componentTypes.multipliers.${MULTIPLIER_KEYS[i]}`)}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/30 bg-primary/5 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="text-primary h-5 w-5" />
            <CardTitle className="text-lg">{t('componentTypes.custom.title')}</CardTitle>
          </div>
          <CardDescription>{t('componentTypes.custom.description')}</CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}

function UnitsSection({ t, tf }: { t: (key: string) => string; tf: (key: string) => string }) {
  return (
    <section className="space-y-6">
      <SectionHeader icon={Calculator} title={t('units.title')} />
      <p className="text-muted-foreground max-w-3xl">{t('units.description')}</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('units.periodic')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{t('units.periodicDesc')}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PERIODIC_UNITS.map((unit) => (
                <Badge key={unit} variant="secondary">
                  {tf(`units.${unit}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('units.eventBased')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{t('units.eventBasedDesc')}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {EVENT_UNITS.map((unit) => (
                <Badge key={unit} variant="secondary">
                  {tf(`units.${unit}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('units.calculated')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{t('units.calculatedDesc')}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {CALCULATED_UNITS.map((unit) => (
                <Badge key={unit} variant="secondary">
                  {tf(`units.${unit}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
