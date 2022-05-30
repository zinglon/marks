<script setup lang="ts">
import { onMounted } from "vue";

onMounted(async () => {
  // tab jiggle to set focus to the page instead of the URL bar
  await browser.tabs.create({ url: `${window.location.href}home` });
  // eslint-disable-next-line
  await browser.tabs.remove((await browser.tabs.getCurrent()).id!); // @ts-ignore
});
</script>
