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
    
    <!-- NAV -->
    <nav class="lumine-nav">
      <div class="nav-content">
        <h1 class="lumine-logo">Lumi.</h1>
        <div class="nav-icons">
          <button @click="themeStore.toggleTheme()" class="theme-toggle-btn" title="Basculer le thème">
            {{ themeStore.isDark ? 'Light mode' : 'Dark mode' }}
          </button>
          <button @click="openModal" class="btn-primary">+ Créer</button>
          
          <!-- PROFIL DROPDOWN -->
          <div class="nav-profile" @click.stop>
            <button class="nav-profile-btn" @click="showProfileMenu = !showProfileMenu" :aria-label="showProfileMenu ? 'Fermer le menu profil' : 'Ouvrir le menu profil'" :aria-expanded="showProfileMenu">
              <div class="nav-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <svg class="chevron-icon" :class="{ open: showProfileMenu }" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div v-if="showProfileMenu" class="profile-dropdown">
              <div class="profile-dropdown-header">
                <div class="profile-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="profile-details">
                  <span class="profile-name">{{ userStore.user?.email || 'Utilisateur' }}</span>
                  <span class="profile-role">Membre</span>
                </div>
              </div>
              <div class="profile-dropdown-divider"></div>
              <button @click="logout" class="profile-dropdown-item danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="main-layout">
      
      <!-- FEED SECTION -->
      <main class="feed-content">
        
        <div v-if="loadingFeed" class="loading-spinner"></div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        
        <div v-if="currentChannelData && !loadingFeed">
          
          <div class="feed-header-info">
             <div class="channel-title-row">
               <div class="channel-title-wrapper">
                 <h2 class="current-channel-title">#{{ currentChannelData.name }}</h2>
                 <span class="pub-count-badge">{{ currentChannelData.publications?.length || 0 }}</span>
                 <div class="info-tooltip-container">
                   <svg class="info-icon" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="currentColor" fill-rule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm10.01 4a1 1 0 01-1 1H10a1 1 0 110-2h.01a1 1 0 011 1zM11 6a1 1 0 10-2 0v5a1 1 0 102 0V6z"></path> </g></svg>
                   <div class="tooltip-text">Partagez ici vos idées de mode à petit budget et vos créations DIY !</div>
                 </div>
               </div>
               <div class="view-toggle">
                 <button class="view-toggle-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="Vue grille compacte" aria-label="Vue grille compacte">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect></svg>
                 </button>
                 <button class="view-toggle-btn" :class="{ active: viewMode === 'normal' }" @click="viewMode = 'normal'" title="Vue normale" aria-label="Vue normale">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="7" rx="1"></rect><rect x="3" y="14" width="18" height="7" rx="1"></rect></svg>
                 </button>
               </div>
             </div>
             <p class="channel-description">Découvrez les dernières tendances, astuces créatives et bons plans de la communauté.</p>
             
             <!-- Filtres -->
             <div class="feed-filters">
               <button 
                 class="filter-btn" 
                 :class="{ active: sortMode === 'recent' }" 
                 @click="sortMode = 'recent'"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                 Récent
               </button>
               <button 
                 class="filter-btn" 
                 :class="{ active: sortMode === 'oldest' }" 
                 @click="sortMode = 'oldest'"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                 Plus ancien
               </button>
               <button 
                 class="filter-btn" 
                 :class="{ active: sortMode === 'trending' }" 
                 @click="sortMode = 'trending'"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                 Tendances
               </button>
             </div>
          </div>

          <div v-if="sortedPublications.length > 0" class="feed-grid" :class="{ 'compact-grid': viewMode === 'grid' }">
            
            <article 
              v-for="pub in sortedPublications" 
              :key="pub['@id']" 
              class="lumine-post"
              :class="{ 'compact-post': viewMode === 'grid' }"
              @click="viewPost(pub)"
            >
              <!-- IMAGE -->
              <div v-if="hasImage(pub)" class="post-image-container">
                 <img 
                   :src="getPostImageUrl(pub)" 
                   class="post-image" 
                   alt="Post content"
                   loading="lazy"
                 />
                 <!-- COLOR PALETTE (inside image) -->
                 <div class="post-palette">
                   <span 
                     v-for="(color, i) in getPostPalette(pub.id)" 
                     :key="i" 
                     class="palette-dot" 
                     :style="{ backgroundColor: color }"
                     :title="color"
                   ></span>
                 </div>
                 <!-- TEXT overlaid on image (normal view only) -->
                 <div v-if="viewMode === 'normal'" class="post-content-overlay">
                   <h3 class="post-mini-title">{{ pub.title }}</h3>
                   <p class="post-mini-body">{{ pub.body }}</p>
                 </div>
              </div>

              <!-- TEXT CONTENT fallback when no image (normal view only) -->
              <div v-if="viewMode === 'normal' && !hasImage(pub)" class="post-content">
                 <h3 class="post-mini-title">{{ pub.title }}</h3>
                 <p class="post-mini-body">{{ pub.body }}</p>
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
                 
                 <button class="delete-post-btn" @click.stop="confirmDeletePost(pub)" aria-label="Supprimer cette publication">
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

      <!-- SIDEBAR CHAÎNES (RIGHT) -->
      <aside class="lumine-sidebar">
        <div class="sidebar-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
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
               <span class="channel-hash">#</span>
               <span class="channel-name">{{ channel.name }}</span>
             </div>
             <div class="channel-menu" @click.stop>
               <button class="menu-btn" @click="toggleMenu(channel.id)" :aria-label="`Options du salon ${channel.name}`" :aria-expanded="openMenuId === channel.id">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
               </button>
               <div v-if="openMenuId === channel.id" class="menu-dropdown">
                 <button class="menu-option" @click="openEditChannelModal(channel)">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                   Modifier
                 </button>
                 <button class="menu-option delete" @click="deleteChannel(channel)">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                   Supprimer
                 </button>
               </div>
             </div>
          </div>
        </div>

        <button class="create-channel-btn" @click="openChannelModal">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           Nouveau salon
        </button>
      </aside>

    </div>

    <!-- FLOATING ACTION BUTTON -->
    <button class="fab-create" @click="openModal" title="Nouvelle publication" aria-label="Nouvelle publication">
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
             <img :src="previewImage" class="preview-img" alt="Aperçu de l'image sélectionnée" />
             <button @click="removeImage" class="btn-text danger remove-img-btn">Supprimer l'image</button>
          </div>

        </div>
      </div>
    </div>

    <!-- MODAL CHANNEL -->
    <div v-if="showChannelModal" class="modal-overlay" @click.self="showChannelModal = false">
      <div class="modal-card" style="max-width: 400px; height: auto;">
        
        <div class="modal-header">
          <button @click="showChannelModal = false" class="btn-text cancel-btn">Annuler</button>
          <span class="modal-title">Nouveau salon</span>
          <button @click="confirmCreateChannel" class="btn-text publish-btn" :disabled="creatingChannel || !newChannelName.trim()">
            {{ creatingChannel ? '...' : 'Créer' }}
          </button>
        </div>

        <div class="modal-body">
          <p style="margin-bottom: 12px; font-size: 14px; color: var(--text-muted);">
             Donnez un nom à votre nouveau salon de discussion.
          </p>
          <input 
            v-model="newChannelName" 
            type="text" 
            class="modal-input" 
            placeholder="Nom du salon (ex: #mode)" 
            @keyup.enter="confirmCreateChannel"
            autoFocus
          />
        </div>
      </div>
    </div>

    <!-- MODAL DELETE CONFIRMATION -->
    <div v-if="showDeletePostModal" class="modal-overlay" @click.self="cancelDeletePost">
      <div class="modal-card" style="max-width: 400px; height: auto;">
        <div class="modal-header">
          <span class="modal-title" style="margin: 0 auto; color: #ef4444;">Supprimer ?</span>
        </div>
        <div class="modal-body" style="text-align: center;">
          <p style="color: var(--text-secondary); font-size: 15px;">
            Voulez-vous vraiment supprimer cette publication ?
            <br><span style="font-size: 13px; color: var(--text-subtle);">Cette action est irréversible.</span>
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; margin-top: 10px;">
             <button @click="cancelDeletePost" class="btn-text" style="background: var(--bg-hover); padding: 10px 20px; border-radius: 3px;">Annuler</button>
             <button @click="executeDeletePost" class="btn-text danger" style="background: var(--bg-hover); padding: 10px 20px; border-radius: 3px;">Supprimer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DETAILS PUBLICATION (POPUP) -->
    <div v-if="showPostModal && selectedPost" class="modal-overlay post-detail-overlay" @click.self="closePostModal">
      <div class="post-detail-card">
        
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
             <!-- 3 points : modifier / supprimer / fermer -->
             <div class="post-detail-menu" @click.stop>
               <button class="menu-btn post-detail-menu-btn" @click="showPostDetailMenu = !showPostDetailMenu" aria-label="Options de la publication" :aria-expanded="showPostDetailMenu">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
               </button>
               <div v-if="showPostDetailMenu" class="menu-dropdown post-detail-dropdown">
                 <button class="menu-option" @click="openEditPostModal(selectedPost!)">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                   Modifier
                 </button>
                 <button class="menu-option delete" @click="confirmDeletePost(selectedPost!); closePostModal()">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                   Supprimer
                 </button>
                 <div class="menu-dropdown-divider"></div>
                 <button class="menu-option" @click="closePostModal()">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                   Fermer
                 </button>
               </div>
             </div>
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
                    <!-- Mode édition inline -->
                    <template v-if="editingCommentId === comment.id">
                      <input
                        v-model="editCommentText"
                        class="comment-edit-input"
                        @keyup.enter="saveEditComment(comment)"
                        @keyup.escape="cancelEditComment"
                        autofocus
                      />
                      <div class="comment-edit-actions">
                        <button class="comment-save-btn" @click="saveEditComment(comment)" :disabled="savingComment || !editCommentText.trim()">
                          {{ savingComment ? '...' : 'Sauvegarder' }}
                        </button>
                        <button class="comment-cancel-btn" @click="cancelEditComment">Annuler</button>
                      </div>
                    </template>
                    <!-- Mode lecture -->
                    <template v-else>
                      <span class="comment-text">{{ comment.body }}</span>
                      <span class="comment-date">{{ comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '' }}</span>
                    </template>
                  </div>
                  <!-- Actions edit/delete (visibles au hover, cachées en mode édition) -->
                  <div v-if="editingCommentId !== comment.id" class="comment-actions">
                    <button class="comment-action-btn" @click="openEditComment(comment)" title="Modifier" aria-label="Modifier le commentaire">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="comment-action-btn danger" @click="deleteCommentFromPost(comment)" title="Supprimer" aria-label="Supprimer le commentaire">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
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

    <!-- MODAL EDIT PUBLICATION -->
    <div v-if="showEditPostModal" class="modal-overlay" @click.self="showEditPostModal = false">
      <div class="modal-card" style="max-width: 550px; height: auto;">
        <div class="modal-header">
          <button @click="showEditPostModal = false" class="btn-text cancel-btn">Annuler</button>
          <span class="modal-title">Modifier la publication</span>
          <button @click="saveEditPost" class="btn-text publish-btn" :disabled="savingPost || !editPostTitle.trim()">
            {{ savingPost ? '...' : 'Enregistrer' }}
          </button>
        </div>
        <div class="modal-body">
          <input
            v-model="editPostTitle"
            type="text"
            class="modal-input title-input"
            placeholder="Titre"
          />
          <textarea
            v-model="editPostBody"
            class="modal-input content-input"
            placeholder="Contenu..."
            rows="6"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- MODAL EDIT CHANNEL -->
    <div v-if="showEditChannelModal" class="modal-overlay" @click.self="showEditChannelModal = false">
      <div class="modal-card" style="max-width: 400px; height: auto;">
        <div class="modal-header">
          <button @click="showEditChannelModal = false" class="btn-text cancel-btn">Annuler</button>
          <span class="modal-title">Renommer le salon</span>
          <button @click="saveEditChannel" class="btn-text publish-btn" :disabled="savingChannel || !editChannelName.trim()">
            {{ savingChannel ? '...' : 'Enregistrer' }}
          </button>
        </div>
        <div class="modal-body">
          <input
            v-model="editChannelName"
            type="text"
            class="modal-input"
            placeholder="Nom du salon"
            @keyup.enter="saveEditChannel"
          />
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

    <!-- FOOTER -->
    <footer class="lumine-footer">
      <div class="footer-content">
        <p>&copy; 2026 Lumi. - Partagez vos idées mode à petit budget.</p>
        <div class="footer-links">
          <a href="#">À propos</a>
          <a href="#">Conditions d'utilisation</a>
          <a href="#">Confidentialité</a>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { channelService, publicationService, API_CONFIG } from '@/services'
