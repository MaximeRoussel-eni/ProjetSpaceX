<script setup lang="ts">
import YouTubeEmbed from './YouTubeEmbed.vue';

defineProps<{
  launches: any[];
}>();
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">SpaceX Launches</h1>
    <ul>
      <li v-for="launch in launches" :key="launch.id" class="mb-4 p-4 border rounded">
        <h2 class="text-xl font-semibold">{{ launch.name }}</h2>
        <p>{{ launch.details }}</p>
        <p class="text-sm text-gray-500">{{ new Date(launch.date_utc).toLocaleDateString() }}</p>
        <YouTubeEmbed v-if="launch.links.youtube_id" :videoId="launch.links.youtube_id" />
      </li>
    </ul>
  </div>
</template>