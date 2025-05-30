import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProductView from '@/views/ProductView.vue'
import NotFound from '@/views/NotFound.vue'
import CartView from '@/views/CartView.vue'
import CategoryView from '@/views/CategoryView.vue'
import AccountView from '@/views/AccountView.vue'
import StorePageView from '@/views/StorePageView.vue'
import StoreApplicationView from '@/views/StoreApplicationView.vue'
import StoreLoginView from '@/views/StoreLoginView.vue'
import StoreDashboardView from '@/views/StoreDashboardView.vue'
import AddProductView from '@/views/AddProductView.vue'
import CheckoutView from "@/views/CheckoutView.vue";
import OrderDetailView from '@/views/OrderDetailView.vue'
import StoreProfileView from '@/views/StoreProfileView.vue'
import AdminLoginView from "@/views/AdminLoginView.vue";
import AdminDashboardView from "@/views/AdminDashboardView.vue";
import ForbiddenView from "@/views/ForbiddenView.vue";
import SearchView from '@/views/SearchView.vue'
import BrandsView from '../views/BrandsView.vue'
import { useLoggedInStore } from '@/stores/counter';
const routes = [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path:'/search',
      name:'search',
      component: SearchView,
    },
    {
      path: '/forbidden',
      name: 'forbidden',
      component: ForbiddenView,
      meta: {
        title: 'Erişim Reddedildi'
      }
    },
    {
      path:'/admin/login',
      name:'admin-login',
      component: AdminLoginView,
    },
    {
      path:'/admin/dashboard',
      name:'admin-dashboard',
      component: AdminDashboardView,
      meta:{
        requiresAuth: true,
        roles:['ADMIN']
      }
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
      meta: {
        requiresAuth: true,
        roles:['ADMIN','USER']
      }
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
        requiresAuth: true,
        roles:['USER']
      },
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
      component: CartView,
      meta:{
        requiresAuth: true,
        roles:['USER']
      }
    },
    {
      path:'/checkout',
      name:'checkout',
      component: CheckoutView,
      meta:{
        requiresAuth: true,
        roles:['USER']
      }
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
      path: '/store/login',
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
        roles: ['STORE'],
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
      roles: ['STORE'],
      title: 'Pazaryerinde Satış Yap'
    },
   },
    {
      path: '/brands',
      name: 'brands',
      component: () => import('../views/BrandsView.vue')
    },
    {
      path: '/brand/:id/products',
      name: 'brand-products',
      component: () => import('../views/BrandProductsView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    } 
  ]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const loginStore = useLoggedInStore();
  const isLoggedIn = loginStore.loggedIn;
  const role = loginStore.role;
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      return next({ name: 'login' });
    }
    if (to.meta.roles && !to.meta.roles.includes(role)) {
      return next({ name: 'forbidden' });
    }
  }
  next();
});

export default router