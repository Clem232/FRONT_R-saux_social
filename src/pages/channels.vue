<template>
  <div class="lumine-app">

    <!-- TOAST NOTIFICATIONS -->
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="toast-item" 
          :class="toast.type"
        >
          <span>{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>
    
    <nav class="lumine-nav">
      <div class="nav-content">
        <h1 class="lumine-logo">Lumi.</h1>
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
             <span class="pub-count-badge">{{ currentChannelData.publications?.length || 0 }} publications</span>
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
                 <p class="post-text-title">{{ pub.title }}</p>
                 <p class="post-text-content">{{ pub.body }}</p>
              </div>

              <!-- HOVER OVERLAY -->
              <div class="post-overlay">
                 <div class="overlay-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    <span>{{ pub.reactions?.length || 0 }}</span>
                 </div>
                 <div class="overlay-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span>{{ pub.comments?.length || 0 }}</span>
                 </div>
                 
                 <button class="delete-post-btn" @click.stop="confirmDeletePost(pub)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                 </button>
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
             <div class="channel-info">
               <svg class="hash-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
               <span class="channel-name">{{ channel.name }}</span>
             </div>
             <div class="channel-menu" @click.stop>
               <button class="menu-btn" @click="toggleMenu(channel.id)">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
               </button>
               <div v-if="openMenuId === channel.id" class="menu-dropdown">
                 <button class="menu-option delete" @click="deleteChannel(channel)">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                   Supprimer
                 </button>
               </div>
             </div>
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
          <button @click="closeModal" class="btn-text cancel-btn">Annuler</button>
          <span class="modal-title">Nouvelle publication</span>
          <button @click="publishPost" class="btn-text publish-btn" :disabled="publishing">
            {{ publishing ? 'Publication...' : 'Publier' }}
          </button>
        </div>

        <div class="modal-body">
          <input 
            v-model="newPostTitle" 
            type="text" 
            class="modal-input title-input" 
            placeholder="Titre de la publication" 
          />
          
          <textarea 
            v-model="newPostContent" 
            class="modal-input content-input" 
            placeholder="Écrivez votre message..."
            rows="5"
          ></textarea>

          <label for="file-upload" class="file-upload-label">
             <span v-if="!selectedFile">Ajouter une image</span>
             <span v-else>Changer l'image</span>
          </label>
          <input id="file-upload" type="file" @change="handleFileSelect" accept="image/*" style="display:none" />
          
          <div v-if="previewImage" class="preview-container">
             <img :src="previewImage" class="preview-img" />
             <button @click="removeImage" class="btn-text danger remove-img-btn">Supprimer l'image</button>
          </div>

        </div>
      </div>
    </div>

    <!-- MODAL DETAILS PUBLICATION (POPUP) -->
    <div v-if="showPostModal && selectedPost" class="modal-overlay post-detail-overlay" @click.self="closePostModal">
      <div class="post-detail-card">
        <button class="close-btn-float" @click="closePostModal">&times;</button>
        
        <!-- SECTION GAUCHE : IMAGE -->
        <div class="post-media-section" :class="{ 'no-media': !hasImage(selectedPost) }">
           <img 
             v-if="hasImage(selectedPost)" 
             :src="getPostImageUrl(selectedPost)" 
             class="detail-main-img" 
           />
           <div v-else class="no-image-placeholder">
             <p>Aucune image</p>
           </div>
        </div>

        <!-- SECTION DROITE : INFOS -->
        <div class="post-info-section">
          
          <!-- Header -->
          <div class="detail-header">
             <div class="author-info">
               <div class="avatar-circle">{{ selectedPost.id.toString().substring(0,2) }}</div>
               <span class="author-name">Publication #{{ selectedPost.id }}</span>
             </div>
             <button @click="confirmDeletePost(selectedPost)" class="btn-text danger" title="Supprimer">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
             </button>
          </div>

          <!-- Scrollable Content -->
          <div class="detail-scrollable">
             
             <!-- Post Caption -->
             <div class="post-caption-box">
                <h3 class="post-title-detail">{{ selectedPost.title }}</h3>
                <p class="post-body-detail">{{ selectedPost.body }}</p>
                <div class="post-date">{{ new Date(selectedPost.createdAt).toLocaleDateString() }}</div>
             </div>

             <div class="separator"></div>

             <!-- Comments List -->
             <div class="comments-list">
               <div v-if="loadingComments" class="loading-spinner small"></div>
               <p v-else-if="selectedPostComments.length === 0" class="no-comments">Aucun commentaire.</p>
               
               <div v-for="comment in selectedPostComments" :key="comment.id" class="comment-item">
                  <div class="comment-avatar-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div class="comment-body">
                    <span class="comment-author">Utilisateur</span>
                    <span class="comment-text">{{ comment.body }}</span>
                    <span class="comment-date">{{ comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '' }}</span>
                  </div>
               </div>
             </div>

          </div>

          <!-- Footer Actions -->
          <div class="detail-footer">
             <div class="action-buttons">
                <button @click="toggleLike(selectedPost!)" class="action-icon-btn">
                  <svg v-if="selectedPostReactions.length > 0" fill="#ed4956" stroke="#ed4956" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                <span class="likes-count">{{ selectedPostReactions.length }} J'aime</span>
             </div>
             
             <div class="add-comment-box">
                <input 
                  v-model="newCommentText" 
                  type="text" 
                  placeholder="Ajouter un commentaire..." 
                  @keyup.enter="sendComment"
                />
                <button @click="sendComment" :disabled="!newCommentText.trim()" class="post-btn">Publier</button>
             </div>
          </div>
          
        </div>

      </div>
    </div>

    <!-- BACKGROUND TEXT DECORATION -->
    <div class="background-text-layer">
        <span class="bg-word w1">FASHION</span>
        <span class="bg-word w2">MODE</span>
        <span class="bg-word w3">VOGUE</span>
        <span class="bg-word w4">STYLE</span>
        <span class="bg-word w5">CHIC</span>
        <span class="bg-word w6">TREND</span>
        <span class="bg-word w7">ART</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { channelService, publicationService, API_CONFIG } from '@/services'
import type { Channel, Publication } from '@/types'
import '@/assets/instagram.css'
import '@/assets/instagram-bg.css'

const userStore = useUserStore()
const router = useRouter()

// Données
const channelsList = ref<Channel[]>([])
const currentChannelData = ref<Channel | null>(null)
const currentChannelId = ref<number | null>(null)

// Formulaire
const showModal = ref(false)
const newPostContent = ref('')
const newPostTitle = ref('')
const publishing = ref(false)
const selectedFile = ref<File | null>(null)
const previewImage = ref<string | null>(null)

// Etats
const loadingList = ref(false)
const loadingFeed = ref(false)
const errorMsg = ref('')
const openMenuId = ref<number | null>(null)

// Modal détails publication
const showPostModal = ref(false)
const selectedPost = ref<Publication | null>(null)
const selectedPostComments = ref<any[]>([])
const selectedPostReactions = ref<any[]>([])
const newCommentText = ref('')
const loadingComments = ref(false)

// Toast notifications
const toasts = ref<{ id: number; message: string; type: 'success' | 'error' | 'info' }[]>([])
let toastIdCounter = 0

function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = ++toastIdCounter
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

// Polling
let pollingTimer: ReturnType<typeof setInterval> | null = null
const POLLING_INTERVAL = 15000 // 15 secondes

function startPolling() {
  stopPolling()
  pollingTimer = setInterval(async () => {
    if (!userStore.token || !currentChannelId.value) return
    const currentObj = channelsList.value.find(c => c.id === currentChannelId.value)
    if (currentObj) {
      try {
        const pubs = await channelService.getPublications(
          userStore.token,
          currentObj.id,
          currentObj.slug
        )
        // Hydrater les médias pour que les images restent affichées
        await publicationService.hydratePublicationsMedia(userStore.token, pubs)
        
        if (currentChannelData.value && currentChannelId.value === currentObj.id) {
          const oldCount = currentChannelData.value.publications?.length || 0
          currentChannelData.value.publications = pubs
          if (pubs.length > oldCount) {
            showToast(`${pubs.length - oldCount} nouvelle(s) publication(s)`, 'info')
          }
        }
      } catch (e) {
        console.warn('[polling] Refresh failed', e)
      }
    }
  }, POLLING_INTERVAL)
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

// 1. LISTE DES SALONS
async function fetchChannelsList() {
  if (!userStore.token) return
  
  loadingList.value = true
  try {
    channelsList.value = await channelService.getAll(userStore.token)
    
    if (channelsList.value.length > 0 && channelsList.value[0]) {
      changeChannel(channelsList.value[0])
    }
  } catch (e) {
    console.error(e)
    errorMsg.value = "Erreur chargement salons"
  } finally { 
    loadingList.value = false 
  }
}

// 2. CHANGER DE SALON (Lecture Feed)
async function changeChannel(channelObj: Channel) {
  if (!userStore.token) return
  
  currentChannelId.value = channelObj.id
  loadingFeed.value = true
  errorMsg.value = ''
  currentChannelData.value = { ...channelObj, publications: [] }

  try {
    // Essayer de récupérer les infos complètes du channel
    try {
      const fullData = await channelService.getById(userStore.token, channelObj.id)
      currentChannelData.value = { ...fullData, publications: [] }
    } catch (e) {
      // Si getById échoue, on garde les infos de base
      console.log('[changeChannel] getById failed, using basic info')
    }
    
    // Charger les publications avec le slug pour un meilleur filtrage
    const pubs = await channelService.getPublications(
      userStore.token, 
      channelObj.id,
      channelObj.slug
    )
    
    // Hydrater les publications avec les médias (force brute)
    await publicationService.hydratePublicationsMedia(userStore.token, pubs)
    
    currentChannelData.value.publications = pubs
    
  } catch (e) {
    console.error(e)
    errorMsg.value = "Impossible de charger le flux."
  } finally {
    loadingFeed.value = false
  }
}

// 3. CRÉATION SALON
async function createChannel() {
  if (!userStore.token) return
  
  const name = prompt("Nom du nouveau salon :")
  if (!name) return
  try {
    await channelService.create(userStore.token, name)
    await fetchChannelsList()
    showToast(`Salon "${name}" créé`, 'success')
  } catch (e: any) { 
    showToast(e.message, 'error') 
  }
}

// 3B. MENU & SUPPRESSION SALON
function toggleMenu(channelId: number) {
  if (openMenuId.value === channelId) {
    openMenuId.value = null
  } else {
    openMenuId.value = channelId
  }
}

async function deleteChannel(channel: Channel) {
  if (!userStore.token) return
  
  openMenuId.value = null
  
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le salon "${channel.name}" ?`)) {
    return
  }
  
  try {
    // IMPORTANT: Utiliser l'ID numérique, pas le slug!
    await channelService.delete(userStore.token, channel.id)
    
    // Recharger la liste
    await fetchChannelsList()
    showToast(`Salon "${channel.name}" supprimé`, 'success')
    
  } catch (e: any) {
    console.error(e)
    showToast("Erreur : " + e.message, 'error')
  }
}

async function confirmDeletePost(pub: Publication) {
  if (!confirm("Voulez-vous vraiment supprimer cette publication ?")) return

  try {
    await publicationService.deleteWithCleanup(userStore.token!, pub)
    
    showToast('Publication supprimée', 'success')

    // Si c'est le post ouvert, on ferme la modale
    if (selectedPost.value && selectedPost.value.id === pub.id) {
      closePostModal()
    }

    // Retirer de la liste locale
    if (currentChannelData.value && currentChannelData.value.publications) {
      currentChannelData.value.publications = currentChannelData.value.publications.filter(p => p.id !== pub.id)
    }
  } catch (e: any) {
    console.error(e)
    showToast("Impossible de supprimer cette publication", 'error')
  }
}


// 4. PUBLICATION
async function publishPost() {
  if (!userStore.token) return
  
  if (!newPostTitle.value.trim()) {
    alert("Le titre est obligatoire.")
    return
  }

  publishing.value = true
  
  try {
    let channelIRI = currentChannelData.value?.['@id']
    if (!channelIRI) {
      channelIRI = `/api/${API_CONFIG.SLUG}/channels/${currentChannelId.value}`
    }

    // Créer la publication via le service
    const createdPost = await publicationService.create(userStore.token, {
      title: newPostTitle.value,
      body: newPostContent.value,
      channelIRI
    })
    
    console.log("Publication créée:", createdPost)

    // Envoi image si présente
    if (selectedFile.value) {
      try {
        await publicationService.uploadMedia(
          userStore.token, 
          selectedFile.value, 
          createdPost['@id']
        )
        console.log("Média uploadé avec succès")
      } catch (mediaErr) {
        console.error("Erreur média:", mediaErr)
        showToast("Publication créée mais erreur lors de l'upload de l'image.", 'error')
      }
    }

    closeModal()
    showToast('Publication créée avec succès 🎉', 'success')
    const currentObj = channelsList.value.find(c => c.id === currentChannelId.value)
    if (currentObj) await changeChannel(currentObj)

  } catch (e: any) {
    showToast("Erreur : " + e.message, 'error')
  } finally {
    publishing.value = false
  }
}

// 5. UTILITAIRES
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const validation = publicationService.validateFile(file)
    if (!validation.valid) {
      alert(validation.error)
      target.value = ''
      return
    }
    
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
    console.log("Fichier sélectionné:", file.name, file.type, file.size)
  }
}

function removeImage() {
  selectedFile.value = null
  previewImage.value = null
}

function hasImage(pub: Publication): boolean {
  return publicationService.hasImage(pub)
}

function getPostImageUrl(pub: Publication): string | undefined {
  return publicationService.getImageUrl(pub) ?? undefined
}

// --- MODAL DÉTAILS PUBLICATION ---

async function viewPost(pub: Publication) {
  if (!userStore.token) return
  // Garder la publication hydratée (avec medias) de la grille
  selectedPost.value = { ...pub }
  showPostModal.value = true
  
  loadingComments.value = true
  try {
    // Charger les détails pour comments et reactions
    const fullPub = await publicationService.getDetail(userStore.token, pub.id)
    // Conserver les medias hydratés de la grille (l'API retourne des IRIs bruts)
    selectedPost.value = {
      ...fullPub,
      medias: pub.medias && pub.medias.length > 0 ? pub.medias : fullPub.medias
    }
    selectedPostComments.value = fullPub.comments || []
    selectedPostReactions.value = fullPub.reactions || []
  } catch (e) {
    console.error("Erreur chargement détails", e)
    selectedPostComments.value = []
    selectedPostReactions.value = []
  } finally {
    loadingComments.value = false
  }
}

function closePostModal() {
  showPostModal.value = false
  selectedPost.value = null
  selectedPostComments.value = []
  selectedPostReactions.value = []
  newCommentText.value = ''
}

async function sendComment() {
  if (!userStore.token || !selectedPost.value || !newCommentText.value.trim()) return
  
  try {
    const pubIRI = selectedPost.value['@id'] || `/api/${API_CONFIG.SLUG}/publications/${selectedPost.value.id}`
    const newComm = await publicationService.addComment(userStore.token, pubIRI, newCommentText.value)
    
    // Ajouter à la liste
    selectedPostComments.value.push(newComm)
    newCommentText.value = ''
    showToast('Commentaire ajouté', 'success')
  } catch (e) {
    console.error(e)
    showToast("Impossible d'ajouter le commentaire", 'error')
  }
}

async function toggleLike(post: Publication) {
  if (!userStore.token) return
  
  try {
    const pubIRI = post['@id'] || `/api/${API_CONFIG.SLUG}/publications/${post.id}`
    
    await publicationService.addReaction(userStore.token, pubIRI, 'like')
    showToast('Vous avez aimé cette publication ❤️', 'success')
    
    // Rafraîchir les détails pour avoir le nouveau compteur
    if (showPostModal.value && selectedPost.value?.id === post.id) {
      const updated = await publicationService.getDetail(userStore.token, post.id)
      selectedPostReactions.value = updated.reactions || []
    }
  } catch (e: any) {
    if (e.message === 'ALREADY_LIKED') {
      showToast('Vous avez déjà aimé cette publication', 'info')
    } else {
      console.error(e)
      showToast("Erreur lors de l'ajout du like", 'error')
    }
  }
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

// Fermer le menu si on clique à l'extérieur
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.channel-menu')) {
    openMenuId.value = null
  }
}

onMounted(() => {
  if (!userStore.token) router.push('/auth/login')
  else {
    fetchChannelsList()
    startPolling()
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Scoped overrides if needed */

.channel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.channel-menu {
  position: relative;
}

.menu-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0a0a0;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}

.channel-item:hover .menu-btn {
  opacity: 1;
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 4px;
  min-width: 140px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.menu-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-option.delete {
  color: #ef4444;
}

.menu-option.delete:hover {
  background: rgba(239, 68, 68, 0.15);
}

.delete-post-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: white;
  opacity: 0.7;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-post-btn:hover {
  opacity: 1;
  color: #ef4444;
}

.delete-post-btn svg {
  stroke: currentColor;
}

/* ====================== */
/* MODAL DETAILS - LIGHT  */
/* ====================== */
.post-detail-overlay {
  display: flex !important;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
}

.post-detail-card {
  display: flex;
  background: #ffffff;
  width: 90vw;
  max-width: 1100px;
  height: 85vh;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}

.close-btn-float {
  position: absolute;
  top: -40px;
  right: 0px;
  background: none;
  color: white;
  border: none;
  font-size: 32px;
  cursor: pointer;
  z-index: 10;
  display: block;
  line-height: 1;
}

.close-btn-float:hover {
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .post-detail-card {
    flex-direction: column;
    height: 95vh;
    width: 95vw;
    overflow-y: auto;
    border-radius: 8px;
  }
  .post-media-section {
    max-height: 50vh;
  }
}

/* LEFT SECTION: MEDIA */
.post-media-section {
  flex: 1.4;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.post-media-section.no-media {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.detail-main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-placeholder {
  color: #a0a0a0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.no-image-placeholder p {
  font-size: 14px;
  font-weight: 500;
}

/* RIGHT SECTION: INFO */
.post-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-left: 1px solid #efefef;
  min-width: 340px;
  color: #262626;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #efefef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 13px;
  color: white;
}

.author-name {
  font-weight: 600;
  font-size: 14px;
  color: #262626;
}

.detail-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.detail-scrollable::-webkit-scrollbar {
  width: 4px;
}

.detail-scrollable::-webkit-scrollbar-thumb {
  background: #d4d4d4;
  border-radius: 4px;
}

.post-caption-box {
  margin-bottom: 16px;
}

.post-title-detail {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #262626;
}

.post-body-detail {
  font-size: 14px;
  color: #555;
  white-space: pre-wrap;
  line-height: 1.5;
}

.post-date {
  font-size: 11px;
  color: #8e8e8e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.separator {
  height: 1px;
  background: #efefef;
  margin: 16px 0;
}

.no-comments {
  color: #8e8e8e;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

/* COMMENTS */
.comment-item {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  align-items: flex-start;
}

.comment-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #efefef;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.comment-body {
  font-size: 14px;
  line-height: 1.4;
  color: #262626;
}

.comment-author {
  font-weight: 600;
  margin-right: 6px;
  color: #262626;
}

.comment-text {
  color: #333;
}

.comment-date {
  display: block;
  font-size: 11px;
  color: #8e8e8e;
  margin-top: 4px;
}

/* FOOTER */
.detail-footer {
  border-top: 1px solid #efefef;
  padding: 12px 16px;
  background: #ffffff;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.action-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #262626;
  transition: transform 0.15s;
}

.action-icon-btn:hover {
  transform: scale(1.15);
}

.action-icon-btn:active {
  transform: scale(0.9);
}

.likes-count {
  font-weight: 600;
  font-size: 14px;
  color: #262626;
}

.add-comment-box {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
  padding: 16px;
  background: #f9fafb;
}

.add-comment-box input {
  flex: 1;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  padding: 10px 16px;
  color: #111827;
  font-family: 'Afacad', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.add-comment-box input:focus {
  border-color: #111827;
  box-shadow: 0 0 0 1px #111827;
}

.add-comment-box input::placeholder {
  color: #9ca3af;
}

.post-btn {
  background-color: #111827;
  color: #ffffff;
  border: none;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post-btn:hover {
  background-color: #1f2937;
  transform: translateY(-1px);
}

.post-btn:active {
  transform: translateY(0);
}

.post-btn:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  margin: 20px auto;
}

/* ====================== */
/* TOAST NOTIFICATIONS    */
/* ====================== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast-item {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  pointer-events: auto;
  max-width: 360px;
  backdrop-filter: blur(12px);
}

.toast-item.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.toast-item.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.toast-item.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

/* Toast transitions */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

</style>
