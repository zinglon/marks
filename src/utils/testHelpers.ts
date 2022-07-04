import { createApp, onMounted, ref } from "vue";

// https://vuejs.org/guide/scaling-up/testing.html#recipes
export const withSetup = <T>(composable: () => T) => {
  let result: T | undefined = undefined;
  const app = createApp({
    setup() {
      result = composable();
      return () => {
        //
      };
    },
  });
  app.mount(document.createElement("div"));
  return { app, composable: result as unknown as T };
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  describe("withSetup", () => {
    it("should run Vue lifecycle hooks", () => {
      const testComposable = () => {
        const testRef = ref<string>();
        onMounted(() => (testRef.value = "bar"));
        return { testRef };
      };
      const { composable } = withSetup(() => testComposable());
      expect(composable.testRef.value).toEqual("bar");
    });
  });
}
