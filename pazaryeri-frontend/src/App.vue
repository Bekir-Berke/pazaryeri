<script setup>
import { RouterLink, RouterView } from "vue-router";
import Header from "./components/Header.vue";
import { useCartStore, useLoggedInStore } from "./stores/counter";
import { onMounted } from "vue";
import apiClient from "./api";
const loginStore = useLoggedInStore();
const cartStore = useCartStore();
onMounted(() => {
  if (localStorage.getItem("access_token") && localStorage.getItem("refresh_token")) {
    loginStore.login()
    apiClient.get('/cart',{headers: {Authorization: `Bearer ${localStorage.getItem("access_token")}`}})
      .then((response) => {
        cartStore.cart = response.data.items;
      })
      .catch((error) => {
        console.error("Error fetching cart data:", error);
      });
  }
});
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <Header :logged-in="loginStore.loggedIn" />
    </div>
    <div class="row">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
</style>