import type { Channel, Publication } from '@/types'
import '@/assets/instagram.css'
import '@/assets/instagram-bg.css'

const userStore = useUserStore()
const themeStore = useThemeStore()
const router = useRouter()

// Données
const channelsList = ref<Channel[]>([])
const currentChannelData = ref<Channel | null>(null)
const currentChannelId = ref<number | null>(null)
const sortMode = ref<'recent' | 'oldest' | 'trending'>('recent')
const viewMode = ref<'grid' | 'normal'>('grid')
// Palette de couleurs prédéfinies pour les posts (simulées)
const colorPalettes = [
  ['#8B4513', '#D2691E', '#F5DEB3', '#FAEBD7', '#2F4F4F'],
  ['#800020', '#C41E3A', '#E8CCD7', '#F5F5DC', '#36454F'],
  ['#556B2F', '#8FBC8F', '#F0E68C', '#FAF0E6', '#483C32'],
  ['#191970', '#4169E1', '#B0C4DE', '#F0F8FF', '#2C3E50'],
  ['#8B008B', '#DA70D6', '#E6E6FA', '#FFF0F5', '#4A4A4A'],
  ['#B8860B', '#DAA520', '#FFFACD', '#FFFFF0', '#696969'],
  ['#CD5C5C', '#F08080', '#FFE4E1', '#FFF5EE', '#3C1414'],
  ['#008080', '#20B2AA', '#E0FFFF', '#F0FFFF', '#2F4F4F'],
]

