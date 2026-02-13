'use client'

import { useMemo, useState } from 'react'
import * as L from 'lucide-react'

import { ICON_SEARCH_ALIASES } from '@/src/shared/lib/constants'
import { cn } from '@/src/shared/lib/utils'

import { Input } from './input'

function getIconSearchTerms(iconName: string): string[] {
  const base = iconName.toLowerCase()
  const aliases = ICON_SEARCH_ALIASES[iconName] ?? []
  return [base, ...aliases.map((a) => a.toLowerCase())]
}

const FALLBACK_ICON = L.Building2

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Activity: L.Activity,
  AlarmClock: L.AlarmClock,
  Ambulance: L.Ambulance,
  Baby: L.Baby,
  BedDouble: L.BedDouble,
  Building2: L.Building2,
  Calendar: L.Calendar,
  CalendarClock: L.CalendarClock,
  Camera: L.Camera,
  Car: L.Car,
  CheckCircle: L.CheckCircle,
  Clock: L.Clock,
  Cloud: L.Cloud,
  CloudMoon: L.CloudMoon,
  CloudRain: L.CloudRain,
  CloudSun: L.CloudSun,
  Coffee: L.Coffee,
  Compass: L.Compass,
  Crosshair: L.Crosshair,
  Database: L.Database,
  Droplet: L.Droplet,
  Flame: L.Flame,
  FlaskConical: L.FlaskConical,
  Footprints: L.Footprints,
  Gauge: L.Gauge,
  Hammer: L.Hammer,
  Headphones: L.Headphones,
  Heart: L.Heart,
  HeartPulse: L.HeartPulse,
  Hospital: L.Hospital,
  Lamp: L.Lamp,
  Landmark: L.Landmark,
  Layers: L.Layers,
  Lightbulb: L.Lightbulb,
  Moon: L.Moon,
  MoonStar: L.MoonStar,
  Mountain: L.Mountain,
  Package: L.Package,
  Palette: L.Palette,
  Pill: L.Pill,
  Plane: L.Plane,
  Search: L.Search,
  Shield: L.Shield,
  ShieldCheck: L.ShieldCheck,
  Ship: L.Ship,
  Sparkles: L.Sparkles,
  Star: L.Star,
  Sun: L.Sun,
  Sunrise: L.Sunrise,
  Sunset: L.Sunset,
  Stethoscope: L.Stethoscope,
  Syringe: L.Syringe,
  Target: L.Target,
  Tent: L.Tent,
  Thermometer: L.Thermometer,
  Timer: L.Timer,
  Tractor: L.Tractor,
  Train: L.Train,
  TreePine: L.TreePine,
  Trophy: L.Trophy,
  Truck: L.Truck,
  Umbrella: L.Umbrella,
  Users: L.Users,
  UtensilsCrossed: L.UtensilsCrossed,
  Waves: L.Waves,
  Wind: L.Wind,
  Zap: L.Zap,
}

export function renderIcon(iconName: string, className?: string, size = 16) {
  const Icon = iconMap[iconName] ?? FALLBACK_ICON
  return <Icon className={cn('shrink-0', className)} size={size} />
}

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  icons: readonly string[]
  className?: string
  ariaLabel?: string
  searchPlaceholder?: string
  statusLabel?: (showing: number, total: number, hasSearch: boolean) => string
}

export function IconPicker({
  value,
  onChange,
  icons,
  className,
  ariaLabel = 'Select icon',
  searchPlaceholder = 'Buscar icono...',
  statusLabel,
}: IconPickerProps) {
  const [search, setSearch] = useState('')

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return [...icons]
    const q = search.trim().toLowerCase()
    return icons.filter((name) => {
      const terms = getIconSearchTerms(name)
      return terms.some((term) => term.includes(q) || q.includes(term))
    })
  }, [icons, search])

  const totalCount = icons.length
  const showingCount = filteredIcons.length

  return (
    <div className={cn('space-y-3', className)} role="group" aria-label={ariaLabel}>
      <div className="relative">
        <L.Search
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
          aria-label={searchPlaceholder}
        />
      </div>
      {statusLabel && (
        <p className="text-muted-foreground text-xs">
          {statusLabel(showingCount, totalCount, search.trim().length > 0)}
        </p>
      )}
      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-md border p-2">
        {filteredIcons.map((name) => {
          const Icon = iconMap[name] ?? FALLBACK_ICON
          const isSelected = value === name
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg border-2 transition-colors',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input bg-background hover:border-primary/50 hover:bg-accent/50'
              )}
              aria-pressed={isSelected}
              aria-label={name}
              title={name}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
