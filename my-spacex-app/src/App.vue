<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style>
/* Ajoutez des styles globaux ici */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f7fafc;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
