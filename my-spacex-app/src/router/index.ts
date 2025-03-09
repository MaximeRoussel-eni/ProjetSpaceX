import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import LaunchDetails from '../views/LaunchDetails.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/launch/:id',
        name: 'LaunchDetails',
        component: LaunchDetails,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
