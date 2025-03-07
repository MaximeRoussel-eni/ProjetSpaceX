<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getNextLaunch, getPastLaunches } from './services/spacexService';

// Données réactives
const nextLaunch = ref<any>(null);
const pastLaunches = ref<any[]>([]);
const filter = ref<'all' | 'success' | 'failed'>('all');
const countdown = ref<string>('');
const error = ref<string | null>(null);
const days = ref<number>(0);
const hours = ref<number>(0);
const minutes = ref<number>(0);
const seconds = ref<number>(0);

// Récupérer le prochain lancement
const fetchNextLaunch = async () => {
  try {
    nextLaunch.value = await getNextLaunch();
    console.log('Prochain lancement :', nextLaunch.value); // Debug
    if (nextLaunch.value) {
      console.log('Date du prochain lancement :', nextLaunch.value.net); // Debug
      if (!nextLaunch.value.net) {
        error.value = 'Date du lancement invalide.';
        return;
      }
      startCountdown();
    } else {
      error.value = 'Aucun lancement futur trouvé.';
    }
  } catch (err) {
    error.value = 'Erreur lors de la récupération du prochain lancement.';
    console.error('Erreur :', err);
  }
};

// Récupérer les lancements passés
const fetchPastLaunches = async () => {
  try {
    pastLaunches.value = await getPastLaunches();
    console.log('Lancements passés :', pastLaunches.value); // Debug
  } catch (err) {
    error.value = 'Erreur lors de la récupération des lancements passés.';
    console.error('Erreur :', err);
  }
};

// Démarrer le décompte
const startCountdown = () => {
  if (!nextLaunch.value) {
    console.error('Aucun prochain lancement trouvé.'); // Debug
    return;
  }

  const launchDate = new Date(nextLaunch.value.net).getTime(); // Heure du décollage
  console.log('Date du prochain lancement :', new Date(launchDate)); // Debug

  const updateCountdown = () => {
    const now = new Date().getTime(); // Heure actuelle
    const timeLeft = launchDate - now; // Différence en millisecondes

    if (timeLeft > 0) {
      // Convertir la différence en jours, heures, minutes et secondes
      days.value = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      hours.value = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes.value = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      seconds.value = Math.floor((timeLeft % (1000 * 60)) / 1000);

      console.log('Décompte mis à jour :', days.value, hours.value, minutes.value, seconds.value); // Debug
    } else {
      // Si le lancement est en cours ou terminé
      days.value = 0;
      hours.value = 0;
      minutes.value = 0;
      seconds.value = 0;
      console.log('Lancement en cours !'); // Debug
      clearInterval(interval);
    }
  };

  // Mettre à jour le décompte toutes les secondes
  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
};

// Filtrer les lancements
const filteredLaunches = computed(() => {
  if (filter.value === 'success') {
    return pastLaunches.value.filter((launch: any) => launch.status?.name === 'Success');
  } else if (filter.value === 'failed') {
    return pastLaunches.value.filter((launch: any) => launch.status?.name === 'Failure');
  } else {
    return pastLaunches.value;
  }
});

// Charger les données au montage du composant
onMounted(async () => {
  await fetchNextLaunch();
  await fetchPastLaunches();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Titre principal -->
    <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">PROCHAIN LANCEMENT</h1>

    <!-- Section du décompte -->
    <div class="bg-white p-8 rounded-lg shadow-md text-center mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">Falcon 9 Block 5</h2>
      <div class="flex justify-center space-x-4">
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

    <!-- Section des lancements -->
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4 text-gray-700">Prochain lancement</h2>
      <div v-if="nextLaunch">
        <p class="text-lg text-gray-600">
          <span class="font-bold">{{ nextLaunch.name }}</span> -
          {{ new Date(nextLaunch.net).toLocaleDateString() }}
        </p>
      </div>
      <p v-else class="text-lg text-gray-600">Aucun lancement prévu pour le moment.</p>
    </div>
  </div>
</template>