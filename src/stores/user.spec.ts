/**
 * Test unitaire – Store utilisateur (useUserStore)
 *
 * On vérifie que :
 *  1. Le token est null au départ (localStorage vide)
 *  2. login() stocke le JWT dans le store ET dans localStorage
 *  3. logout() efface le token du store ET du localStorage
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './user'

describe('useUserStore', () => {
  beforeEach(() => {
    // Réinitialiser Pinia et le localStorage entre chaque test
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('le token est null par défaut', () => {
    const store = useUserStore()
    expect(store.token).toBeNull()
  })

  it('login() sauvegarde le token dans le store et le localStorage', () => {
    const store = useUserStore()
    const fakeJwt = 'mon.super.jwt'

    store.login(fakeJwt)

    expect(store.token).toBe(fakeJwt)
    expect(localStorage.getItem('token')).toBe(fakeJwt)
  })

  it('logout() efface le token du store et du localStorage', () => {
    const store = useUserStore()

    // On se connecte d'abord
    store.login('un.jwt.quelconque')
    // Puis on se déconnecte
    store.logout()

    expect(store.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })
})