function getPostPalette(postId: number): string[] {
  return colorPalettes[postId % colorPalettes.length] ?? []
}

// Publications triées selon le filtre actif
const sortedPublications = computed(() => {
  const pubs = currentChannelData.value?.publications
  if (!pubs || pubs.length === 0) return []
  const copy = [...pubs]
  switch (sortMode.value) {
    case 'recent':
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'trending':
      return copy.sort((a, b) => {
        const scoreA = (a.reactions?.length || 0) + (a.comments?.length || 0)
        const scoreB = (b.reactions?.length || 0) + (b.comments?.length || 0)
        return scoreB - scoreA
      })
    default:
      return copy
  }
})

// Formulaire
const showModal = ref(false)
const showChannelModal = ref(false) // New modal state
const showDeletePostModal = ref(false) // Delete confirm modal
const postToDelete = ref<Publication | null>(null) // Post to delete
const newChannelName = ref('')      // New channel name state
const creatingChannel = ref(false)  // New loading state
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
const showProfileMenu = ref(false)

// Modal détails publication
const showPostModal = ref(false)
const selectedPost = ref<Publication | null>(null)
const selectedPostComments = ref<any[]>([])
const selectedPostReactions = ref<any[]>([])
const newCommentText = ref('')
const loadingComments = ref(false)
const showPostDetailMenu = ref(false)

