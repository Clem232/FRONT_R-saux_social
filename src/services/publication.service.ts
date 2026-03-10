import type { Publication, Media, Comment, ApiCollection } from '@/types'
import { getApiUrl, getAuthHeaders, API_CONFIG } from './api.config'

/**
 * Service pour gérer les publications
 */
export const publicationService = {

  // ========== PUBLICATIONS ==========

  /**
   * Récupérer les détails d'une publication (avec comments et reactions embarqués)
   */
  async getDetail(token: string, id: number): Promise<Publication> {
    const res = await fetch(getApiUrl(`/publications/${id}`), {
      headers: getAuthHeaders(token)
    })
    if (!res.ok) {
      throw new Error('Impossible de charger la publication')
    }
    return await res.json()
  },

  /**
   * Créer une nouvelle publication
   */
  async create(token: string, data: { title: string; body: string; channelIRI: string }): Promise<Publication> {
    const res = await fetch(getApiUrl('/publications'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        title: data.title,
        body: data.body,
        channel: data.channelIRI
      })
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.detail || error.message || 'Erreur lors de la publication')
    }

    return await res.json()
  },

  /**
   * Modifier le titre et le corps d'une publication (PATCH)
   */
  async update(token: string, id: number, data: { title: string; body: string }): Promise<Publication> {
    const res = await fetch(getApiUrl(`/publications/${id}`), {
      method: 'PATCH',
      headers: { ...getAuthHeaders(token), 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error['hydra:description'] || error.detail || error.message || 'Erreur lors de la modification')
    }
    return await res.json()
  },

  /**
   * Supprimer une publication
   */
  async delete(token: string, id: number): Promise<void> {
    const res = await fetch(getApiUrl(`/publications/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    })

    if (!res.ok && res.status !== 204) {
      const errorText = await res.text()
      console.error('[publicationService.delete] Error:', res.status, errorText)
      throw new Error('Impossible de supprimer cette publication')
    }
  },

  /**
   * Supprimer une publication avec nettoyage complet des dépendances
   * (médias, commentaires) pour éviter les erreurs 500 de contraintes FK.
   * Note: La suppression des réactions est impossible (bug serveur),
   * donc si une publication a des réactions, elle ne pourra pas être supprimée.
   */
  async deleteWithCleanup(token: string, pub: Publication): Promise<void> {
    // 1. Charger les détails complets pour avoir comments et reactions
    let fullPub = pub
    try {
      fullPub = await this.getDetail(token, pub.id)
    } catch (e) {
      console.warn('[deleteWithCleanup] Could not get full detail, proceeding with partial data')
    }

    // 2. Supprimer les médias
    if (fullPub.medias && fullPub.medias.length > 0) {
      for (const m of fullPub.medias) {
        const mediaId = typeof m === 'object' ? m.id : parseInt(String(m).split('/').pop() || '0')
        if (mediaId && !isNaN(mediaId)) {
          try { 
            await this.deleteMedia(token, mediaId) 
          } catch (e) {
            console.warn('[deleteWithCleanup] Media delete failed:', mediaId, e)
          }
        }
      }
    }

    // 3. Supprimer les commentaires
    if (fullPub.comments && fullPub.comments.length > 0) {
      for (const c of fullPub.comments) {
        const commentId = typeof c === 'object' ? c.id : parseInt(String(c).split('/').pop() || '0')
        if (commentId && !isNaN(commentId)) {
        try { 
            await this.deleteComment(token, commentId) 
        } catch (e) {
            console.warn('[deleteWithCleanup] Comment delete failed:', commentId, e)
        }
      }
      }
    }

    // 4. Tenter de supprimer les réactions (même si le serveur a des bugs parfois)
    if (fullPub.reactions && fullPub.reactions.length > 0) {
      for (const r of fullPub.reactions) {
        const reactionId = typeof r === 'object' ? (r as any).id : parseInt(String(r).split('/').pop() || '0')
        if (reactionId) {
          try { 
            await this.deleteReaction(token, reactionId) 
          } catch (e) {
            console.warn('[deleteWithCleanup] Reaction delete failed, continuing anyway:', reactionId)
          }
        }
      }
    }

    // 5. Supprimer la publication
    await this.delete(token, pub.id)
  },

  // ========== COMMENTAIRES ==========

  /**
   * Ajouter un commentaire à une publication
   * L'API attend { publication: IRI, body: string }
   */
  async addComment(token: string, publicationIRI: string, body: string): Promise<Comment> {
    const res = await fetch(getApiUrl('/comments'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ publication: publicationIRI, body })
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error('[addComment] Error:', res.status, errBody)
      throw new Error(`Impossible d'ajouter le commentaire (${res.status})`)
    }
    return await res.json()
  },

  /**
   * Modifier un commentaire
   */
  async updateComment(token: string, commentId: number, body: string): Promise<Comment> {
    const res = await fetch(getApiUrl(`/comments/${commentId}`), {
      method: 'PATCH',
      headers: { ...getAuthHeaders(token), 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify({ body })
    })
    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error('[updateComment] Error:', res.status, errBody)
      throw new Error(`Impossible de modifier le commentaire (${res.status})`)
    }
    return await res.json()
  },

  /**
   * Supprimer un commentaire
   */
  async deleteComment(token: string, commentId: number): Promise<void> {
    const res = await fetch(getApiUrl(`/comments/${commentId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    })
    if (!res.ok && res.status !== 204) {
      console.warn(`[deleteComment] Failed for ${commentId}:`, res.status)
    }
  },

  // ========== RÉACTIONS ==========

  /**
   * Ajouter une réaction (like) à une publication.
   * ATTENTION: L'API a une contrainte UNIQUE (pub + user + type).
   * Si le user a déjà liké, ça retourne 500 avec "Duplicate entry".
   * On gère ça proprement côté client.
   */
  async addReaction(token: string, publicationIRI: string, type: string = 'like'): Promise<any> {
    const res = await fetch(getApiUrl('/reactions'), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ publication: publicationIRI, type })
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      if (errBody.includes('Duplicate entry') || errBody.includes('1062')) {
        throw new Error('ALREADY_LIKED')
      }
      console.error('[addReaction] Error:', res.status, errBody)
      throw new Error(`Impossible d'ajouter la réaction (${res.status})`)
    }
    return await res.json().catch(() => null)
  },

  /**
   * Supprimer une réaction  
   * NOTE: Le serveur a un bug sur DELETE /reactions/{id} (erreur 500 Semantical).
   */
  async deleteReaction(token: string, reactionId: number): Promise<boolean> {
    const res = await fetch(getApiUrl(`/reactions/${reactionId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    })
    if (res.ok || res.status === 204) return true
    console.warn(`[deleteReaction] Server error for ${reactionId}:`, res.status)
    return false
  },

  // ========== MÉDIAS ==========

  /**
   * Uploader un média pour une publication (FormData uniquement)
   */
  async uploadMedia(token: string, file: File, publicationIRI: string): Promise<Media> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('publication', publicationIRI)

    const res = await fetch(getApiUrl('/media'), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[uploadMedia] Error:', res.status, errText)
      throw new Error("Erreur lors de l'upload du média")
    }
    return await res.json()
  },

  /**
   * Récupérer tous les médias du workspace
   */
  async getAllMedia(token: string): Promise<Media[]> {
    const res = await fetch(getApiUrl('/media'), {
      headers: getAuthHeaders(token)
    })
    if (!res.ok) {
      console.warn('[getAllMedia] Error:', res.status)
      return []
    }
    const data: ApiCollection<Media> = await res.json()
    return data['hydra:member'] || data.member || []
  },

  /**
   * Hydrater les publications avec leurs médias
   * (récupère tous les médias et les associe par publication IRI/ID)
   */
  async hydratePublicationsMedia(token: string, publications: Publication[]): Promise<void> {
    if (publications.length === 0) return
    
    try {
      const allMedias = await this.getAllMedia(token)
      if (allMedias.length === 0) return

      for (const pub of publications) {
        const pubId = String(pub.id || pub['@id']?.split('/').pop())

        const mediasForPub = allMedias.filter(m => {
          if (!m.publication) return false
          const p = m.publication
          return (typeof p === 'string' && p.includes(pubId)) ||
                 (typeof p === 'object' && p['@id']?.includes(pubId))
        })

        if (mediasForPub.length > 0) {
          pub.medias = mediasForPub
        }
      }
      console.log(`[hydrateMedia] ${allMedias.length} médias trouvés, associés aux publications`)
    } catch (e) {
      console.warn('[hydrateMedia] Erreur hydratation médias', e)
    }
  },

  /**
   * Supprimer un média
   */
  async deleteMedia(token: string, mediaId: number): Promise<void> {
    const res = await fetch(getApiUrl(`/media/${mediaId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    })
    if (!res.ok && res.status !== 204) {
      console.warn(`[deleteMedia] Failed for ${mediaId}:`, res.status)
    }
  },

  // ========== UTILITAIRES ==========

  hasImage(pub: Publication): boolean {
    return !!(pub.medias && pub.medias.length > 0)
  },

  getImageUrl(pub: Publication): string | null {
    const media = pub.medias?.[0]
    if (!media) return null

    // Si c'est juste un IRI string, pas d'image affichable
    if (typeof media === 'string') return null

    // Utiliser path en priorité (propriété retournée par l'API)
    let imagePath = media.path || media.contentUrl
    if (!imagePath) return null

    // URL absolue → retourner directement
    if (imagePath.startsWith('http')) return imagePath

    // Construire l'URL: BASE_URL + /uploads/SLUG/filename
    if (!imagePath.includes('/')) {
      imagePath = `/uploads/${API_CONFIG.SLUG}/${imagePath}`
    } else if (!imagePath.startsWith('/')) {
      imagePath = '/' + imagePath
    }

    return `${API_CONFIG.BASE_URL}${imagePath}`
  },

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (file.size > maxSize) return { valid: false, error: "L'image est trop grande. Maximum 5MB." }
    if (!allowedTypes.includes(file.type)) return { valid: false, error: 'Format non supporté. Utilisez JPG, PNG, GIF ou WebP.' }
    return { valid: true }
  }
}

export default publicationService
