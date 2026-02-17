import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../pages/AuthView.vue'
import ChannelView from '../pages/channels.vue'
import { useUserStore } from '@/stores/user'  // store pour le token

const routes = [
  // Redirection par défaut vers login
  { path: '/', redirect: '/auth/login' },

  // Page de connexion / inscription
  { path: '/auth/login', component: AuthView },

  // Page channels unique, protégée par authentification
  {
    path: '/channels',
    component: ChannelView,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Middleware global pour protéger les routes nécessitant un token
router.beforeEach((to, from, next) => {
  const store = useUserStore()

  if (to.meta.requiresAuth && !store.token) {
    // Redirection vers login si non connecté
    next('/auth/login')
  } else {
    next()
  }
})

export default router
