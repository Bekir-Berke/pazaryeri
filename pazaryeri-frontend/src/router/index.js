import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProductView from '@/views/ProductView.vue'
import NotFound from '@/views/NotFound.vue'
import CartView from '@/views/CartView.vue'
import AccountView from '@/views/AccountView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path:'/product/:id',
      name:'product',
      component: ProductView,
    },
    {
      path:'/account',
      name:'account',
      component: AccountView,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        const isLoggedIn = localStorage.getItem('access_token') !== null;
        if (isLoggedIn) {
          next();
        } else {
          next({ name: 'login' });
        }
      }
    },
    {
      path:'/login',
      name:'login',
      component: LoginView,
    },
    {
      path:'/register',
      name:'register',
      component: RegisterView
    },
    {
      path:'/cart',
      name:'cart',
      component: CartView
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ],
})

export default router
