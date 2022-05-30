import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Bookmark from "../views/Bookmark.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/bookmark",
      name: "bookmark",
      component: Bookmark,
      props: true,
    },
  ],
});
export default router;
