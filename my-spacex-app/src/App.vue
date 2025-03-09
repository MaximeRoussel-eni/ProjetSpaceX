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
  <div class="min-h-screen bg-gray-100 p-6">
    <!-- Titre principal -->
    <h1 class="text-5xl font-bold text-center mb-8 text-gray-800">PROCHAIN LANCEMENT</h1>

    <!-- Section du décompte -->
    <div v-if="isLoading" class="text-center">Chargement en cours...</div>
    <div v-else class="bg-white p-8 rounded-lg shadow-md text-center mb-8">
      <h2 class="text-3xl font-semibold mb-6 text-gray-700">{{ nextLaunch?.name || 'Aucun lancement futur trouvé.' }}</h2>
      <div v-if="nextLaunch" class="flex justify-center space-x-4 countdown-container">
        <!-- Jours -->
        <div class="countdown-item">
          <span class="value">{{ days }}</span>
          <span class="label">JOURS</span>
        </div>
        <!-- Heures -->
        <div class="countdown-item">
          <span class="value">{{ hours }}</span>
          <span class="label">HEURES</span>
        </div>
        <!-- Minutes -->
        <div class="countdown-item">
          <span class="value">{{ minutes }}</span>
          <span class="label">MINUTES</span>
        </div>
        <!-- Secondes -->
        <div class="countdown-item">
          <span class="value">{{ seconds }}</span>
          <span class="label">SECONDES</span>
        </div>
      </div>
    </div>

    <!-- Sélecteur de filtre -->
    <div class="mb-8">
      <label for="filter" class="block text-lg font-semibold mb-2 text-gray-700">Filtrer les lancements :</label>
      <select
          id="filter"
          v-model="filter"
          class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
      >
        <option value="all">Tous les lancements</option>
        <option value="success">Lancements réussis</option>
        <option value="failed">Lancements échoués</option>
      </select>
    </div>

    <!-- Section des lancements filtrés -->
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-3xl font-semibold mb-6 text-gray-700">Lancements passés</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div v-for="launch in filteredLaunches" :key="launch.id" class="launch-card">
          <p class="text-xl font-bold text-gray-800">{{ launch.name }}</p>
          <p class="text-sm text-gray-600 mt-2">{{ new Date(launch.net).toLocaleDateString() }}</p>
          <p v-if="launch.status" class="text-sm mt-2 status" :class="{'success': launch.status.name === 'Launch Successful', 'failure': launch.status.name === 'Launch Failure'}">
            Statut: {{ launch.status.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ajoutez des styles personnalisés ici */
.countdown-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.countdown-item {
  text-align: center;
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease-in-out;
}

.countdown-item:hover {
  transform: scale(1.05);
}

.countdown-item .value {
  font-size: 2.25rem;
  font-weight: bold;
  color: #1a202c;
}

.countdown-item .label {
  font-size: 1rem;
  color: #718096;
  margin-top: 0.5rem;
}

.launch-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s, transform 0.3s ease-in-out;
}

.launch-card:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.launch-card p {
  margin-bottom: 0.5rem;
}

.launch-card .status {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.launch-card .status.success {
  color: #28a745;
}

.launch-card .status.failure {
  color: #dc3545;
}
</style>
