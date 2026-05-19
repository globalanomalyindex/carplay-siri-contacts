import { createContext, useContext, type ReactNode } from 'react'

const DrivingContext = createContext<boolean>(false)

export function DrivingProvider({ driving, children }: { driving: boolean; children: ReactNode }) {
  return <DrivingContext.Provider value={driving}>{children}</DrivingContext.Provider>
}

export function useDriving(): boolean {
  return useContext(DrivingContext)
}
