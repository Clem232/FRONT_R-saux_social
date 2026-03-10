/**
 * Test unitaire – Store thème (useThemeStore)
 *
 * On vérifie que :
 *  1. toggleTheme() bascule isDark de false → true
 *  2. toggleTheme() applique/retire la classe CSS "dark" sur <html>
 *  3. toggleTheme() persiste le choix dans le localStorage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// jsdom n'implémente pas window.matchMedia — on le simule avant d'importer le store
function mockMatchMedia(prefersDark = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('dark') ? prefersDark : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

import { useThemeStore } from './theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    // Partir d'un état propre
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockMatchMedia(false) // simuler un OS en mode clair
    setActivePinia(createPinia())
  })

  it('isDark est false par défaut (localStorage vide, OS en mode clair)', () => {
    const store = useThemeStore()
    store.initTheme()
    expect(store.isDark).toBe(false)
  })

  it('toggleTheme() passe isDark à true et ajoute la classe "dark" au <html>', () => {
    const store = useThemeStore()
    store.initTheme()

    store.toggleTheme()

    expect(store.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggleTheme() sauvegarde le thème dans le localStorage', () => {
    const store = useThemeStore()
    store.initTheme()

    store.toggleTheme() // light → dark
    expect(localStorage.getItem('theme')).toBe('dark')

    store.toggleTheme() // dark → light
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
