import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'  // store pour le token

const routes = [
  // Redirection par défaut vers login
  { path: '/', redirect: '/auth/login' },

  // Page de connexion / inscription — chargée de façon différée
  {
    path: '/auth/login',
    component: () => import('../pages/AuthView.vue')
  },

  // Page channels unique, protégée par authentification — chargée de façon différée
  {
    path: '/channels',
    component: () => import('../pages/channels.vue'),
    meta: { requiresAuth: true }
  },

  // Page profil
  {
    path: '/profile',
    component: () => import('../pages/ProfileView.vue'),
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
