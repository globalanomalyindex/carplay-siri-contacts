import { createContext, useContext } from 'react'

export const DrivingContext = createContext<boolean>(false)

export function useDriving(): boolean {
  return useContext(DrivingContext)
}
