<template>
  <div class="auth-wrapper">
    
    <!-- Carrousel d'images à gauche -->
    <div class="auth-images">
      <div class="slideshow">
        <img 
          v-for="(image, index) in images" 
          :key="index"
          :src="image" 
          :class="{ active: currentImage === index }"
          alt="Connexion illustration"
        />
      </div>
      <div class="slideshow-dots">
        <span 
          v-for="(_, index) in images" 
          :key="index" 
          :class="{ active: currentImage === index }"
          @click="currentImage = index"
        ></span>
      </div>
    </div>

    <!-- Formulaire à droite -->
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' 

// Images
import connexion from '@/assets/connexion.png'
import connexion1 from '@/assets/connexion.1.png'
import connexion2 from '@/assets/connexion.2.png'

const router = useRouter()
const userStore = useUserStore()

// --- IMAGES SLIDESHOW ---
const images = [connexion, connexion2, connexion1]
const currentImage = ref(0)
let slideInterval: number | null = null

onMounted(() => {
  slideInterval = setInterval(() => {
    currentImage.value = (currentImage.value + 1) % images.length
  }, 4000)
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})

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
  align-items: stretch;
  background-color: #ffffff;
  font-family: 'Afacad', sans-serif;
  line-height: 1.6;
}

/* Carrousel d'images à gauche */
.auth-images {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f4f5;
}

.slideshow {
  position: relative;
  width: 100%;
  height: 100%;
}

.slideshow img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.slideshow img.active {
  opacity: 1;
}

.slideshow-dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.slideshow-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background-color 0.3s;
}

.slideshow-dots span.active {
  background-color: #ffffff;
}

/* Formulaire à droite */
.auth-card {
  flex: 1;
  max-width: 500px;
  background: #ffffff;
  padding: 40px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

/* Responsive - cacher les images sur mobile */
@media (max-width: 768px) {
  .auth-images {
    display: none;
  }
  
  .auth-card {
    max-width: 100%;
    padding: 40px 20px;
  }
}
</style>
