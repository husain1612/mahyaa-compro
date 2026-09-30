import type { TourPackage } from '@/types'
import { PackageCard } from './PackageCard'

export const PackageGrid = ({ packages }: { packages: TourPackage[] }) => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {packages.map((p) => <PackageCard key={p.id} pkg={p} />)}
  </div>
)
