<template>
  <div class="store-dashboard" v-if="storeData">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo-container">
          <h3>{{ storeData.name }}</h3>
        </div>
      </div>
      <div class="sidebar-menu">
        <div class="menu-item" :class="{ active: pages == 'dashboard' }" @click="pages = 'dashboard'">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </div>
        <div class="menu-item" :class="{ active: pages == 'products' }" @click="pages = 'products'">
          <i class="bi bi-box"></i>
          <span>Ürünler</span>
        </div>
        <div class="menu-item" :class="{ active: pages == 'coupons' }" @click="pages = 'coupons'">
          <i class="bi bi-tag"></i>
          <span>Kuponlar</span>
        </div>
        <div class="menu-item" :class="{ active: pages == 'orders' }" @click="pages = 'orders'">
          <i class="bi bi-cart"></i>
          <span>Siparişler</span>
        </div>
        <div class="menu-item" :class="{ active: pages == 'reviews' }" @click="pages = 'reviews'">
          <i class="bi bi-star"></i>
          <span>Değerlendirmeler</span>
        </div>
        <div class="menu-item">
          <i class="bi bi-graph-up"></i>
          <span>Performans</span>
        </div>
        <div class="menu-item">
          <i class="bi bi-gear"></i>
          <span>Ayarlar</span>
        </div>
        <div class="menu-item logout" @click="logout">
          <i class="bi bi-box-arrow-right"></i>
          <span>Çıkış</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <Dashbooard v-if="pages == 'dashboard'" v-model="storeData" />
    <StoreDashboardProductList v-if="pages == 'products'" v-model="storeData.products" />
    <StoreDashboardOrderList v-if="pages == 'orders'" v-model="storeData.orders" />
    <StoreDashboardCouponList v-if="pages == 'coupons'" v-model="storeData.Coupon" />
    <StoreDashboardReviewList v-if="pages == 'reviews'" v-model="storeData.reviews" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import apiClient from "@/api";
import router from "@/router";
import Swal from "sweetalert2";
import Dashbooard from "@/components/Dashbooard.vue";
import StoreDashboardProductList from "@/components/StoreDashboardProductList.vue";
import StoreDashboardOrderList from "@/components/StoreDashboardOrderList.vue";
import StoreDashboardCouponList from "@/components/StoreDashboardCouponList.vue";
import StoreDashboardReviewList from "@/components/StoreDashboardReviewList.vue";
import { useLoggedInStore } from "@/stores/counter";

const storeData = ref(null);
const pages = ref("dashboard");

const logout = () => {
  apiClient
    .post("/auth/store-logout")
    .then(() => {
      useLoggedInStore().setRole(null);
      useLoggedInStore().logout();
      Swal.fire({
        icon: "success",
        title: "Başarıyla çıkış yaptınız.",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        router.push("/");
      });
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
};

onMounted(() => {
  apiClient
    .get("/store/dashboard")
    .then((response) => {
      storeData.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching dashboard data:", error);
      // Keep the mock data in case of error
    });
});
</script>
<style scoped>
.store-dashboard {
  display: flex;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  color: #333;
  background-color: #f0f2f5;
}

/* ===== SIDEBAR STYLES ===== */
.sidebar {
  width: 250px;
  background: linear-gradient(to bottom, #2b4162, #12100e);
  color: white;
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 12px;
}

.sidebar-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-menu {
  padding: 20px 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  margin: 2px 10px;
  border-radius: 8px;
}

.menu-item i {
  font-size: 18px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-item.active {
  background-color: #ff7f00;
  color: white;
  box-shadow: 0 4px 10px rgba(255, 127, 0, 0.3);
}

.menu-item.logout {
  margin-top: auto;
  color: #ff9b9b;
}

.menu-item.logout:hover {
  background-color: rgba(255, 0, 0, 0.1);
}
</style>
