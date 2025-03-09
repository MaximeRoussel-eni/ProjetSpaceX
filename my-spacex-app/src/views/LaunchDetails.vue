<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-5xl font-bold text-center mb-8 text-gray-800">Détails du Lancement</h1>

    <div v-if="isLoading" class="text-center">Chargement en cours...</div>
    <div v-else class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">{{ launch?.name }}</h2>
      <img :src="launch?.image" alt="Rocket Image" class="w-full h-64 object-cover rounded mb-4">
      <p class="text-gray-600">Date de lancement: {{ new Date(launch?.net).toLocaleDateString() }}</p>
      <p class="text-gray-600">Statut: {{ launch?.status?.name }}</p>
      <!-- Ajoutez d'autres détails ici -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getPastLaunches } from '../services/spacexService.ts';
import type {Launch} from "../types/launch.ts";

const route = useRoute();
const launch = ref<Launch | null>(null);
const isLoading = ref<boolean>(false);

const fetchLaunchDetails = async () => {
  isLoading.value = true;
  try {
    const launches = await getPastLaunches();
    launch.value = launches.find(l => l.id === route.params.id) || null;
  } catch (err) {
    console.error('Erreur lors de la récupération des détails du lancement :', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchLaunchDetails();
});
</script>