// Edition publication
const showEditPostModal = ref(false)
const editPostTitle = ref('')
const editPostBody = ref('')
const savingPost = ref(false)

// Edition channel
const showEditChannelModal = ref(false)
const editChannelName = ref('')
const editingChannel = ref<Channel | null>(null)
const savingChannel = ref(false)

// Edition commentaire
const editingCommentId = ref<number | null>(null)
const editCommentText = ref('')
const savingComment = ref(false)

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

// 3. CRÉATION SALON (Ouvrir modale)
function openChannelModal() {
  showChannelModal.value = true
  newChannelName.value = ''
}

// 3B. CONFIRMER CRÉATION SALON
async function confirmCreateChannel() {
  if (!userStore.token || !newChannelName.value.trim()) return

  creatingChannel.value = true
  try {
    await channelService.create(userStore.token, newChannelName.value)
    
    // Recharger
    showChannelModal.value = false
    await fetchChannelsList()
    showToast(`Salon "${newChannelName.value}" créé`, 'success')
    
  } catch (e: any) { 
    showToast(e.message, 'error') 
  } finally {
    creatingChannel.value = false
  }
}

// 3C. MENU & SUPPRESSION SALON
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

// Ouvre la modale de confirmation
function confirmDeletePost(pub: Publication) {
  postToDelete.value = pub
  showDeletePostModal.value = true
}

// Effectue la suppression réelle
async function executeDeletePost() {
  if (!userStore.token || !postToDelete.value) return

  const pub = postToDelete.value
  
  try {
    await publicationService.deleteWithCleanup(userStore.token, pub)
    
    showToast('Publication supprimée', 'success')

    // Si c'est le post ouvert, on ferme la modale détails
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
  } finally {
    showDeletePostModal.value = false
    postToDelete.value = null
  }
}

