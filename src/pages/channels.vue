<template>
  <div class="lumine-app">
    
    <nav class="lumine-nav">
      <div class="nav-content">
        <h1 class="lumine-logo">Lumine.</h1>
        <div class="nav-icons">
          <button @click="openModal" class="btn-primary">+ Créer</button>
          <button @click="logout" class="btn-text danger">Déconnexion</button>
        </div>
      </div>
    </nav>

    <div class="main-layout">
      
      <!-- FEED SECTION (LEFT) -->
      <main class="feed-content">
        
        <div v-if="loadingFeed" class="loading-spinner"></div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        
        <div v-if="currentChannelData && !loadingFeed">
          
          <div class="feed-header-info">
             <h2 class="current-channel-title">#{{ currentChannelData.name }}</h2>
             <p style="color: grey">{{ currentChannelData.publications?.length || 0 }} publications</p>
          </div>

          <div v-if="currentChannelData.publications && currentChannelData.publications.length > 0" class="feed-grid">
            
            <article 
              v-for="pub in currentChannelData.publications" 
              :key="pub['@id']" 
              class="lumine-post"
              @click="viewPost(pub)"
            >
              <!-- IMAGE OR TEXT PLACEHOLDER -->
              <img 
                v-if="hasImage(pub)" 
                :src="getPostImageUrl(pub)" 
                class="post-image" 
                alt="Post content"
                loading="lazy"
              />
              <div v-else class="post-text-placeholder">
                 <p class="post-text-content">{{ pub.body }}</p>
              </div>

              <!-- HOVER OVERLAY -->
              <div class="post-overlay">
                 <div class="overlay-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <span>0</span>
                 </div>
              </div>

            </article>

          </div>

          <div v-else class="empty-feed">
             <p>Aucune publication encore.</p>
             <button class="btn-text" @click="openModal">Soyez le premier à publier.</button>
          </div>

        </div>
      </main>

      <!-- SIDEBAR (RIGHT) -->
      <aside class="lumine-sidebar">
        
        <div class="sidebar-header">
           <svg class="sidebar-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
           <span>CHAÎNES</span>
        </div>

        <div class="channel-list">
          <div 
             v-for="channel in channelsList" 
             :key="channel.id"
             class="channel-item"
             :class="{ active: currentChannelId === channel.id }"
             @click="changeChannel(channel)"
          >
             <svg class="hash-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
             <span class="channel-name">{{ channel.name }}</span>
          </div>
        </div>

        <button class="create-channel-btn" @click="createChannel">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           Nouveau salon
        </button>

      </aside>

    </div>

    <!-- FLOATING ACTION BUTTON -->
    <button class="fab-create" @click="openModal" title="Nouvelle publication">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>

    <!-- MODAL POST -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        
        <div class="modal-header">
          <button @click="closeModal" class="btn-text">Annuler</button>
          <span style="font-weight:600">Nouveau post</span>
          <button @click="publishPost" class="btn-text" style="color: #0095f6" :disabled="publishing">
            {{ publishing ? '...' : 'Partager' }}
          </button>
        </div>

        <div class="modal-body">
          <input 
            v-model="newPostTitle" 
            type="text" 
            class="modal-input" 
            placeholder="Titre..." 
            style="font-weight:bold; font-size:16px;"
          />
          
          <textarea 
            v-model="newPostContent" 
            class="modal-input" 
            placeholder="Légende..."
            rows="3"
            style="border:none; margin-bottom:0;"
          ></textarea>

          <label for="file-upload" class="file-upload-label">
             <span v-if="!selectedFile">📷 Ajouter une photo</span>
             <span v-else>Changer la photo</span>
          </label>
          <input id="file-upload" type="file" @change="handleFileSelect" accept="image/*" style="display:none" />
          
          <div v-if="previewImage">
             <img :src="previewImage" class="preview-img" />
             <button @click="removeImage" class="btn-text danger" style="width:100%">Supprimer l'image</button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import '@/assets/instagram.css'

const userStore = useUserStore()
const router = useRouter()

// Données
const channelsList = ref([])
const currentChannelData = ref(null)
const currentChannelId = ref(null)

// Formulaire
const showModal = ref(false)
const newPostContent = ref('')
const newPostTitle = ref('')
const publishing = ref(false)
const selectedFile = ref(null)
const previewImage = ref(null)

// Etats
const loadingList = ref(false)
const loadingFeed = ref(false)
const errorMsg = ref('')

// Config
const SLUG = 'ws-v' 
const API_BASE = 'https://wra506d.davidannebicque.ovh/api'
const BASE_URL = 'https://wra506d.davidannebicque.ovh'


