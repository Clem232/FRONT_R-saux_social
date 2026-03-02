import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    // État
    const isDark = ref(false)

    // Initialisation
    function initTheme() {
        const storedTheme = localStorage.getItem('theme')
        if (storedTheme) {
            isDark.value = storedTheme === 'dark'
        } else {
            // Détection préférence système
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        applyTheme()
    }

    // Basculer
    function toggleTheme() {
        isDark.value = !isDark.value
        applyTheme()
    }

    // Appliquer au DOM
    function applyTheme() {
        if (isDark.value) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    // Sync si l'OS change (optionnel)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!localStorage.getItem('theme')) {
            isDark.value = event.matches
            applyTheme()
        }
    })

    return {
        isDark,
        initTheme,
        toggleTheme
    }
})
