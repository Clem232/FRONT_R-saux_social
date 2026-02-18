import type { Channel, ApiCollection, Publication } from '@/types'
import { API_CONFIG, getApiUrl, getAuthHeaders } from './api.config'

/**
 * Service pour gérer les channels (salons)
 */
export const channelService = {
  
  /**
   * Récupérer la liste de tous les channels
   */
  async getAll(token: string): Promise<Channel[]> {
    const res = await fetch(getApiUrl('/channels'), {
      headers: getAuthHeaders(token)
    })
    
    if (!res.ok) {
      throw new Error('Erreur lors du chargement des salons')
    }
    
    const data: ApiCollection<Channel> = await res.json()
    return data['hydra:member'] || data.member || []
  },

  /**
   * Récupérer un channel par son ID
   * IMPORTANT: L'API utilise /channels/by-id/{id} pour l'ID numérique
   */
  async getById(token: string, id: number): Promise<Channel> {
    const res = await fetch(getApiUrl(`/channels/by-id/${id}`), {
      headers: getAuthHeaders(token)
    })
    
    if (!res.ok) {
      throw new Error('Erreur lors du chargement du salon')
    }
    
    return await res.json()
  },

  /**
   * Récupérer un channel par son slug
   */
  async getBySlug(token: string, channelSlug: string): Promise<Channel> {
    const res = await fetch(getApiUrl(`/channels/${channelSlug}`), {
      headers: getAuthHeaders(token)
    })
    
    if (!res.ok) {
      throw new Error('Erreur lors du chargement du salon')
    }
    
    return await res.json()
  },

  /**
   * Créer un nouveau channel
   */
  async create(token: string, name: string): Promise<Channel> {
    const res = await fetch(getApiUrl('/channels'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ name })
    })
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.detail || error.message || 'Erreur lors de la création du salon')
    }
    
    return await res.json()
  },

  /**
   * Supprimer un channel par son ID numérique
   * @param token - Token d'authentification
   * @param id - ID numérique du channel (pas le slug!)
   */
  async delete(token: string, id: number): Promise<void> {
    const res = await fetch(getApiUrl(`/channels/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    // 204 No Content = succès
    if (!res.ok && res.status !== 204) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.detail || error.message || 'Erreur lors de la suppression du salon')
    }
  },

  /**
   * Récupérer les publications d'un channel spécifique
   */
  async getPublications(token: string, channelId: number, channelSlug?: string): Promise<Publication[]> {
    console.log(`[channelService] Chargement publications pour channel ID: ${channelId}, slug: ${channelSlug}`)
    let publications: Publication[] = []
    
    // Stratégie 1: Utiliser le slug du channel si disponible
    if (channelSlug) {
      try {
        const channelIRI = `/api/${API_CONFIG.SLUG}/channels/${channelSlug}`
        const res = await fetch(getApiUrl(`/publications?channel=${encodeURIComponent(channelIRI)}`), {
          headers: getAuthHeaders(token)
        })
        if (res.ok) {
           const data: ApiCollection<Publication> = await res.json()
           publications = data['hydra:member'] || data.member || []
           if (publications.length > 0) {
             console.log(`[channelService] Publications chargées via slug IRI (${publications.length})`)
             return publications.filter(p => p.channel === channelIRI || p.channel?.includes(channelSlug))
           }
        }
      } catch (e) {
        console.warn("[channelService] Echec stratégie slug", e)
      }
    }
    
    // Stratégie 2: Essayer avec channel.id
    try {
      const res = await fetch(getApiUrl(`/publications?channel.id=${channelId}`), {
        headers: getAuthHeaders(token)
      })
      if (res.ok) {
        const data: ApiCollection<Publication> = await res.json()
        publications = data['hydra:member'] || data.member || []
        console.log(`[channelService] Publications chargées via channel.id (${publications.length})`)
        // Filtrage côté client pour être sûr
        return publications.filter(p => {
          if (!p.channel) return true // Au cas où
          // Vérifie si l'IRI du channel correspond ou si c'est l'objet
          if (typeof p.channel === 'string') {
             return p.channel.endsWith(`/${channelId}`) || (channelSlug && p.channel.includes(channelSlug))
          }
          // @ts-ignore
          return p.channel.id === channelId 
        })
      }
    } catch (e) {
      console.warn("[channelService] Echec stratégie channel.id", e)
    }

    // Stratégie 3: Essayer avec l'IRI by-id
    try {
      const channelIRI = `/api/${API_CONFIG.SLUG}/channels/by-id/${channelId}`
      const res = await fetch(getApiUrl(`/publications?channel=${encodeURIComponent(channelIRI)}`), {
        headers: getAuthHeaders(token)
      })
      if (res.ok) {
        const data: ApiCollection<Publication> = await res.json()
        publications = data['hydra:member'] || data.member || []
        console.log(`[channelService] Publications chargées via by-id IRI (${publications.length})`)
        return publications
      }
    } catch (e) {
       console.warn("[channelService] Echec stratégie by-id", e)
    }
    
    // Si tout échoue, renvoie tableau vide mais ne crash pas
    console.error('[channelService] Impossible de charger les publications après multiples essais')
    return []
  }
}

export default channelService
