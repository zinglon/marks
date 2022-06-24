<script setup lang="ts"></script>
<template>
  <h2 class="text-center pb-4">
    <slot name="header" />
  </h2>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="flex flex-col space-y-2 overflow-hidden p-1">
      <slot name="content" />
    </div>
    <div
      class="flex-1 flex flex-col justify-end items-end text-white space-y-2 p-1"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
