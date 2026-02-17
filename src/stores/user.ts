import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Token JWT
  const token = ref<string | null>(localStorage.getItem('token') || null)
  // Infos utilisateur
  const user = ref<any>(null)

  // Méthode pour se connecter
  const login = (jwt: string) => {
    token.value = jwt
    localStorage.setItem('token', jwt)
  }

  // Déconnexion
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  // Méthode pour stocker les infos utilisateur
  const setUser = (userData: any) => {
    user.value = userData
  }

  return { token, user, login, logout, setUser }
})
