<template>
  <div class="insta-app">
    
    <nav class="insta-nav">
      <div class="nav-content">
        <h1 class="insta-logo">Social App</h1>
        <div class="nav-icons">
          <button @click="logout" class="text-btn">Déconnexion</button>
        </div>
      </div>
    </nav>

    <div class="main-container">
      
      <div class="stories-tray">
        <div class="story-item" @click="createChannel">
          <div class="story-ring add-ring">
            <div class="story-avatar add-avatar"><span>+</span></div>
          </div>
          <span class="story-name">Nouveau</span>
        </div>

        <div 
          v-for="channel in channelsList" 
          :key="channel.id" 
          class="story-item"
          @click="changeChannel(channel)"
        >
          <div class="story-ring" :class="{ active: currentChannelId === channel.id }">
            <div class="story-avatar">
              {{ channel.name ? channel.name.charAt(0).toUpperCase() : '#' }}
            </div>
          </div>
          <span class="story-name">{{ channel.name }}</span>
        </div>
      </div>

      <div class="feed-container">
        
        <div v-if="loadingFeed" class="loading-spinner"></div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        
        <div v-if="currentChannelData && !loadingFeed">
          
          <div v-if="currentChannelData.publications && currentChannelData.publications.length > 0">
            <article v-for="pub in currentChannelData.publications" :key="pub['@id']" class="insta-post">
              
              <header class="post-header">
                <div class="user-avatar-small">
                  {{ pub.title ? pub.title.charAt(0).toUpperCase() : '?' }}
                </div>
                <div class="header-info">
                  <span class="username">{{ pub.title || 'Anonyme' }}</span>
                  <span class="location">#{{ currentChannelData.name }}</span>
                </div>
              </header>

              <div class="post-image-container">
                <img 
                  v-if="getPostImageUrl(pub)" 
                  :src="getPostImageUrl(pub)" 
                  class="real-image" 
                  alt="Post content"
                  @error="onImgError"
                />
                <div v-else class="text-as-image">
                  <p>{{ pub.body }}</p>
                </div>
              </div>

              <div class="post-actions">
                <div class="actions-left">
                  <span class="action-icon">❤️</span>
                  <span class="action-icon">💬</span>
                </div>
              </div>

              <div class="post-caption-section">
                <div class="caption-text">
                  <span class="username-caption">{{ pub.title }}</span> 
                  {{ pub.body }}
                </div>
              </div>
            </article>
          </div>

          <div v-else class="empty-feed">
             <div class="empty-icon">📷</div>
             <h3>Aucune publication</h3>
             <p>Le salon <b>#{{ currentChannelData.name }}</b> est vide.</p>
             <button class="cta-btn" @click="openModal">Créer le premier post</button>
          </div>

        </div>
      </div>
    </div>

    <nav class="bottom-nav">
      <div class="nav-item">🏠</div>
      <div class="nav-item plus-btn-container" @click="openModal">
        <div class="plus-btn-icon">+</div>
      </div>
      <div class="nav-item">👤</div>
    </nav>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        
        <div class="modal-header">
          <button @click="closeModal" class="cancel-btn">Annuler</button>
          <h3>Nouveau post</h3>
          <button @click="publishPost" class="share-btn" :disabled="publishing">
            {{ publishing ? 'Envoi...' : 'Partager' }}
          </button>
        </div>

        <div class="modal-body">
          <div class="modal-user-info">
             <div class="user-avatar-xs">Moi</div>
             <span class="posting-in">Dans : <strong>#{{ currentChannelData?.name || '...' }}</strong></span>
          </div>
          
          <input 
            v-model="newPostTitle" 
            type="text" 
            class="modal-input-title" 
            placeholder="Titre obligatoire..." 
          />
          
          <textarea 
            v-model="newPostContent" 
            class="modal-textarea" 
            placeholder="Écrivez une légende..."
          ></textarea>

          <div class="image-upload-zone">
            <label for="file-upload" class="custom-file-upload">
              📷 Ajouter une photo
            </label>
            <input id="file-upload" type="file" @change="handleFileSelect" accept="image/*" />
            
            <div v-if="previewImage" class="preview-container">
              <img :src="previewImage" class="preview-img" />
              <button @click="removeImage" class="remove-img-btn">×</button>
            </div>
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
const SLUG = 'ws-n' 
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
  } catch (e) { console.error(e) } finally { loadingList.value = false }
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
        
        // Force loading messages if missing
        if (!fullData.publications) throw new Error("Partial load")
    } else {
        throw new Error("Channel fetch error")
    }

  } catch (e) {
    // Fallback: fetch messages manually by ID
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


// 4. PUBLICATION POST + IMAGE (CORRIGÉ)
async function publishPost() {
  if (!newPostTitle.value.trim()) {
    alert("Le titre est obligatoire.")
    return
  }

  publishing.value = true
  
  try {
    // A. Trouver l'IRI du salon
    let channelIRI = currentChannelData.value?.['@id']
    if (!channelIRI) {
         channelIRI = `/api/${SLUG}/channels/${currentChannelId.value}`
    }

    console.log("Envoi POST vers le salon :", channelIRI)

    const postPayload = {
      title: newPostTitle.value,
      body: newPostContent.value,
      channel: channelIRI 
    }

    // 🔥 CORRECTION : Ajout du /ws-n/ dans l'URL
    const urlPost = `${API_BASE}/${SLUG}/publications`

    const resPost = await fetch(urlPost, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${userStore.token}`, 
        'Content-Type': 'application/ld+json' 
      },
      body: JSON.stringify(postPayload)
    })

    // Lecture sécurisée de la réponse
    const responseText = await resPost.text()

    if (!resPost.ok) {
      console.error("Erreur API :", responseText)
      throw new Error(`Erreur ${resPost.status}. Voir console.`)
    }

    const createdPost = JSON.parse(responseText)
    console.log("Post créé :", createdPost)

    // B. Envoi de l'image (si présente)
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('publication', createdPost['@id']) 

      // 🔥 CORRECTION : Ajout du /ws-n/ dans l'URL media
      const urlMedia = `${API_BASE}/${SLUG}/media`
      
      console.log("Envoi MEDIA vers :", urlMedia)

      const resMedia = await fetch(urlMedia, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userStore.token}` },
        body: formData
      })

      if (!resMedia.ok) {
        console.warn("Erreur image", await resMedia.text())
        alert("Post publié, mais l'image n'a pas pu être envoyée.")
      }
    }

    closeModal()
    const currentObj = channelsList.value.find(c => c.id === currentChannelId.value)
    if(currentObj) await changeChannel(currentObj)

  } catch (e) {
    alert("Erreur : " + e.message)
    console.error(e)
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

function getPostImageUrl(pub) {
  // Adaptation selon le format de retour API (tableau medias ou propriété media)
  // On regarde dans medias[]
  if (pub.medias && pub.medias.length > 0) {
    if (pub.medias[0].contentUrl) return BASE_URL + pub.medias[0].contentUrl
    return BASE_URL + pub.medias[0] // Si c'est juste un string
  }
  return null
}

function onImgError(e) {
  e.target.style.display = 'none'
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
/* Ajouts Upload */
.image-upload-zone {
  margin-top: 15px; border-top: 1px solid #efefef; padding-top: 10px;
}
input[type="file"] { display: none; }
.custom-file-upload {
  display: inline-block; padding: 6px 12px; cursor: pointer;
  background: #fafafa; border: 1px solid #dbdbdb; border-radius: 4px;
  font-size: 14px; font-weight: 600;
}
.preview-container {
  position: relative; margin-top: 10px; width: 100px; height: 100px;
}
.preview-img {
  width: 100%; height: 100%; object-fit: cover; border-radius: 4px;
}
.remove-img-btn {
  position: absolute; top: -5px; right: -5px; background: red; color: white;
  border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer;
}
.real-image { width: 100%; height: 100%; object-fit: cover; }
.cta-btn {
  margin-top: 15px; background-color: #0095f6; color: white; border: none;
  padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;
}
</style>