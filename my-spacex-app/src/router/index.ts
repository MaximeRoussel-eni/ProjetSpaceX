import { createRouter, createWebHistory } from 'vue-router';
import AllLaunches from '../views/AllLaunches.vue';

const routes = [
    { path: '/all-launches', component: AllLaunches },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;