import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/api'
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

export const useProductStore = defineStore('products', () => {
  const products = ref([]);
  function fetchProducts() {
    apiClient.get("/product")
      .then(response => {
        products.value = response.data.items;
      });
  }
  return { products, fetchProducts }
})
export const useCategoryStore = defineStore('categories', () => {
  const categories = ref([]);
  function fetchCategories() {
    apiClient.get("/category")
      .then(response => {
        categories.value = response.data;
      });
  }
  return { categories, fetchCategories }
})
export const useLoggedInStore = defineStore('loggedIn', () => {
  const loggedIn = ref(false);
  function login() {
    loggedIn.value = true;
  }
  function logout() {
    loggedIn.value = false;
  }
  return { loggedIn, login, logout }
})
export const useCartStore = defineStore('cart', () => {
  const cart = ref([]);
  function addToCart(item) {
    let product = cart.value.find(p => p.id === item.id);
    if(product){
      product.quantity++;
    }else{
      cart.value.push({...item, quantity: 1})
    }
  }
  function decreaseQuantity(item) {
    let product = cart.value.find(p => p.id === item.id);
    if(product){
      product.quantity--;
      if(product.quantity === 0){
        cart.value = cart.value.filter(p => p.id !== item.id);
      }
    }
  }
  function removeFromCart(item) {
    cart.value = cart.value.filter(p => p.id !== item.id);
  }
  return { cart, addToCart, decreaseQuantity, removeFromCart }
})