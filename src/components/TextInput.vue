<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ modelValue?: string }>();
const emit = defineEmits<{
  (e: "update:modelValue", value?: string): void;
}>();

const value = computed({
  get: () => props.modelValue,
  set: (value?: string) => emit("update:modelValue", value),
});
</script>
<template>
  <input
    v-model="value"
    class="rounded-lg border border-stone-300 dark:border-gray-700 p-2 dark:bg-gray-900"
  />
</template>
