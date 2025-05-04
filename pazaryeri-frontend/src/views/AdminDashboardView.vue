<template>
  <div class="admin-dashboard">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'open': sidebarOpen }">
      <div class="sidebar-header">
        <div class="logo-container">
          <h3>Admin Panel</h3>
        </div>
        <button class="close-sidebar" @click="toggleSidebar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="admin-menu">
        <div
            class="menu-item"
            :class="{ 'active': activeTab === 'dashboard' }"
            @click="setActiveTab('dashboard')"
        >
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </div>
        <div
            class="menu-item"
            :class="{ 'active': activeTab === 'users' }"
            @click="setActiveTab('users')"
        >
          <i class="bi bi-people"></i>
          <span>Kullanıcılar</span>
        </div>
        <div
            class="menu-item"
            :class="{ 'active': activeTab === 'stores' }"
            @click="setActiveTab('stores')"
        >
          <i class="bi bi-shop"></i>
          <span>Mağazalar</span>
        </div>
        <div
            class="menu-item"
            :class="{ 'active': activeTab === 'products' }"
            @click="setActiveTab('products')"
        >
          <i class="bi bi-box-seam"></i>
          <span>Ürünler</span>
        </div>
        <div
            class="menu-item"
            :class="{ 'active': activeTab === 'orders' }"
            @click="setActiveTab('orders')"
        >
          <i class="bi bi-cart3"></i>
          <span>Siparişler</span>
        </div>
        <div
            class="menu-item"
            :class="{'active': activeTab === 'invoices' }"
            @click="setActiveTab('invoices')"
        >
          <i class="bi bi-file-earmark-text"></i>
          <span>Faturalar</span>
        </div>
        <div
            class="menu-item"
            :class="{ 'active': activeTab === 'categories' }"
            @click="setActiveTab('categories')"
        >
          <i class="bi bi-grid"></i>
          <span>Kategoriler</span>
        </div>
        <div
          class="menu-item"
          :class="{ 'active': activeTab === 'brands' }"
          @click="setActiveTab('brands')"
      >
        <i class="bi bi-grid"></i>
        <span>Markalar</span>
      </div>
        <div
            class="menu-item"
            :class="{ 'active': activeTab === 'applications' }"
            @click="setActiveTab('applications')"
        >
          <i class="bi bi-clipboard-check"></i>
          <span>Mağaza Başvuruları</span>
        </div>
        <div
            class="menu-item"
            :class="{ 'active': activeTab === 'settings' }"
            @click="setActiveTab('settings')"
        >
          <i class="bi bi-gear"></i>
          <span>Ayarlar</span>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item logout" @click="logout">
          <i class="bi bi-box-arrow-right"></i>
          <span>Çıkış</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content" :class="{ 'sidebar-closed': !sidebarOpen }">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="left-section">
          <div class="toggle-sidebar" @click="toggleSidebar">
            <i class="bi" :class="sidebarOpen ? 'bi-arrow-left' : 'bi-list'"></i>
          </div>
          <div class="page-title">{{ getPageTitle() }}</div>
        </div>
        <div class="right-section">
          <div class="profile-dropdown" ref="profileDropdown">
            <div class="profile-trigger" @click="toggleProfileDropdown">
              <img src="https://ui-avatars.com/api/?name=A+D&background=4a6da7&color=fff" alt="Admin" />
              <span>Admin User</span>
              <i class="bi bi-chevron-down"></i>
            </div>
            <div class="dropdown-menu" v-if="showProfileMenu">
              <div class="dropdown-item">
                <i class="bi bi-person"></i>
                <span>Profil</span>
              </div>
              <div class="dropdown-item">
                <i class="bi bi-gear"></i>
                <span>Hesap Ayarları</span>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item" @click="logout">
                <i class="bi bi-box-arrow-right"></i>
                <span>Çıkış</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="content-wrapper">
        <transition name="fade" mode="out-in">
          <AdminDashboard v-if="activeTab === 'dashboard'" />
          <AdminUsers v-else-if="activeTab === 'users'" />
          <AdminStores v-else-if="activeTab === 'stores'" />
          <AdminProducts v-else-if="activeTab === 'products'" />
          <AdminOrders v-else-if="activeTab === 'orders'" />
          <AdminInvoices v-else-if="activeTab === 'invoices'" />
          <AdminCategories v-else-if="activeTab === 'categories'" />
          <AdminStoreApplications v-else-if="activeTab === 'applications'" />
          <AdminSettings v-else-if="activeTab === 'settings'" />
          <AdminBrands v-else-if="activeTab === 'brands'" />
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import apiClient from '@/api';
import AdminUsers from '@/components/AdminUsers.vue';
import AdminStores from '@/components/AdminStores.vue';
import AdminCategories from "@/components/AdminCategories.vue";
import AdminProducts from '@/components/AdminProducts.vue';
import AdminOrders from '@/components/AdminOrders.vue';
import AdminStoreApplications from "@/components/AdminStoreApplications.vue";
import AdminBrands from '@/components/AdminBrands.vue';
import AdminInvoices from '@/components/AdminInvoices.vue';

