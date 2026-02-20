import { VitaLoader } from '@/src/shared/ui/atoms'

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <VitaLoader size="lg" />
    </div>
  )
}
