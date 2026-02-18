// Types pour l'API

export interface Media {
  '@id': string
  '@type': string
  id: number
  contentUrl?: string
  originalName?: string
  path?: string
  publication?: string | { '@id': string }
}

export interface Comment {
  '@id': string
  '@type': string
  id: number
  body: string
  author?: string // IRI like "/api/users/48"
  publication?: string // IRI
  createdAt: string
  updatedAt?: string
  reactions: string[] // IRI references
  media: (string | Media)[]
}

export interface Publication {
  '@id': string
  '@type': string
  id: number
  title: string
  body: string
  author?: string // IRI
  createdAt: string
  updatedAt?: string
  medias: (string | Media)[]
  comments?: Comment[]
  reactions?: string[] // IRI references (e.g. "/api/reactions/105")
  channel?: string
}

export interface Channel {
  '@id': string
  '@type': string
  id: number
  name: string
  slug: string
  publications?: Publication[]
}

export interface ApiCollection<T> {
  '@context': string
  '@id': string
  '@type': string
  'hydra:member'?: T[]
  member?: T[]
  totalItems?: number
  'hydra:totalItems'?: number
}

export interface User {
  id?: number
  email: string
  displayName?: string
}

export interface LoginResponse {
  token: string
  user?: User
}

export interface ApiError {
  '@context': string
  '@type': string
  'hydra:title': string
  'hydra:description': string
  detail?: string
  message?: string
}
