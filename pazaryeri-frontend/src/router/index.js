import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProductView from '@/views/ProductView.vue'
import NotFound from '@/views/NotFound.vue'
import CartView from '@/views/CartView.vue'
import CategoryView from '@/views/CategoryView.vue'
import AccountView from '@/views/AccountView.vue'
import { useLoggedInStore } from '@/stores/counter'
import StorePageView from '@/views/StorePageView.vue'
import StoreApplicationView from '@/views/StoreApplicationView.vue'
import StoreLoginView from '@/views/StoreLoginView.vue'
import StoreDashboardView from '@/views/StoreDashboardView.vue'
import AddProductView from '@/views/AddProductView.vue'
import CheckoutView from "@/views/CheckoutView.vue";
import OrderDetailView from '@/views/OrderDetailView.vue'
import StoreProfileView from '@/views/StoreProfileView.vue'
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
      path:'/order/:id',
      name:'order',
      component: OrderDetailView,
    },
    {
      path:'/category/:id',
      name:'category',
      component: CategoryView,
    },
    {
      path:'/account',
      name:'account',
      component: AccountView,
      meta: {
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        const isAuthenticated = useLoggedInStore().loggedIn
        if (!isAuthenticated) {
          next({ name: 'login' });
        } else {
          next();
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
      path:'/checkout',
      name:'checkout',
      component: CheckoutView,
    },
    {
      path: '/store-page',
      name: 'store',
      component: StorePageView,
      meta: {
        title: 'Pazaryerinde Satış Yap'
      }
    },
    {
      path:'/store/:id',
      name:'store-profile',
      component: StoreProfileView,
    },
    {
      path: '/store-application',
      name: 'store-application',
      component: StoreApplicationView,
      meta: {
        title: 'Pazaryerinde Satış Yap'
      }
    },
    {
      path: '/store-login',
      name: 'store-login',
      component: StoreLoginView,
      meta: {
        title: 'Pazaryerinde Satış Yap'
      }
    },
    {
      path: '/store/dashboard',
      name: 'store-dashboard',
      component: StoreDashboardView,
      meta: {
        requiresAuth: true,
        title: 'Pazaryerinde Satış Yap'
      },
    },
    /*{
      path: '/store/dashboard/:pathMatch(.*)*',
    }*/
   {
    path: '/store/dashboard/add-product',
    name: 'store-dashboard-add-product',
    component: AddProductView,
    meta: {
      requiresAuth: true,
      title: 'Pazaryerinde Satış Yap'
    },
   },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
    
  ],
})

export default router
