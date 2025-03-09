<template>
  <div class="launch-card" @click="navigateToLaunchDetails(launch.id)">
    <img :src="launch.image" alt="Rocket Image" class="w-full h-24 object-cover rounded-t-lg lazyload" loading="lazy">
    <div class="p-3">
      <p class="text-base font-bold text-gray-800">{{ launch.name }}</p>
      <p class="text-sm text-gray-600 mt-1">{{ new Date(launch.net).toLocaleDateString() }}</p>
      <p v-if="launch.status" class="text-sm mt-1 status" :class="{'success': launch.status.name === 'Launch Successful', 'failure': launch.status.name === 'Launch Failure'}">
        Statut: {{ launch.status.name }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type {Launch} from "../types/launch.ts";

const props = defineProps<{ launch: Launch }>();
const router = useRouter();

const navigateToLaunchDetails = (launchId: string) => {
  router.push({ name: 'LaunchDetails', params: { id: launchId } });
};
</script>

<style scoped>
.launch-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s, transform 0.3s ease-in-out;
  cursor: pointer;
}

.launch-card:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.launch-card p {
  margin-bottom: 0.25rem;
}

.launch-card .status {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.launch-card .status.success {
  color: #28a745;
}

.launch-card .status.failure {
  color: #dc3545;
}
</style>
