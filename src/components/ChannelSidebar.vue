<template>
  <aside class="sidebar">
    <h2>Salons</h2>
    <ul>
      <li v-for="c in channels" :key="c.id">
        <router-link :to="`/channels/${c.id}`">{{ c.name }}</router-link>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const slug = 'ws-n'
const token = localStorage.getItem('token') || ''
const channels = ref<any[]>([])

async function fetchChannels() {
  try {
    const res = await fetch(`https://wra506d.davidannebicque.ovh/api/${slug}/channels`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    channels.value = data['hydra:member'] || []
  } catch (err) {
    console.error(err)
  }
}

onMounted(fetchChannels)
</script>

<style scoped>
.sidebar { width:250px;padding:1rem;background:#262626;color:white; }
.sidebar a { color:white;text-decoration:none; }
.sidebar a.router-link-active { font-weight:bold; }
</style>
