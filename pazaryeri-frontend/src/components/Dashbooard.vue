<template>
    <div class="main-content">
        <!-- Top Bar -->
        <div class="top-bar">
          <div class="toggle-sidebar">
            <i class="bi bi-list"></i>
          </div>
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input type="text" placeholder="Ara..." />
          </div>
          <div class="user-info">
            <div class="notification">
              <i class="bi bi-bell"></i>
            </div>
            <div class="profile-dropdown">
              <div class="profile-trigger">
                <span>{{ storeData.ownerFirstName }} {{ storeData.ownerLastName }}</span>
                <img src="https://ui-avatars.com/api/?name=K+O&background=ff7f00&color=fff" alt="Profile" />
                <i class="bi bi-chevron-down"></i>
              </div>
              <div class="dropdown-menu">
                <div class="dropdown-item">
                  <i class="bi bi-person"></i> Profil
                </div>
                <div class="dropdown-item">
                  <i class="bi bi-gear"></i> Hesap Ayarları
                </div>
                <div class="dropdown-item logout">
                  <i class="bi bi-box-arrow-right"></i> Çıkış
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Dashboard Content -->
        <div class="dashboard-content">
          <div class="page-header">
            <div>
              <h2>Mağaza Paneli</h2>
              <p class="store-status">
                Mağaza Durumu:
                <span :class="storeData.status === 'APPROVED' ? 'status-approved' : 'status-pending'">
                  {{ storeData.status === 'APPROVED' ? 'Onaylı' : 'Beklemede' }}
                </span>
              </p>
            </div>
            <div class="date-display">
              <i class="bi bi-calendar3"></i>
              {{ new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </div>
          </div>
  
          <!-- Stats Cards -->
          <div class="stats-cards">
            <div class="stat-card product-card">
              <div class="stat-icon">
                <i class="bi bi-box"></i>
              </div>
              <div class="stat-content">
                <h4>Toplam Ürün</h4>
                <div class="stat-value">{{ storeData.products.length }}</div>
                <div class="stat-progress">
                  <div class="progress-bar" :style="{width: `${(storeData.products.length/10) * 100}%`}"></div>
                </div>
              </div>
            </div>
            
            <div class="stat-card stock-card">
              <div class="stat-icon">
                <i class="bi bi-archive"></i>
              </div>
              <div class="stat-content">
                <h4>Toplam Stok</h4>
                <div class="stat-value">{{ totalStock }}</div>
                <div class="stat-progress">
                  <div class="progress-bar" :style="{width: `${(totalStock/2000) * 100}%`}"></div>
                </div>
              </div>
            </div>
            
            <div class="stat-card featured-card">
              <div class="stat-icon">
                <i class="bi bi-star"></i>
              </div>
              <div class="stat-content">
                <h4>Öne Çıkanlar</h4>
                <div class="stat-value">{{ featuredProducts }}</div>
                <div class="stat-progress">
                  <div class="progress-bar" :style="{width: `${(featuredProducts/storeData.products.length) * 100}%`}"></div>
                </div>
              </div>
            </div>
            
            <div class="stat-card price-card">
              <div class="stat-icon">
                <i class="bi bi-currency-lira"></i>
              </div>
              <div class="stat-content">
                <h4>Ortalama Fiyat</h4>
                <div class="stat-value">{{ formatPrice(averagePrice) }}</div>
                <div class="stat-progress">
                  <div class="progress-bar" :style="{width: `${(averagePrice/50000) * 100}%`}"></div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Products Section -->
          <div class="section">
            <div class="section-header">
              <h3><i class="bi bi-boxes"></i> Ürünler</h3>
              <div class="action-buttons">
                <button class="btn secondary-btn">
                  <i class="bi bi-filter"></i> Filtrele
                </button>
                <router-link to="/store/dashboard/add-product">
                  <button class="btn primary-btn">
                  <i class="bi bi-plus-circle"></i> Yeni Ürün
                </button>
                </router-link>
              </div>
            </div>
            
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>SKU</th>
                    <th>Fiyat (KDV Hariç)</th>
                    <th>KDV Oranı</th>
                    <th>Fiyat (KDV Dahil)</th>
                    <th>Stok</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="product in storeData.products" :key="product.id">
                    <td class="product-cell">
                      <div class="product-image">
                        <img :src="product.imageUrl" :alt="product.name" />
                      </div>
                      <div class="product-details">
                        <h5>{{ product.name }}</h5>
                        <small>{{ truncateText(product.description, 50) }}</small>
                      </div>
                    </td>
                    <td><span class="sku-badge">{{ product.sku }}</span></td>
                    <td class="price-cell">{{ product.price }}</td>
                    <td class="tax-cell">%{{ product.vatRate }}</td>
                    <td class="price-cell">{{ product.vatPrice }}</td>
                    <td>
                      <span class="stock-indicator" :class="getStockClass(product.stock)">
                        {{ product.stock }}
                      </span>
                    </td>
                    <td>
                      <span class="status-badge" :class="product.isActive ? 'active' : 'inactive'">
                        {{ product.isActive ? 'Aktif' : 'Pasif' }}
                      </span>
                    </td>
                    <td class="actions-cell">
                      <button class="icon-btn edit-btn" title="Düzenle">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="icon-btn view-btn" title="Görüntüle">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button @click="deleteProduct(product.id)" class="icon-btn delete-btn" title="Sil">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="table-footer">
              <div class="showing-entries">
                1-{{ storeData.products.length }} / {{ storeData.products.length }} ürün gösteriliyor
              </div>
              <div class="pagination">
                <button class="pagination-btn" disabled>
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button class="pagination-btn active">1</button>
                <button class="pagination-btn" disabled>
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
  
          <!-- Store Info Section -->
          <div class="info-section">
            <div class="section-header">
              <h3><i class="bi bi-shop"></i> Mağaza Bilgileri</h3>
              <button class="btn outline-btn">
                <i class="bi bi-pencil"></i> Düzenle
              </button>
            </div>
            
            <div class="store-info-panels">
              <div class="info-panel">
                <div class="panel-header">
                  <i class="bi bi-info-circle"></i>
                  <h4>Genel Bilgiler</h4>
                </div>
                <div class="panel-body">
                  <div class="info-item">
                    <span class="info-label">Mağaza Adı</span>
                    <span class="info-value">{{ storeData.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">E-posta</span>
                    <span class="info-value">{{ storeData.email }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Telefon</span>
                    <span class="info-value">{{ storeData.phone }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Adres</span>
                    <span class="info-value">{{ storeData.address }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Katılım</span>
                    <span class="info-value">{{ new Date(storeData.createdAt).toLocaleDateString('tr-TR') }}</span>
                  </div>
                </div>
              </div>
              
              <div class="info-panel">
                <div class="panel-header">
                  <i class="bi bi-building"></i>
                  <h4>Şirket Bilgileri</h4>
                </div>
                <div class="panel-body">
                  <div class="info-item">
                    <span class="info-label">Şirket Adı</span>
                    <span class="info-value">{{ storeData.companyName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Şirket Türü</span>
                    <span class="info-value">{{ storeData.companyType.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Vergi Oranı</span>
                    <span class="info-value">%{{ storeData.companyType.taxRate }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Vergi Dairesi</span>
                    <span class="info-value">{{ storeData.taxOffice }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Vergi No</span>
                    <span class="info-value">{{ storeData.taxNumber }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">IBAN</span>
                    <span class="info-value">{{ storeData.iban }}</span>
                  </div>
                </div>
              </div>
              
              <div class="info-panel">
                <div class="panel-header">
                  <i class="bi bi-person"></i>
                  <h4>Yetkili Bilgileri</h4>
                </div>
                <div class="panel-body">
                  <div class="info-item">
                    <span class="info-label">Ad Soyad</span>
                    <span class="info-value">{{ storeData.ownerFirstName }} {{ storeData.ownerLastName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">E-posta</span>
                    <span class="info-value">{{ storeData.ownerEmail }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Telefon</span>
                    <span class="info-value">{{ storeData.ownerPhone }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>
<script setup>
import apiClient from '@/api';
import Swal from 'sweetalert2';
import { ref, computed, onMounted } from 'vue';
    const model = defineModel({})
    const storeData = model.value
  // Computed properties for dashboard statistics
  const totalStock = computed(() => {
    return storeData.products.reduce((total, product) => total + product.stock, 0);
  });
  
  const featuredProducts = computed(() => {
    return storeData.products.filter(product => product.isFeature).length;
  });
  
  const averagePrice = computed(() => {
    const total = storeData.products.reduce((sum, product) => sum + parseFloat(product.vatPrice), 0);
    return (total / storeData.products.length).toFixed(2);
  });
  
  // Helper functions
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('tr-TR') + ' ₺';
  };
  
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };
  
  const getStockClass = (stock) => {
    if (stock <= 10) return 'low';
    if (stock <= 50) return 'medium';
    return 'high';
  };

  const deleteProduct = (id) => {
    apiClient.delete(`/product/${id}`)
      .then(() => {
        storeData.products = storeData.products.filter(product => product.id !== id);
        Swal.fire({
          icon: 'success',
          title: 'Ürün silindi.',
          showConfirmButton: false,
          timer: 1000
        });
      })
      .catch(error => {
        console.error('Delete product error:', error);
      });
  }
  onMounted(() => {
  })
</script>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'); 
<style scoped>

/* ===== MAIN CONTENT STYLES ===== */
.main-content {
  flex-grow: 1;
  background-color: #f0f2f5;
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Top Bar Styles */
.top-bar {
  background-color: white;
  padding: 15px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.toggle-sidebar {
  display: none;
  font-size: 24px;
  cursor: pointer;
  color: #555;
}

.search-box {
  flex-grow: 0.4;
  max-width: 400px;
  background-color: #f0f2f5;
  border-radius: 30px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
}

.search-box i {
  color: #666;
  margin-right: 10px;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
}

.notification {
  margin-right: 20px;
  position: relative;
  cursor: pointer;
}

.notification i {
  font-size: 20px;
  color: #555;
}

.notification .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff7f00;
  color: white;
  width: 18px;
  height: 18px;
  font-size: 11px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-dropdown {
  position: relative;
}

.profile-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 30px;
  transition: background-color 0.2s;
}

.profile-trigger:hover {
  background-color: #f0f2f5;
}

.profile-trigger span {
  margin-right: 10px;
  font-weight: 500;
  color: #333;
}

.profile-trigger img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 5px;
}

.profile-trigger i {
  color: #666;
  font-size: 12px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 180px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  padding: 8px 0;
  margin-top: 10px;
  transform-origin: top right;
  transform: scale(0);
  opacity: 0;
  transition: all 0.2s;
  z-index: 1000;
}

.profile-dropdown:hover .dropdown-menu {
  transform: scale(1);
  opacity: 1;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item i {
  margin-right: 10px;
  width: 18px;
  font-size: 16px;
}

.dropdown-item:hover {
  background-color: #f0f2f5;
}

.dropdown-item.logout {
  color: #dc3545;
}

.dropdown-item.logout:hover {
  background-color: rgba(220,53,69,0.1);
}

/* Dashboard Content Styles */
.dashboard-content {
  padding: 25px;
  flex-grow: 1;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: #222;
}

.store-status {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.date-display {
  background-color: white;
  padding: 8px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  font-size: 14px;
  color: #555;
  display: flex;
  align-items: center;
}

.date-display i {
  margin-right: 8px;
  color: #ff7f00;
}

.status-approved, .status-pending {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-approved {
  background-color: #e6f9e9;
  color: #0fa958;
}

.status-pending {
  background-color: #fff8e6;
  color: #ffad33;
}

/* Stats Cards Styles */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  padding: 20px;
  display: flex;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  margin-right: 15px;
  color: white;
  font-size: 24px;
}

.product-card .stat-icon {
  background-color: #6259ca;
}

.stock-card .stat-icon {
  background-color: #00b3b3;
}

.featured-card .stat-icon {
  background-color: #ffb703;
}

.price-card .stat-icon {
  background-color: #ff6b6b;
}

.stat-content {
  flex-grow: 1;
}

.stat-content h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #212529;
}

.stat-progress {
  height: 6px;
  background-color: #eeeeee;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease-in-out;
}

.product-card .progress-bar {
  background-color: #6259ca;
}

.stock-card .progress-bar {
  background-color: #00b3b3;
}

.featured-card .progress-bar {
  background-color: #ffb703;
}

.price-card .progress-bar {
  background-color: #ff6b6b;
}

/* Section Styles */
.section, .info-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  padding: 20px;
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
}

.section-header h3 i {
  margin-right: 8px;
  color: #ff7f00;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

/* Table Styles */
.table-container {
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 12px 20px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #eee;
}

.data-table td {
  padding: 12px 20px;
  vertical-align: middle;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.product-cell {
  display: flex;
  align-items: center;
}

.product-image {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details h5 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 500;
}

.product-details small {
  color: #6c757d;
  font-size: 12px;
}

.sku-badge {
  display: inline-block;
  background-color: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
  font-family: monospace;
}

.price-cell {
  font-weight: 600;
  color: #333;
}

.tax-cell {
  color: #333;
}

.stock-indicator {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stock-indicator.low {
  background-color: #fde0e0;
  color: #e53e3e;
}

.stock-indicator.medium {
  background-color: #fff3cd;
  color: #c27803;
}

.stock-indicator.high {
  background-color: #d4edda;
  color: #28a745;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e6f9e9;
  color: #0fa958;
}

.status-badge.inactive {
  background-color: #f8f9fa;
  color: #adb5bd;
}

.actions-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background-color: transparent;
  border-radius: 6px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.edit-btn:hover {
  background-color: rgba(23, 162, 184, 0.1);
  color: #17a2b8;
}

.view-btn:hover {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.delete-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
}

.showing-entries {
  font-size: 13px;
  color: #6c757d;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not([disabled]) {
  background-color: #f0f2f5;
  border-color: #ced4da;
}

.pagination-btn.active {
  background-color: #ff7f00;
  border-color: #ff7f00;
  color: white;
}

.pagination-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Store Info Panels */
.store-info-panels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.info-panel {
  border-radius: 8px;
  border: 1px solid #eee;
  background-color: #fff;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.info-panel:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.panel-header i {
  margin-right: 10px;
  color: #ff7f00;
  font-size: 18px;
}

.panel-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.panel-body {
  padding: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #6c757d;
  font-size: 12px;
  margin-bottom: 4px;
}

.info-value {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn i {
  margin-right: 8px;
}

.primary-btn {
  background-color: #ff7f00;
  color: white;
}

.primary-btn:hover {
  background-color: #e67300;
  box-shadow: 0 4px 10px rgba(255,127,0,0.3);
}

.secondary-btn {
  background-color: #f0f2f5;
  color: #555;
}

.secondary-btn:hover {
  background-color: #e9ecef;
  color: #333;
}

.outline-btn {
  background-color: transparent;
  border: 1px solid #ff7f00;
  color: #ff7f00;
}

.outline-btn:hover {
  background-color: rgba(255,127,0,0.1);
}

/* Responsive Styles */
@media screen and (max-width: 1200px) {
  .stats-cards, .store-info-panels {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 992px) {
  .sidebar {
    width: 70px;
    position: fixed;
    height: 100%;
  }
  
  .logo-container {
    justify-content: center;
  }
  
  .sidebar-header h3, .menu-item span {
    display: none;
  }
  
  .menu-item {
    justify-content: center;
    padding: 15px 0;
  }
  
  .menu-item i {
    margin-right: 0;
    font-size: 20px;
  }
  
  .main-content {
    margin-left: 70px;
  }
  
  .toggle-sidebar {
    display: block;
  }
}

@media screen and (max-width: 768px) {
  .stats-cards, .store-info-panels {
    grid-template-columns: 1fr;
  }
  
  .search-box {
    display: none;
  }
  
  .profile-trigger span {
    display: none;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .action-buttons {
    width: 100%;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}

@media screen and (max-width: 576px) {
  .dashboard-content {
    padding: 15px;
  }
  
  .date-display {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn {
    width: 100%;
  }
}
</style>