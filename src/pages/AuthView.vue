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
          alt="Illustration de mode"
          :loading="index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="index === 0 ? 'high' : 'low'"
        />
      </div>
      <div class="slideshow-dots" role="tablist" aria-label="Navigation du carrousel">
        <span 
          v-for="(_, index) in images" 
          :key="index" 
          :class="{ active: currentImage === index }"
          @click="currentImage = index"
          role="button"
          :aria-label="`Image ${index + 1} sur ${images.length}`"
          :aria-pressed="currentImage === index"
          tabindex="0"
          @keyup.enter="currentImage = index"
          @keyup.space.prevent="currentImage = index"
        ></span>
      </div>
    </div>

    <!-- Formulaire à droite -->
    <div class="auth-card">
      <h1 class="logo">Lumi.</h1>
      <h2 class="auth-title">{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>

      <p class="auth-description">
        Rejoignez notre communauté créative ! Profitez de partager vos idées de mode, découvrez les dernières tendances et connectez-vous avec des passionnés.
      </p>

      <form @submit.prevent="submit" class="auth-form">
        
        <div v-if="!isLogin" class="form-group">
          <label for="display-name" class="sr-only">Nom d'utilisateur</label>
          <input
            id="display-name"
            v-model="displayName"
            type="text"
            placeholder="Nom d'utilisateur"
            required
            class="auth-input"
          />
        </div>
        
        <div class="form-group">
          <label for="email" class="sr-only">Adresse e-mail</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="Email" 
            required 
            class="auth-input"
          />
        </div>

        <div class="form-group">
          <label for="password" class="sr-only">Mot de passe</label>
          <input 
            id="password"
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

        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>
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
import img3 from '@/assets/europeana-9oMfRY9UuMo-unsplash.jpg'
import img2 from '@/assets/europeana-Md_krY078OM-unsplash.jpg'
import img1 from '@/assets/charlota-blunarova-r5xHI_H44aM-unsplash (1).jpg'
import img4 from '@/assets/europeana-SxKoo0k6fJs-unsplash (1).jpg'
import img5 from '@/assets/gio-gix-1RNr1pLBeR4-unsplash (1).jpg'

const router = useRouter()
const userStore = useUserStore()

// --- IMAGES SLIDESHOW ---
const images = [img1, img2, img3, img4, img5]
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
const successMsg = ref('')

// --- CONFIGURATION ---
const slug = 'ws-v' 
const API_URL = 'https://wra506d.davidannebicque.ovh/api'

// --- ACTIONS ---

function toggle() {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  successMsg.value = ''
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
      // registerWithSlug → POST /api/{slug}/register
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
        // Afficher la réponse brute du serveur pour diagnostiquer
        const errText = await registerRes.text()
        let errMsg = `Erreur ${registerRes.status}`
        try {
          const errData = JSON.parse(errText)
          errMsg = errData['hydra:description'] || errData.detail || errData.message || errData.error || errText
        } catch {
          errMsg = errText || errMsg
        }
        console.error('API register response:', registerRes.status, errText)
        throw new Error(errMsg)
      }

      // Inscription réussie → on réinitialise le formulaire
      // pour pouvoir inscrire quelqu'un d'autre ou se connecter
      successMsg.value = `Compte créé pour ${displayName.value} ! Vous pouvez maintenant vous connecter.`
      displayName.value = ''
      email.value = ''
      password.value = ''
      isLogin.value = true   // bascule vers l'onglet connexion
      return
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
    userStore.setUser({ email: email.value })

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
  background-color: var(--bg-card, #ffffff);
  font-family: 'Afacad', sans-serif;
  line-height: 1.6;
  transition: background-color 0.3s ease;
}

/* Carrousel d'images à gauche */
.auth-images {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-input-alt, #f4f4f5);
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
  background: var(--bg-card, #ffffff);
  padding: 40px 60px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 40px;
  margin-bottom: 20px;
  margin-top: 0;
  font-weight: 700;
  letter-spacing: -2px;
  color: var(--text-primary, #414141);
  align-self: center;
}

.auth-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-muted, #6b7280);
  margin-bottom: 16px;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.5px;
  align-self: center;
}

.auth-description {
  font-size: 13px;
  color: var(--text-muted, #6b7280);
  margin-bottom: 24px;
  text-align: left;
  line-height: 1.5;
  max-width: 100%;
  width: 100%;
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
  background: var(--bg-input-alt, #f4f4f5);
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 3px;
  font-size: 15px;
  outline: none;
  font-family: 'Afacad', sans-serif;
  transition: all 0.2s;
  color: var(--text-primary, #414141);
}

.auth-input::placeholder {
  color: var(--text-muted, #6b7280);
}

.auth-input:focus {
  border-color: var(--text-primary, #414141);
  background: var(--bg-input, #ffffff);
}

.auth-btn {
  margin-top: 10px;
  background-color: #414141;
  color: #ffffff;
  border: none;
  border-radius: 3px;
  padding: 14px;
  font-weight: 700;
  cursor: pointer;
  font-size: 16px;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.5px;
  transition: background-color 0.2s;
}

.auth-btn:hover {
  background-color: #555555;
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  margin: 25px 0;
  color: var(--text-muted, #6b7280);
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
  background: var(--border-light, #e5e7eb);
  flex: 1;
}

.toggle-link {
  background: none;
  border: none;
  color: var(--text-primary, #414141);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Afacad', sans-serif;
  text-decoration: underline;
  padding: 8px;
  align-self: center;
}

.toggle-link:hover {
  color: var(--text-secondary, #666666);
}

.error-msg {
  color: #ef4444;
  font-size: 13px;
  margin-top: 15px;
  text-align: center;
  font-family: 'Afacad', sans-serif;
}

.success-msg {
  color: #16a34a;
  font-size: 13px;
  margin-top: 15px;
  text-align: center;
  font-family: 'Afacad', sans-serif;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 3px;
  padding: 10px 14px;
}

/* Responsive - cacher les images sur mobile */
@media (max-width: 768px) {
  .auth-wrapper {
    align-items: flex-start;
  }

  .auth-images {
    display: none;
  }

  .auth-card {
    max-width: 100%;
    padding: 48px 24px 32px;
    min-height: 100vh;
    justify-content: center;
  }

  .logo {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .auth-input {
    font-size: 16px; /* évite le zoom automatique sur iOS */
    padding: 15px 14px;
    min-height: 50px;
  }

  .auth-btn {
    min-height: 50px;
    font-size: 16px;
  }

  .toggle-link {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 360px) {
  .auth-card {
    padding: 40px 16px 24px;
  }
}
</style>