const router = useRouter();
const sidebarOpen = ref(window.innerWidth >= 992);
const activeTab = ref('dashboard');
const showProfileMenu = ref(false);
const profileDropdown = ref(null);

// Get current page title based on active tab
const getPageTitle = () => {
  switch (activeTab.value) {
    case 'dashboard': return 'Dashboard';
    case 'users': return 'Kullanıcı Yönetimi';
    case 'stores': return 'Mağaza Yönetimi';
    case 'products': return 'Ürün Yönetimi';
    case 'orders': return 'Sipariş Yönetimi';
    case 'categories': return 'Kategori Yönetimi';
    case 'applications': return 'Mağaza Başvuruları';
    case 'settings': return 'Sistem Ayarları';
    default: return 'Admin Panel';
  }
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const setActiveTab = (tab) => {
  activeTab.value = tab;
  if (window.innerWidth < 992) {
    sidebarOpen.value = false;
  }
};

const toggleProfileDropdown = () => {
  showProfileMenu.value = !showProfileMenu.value;
};

const showNotifications = () => {
  Swal.fire({
    title: 'Bildirimler',
    html: `
      <div class="notification-list">
        <div class="notification-item">
          <div class="notification-icon new"><i class="bi bi-shop"></i></div>
          <div class="notification-content">
            <div class="notification-title">Yeni mağaza başvurusu</div>
            <div class="notification-text">XYZ Mağazası için yeni bir başvuru alındı</div>
            <div class="notification-time">15 dakika önce</div>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-icon"><i class="bi bi-cart"></i></div>
          <div class="notification-content">
            <div class="notification-title">Yeni sipariş</div>
            <div class="notification-text">3 yeni sipariş alındı</div>
            <div class="notification-time">2 saat önce</div>
          </div>
        </div>
        <div class="notification-item">
          <div class="notification-icon"><i class="bi bi-person-plus"></i></div>
          <div class="notification-content">
            <div class="notification-title">Yeni kullanıcı kaydı</div>
            <div class="notification-text">5 yeni kullanıcı kaydoldu</div>
            <div class="notification-time">Dün</div>
          </div>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      container: 'notification-container',
      popup: 'notification-popup'
    }
  });
};

const handleClickOutside = (event) => {
  if (profileDropdown.value && !profileDropdown.value.contains(event.target)) {
    showProfileMenu.value = false;
  }
};

const handleResize = () => {
  if (window.innerWidth >= 992) {
    sidebarOpen.value = true;
  } else {
    sidebarOpen.value = false;
  }
};

const logout = () => {
  Swal.fire({
    title: 'Çıkış yapmak istediğinizden emin misiniz?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Evet, çıkış yap',
    cancelButtonText: 'İptal'
  }).then((result) => {
    if (result.isConfirmed) {
      apiClient
          .post('/auth/admin-logout')
          .then(() => {
            localStorage.removeItem('token');
            Swal.fire({
              icon: 'success',
              title: 'Başarıyla çıkış yaptınız.',
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              router.push('/admin/login');
            });
          })
          .catch((error) => {
            console.error('Logout error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Çıkış yapılırken bir hata oluştu.',
              text: 'Lütfen tekrar deneyin.'
            });
          });
    }
  });
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fc;
  font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background-color: #ffffff;
  color: #334155;
  transition: all 0.3s ease;
  position: absolute;
  height: 100%;
  z-index: 1000;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 32px;
  height: 32px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #0f172a;
}

.close-sidebar {
  display: none;
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-sidebar:hover {
  color: #1e293b;
}

.admin-menu {
  padding: 15px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 4px 8px;
  border-radius: 8px;
  color: #64748b;
}

.menu-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.menu-item.active {
  background-color: #e2e8f0;
  color: #0f172a;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.menu-item i {
  font-size: 1.2rem;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.menu-item span {
  font-size: 0.95rem;
}

.menu-divider {
  height: 1px;
  background-color: #f1f5f9;
  margin: 10px 20px;
}

.menu-item.logout {
  color: #ef4444;
  margin-top: 10px;
}

.menu-item.logout:hover {
  background-color: #fee2e2;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: all 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content.sidebar-closed {
  margin-left: 0;
}

.top-bar {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 900;
  height: 64px;
}

.left-section, .right-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.toggle-sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
}

.toggle-sidebar:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.toggle-sidebar i {
  font-size: 1.2rem;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 8px 15px;
  width: 300px;
  transition: all 0.2s;
}

.search-box:focus-within {
  background-color: #e2e8f0;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.search-box i {
  color: #64748b;
  margin-right: 8px;
}

.search-box input {
  border: none;
  background: transparent;
  flex: 1;
  font-size: 0.95rem;
  color: #334155;
}

.search-box input:focus {
  outline: none;
}

.notification {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.notification:hover {
  background-color: #f1f5f9;
}

.notification i {
  font-size: 1.2rem;
  color: #64748b;
}

.notification .badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 0 5px;
  border: 2px solid #ffffff;
}

.profile-dropdown {
  position: relative;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-trigger:hover {
  background-color: #f1f5f9;
}

.profile-trigger span {
  font-size: 0.95rem;
  color: #334155;
  font-weight: 500;
}

.profile-trigger img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.profile-trigger i {
  color: #64748b;
  transition: transform 0.2s;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background-color: #ffffff;
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  gap: 10px;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item i {
  font-size: 1.1rem;
  color: #64748b;
  width: 20px;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.dropdown-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 5px 0;
}

/* Content Wrapper */
.content-wrapper {
  padding: 24px;
  flex: 1;
}

/* Transition Effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Notification Styles for SweetAlert */
::v-deep(.notification-container) {
  z-index: 1100;
}

::v-deep(.notification-popup) {
  padding: 20px;
  max-width: 400px;
}

::v-deep(.notification-list) {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

::v-deep(.notification-item) {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  background-color: #f8fafc;
  transition: all 0.2s;
}

::v-deep(.notification-item:hover) {
  background-color: #f1f5f9;
}

::v-deep(.notification-icon) {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

::v-deep(.notification-icon.new) {
  background-color: #dcfce7;
  color: #22c55e;
}

::v-deep(.notification-content) {
  flex: 1;
}

::v-deep(.notification-title) {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

::v-deep(.notification-text) {
  font-size: 0.9rem;
  color: #64748b;
}

::v-deep(.notification-time) {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 4px;
}

/* Responsive Design */
@media (max-width: 991px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .close-sidebar {
    display: block;
  }

  .main-content {
    margin-left: 0;
  }

  .search-box {
    width: 200px;
  }
}

@media (max-width: 767px) {
  .search-box {
    display: none;
  }

  .profile-trigger span,
  .profile-trigger i {
    display: none;
  }

  .top-bar {
    padding: 12px 16px;
  }

  .page-title {
    font-size: 1rem;
  }

  .content-wrapper {
    padding: 16px;
  }
}
</style>