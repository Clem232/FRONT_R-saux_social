<template>
  <div class="auth-container">
    <h1>{{ isLogin ? 'Connexion' : 'Inscription' }}</h1>

    <form @submit.prevent="submit">
      <input
        v-if="!isLogin"
        v-model="displayName"
        type="text"
        placeholder="Nom d'utilisateur"
        required
      />
      
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Mot de passe" required />

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire") }}
      </button>
    </form>

    <button class="toggle-btn" @click="toggle" :disabled="isLoading">
      {{ isLogin ? 'Pas de compte ? Créer un compte' : 'Déjà un compte ? Se connecter' }}
    </button>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // Assure-toi que le chemin est bon

const router = useRouter()
const userStore = useUserStore()

// --- ETATS ---
const isLogin = ref(true)
const isLoading = ref(false)
const email = ref('')
const password = ref('')
const displayName = ref('')
const errorMsg = ref('')

// --- CONFIGURATION ---
const slug = 'ws-n' 
const API_URL = 'https://wra506d.davidannebicque.ovh/api'

// --- ACTIONS ---

function toggle() {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  displayName.value = ''
}

async function submit() {
  errorMsg.value = ''
  isLoading.value = true

  try {
    // ----------------------------------------------------
    // ÉTAPE 1 : INSCRIPTION (Seulement si on est en mode Register)
    // ----------------------------------------------------
    if (!isLogin.value) {
      const registerRes = await fetch(`${API_URL}/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.value,
          email: email.value,
          password: password.value
        })
      })

      if (!registerRes.ok) {
        // Tentative de récupération du message d'erreur précis
        const errData = await registerRes.json().catch(() => ({}))
        throw new Error(errData.detail || errData.message || "Erreur lors de l'inscription")
      }
      
      console.log('Inscription réussie ! Connexion en cours...')
    }

    // ----------------------------------------------------
    // ÉTAPE 2 : CONNEXION (Pour tout le monde)
    // ----------------------------------------------------
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const loginData = await loginRes.json()

    if (!loginRes.ok) {
      throw new Error(loginData.message || 'Email ou mot de passe incorrect')
    }

    if (!loginData.token) {
      throw new Error("Erreur technique : Token manquant")
    }

    // ----------------------------------------------------
    // ÉTAPE 3 : SAUVEGARDE ET REDIRECTION
    // ----------------------------------------------------
    
    // 1. Sauvegarder le token dans le store Pinia
    userStore.login(loginData.token)
    console.log('Token récupéré :', loginData.token)

    // 2. Récupérer les infos de l'utilisateur (optionnel mais conseillé)
    try {
      const userRes = await fetch(`${API_URL}/${slug}/users/me`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      })
      if (userRes.ok) {
        const userData = await userRes.json()
        // Si ton store a une action setUser, utilise-la
        if (userStore.setUser) userStore.setUser(userData)
      }
    } catch (e) {
      console.warn("Impossible de charger le profil utilisateur", e)
    }

    // 3. Redirection vers la page principale
    router.push('/channels')

  } catch (err: any) {
    console.error(err)
    errorMsg.value = err.message || 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  text-align: center;
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input {
  padding: 12px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
}

button {
  padding: 12px;
  border: none;
  border-radius: 5px;
  background-color: #0095f6;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #007acc;
}

button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.toggle-btn {
  margin-top: 15px;
  background: none;
  border: none;
  color: #0095f6;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.toggle-btn:hover {
  color: #003d80;
  background: none;
}

.error {
  color: #d32f2f;
  background-color: #ffcccc;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  font-size: 14px;
}
</style>