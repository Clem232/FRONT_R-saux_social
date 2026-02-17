<template>
  <div class="auth-wrapper">
    
    <div class="auth-card">
      <h1 class="logo">Lumine.</h1>
      <h2 class="auth-title">{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>

      <form @submit.prevent="submit" class="auth-form">
        
        <div v-if="!isLogin" class="form-group">
          <input
            v-model="displayName"
            type="text"
            placeholder="Nom d'utilisateur"
            required
            class="auth-input"
          />
        </div>
        
        <div class="form-group">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Email" 
            required 
            class="auth-input"
          />
        </div>

        <div class="form-group">
          <input 
            v-model="password" 
            type="password" 
            placeholder="Mot de passe" 
            required 
            class="auth-input"
          />
        </div>

        <button type="submit" :disabled="isLoading" class="auth-btn">
          {{ isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire") }}
        </button>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
      </form>

      <div class="divider">ou</div>

      <button class="toggle-link" @click="toggle" :disabled="isLoading">
        {{ isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter' }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' 

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
const slug = 'ws-v' 
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
      throw new Error("Echec connexion")
    }

    userStore.login(loginData.token)
    userStore.setUser({ email: email.value }) // Ou récupérer profil si dispo

    router.push('/channels')

  } catch (e: any) {
    console.error(e)
    errorMsg.value = e.message || "Une erreur est survenue."
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f4f5;
  font-family: 'Afacad', sans-serif;
  line-height: 1.6;
}

.auth-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 40px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 40px;
  margin-bottom: 20px;
  margin-top: 0;
  font-weight: 700;
  letter-spacing: -2px;
  color: #111827;
}

.auth-title {
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 30px;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.5px;
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  width: 100%;
}

.auth-input {
  width: 100%;
  padding: 14px 12px;
  background: #f4f4f5;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 15px;
  outline: none;
  font-family: 'Afacad', sans-serif;
  transition: all 0.2s;
  color: #111827;
}

.auth-input::placeholder {
  color: #6b7280;
}

.auth-input:focus {
  border-color: #111827;
  background: #ffffff;
}

.auth-btn {
  margin-top: 10px;
  background-color: #111827;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 14px;
  font-weight: 700;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.5px;
  transition: background-color 0.2s;
}

.auth-btn:hover {
  background-color: #1f2937;
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  margin: 25px 0;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.divider::before, .divider::after {
  content: '';
  height: 1px;
  background: #e5e7eb;
  flex: 1;
}

.toggle-link {
  background: none;
  border: none;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Afacad', sans-serif;
  text-decoration: underline;
  padding: 8px;
}

.toggle-link:hover {
  color: #374151;
}

.error-msg {
  color: #ef4444;
  font-size: 13px;
  margin-top: 15px;
  text-align: center;
  font-family: 'Afacad', sans-serif;
}
</style>
