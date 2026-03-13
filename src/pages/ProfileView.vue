<template>
  <div class="profile-page" :class="{ dark: themeStore.isDark }">

    <!-- NAV -->
    <nav class="top-nav">
      <div class="nav-inner">
        <router-link to="/channels" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Retour aux chaînes
        </router-link>
        <span class="nav-title">Mon Profil</span>
        <div style="width: 140px;"></div>
      </div>
    </nav>

    <!-- CONTENU -->
    <div class="profile-container" v-if="!loading">

      <!-- HEADER PROFIL -->
      <div class="profile-header">
        <div class="profile-avatar-big">
          {{ userInitial }}
        </div>
        <div class="profile-header-info">
          <h1 class="profile-display-name">{{ displayName || 'Utilisateur' }}</h1>
          <p class="profile-email">{{ userStore.user?.email || '' }}</p>
        </div>
      </div>

      <!-- SECTION INFOS -->
      <div class="profile-section">
        <h2 class="section-title">Informations</h2>
        
        <div v-if="!editing" class="info-grid">
          <div class="info-item">
            <span class="info-label">Nom d'affichage</span>
            <span class="info-value">{{ displayName || '—' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">{{ userStore.user?.email || '—' }}</span>
          </div>
          <button class="btn-edit" @click="startEditing">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Modifier le profil
          </button>
        </div>

        <div v-else class="edit-form">
          <div class="form-group">
            <label for="edit-displayname">Nom d'affichage</label>
            <input id="edit-displayname" v-model="editDisplayName" type="text" class="form-input" placeholder="Votre nom" />
          </div>
          <div class="form-group">
            <label for="edit-email">Email</label>
            <input id="edit-email" :value="userStore.user?.email" type="email" class="form-input" disabled />
            <span class="form-hint">L'email ne peut pas être modifié</span>
          </div>
          <div class="form-actions">
            <button class="btn-cancel" @click="cancelEditing">Annuler</button>
            <button class="btn-save" @click="saveProfile" :disabled="saving">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- SECTION STATISTIQUES -->
      <div class="profile-section">
        <h2 class="section-title">Statistiques</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">{{ stats.publications }}</span>
            <span class="stat-label">Publications</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ stats.comments }}</span>
            <span class="stat-label">Commentaires</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ stats.reactions }}</span>
            <span class="stat-label">Réactions</span>
          </div>
        </div>
      </div>

      <!-- SECTION DANGER -->
      <div class="profile-section danger-section">
        <h2 class="section-title">Session</h2>
        <button class="btn-logout" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Se déconnecter
        </button>
      </div>

    </div>

    <!-- LOADING -->
    <div v-else class="profile-loading">
      <p>Chargement du profil...</p>
    </div>

    <!-- TOAST -->
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { userService } from '@/services'
import '@/assets/instagram.css'
import '@/assets/instagram-bg.css'

const userStore = useUserStore()
const themeStore = useThemeStore()
const router = useRouter()

const loading = ref(true)
const editing = ref(false)
const saving = ref(false)
const editDisplayName = ref('')
const profileData = ref<any>(null)

const stats = ref({ publications: 0, comments: 0, reactions: 0 })

const displayName = computed(() => {
  return profileData.value?.displayName || userStore.user?.displayName || userStore.user?.email || ''
})

const userInitial = computed(() => {
  const name = displayName.value || '?'
  return name.charAt(0).toUpperCase()
})

// Toasts
const toasts = ref<{ id: number; message: string; type: string }[]>([])
let toastId = 0
function showToast(message: string, type: 'success' | 'error' = 'success') {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3500)
}

function startEditing() {
  editDisplayName.value = profileData.value?.displayName || ''
  editing.value = true
}

function cancelEditing() {
  editing.value = false
}

async function saveProfile() {
  if (!userStore.token || !profileData.value?.id) return
  saving.value = true
  try {
    const updated = await userService.update(userStore.token, profileData.value.id, {
      displayName: editDisplayName.value
    })
    profileData.value = updated
    userStore.setUser({ ...userStore.user, displayName: updated.displayName })
    editing.value = false
    showToast('Profil mis à jour', 'success')
  } catch (e: any) {
    showToast(e.message || 'Erreur', 'error')
  } finally {
    saving.value = false
  }
}

async function fetchProfile() {
  if (!userStore.token) return
  loading.value = true
  try {
    const users = await userService.getAll(userStore.token)
    // Trouver l'utilisateur courant par email
    const me = users.find(u => u.email === userStore.user?.email)
    if (me) {
      profileData.value = me
      userStore.setUser({ ...userStore.user, ...me })
    }
  } catch (e) {
    console.warn('Erreur chargement profil', e)
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  userStore.logout()
  router.push('/auth/login')
}

onMounted(() => {
  if (!userStore.token) {
    router.push('/auth/login')
    return
  }
  fetchProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-app);
  color: var(--text-primary);
}

/* NAV */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-nav);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-nav);
}

.nav-inner {
  max-width: 800px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.15s;
}

.back-link:hover {
  opacity: 0.7;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

/* CONTAINER */
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

/* HEADER */
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

.profile-avatar-big {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.profile-header-info {
  min-width: 0;
}

.profile-display-name {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0 0 4px;
}

.profile-email {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* SECTIONS */
.profile-section {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin: 0 0 16px;
}

/* INFO GRID */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 15px;
  color: var(--text-primary);
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--border-main);
  color: var(--text-primary);
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 8px;
  width: fit-content;
}

.btn-edit:hover {
  background: var(--bg-hover);
  border-color: var(--text-primary);
}

/* EDIT FORM */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-input {
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus {
  border-color: #667eea;
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-hint {
  font-size: 11px;
  color: var(--text-subtle);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.btn-cancel {
  background: none;
  border: 1px solid var(--border-main);
  color: var(--text-primary);
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  background: var(--bg-hover);
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-save:hover {
  opacity: 0.9;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  background: var(--bg-input-alt);
  border-radius: 12px;
  border: 1px solid var(--border-light);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* DANGER */
.btn-logout {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

/* LOADING */
.profile-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  color: var(--text-muted);
}

/* TOAST */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.toast.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