// 1. LISTE DES SALONS
async function fetchChannelsList() {
  loadingList.value = true
  try {
    const res = await fetch(`${API_BASE}/${SLUG}/channels`, {
      headers: { 'Authorization': `Bearer ${userStore.token}` }
    })
    const data = await res.json()
    channelsList.value = data.member || data
    
    if (channelsList.value.length > 0) {
      changeChannel(channelsList.value[0])
    }
  } catch (e) {
      console.error(e)
      errorMsg.value = "Erreur chargement salons"
  } finally { loadingList.value = false }
}

// 2. CHANGER DE SALON (Lecture Feed)
async function changeChannel(channelObj) {
  currentChannelId.value = channelObj.id
  loadingFeed.value = true
  errorMsg.value = ''
  currentChannelData.value = { ...channelObj, publications: [] }

  try {
    const identifier = channelObj.slug || channelObj.id
    const url = `${API_BASE}/${SLUG}/channels/${identifier}`
    
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${userStore.token}` } })
    
    if(res.ok) {
        const fullData = await res.json()
        currentChannelData.value = fullData
        if (!fullData.publications) fullData.publications = [] // Ensure array
        
        // Sometimes API returns minimal info, check if pubs exist
        if (fullData.publications.length === 0) {
             // Optional: Try specialized call if needed, but standard should work
        }

    } else {
        throw new Error("Channel fetch error")
    }

  } catch (e) {
    // Fallback if detail fetch fails, try listing pubs
    try {
        const resPubs = await fetch(`${API_BASE}/${SLUG}/publications?channel.id=${channelObj.id}`, {
            headers: { 'Authorization': `Bearer ${userStore.token}` }
        })
        const pubsData = await resPubs.json()
        currentChannelData.value.publications = pubsData['hydra:member'] || pubsData
    } catch (err2) {
        console.error(err2)
        errorMsg.value = "Impossible de charger le flux."
    }
  } finally {
    loadingFeed.value = false
  }
}

// 3. CRÉATION SALON
async function createChannel() {
  const name = prompt("Nom du nouveau salon :")
  if (!name) return
  try {
    await fetch(`${API_BASE}/${SLUG}/channels`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userStore.token}`, 'Content-Type': 'application/ld+json' },
      body: JSON.stringify({ name })
    })
    await fetchChannelsList()
  } catch (e) { alert(e.message) }
}


// 4. PUBLICATION
async function publishPost() {
  if (!newPostTitle.value.trim()) {
    alert("Le titre est obligatoire.")
    return
  }

  publishing.value = true
  
  try {
    let channelIRI = currentChannelData.value?.['@id']
    if (!channelIRI) {
         channelIRI = `/api/${SLUG}/channels/${currentChannelId.value}`
    }

    const postPayload = {
      title: newPostTitle.value,
      body: newPostContent.value,
      channel: channelIRI 
    }

    const resPost = await fetch(`${API_BASE}/${SLUG}/publications`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${userStore.token}`, 
        'Content-Type': 'application/ld+json' 
      },
      body: JSON.stringify(postPayload)
    })

    if (!resPost.ok) throw new Error("Erreur publication")
    
    const createdPost = await resPost.json()

    // Envoi image
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('publication', createdPost['@id']) 

      await fetch(`${API_BASE}/${SLUG}/media`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userStore.token}` },
        body: formData
      })
    }

    closeModal()
    const currentObj = channelsList.value.find(c => c.id === currentChannelId.value)
    if(currentObj) await changeChannel(currentObj)

  } catch (e) {
    alert("Erreur : " + e.message)
  } finally {
    publishing.value = false
  }
}

// 5. UTILITAIRES
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

function removeImage() {
  selectedFile.value = null
  previewImage.value = null
}

function hasImage(pub) {
   return pub.medias && pub.medias.length > 0;
}

function getPostImageUrl(pub) {
  if (pub.medias && pub.medias.length > 0) {
    const m = pub.medias[0]
    if (m.contentUrl) return BASE_URL + m.contentUrl
    return BASE_URL + m
  }
  return null
}

function viewPost(pub) {
    // Optional
    console.log("View post", pub)
}

// Navigation
function openModal() {
  if (!currentChannelId.value) {
    alert("Veuillez sélectionner un salon.")
    return
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  newPostContent.value = ''
  newPostTitle.value = ''
  removeImage()
}

function logout() {
  userStore.logout()
  router.push('/auth/login')
}

onMounted(() => {
  if (!userStore.token) router.push('/auth/login')
  else fetchChannelsList()
})
</script>

<style scoped>
/* Scoped overrides if needed */
</style>
