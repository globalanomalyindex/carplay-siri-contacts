import type { ReactNode } from 'react'
import { DrivingContext } from './useDriving'

export function DrivingProvider({ driving, children }: { driving: boolean; children: ReactNode }) {
  return <DrivingContext.Provider value={driving}>{children}</DrivingContext.Provider>
}