// Annule la suppression
function cancelDeletePost() {
  showDeletePostModal.value = false
  postToDelete.value = null
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
  showPostDetailMenu.value = false
}

function openEditPostModal(pub: Publication) {
  editPostTitle.value = pub.title
  editPostBody.value = pub.body
  showPostDetailMenu.value = false
  showEditPostModal.value = true
}

async function saveEditPost() {
  if (!userStore.token || !selectedPost.value) return
  savingPost.value = true
  try {
    const updated = await publicationService.update(userStore.token, selectedPost.value.id, {
      title: editPostTitle.value,
      body: editPostBody.value
    })
    // Mettre à jour en local
    selectedPost.value = { ...selectedPost.value, title: updated.title, body: updated.body }
    if (currentChannelData.value?.publications) {
      currentChannelData.value.publications = currentChannelData.value.publications.map(p =>
        p.id === updated.id ? { ...p, title: updated.title, body: updated.body } : p
      )
    }
    showEditPostModal.value = false
    showToast('Publication modifiée', 'success')
  } catch (e: any) {
    showToast('Erreur : ' + e.message, 'error')
  } finally {
    savingPost.value = false
  }
}

function openEditChannelModal(channel: Channel) {
  editingChannel.value = channel
  editChannelName.value = channel.name
  openMenuId.value = null
  showEditChannelModal.value = true
}

async function saveEditChannel() {
  if (!userStore.token || !editingChannel.value) return
  savingChannel.value = true
  try {
    const updated = await channelService.update(userStore.token, editingChannel.value.id, editChannelName.value)
    // Mettre à jour localement
    channelsList.value = channelsList.value.map(c =>
      c.id === updated.id ? { ...c, name: updated.name } : c
    )
    if (currentChannelData.value?.id === updated.id) {
      currentChannelData.value = { ...currentChannelData.value, name: updated.name }
    }
    showEditChannelModal.value = false
    showToast(`Salon renommé en "${updated.name}"`, 'success')
  } catch (e: any) {
    showToast('Erreur : ' + e.message, 'error')
  } finally {
    savingChannel.value = false
  }
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

function openEditComment(comment: any) {
  editingCommentId.value = comment.id
  editCommentText.value = comment.body
}

function cancelEditComment() {
  editingCommentId.value = null
  editCommentText.value = ''
}

async function saveEditComment(comment: any) {
  if (!userStore.token || !editCommentText.value.trim()) return
  savingComment.value = true
  try {
    const updated = await publicationService.updateComment(userStore.token, comment.id, editCommentText.value)
    selectedPostComments.value = selectedPostComments.value.map(c =>
      c.id === comment.id ? { ...c, body: updated.body } : c
    )
    editingCommentId.value = null
    editCommentText.value = ''
  } catch (e: any) {
    showToast('Erreur : ' + e.message, 'error')
  } finally {
    savingComment.value = false
  }
}

async function deleteCommentFromPost(comment: any) {
  if (!userStore.token) return
  try {
    await publicationService.deleteComment(userStore.token, comment.id)
    selectedPostComments.value = selectedPostComments.value.filter(c => c.id !== comment.id)
    showToast('Commentaire supprimé', 'success')
  } catch (e: any) {
    showToast('Erreur : ' + e.message, 'error')
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
  if (!target.closest('.nav-profile')) {
    showProfileMenu.value = false
  }
  if (!target.closest('.post-detail-menu')) {
    showPostDetailMenu.value = false
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
/* ====================== */
/* MENU 3 POINTS POST     */
/* ====================== */
.post-detail-menu {
  position: relative;
}

.post-detail-menu-btn {
  opacity: 1 !important; /* override .menu-btn { opacity: 0 } from instagram.css */
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;
}

.post-detail-menu-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.post-detail-dropdown {
  right: 0;
  left: auto;
  top: calc(100% + 4px);
}

.menu-dropdown-divider {
  height: 1px;
  background: var(--border-light);
  margin: 4px 0;
}

/* ====================== */
/* COMMENT ACTIONS        */
/* ====================== */
.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  position: relative;
}

.comment-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  margin-top: 2px;
}

.comment-item:hover .comment-actions {
  opacity: 1;
}

.comment-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-subtle);
  padding: 3px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;
}

