<template>
  <div class="header-container">
    <header class="site-header">
      <div class="container">
        <div class="header-wrapper">
          <div class="logo">
            <RouterLink to="/">
              <h2>Pazaryeri</h2>
            </RouterLink>
          </div>
          
          <div class="search-container">
            <input class="search-input" type="text" placeholder="ürün adı giriniz">
            <button class="search-button">
              <i class="bi bi-search"></i>
            </button>
          </div>
          
          <nav class="user-nav">
            <ul v-if="!session.loggedIn">
              <li>
                <router-link to="/register" class="btn btn-outline-primary">Üye Ol</router-link>
              </li>
              <li>
                <router-link to="/login" class="btn btn-primary">Giriş Yap</router-link>
              </li>
            </ul>
            <ul v-else>
              <li>
                <div class="dropdown">
                  <b-dropdown id="user-dropdown" text="Hesabım" variant="warning">
                    <b-dropdown-item to="/account">
                      <i class="bi bi-gear me-2"></i>Hesap Detayları
                    </b-dropdown-item>
                    <b-dropdown-item to="/orders">
                      <i class="bi bi-box me-2"></i>Siparişlerim
                    </b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item @click="handleLogout" class="logout">
                      <i class="bi bi-box-arrow-right me-2"></i>Çıkış Yap
                    </b-dropdown-item>
                  </b-dropdown>
                </div>
              </li>
              <li>
                <router-link to="/cart" class="btn btn-outline-primary cart-btn">
                  <i class="bi bi-cart"></i>
                  <span class="cart-count">{{ cartCount }}</span>
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <CategoryHeader />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import CategoryHeader from './CategoryHeader.vue';
import { useCategoryStore } from '@/stores/counter'
import { useLoggedInStore } from '@/stores/counter';
import { useCartStore } from '@/stores/counter';
import { BDropdown, BDropdownItem, BDropdownDivider } from 'bootstrap-vue-next';
import apiClient from '@/api';
const session = defineProps(['loggedIn', 'cartCount'])
const loginStore = useLoggedInStore();
const cartStore = useCartStore();

const handleLogout = () => {
  apiClient.post('/auth/logout', {},{
    headers: {
      Authorization: `Bearer ${localStorage.getItem('refresh_token')}`
    }
  }).then(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    loginStore.logout();
  });
};
const cartCount = computed(() => {
  return cartStore.cart.map(item => item.quantity).reduce((a, b) => a + b, 0);
});

</script>

<style scoped>
.header-container {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #ffffff;
}

.site-header {
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.header-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.logo a {
  text-decoration: none;
  color: black;
}

.logo h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.search-container {
  position: relative;
  width: 100%;
  max-width: 550px;
  margin: 0 15px;
}

.search-input {
  width: 100%;
  padding: 10px 45px 10px 15px;
  border: 1px solid #ff7f00;
  border-radius: 25px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #ff7f00;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.search-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: #ff7f00;
  border: none;
  color: white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.user-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 10px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border-radius: 5px;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.btn-primary {
  background-color: #ff7f00;
  color: white;
  border: 1px solid #ff7f00;
}

.btn-outline-primary {
  background-color: transparent;
  color: #ff7f00;
  border: 1px solid #ff7f00;
}

.btn-primary:hover {
  background-color: white;
  color:#ff7f00;
  border-color: #ff7f00;
}

.btn-outline-primary:hover {
  background-color: #ff7f00;
  color: white;
}

.dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  padding: 8px 0;
}

.dropdown-item {
  padding: 8px 16px;
}

.dropdown-item a {
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.logout a {
  color: #ef4444;
}

.cart-btn {
  position: relative;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .header-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .logo {
    margin-bottom: 15px;
    text-align: center;
  }
  
  .search-container {
    margin: 15px 0;
    max-width: 100%;
  }
  
  .user-nav {
    margin-top: 15px;
    display: flex;
    justify-content: center;
  }
}
</style>