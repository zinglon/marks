module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],
  plugins: ["vue", "html", "simple-import-sort"],
  globals: {
    defineProps: "readonly",
  },
  rules: {
    "vue/multi-word-component-names": "off",
    "no-undef": "off", // dom types don't work with this on
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
};
