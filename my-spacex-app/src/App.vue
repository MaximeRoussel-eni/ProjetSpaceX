<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { getNextLaunch, getPastLaunches } from './services/spacexService';

// Interfaces pour le typage
interface Launch {
  id: string;
  name: string;
  net: string;
  status?: {
    name: string;
  };
}

// Données réactives
const nextLaunch = ref<Launch | null>(null);
const pastLaunches = ref<Launch[]>([]);
const filter = ref<'all' | 'success' | 'failed'>('all');
const error = ref<string | null>(null);
const days = ref<number>(0);
const hours = ref<number>(0);
const minutes = ref<number>(0);
const seconds = ref<number>(0);
const isLoading = ref<boolean>(false); // Indicateur de chargement

// Variable pour stocker l'intervalle du décompte
let interval: number | null = null;

// Récupérer le prochain lancement
const fetchNextLaunch = async () => {
  isLoading.value = true; // Activer le chargement
  try {
    const launch = await getNextLaunch();
    if (!launch || !launch.net) {
      error.value = 'Aucun lancement futur trouvé ou date de lancement invalide.';
      return;
    }
    nextLaunch.value = launch;
    console.log('Prochain lancement :', launch); // Debug
    console.log('Date du lancement :', new Date(launch.net)); // Debug
    startCountdown();
  } catch (err) {
    error.value = 'Erreur lors de la récupération du prochain lancement.';
    console.error('Erreur :', err);
  } finally {
    isLoading.value = false; // Désactiver le chargement
  }
};

// Récupérer les lancements passés
const fetchPastLaunches = async () => {
  try {
    const launches = await getPastLaunches();
    pastLaunches.value = launches;
    console.log('Lancements passés :', launches); // Debug
    console.log('Statuts des lancements :', launches.map(launch => launch.status?.name)); // Debug
  } catch (err) {
    error.value = 'Erreur lors de la récupération des lancements passés.';
    console.error('Erreur :', err);
  }
};

// Démarrer le décompte
const startCountdown = () => {
  if (!nextLaunch.value || !nextLaunch.value.net) {
    console.error('Aucun prochain lancement trouvé ou date invalide.');
    return;
  }

  // Parse la date du lancement en tenant compte du fuseau horaire
  const launchDate = new Date(nextLaunch.value.net).getTime();
  if (isNaN(launchDate)) {
    console.error('Date du lancement invalide.');
    return;
  }

  console.log('Date du lancement (timestamp) :', launchDate); // Debug
  console.log('Date actuelle (timestamp) :', Date.now()); // Debug

  const updateCountdown = () => {
    const now = Date.now(); // Heure actuelle en millisecondes
    const timeLeft = launchDate - now;

    console.log('Temps restant (ms) :', timeLeft); // Debug

    if (timeLeft > 0) {
      days.value = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      hours.value = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes.value = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      seconds.value = Math.floor((timeLeft % (1000 * 60)) / 1000);
    } else {
      days.value = 0;
      hours.value = 0;
      minutes.value = 0;
      seconds.value = 0;
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }
  };

  // Nettoyer l'intervalle précédent s'il existe
  if (interval) {
    clearInterval(interval);
  }

  // Mettre à jour le décompte toutes les secondes
  updateCountdown();
  interval = setInterval(updateCountdown, 1000);
};

// Filtrer les lancements
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

// Charger les données au montage du composant
onMounted(async () => {
  await Promise.all([fetchNextLaunch(), fetchPastLaunches()]);
});

// Watcher pour recalculer le décompte si nextLaunch change
watch(nextLaunch, () => {
  if (nextLaunch.value) {
    startCountdown();
  }
});

// Watcher pour déboguer le filtre
watch(filter, (newFilter) => {
  console.log('Filtre sélectionné :', newFilter); // Debug
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Titre principal -->
    <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">PROCHAIN LANCEMENT</h1>

    <!-- Section du décompte -->
    <div v-if="isLoading" class="text-center">Chargement en cours...</div>
    <div v-else class="bg-white p-8 rounded-lg shadow-md text-center mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">{{ nextLaunch?.name || 'Aucun lancement futur trouvé.' }}</h2>
      <div v-if="nextLaunch" class="flex justify-center space-x-4">
        <!-- Jours -->
        <div class="text-center">
          <span class="text-5xl font-bold text-gray-800">{{ days }}</span>
          <span class="block text-sm text-gray-500">J</span>
        </div>
        <!-- Heures -->
        <div class="text-center">
          <span class="text-5xl font-bold text-gray-800">{{ hours }}</span>
          <span class="block text-sm text-gray-500">H</span>
        </div>
        <!-- Minutes -->
        <div class="text-center">
          <span class="text-5xl font-bold text-gray-800">{{ minutes }}</span>
          <span class="block text-sm text-gray-500">M</span>
        </div>
        <!-- Secondes -->
        <div class="text-center">
          <span class="text-5xl font-bold text-gray-800">{{ seconds }}</span>
          <span class="block text-sm text-gray-500">S</span>
        </div>
      </div>
    </div>

    <!-- Sélecteur de filtre -->
    <div class="mb-8">
      <label for="filter" class="block text-lg font-semibold mb-2 text-gray-700">Filtrer les lancements :</label>
      <select
          id="filter"
          v-model="filter"
          class="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">Tous les lancements</option>
        <option value="success">Lancements réussis</option>
        <option value="failed">Lancements échoués</option>
      </select>
    </div>

    <!-- Section des lancements filtrés -->
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">Lancements passés</h2>
      <ul>
        <li v-for="launch in filteredLaunches" :key="launch.id" class="mb-4">
          <p class="text-lg text-gray-600">
            <span class="font-bold">{{ launch.name }}</span> -
            {{ new Date(launch.net).toLocaleDateString() }}
            <span v-if="launch.status" class="ml-2">
              ({{ launch.status.name }})
            </span>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>