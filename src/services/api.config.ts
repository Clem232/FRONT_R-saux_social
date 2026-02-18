// Configuration API centralisée

export const API_CONFIG = {
  BASE_URL: 'https://wra506d.davidannebicque.ovh',
  API_URL: 'https://wra506d.davidannebicque.ovh/api',
  SLUG: 'ws-v'
} as const

export function getApiUrl(path: string): string {
  return `${API_CONFIG.API_URL}/${API_CONFIG.SLUG}${path}`
}

export function getAuthHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/ld+json'
  }
}

export function getMediaUrl(contentUrl: string): string {
  if (contentUrl.startsWith('http')) return contentUrl
  return `${API_CONFIG.BASE_URL}${contentUrl}`
}
