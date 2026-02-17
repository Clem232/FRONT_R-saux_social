<template>
  <!-- C’est le conteneur du routeur -->
  <router-view />
</template>

<script setup lang="ts">
// Rien à importer ici
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: Arial, sans-serif;
  background-color: #fafafa;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: #262626 ;
  color : white ;
  padding: 1.5rem;
  border-right: 1px solid #dbdbdb;
}

.sidebar h2 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin: 0.75rem 0;
}

.sidebar a {
  color: #fff;
  text-decoration: none;
}

.sidebar a.router-link-active {
  font-weight: bold;
}

/* Main */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color:  #262626;
  color: #ffffff;
}

.channel-header {
  padding: 1rem;
  border-bottom: 1px solid #dbdbdb;
  background-color: #262626;
}

.messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.message {
  margin-bottom: 0.75rem;
  background: white;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.author {
  font-weight: 600;
  color: #0095f6;
}

.message-input {
  display: flex;
  padding: 0.75rem;
  border-top: 1px solid #dbdbdb;
  background-color:  #262626;
}

.message-input input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #dbdbdb;
  border-radius: 20px;
  margin-right: 0.5rem;
  background-color: #fafafa;
}

.message-input input:focus {
  outline: none;
  background-color: white;
}

.message-input button {
  padding: 0.5rem 1.2rem;
  border: none;
  background-color: #0095f6;
  color: white;
  border-radius: 20px;
  cursor: pointer;
}

.message-input button:hover {
  background-color: #007acc;
}
</style>

<!-- 🌍 Ajout global pour supprimer les marges par défaut -->
<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #fafafa;
}

#app {
  height: 100%;
}
</style>
