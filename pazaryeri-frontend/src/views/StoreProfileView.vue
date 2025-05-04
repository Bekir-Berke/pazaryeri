<template>
  <div class="store-profile-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Mağaza bilgileri yükleniyor...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <h3>Bir hata oluştu</h3>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchStoreData">Tekrar Dene</button>
    </div>

    <!-- Store Profile Content -->
    <div v-else-if="store" class="store-content">
      <!-- Store Header -->
      <div class="store-header">
        <div class="store-info">
          <h1>{{ store.name }}</h1>
          <div class="store-contact">
            <div class="contact-item">
              <i class="bi bi-geo-alt-fill"></i>
              <span>{{ store.address }}</span>
            </div>
            <div class="contact-item">
              <i class="bi bi-telephone-fill"></i>
              <span>{{ formatPhone(store.phone) }}</span>
            </div>
            <div class="contact-item">
              <i class="bi bi-envelope-fill"></i>
              <span>{{ store.email }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Section -->
      <div class="products-section">
        <h2>Mağaza Ürünleri <span class="product-count">({{ store.products.length }})</span></h2>
        
        <!-- Product Filters -->
        <div class="product-filters">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Ürün ara..." 
              @input="filterProducts"
            >
          </div>
          <div class="filter-options">
            <select v-model="sortOption" @change="filterProducts">
              <option value="nameAsc">İsme Göre (A-Z)</option>
              <option value="nameDesc">İsme Göre (Z-A)</option>
              <option value="priceLow">Fiyat (Düşükten Yükseğe)</option>
              <option value="priceHigh">Fiyat (Yüksekten Düşüğe)</option>
              <option value="newest">En Yeni</option>
            </select>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="product-grid" v-if="filteredProducts.length > 0">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card">
            <div class="product-image">
              <img :src="product.imageUrl" :alt="product.name">
              <div class="product-badge" v-if="product.isFeature">Öne Çıkan</div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-price">{{ formatPrice(product.vatPrice) }}</p>
              <button class="btn-view-product" @click="viewProductDetails(product.id)">
                <i class="bi bi-eye"></i> Ürünü İncele
              </button>
            </div>
          </div>
        </div>

        <!-- No Products Found -->
        <div v-else class="no-products">
          <i class="bi bi-search-heart"></i>
          <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api';

const route = useRoute();
const router = useRouter();
const storeId = route.params.id;

const store = ref(null);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const sortOption = ref('nameAsc');
const filteredProducts = ref([]);

// Fetch store data
const fetchStoreData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await apiClient.get(`/store/${storeId}`);
    store.value = response.data;
    filteredProducts.value = [...store.value.products];
    filterProducts();
  } catch (err) {
    console.error('Error fetching store data:', err);
    error.value = 'Mağaza bilgileri yüklenirken bir sorun oluştu.';
  } finally {
    loading.value = false;
  }
};

// Format phone number: 2163334455 -> 0216 333 44 55
const formatPhone = (phone) => {
  if (!phone) return '';
  return `0${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8)}`;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

// Get appropriate class for stock display
const getStockClass = (stock) => {
  if (stock <= 0) return 'out-of-stock';
  if (stock < 10) return 'low-stock';
  return 'in-stock';
};

// Filter and sort products
const filterProducts = () => {
  if (!store.value) return;
  
  let filtered = [...store.value.products];
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) || 
      (product.description && product.description.toLowerCase().includes(query))
    );
  }
  
  // Apply sorting
  switch (sortOption.value) {
    case 'nameAsc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'nameDesc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'priceLow':
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case 'priceHigh':
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case 'newest':
      filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      break;
  }
  
  filteredProducts.value = filtered;
};

// Navigate to product details page
const viewProductDetails = (productId) => {
  router.push(`/product/${productId}`);
};

// Initialize data
onMounted(() => {
  fetchStoreData();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');

.store-profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  font-family: 'Inter', sans-serif;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #ff7f00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
  padding: 24px;
  background-color: #fff5f5;
  border-radius: 8px;
  color: #e53e3e;
}

.error-icon {
  font-size: 28px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #fed7d7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-weight: bold;
}

.btn-retry {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-retry:hover {
  background-color: #c53030;
}

/* Store Header */
.store-header {
  background-color: #f9f9f9;
  padding: 32px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.store-info h1 {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
}

.store-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
}

.contact-item i {
  color: #ff7f00;
}

/* Products Section */
.products-section {
  margin-top: 32px;
}

.products-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-count {
  font-size: 16px;
  font-weight: 500;
  color: #777;
}

/* Product Filters */
.product-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 280px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
}

.search-box input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-box input:focus {
  outline: none;
  border-color: #ff7f00;
}

.filter-options select {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
}

.filter-options select:focus {
  outline: none;
  border-color: #ff7f00;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #f8f9fa;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff7f00;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  height: 44px; /* 2 lines at most */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff7f00;
  margin-bottom: 8px;
}

.product-stock {
  font-size: 14px;
  margin-bottom: 16px;
}

.in-stock {
  color: #48bb78;
}

.low-stock {
  color: #f6ad55;
}

.out-of-stock {
  color: #e53e3e;
}

.btn-view-product {
  width: 100%;
  padding: 8px 16px;
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-view-product:hover {
  background-color: #e2e2e2;
}

/* No Products Found */
.no-products {
  text-align: center;
  padding: 40px 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #777;
}

.no-products i {
  font-size: 36px;
  margin-bottom: 16px;
  color: #aaa;
}

/* Responsive Design */
@media (max-width: 768px) {
  .store-contact {
    flex-direction: column;
    gap: 12px;
  }

  .product-filters {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filter-options {
    width: 100%;
  }
  
  .filter-options select {
    width: 100%;
  }
}
</style>