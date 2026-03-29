export interface LabelValue {
  label: string
  value: string
}

export interface Team {
  project: string
  date?: string
  teamSize: string
  tasks: string
  stack: string
  description: string
}

export interface Company {
  name: string
  role: string
  info?: LabelValue[]
}

export interface Entry {
  date: string
  company?: Company
  teams?: Team[]
  description?: string
}

export interface Meta {
  title: string
  date: string
  name: string
  role: string
  address: string
  email: string
}

export interface CVData {
  meta: Meta
  summary: string
  entries: Entry[]
}
