<template>
  <div class="countdown-container">
    <div class="countdown-item">
      <span class="value">{{ days }}</span>
      <span class="label">JOURS</span>
    </div>
    <div class="countdown-item">
      <span class="value">{{ hours }}</span>
      <span class="label">HEURES</span>
    </div>
    <div class="countdown-item">
      <span class="value">{{ minutes }}</span>
      <span class="label">MINUTES</span>
    </div>
    <div class="countdown-item">
      <span class="value">{{ seconds }}</span>
      <span class="label">SECONDES</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{ launchDate: string }>();
const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);
let interval: number | null = null;

const startCountdown = () => {
  const launchDate = new Date(props.launchDate).getTime();
  if (isNaN(launchDate)) {
    console.error('Date du lancement invalide.');
    return;
  }

  const updateCountdown = () => {
    const now = Date.now();
    const timeLeft = launchDate - now;

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

  if (interval) {
    clearInterval(interval);
  }

  updateCountdown();
  interval = setInterval(updateCountdown, 1000);
};

onMounted(() => {
  startCountdown();
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<style scoped>
.countdown-container {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.countdown-item {
  text-align: center;
  background-color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.3s ease-in-out;
}

.countdown-item:hover {
  transform: scale(1.05);
}

.countdown-item .value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a202c;
}

.countdown-item .label {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.25rem;
}
</style>
