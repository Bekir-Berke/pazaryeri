import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/api'

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

  // Initialize cart with data from API
  function initCart(cartData) {
    if (cartData && cartData.items) {
      cart.value = cartData.items;
    }
  }
  
  function addToCart(item) {
    const productId = item.productId || item.id;
    const variantId = item.variantId || (item.variant ? item.variant.id : null);
    
    let cartItem = cart.value.find(p => 
      p.productId === productId && 
      ((variantId && p.variantId === variantId) || (!variantId && !p.variantId))
    );
    
    if (cartItem) {
      cartItem.quantity++;
    } else {
      if (!item.productId) {
        cart.value.push({
          productId: item.id,
          variantId: item.variant ? item.variant.id : null,
          quantity: 1,
          price: item.price,
          product: item,
          variant: item.variant || null
        });
      } else {
        cart.value.push({ ...item, quantity: 1 });
      }
    }
  }
  
  function decreaseQuantity(item) {
    const productId = item.productId || item.id;
    const variantId = item.variantId || (item.variant ? item.variant.id : null);
    
    let cartItem = cart.value.find(p => 
      p.productId === productId && 
      ((variantId && p.variantId === variantId) || (!variantId && !p.variantId))
    );
    
    if (cartItem) {
      cartItem.quantity--;
      if (cartItem.quantity <= 0) {
        removeFromCart(item);
      }
    }
  }
  
  function removeFromCart(item) {
    const productId = item.productId || item.id;
    const variantId = item.variantId || (item.variant ? item.variant.id : null);
    
    cart.value = cart.value.filter(p => 
      !(p.productId === productId && 
        ((variantId && p.variantId === variantId) || (!variantId && !p.variantId)))
    );
  }

  function clearCart(){
    cart.value = []
  }

  return { cart, addToCart, decreaseQuantity, removeFromCart, initCart, clearCart }
})