import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
// import Redirect from "../views/Redirect.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // {
    //   path: "/",
    //   name: "redirect",
    //   component: Redirect,
    // },
    {
      path: "/",
      name: "home",
      component: Home,
    },
  ],
});
export default router;
