import type { User, ApiCollection } from '@/types'
import { API_CONFIG, getAuthHeaders } from './api.config'

/**
 * Service pour gérer les utilisateurs
 */
export const userService = {
  /**
   * Récupérer la liste de tous les utilisateurs
   */
  async getAll(token: string): Promise<User[]> {
    const res = await fetch(`${API_CONFIG.API_URL}/users`, {
      headers: getAuthHeaders(token)
    })

    if (!res.ok) {
      throw new Error('Erreur lors du chargement des utilisateurs')
    }

    const data: ApiCollection<User> = await res.json()
    return data['hydra:member'] || data.member || []
  },

  /**
   * Modifier un utilisateur (PATCH)
   */
  async update(token: string, id: number, data: { displayName?: string }): Promise<User> {
    const res = await fetch(`${API_CONFIG.API_URL}/users/${id}`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(token), 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error['hydra:description'] || error.detail || 'Erreur lors de la modification du profil')
    }

    return await res.json()
  },
}
