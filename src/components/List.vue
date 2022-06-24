<script setup lang="ts">
defineProps<{ items: unknown[] }>();
</script>
<template>
  <ul v-if="items.length > 0" class="h-full overflow-y-scroll">
    <slot name="list" />
  </ul>
  <div v-else class="h-full flex justify-center items-center">
    <slot name="fallback" />
  </div>
</template>
