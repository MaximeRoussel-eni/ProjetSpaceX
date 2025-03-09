<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Titre centré -->
    <h1 class="text-5xl font-bold text-center mb-8 text-gray-800">PROCHAIN LANCEMENT</h1>

    <!-- Section du prochain lancement -->
    <div v-if="isLoading" class="text-center">Chargement en cours...</div>
    <div v-else class="bg-white p-6 rounded-lg shadow-md text-center mb-8">
      <!-- Nom de la fusée centré -->
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">{{ nextLaunch?.name || 'Aucun lancement futur trouvé.' }}</h2>
      <Countdown v-if="nextLaunch" :launchDate="nextLaunch.net" />
    </div>

    <!-- Boutons de filtrage centrés -->
    <div class="flex justify-center mb-6">
      <button
          class="filter-button"
          :class="{ active: filter === 'all' }"
          @click="filter = 'all'"
      >
        Tous
      </button>
      <button
          class="filter-button"
          :class="{ active: filter === 'success' }"
          @click="filter = 'success'"
      >
        Réussis
      </button>
      <button
          class="filter-button"
          :class="{ active: filter === 'failed' }"
          @click="filter = 'failed'"
      >
        Échoués
      </button>
    </div>

    <!-- Section des lancements passés -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">Lancements passés</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LaunchCard v-for="launch in filteredLaunches" :key="launch.id" :launch="launch" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getNextLaunch, getPastLaunches } from '../services/spacexService';
import LaunchCard from '../components/LaunchCard.vue';
import Countdown from '../components/Countdown.vue';
import type {Launch} from "../types/launch.ts";

const nextLaunch = ref<Launch | null>(null);
const pastLaunches = ref<Launch[]>([]);
const filter = ref<'all' | 'success' | 'failed'>('all');
const error = ref<string | null>(null);
const isLoading = ref<boolean>(false);

const fetchNextLaunch = async () => {
  isLoading.value = true;
  try {
    const launch = await getNextLaunch();
    if (!launch || !launch.net) {
      error.value = 'Aucun lancement futur trouvé ou date de lancement invalide.';
      return;
    }
    nextLaunch.value = launch;
  } catch (err) {
    error.value = 'Erreur lors de la récupération du prochain lancement.';
    console.error('Erreur :', err);
  } finally {
    isLoading.value = false;
  }
};

const fetchPastLaunches = async () => {
  try {
    const launches = await getPastLaunches();
    pastLaunches.value = launches;
  } catch (err) {
    error.value = 'Erreur lors de la récupération des lancements passés.';
    console.error('Erreur :', err);
  }
};

const filteredLaunches = computed(() => {
  switch (filter.value) {
    case 'success':
      return pastLaunches.value.filter((launch) =>
          launch.status?.name === 'Launch Successful'
      );
    case 'failed':
      return pastLaunches.value.filter((launch) =>
          launch.status?.name === 'Launch Failure'
      );
    default:
      return pastLaunches.value;
  }
});

onMounted(async () => {
  await Promise.all([fetchNextLaunch(), fetchPastLaunches()]);
});
</script>

<style scoped>
/* Styles pour les boutons de filtrage */
.filter-button {
  background-color: #f3f4f6;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.filter-button.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.filter-button:hover {
  background-color: #e2e8f0;
}

/* Centrer les éléments */
.text-center {
  text-align: center;
}
</style>