.comment-action-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.comment-action-btn.danger:hover {
  color: #ef4444;
}

.comment-edit-input {
  width: 100%;
  background: var(--bg-input, var(--bg-hover));
  border: 1px solid var(--border-main);
  border-radius: 4px;
  padding: 4px 8px;
  color: var(--text-primary);
  font-size: 13px;
  margin-top: 2px;
  outline: none;
}

.comment-edit-input:focus {
  border-color: var(--accent, #e91e8c);
}

.comment-edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.comment-save-btn {
  font-size: 12px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent, #e91e8c);
  padding: 0;
}

.comment-save-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.comment-cancel-btn {
  font-size: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
}

/* ====================== */

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
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-subtle);
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}

.channel-item:hover .menu-btn {
  opacity: 1;
}

.menu-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border-main);
  border-radius: 3px;
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
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.2s;
}

.menu-option:hover {
  background: var(--bg-hover);
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
  padding: 40px 20px;
}

.post-detail-card {
  display: flex;
  background: var(--bg-card);
  width: 90vw;
  max-width: 1100px;
  max-height: 80vh;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 25px 60px rgba(0,0,0,0.3);
}

.close-btn-float {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  font-size: 24px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.2s;
}

.close-btn-float:hover {
  background: rgba(0, 0, 0, 0.6);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .post-detail-card {
    flex-direction: column;
    max-height: 90vh;
    width: 95vw;
    overflow-y: auto;
    border-radius: 3px;
  }
  .post-media-section {
    max-height: 50vh;
  }
}

/* LEFT SECTION: MEDIA */
.post-media-section {
  flex: 1.4;
  background: var(--bg-input-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.post-media-section.no-media {
  background: linear-gradient(135deg, var(--bg-input-alt) 0%, var(--bg-hover) 100%);
}

.detail-main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image-placeholder {
  color: var(--text-subtle);
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
  background: var(--bg-card);
  border-left: 1px solid var(--border-light);
  min-width: 340px;
  color: var(--text-primary);
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
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
  color: var(--text-primary);
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
  background: var(--border-main);
  border-radius: 20px;
}

.post-caption-box {
  margin-bottom: 16px;
}

.post-title-detail {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.post-body-detail {
  font-size: 14px;
  color: var(--text-muted);
  white-space: pre-wrap;
  line-height: 1.5;
}

.post-date {
  font-size: 11px;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.separator {
  height: 1px;
  background: var(--border-light);
  margin: 16px 0;
}

.no-comments {
  color: var(--text-subtle);
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
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.comment-body {
  font-size: 14px;
  line-height: 1.4;
  color: var(--text-primary);
}

.comment-author {
  font-weight: 600;
  margin-right: 6px;
  color: var(--text-primary);
}

.comment-text {
  color: var(--text-secondary);
}

.comment-date {
  display: block;
  font-size: 11px;
  color: var(--text-subtle);
  margin-top: 4px;
}

/* FOOTER */
.detail-footer {
  border-top: 1px solid var(--border-light);
  padding: 12px 16px;
  background: var(--bg-card);
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
  color: var(--text-primary);
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
  color: var(--text-primary);
}

.add-comment-box {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid var(--border-light);
  padding: 16px;
  background: var(--bg-input-alt);
}

.add-comment-box input {
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 3px;
  padding: 10px 16px;
  color: var(--text-primary);
  font-family: 'Afacad', sans-serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.add-comment-box input:focus {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 1px var(--text-primary);
}

.add-comment-box input::placeholder {
  color: var(--text-subtle);
}

.post-btn {
  background-color: #414141;
  color: #ffffff;
  border: none;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.post-btn:hover {
  background-color: #555555;
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
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff; /* White text */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  max-width: 360px;
  background-color: #555555; /* Dark gray background */
  border: 1px solid #666666; /* Subtle border */
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast-item.success {
  border-left: 4px solid #10b981; /* Green accent */
}

.toast-item.error {
  border-left: 4px solid #ef4444; /* Red accent */
}

.toast-item.info {
  border-left: 4px solid #3b82f6; /* Blue accent */
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

/* ====================== */
/* THEME TOGGLE BUTTON    */
/* ====================== */
.theme-toggle-btn {
  background: none;
  border: 1px solid var(--border-input);
  border-radius: 3px;
  padding: 6px 14px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
}

.theme-toggle-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--text-primary);
  color: var(--text-primary);
}

</style>
