export interface Contact {
  id: string
  name: string
  avatar: string
}

export const FAVORITES: Contact[] = [
  { id: 'mom',   name: 'Mom',   avatar: 'M' },
  { id: 'dad',   name: 'Dad',   avatar: 'D' },
  { id: 'sarah', name: 'Sarah', avatar: 'S' },
  { id: 'jake',  name: 'Jake',  avatar: 'J' },
  { id: 'kira',  name: 'Kira',  avatar: 'K' },
]

export const RECENTS: Contact[] = [
  { id: 'sarah-r', name: 'Sarah',     avatar: 'S' },
  { id: 'pizza',   name: 'Pizza Co.', avatar: 'P' },
  { id: 'mom-r',   name: 'Mom',       avatar: 'M' },
  { id: 'dentist', name: 'Dentist',   avatar: 'D' },
]

export const CONTACTS: Contact[] = [
  { id: 'aaa',     name: 'AAA',         avatar: 'A' },
  { id: 'adam',    name: 'Adam Chen',   avatar: 'A' },
  { id: 'alex',    name: 'Alex Park',   avatar: 'A' },
  { id: 'amy',     name: 'Amy Lin',     avatar: 'A' },
  { id: 'ben',     name: 'Ben Ortega',  avatar: 'B' },
  { id: 'cara',    name: 'Cara Singh',  avatar: 'C' },
]
