<script setup lang="ts">
defineProps<{ isDarkTheme: boolean }>();
</script>
<template>
  <div class="h-screen" :class="{ dark: isDarkTheme }">
    <div
      class="h-screen flex flex-col bg-[url('/public/background.avif')] dark:bg-[url('/public/background_dark.avif')] bg-cover bg-center text-stone-700 dark:text-gray-300"
    >
      <div class="text-white flex flex-row justify-end">
        <slot name="header" />
      </div>
      <div class="flex flex-1 overflow-hidden">
        <div class="flex-1 flex justify-center items-center">
          <slot name="content" />
        </div>
      </div>
      <div>
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
