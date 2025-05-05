<script setup>
import { RouterLink, RouterView } from "vue-router";
import Header from "./components/Header.vue";
import { useCartStore, useLoggedInStore } from "./stores/counter";
import { onMounted } from "vue";
import apiClient from "./api";
const loginStore = useLoggedInStore();
const cartStore = useCartStore();
onMounted(() => {
  apiClient.get("/auth/me").then((response) => {
    if (response.data.success === true) {
      loginStore.login();
      loginStore.setRole(response.data.role);
      sessionStorage.setItem("role", response.data.role);
      sessionStorage.setItem("loggedIn", true);
      apiClient.get("/cart").then((response) => {
        if (response.data) {
          cartStore.initCart(response.data);
        }
      });
    }
  });
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
