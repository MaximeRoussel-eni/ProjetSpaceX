<template>
  <div class="text-center">
    <button
        class="filter-button"
        :class="{ active: modelValue === 'all' }"
        @click="$emit('update:modelValue', 'all')"
    >
      Tous
    </button>
    <button
        class="filter-button"
        :class="{ active: modelValue === 'success' }"
        @click="$emit('update:modelValue', 'success')"
    >
      Réussis
    </button>
    <button
        class="filter-button"
        :class="{ active: modelValue === 'failed' }"
        @click="$emit('update:modelValue', 'failed')"
    >
      Échoués
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: 'all' | 'success' | 'failed' }>();
defineEmits<{ (e: 'update:modelValue', value: 'all' | 'success' | 'failed'): void }>();
</script>

<style scoped>
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
</style>
