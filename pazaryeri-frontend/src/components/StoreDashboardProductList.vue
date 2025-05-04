<template>
  <div class="product-list-container">
    <!-- Filters -->
    <div class="filters-section">
      <div class="search-box">
        <i class="bi bi-search"></i>
        <input type="text" v-model="searchQuery" placeholder="Ürün ara..." @input="applyFilters" />
      </div>

      <div class="filter-controls">
        <div class="filter-dropdown">
          <select v-model="filters.brand" @change="applyFilters" class="form-select">
            <option value="">Tüm Markalar</option>
            <option v-for="brand in brands" :key="brand" :value="brand">
              {{ brand.name }}
            </option>
          </select>
        </div>

        <div class="filter-dropdown">
          <select v-model="filters.stockStatus" @change="applyFilters" class="form-select">
            <option value="">Tüm Stok Durumları</option>
            <option value="low">Düşük Stok (≤ 10)</option>
            <option value="medium">Orta Stok (≤ 50)</option>
            <option value="high">Yüksek Stok (> 50)</option>
          </select>
        </div>

        <div class="filter-dropdown">
          <select v-model="filters.featured" @change="applyFilters" class="form-select">
            <option value="">Tüm Ürünler</option>
            <option value="true">Öne Çıkanlar</option>
            <option value="false">Standart Ürünler</option>
          </select>
        </div>

        <div class="filter-dropdown">
          <select v-model="sortOrder" @change="applyFilters" class="form-select">
            <option value="name_asc">İsim (A-Z)</option>
            <option value="name_desc">İsim (Z-A)</option>
            <option value="price_asc">Fiyat (Düşük-Yüksek)</option>
            <option value="price_desc">Fiyat (Yüksek-Düşük)</option>
            <option value="stock_asc">Stok (Az-Çok)</option>
            <option value="stock_desc">Stok (Çok-Az)</option>
            <option value="date_desc">Eklenme (Yeni-Eski)</option>
            <option value="date_asc">Eklenme (Eski-Yeni)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="loading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Yükleniyor...</span>
      </div>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="no-results">
      <i class="bi bi-search"></i>
      <p>Arama kriterlerinize uygun ürün bulunamadı.</p>
      <button @click="resetFilters" class="btn secondary-btn">Filtreleri Sıfırla</button>
    </div>

    <div v-else class="products-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-image">
          <img :src="product.imageUrl" :alt="product.name">
          <span v-if="product.isFeature" class="featured-badge">Öne Çıkan</span>
        </div>
        <div class="product-info">
          <h5 class="product-name">{{ product.name }}</h5>
          <div class="product-meta">
            <span class="brand-name">{{ product.brand.name }}</span>
            <span class="stock-badge" :class="getStockClass(product.stock)">
              {{ getStockLabel(product.stock) }}
            </span>
          </div>
          <p class="product-description">{{ truncateText(product.description, 60) }}</p>
          <div class="product-attributes">
            <span v-for="attr in limitAttributes(product.attributes)" :key="attr.id" class="attribute-tag">
              {{ attr.name }}: {{ attr.value }}
            </span>
            <span v-if="product.attributes.length > 3" class="more-attributes">
              +{{ product.attributes.length - 3 }} daha
            </span>
          </div>
          <div class="product-variants" v-if="product.variants.length > 0">
            <span class="variants-label">{{ product.variants.length }} Varyant</span>
          </div>
        </div>
        <div class="product-details">
          <div class="product-price">
            <span class="price">{{ formatPrice(product.vatPrice) }}</span>
            <span class="sku">SKU: {{ product.sku }}</span>
          </div>
          <div class="stock-info">
            <div class="stock-bar">
              <div class="stock-level" :style="{ width: getStockPercentage(product.stock) + '%' }"
                :class="getStockClass(product.stock)"></div>
            </div>
            <span class="stock-count">{{ product.stock }} adet</span>
          </div>
          <div class="product-actions">
            <button class="btn action-btn edit-btn" @click="editProduct(product)">
              <i class="bi bi-pencil"></i>
              Düzenle
            </button>
            <div class="dropdown">
              <button class="btn action-btn more-btn">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <div class="dropdown-menu">
                <a href="#" @click.prevent="viewProductDetails(product)" class="dropdown-item">
                  <i class="bi bi-eye"></i> Detaylı Görüntüle
                </a>
                <a href="#" @click.prevent="toggleFeatured(product)" class="dropdown-item">
                  <i :class="product.isFeature ? 'bi bi-star-fill' : 'bi bi-star'"></i>
                  {{ product.isFeature ? 'Öne Çıkarma' : 'Öne Çıkar' }}
                </a>
                <a href="#" @click.prevent="duplicateProduct(product)" class="dropdown-item">
                  <i class="bi bi-copy"></i> Kopyala
                </a>
                <a href="#" @click.prevent="toggleActive(product)" class="dropdown-item">
                  <i :class="product.isActive ? 'bi bi-toggle-on' : 'bi bi-toggle-off'"></i>
                  {{ product.isActive ? 'Pasif Yap' : 'Aktif Yap' }}
                </a>
                <a href="#" @click.prevent="deleteProduct(product)" class="dropdown-item text-danger">
                  <i class="bi bi-trash"></i> Sil
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination-container" v-if="filteredProducts.length > 0">
      <div class="showing-info">
        {{ paginationInfo }}
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
          <i class="bi bi-chevron-left"></i>
        </button>

        <button v-for="page in displayedPages" :key="page" class="pagination-btn"
          :class="{ 'active': page === currentPage }" @click="goToPage(page)">
          {{ page }}
        </button>

        <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
    <ProductEdit :is-open="isEditModalOpen" :product="selectedProduct" @close="closeEditModal"
      @update="handleProductUpdate" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import apiClient from '@/api';
import ProductEdit from './ProductEdit.vue';
const model = defineModel({})
const brands = ref(null);
const loading = ref(false);
const products = model.value
const currentPage = ref(1);
const itemsPerPage = ref(9);
const isEditModalOpen = ref(false);
const selectedProduct = ref({});

const editProduct = (product) => {
  selectedProduct.value = product;
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const handleProductUpdate = () => {
  Swal.fire({
    title: 'Başarılı!',
    text: 'Ürün başarıyla güncellendi.',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
};

const searchQuery = ref('');
const sortOrder = ref('date_desc');
const filters = ref({
  brand: '',
  stockStatus: '',
  featured: ''
});
onMounted(() => {
  apiClient.get('/brand').then((response) => {
    brands.value = response.data;
  }).catch((error) => {
    console.error('Error fetching brands:', error);
  });
})
// Computed properties

const filteredProducts = computed(() => {
  let result = [...products];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    );
  }

  // Apply brand filter
  if (filters.value.brand) {
    result = result.filter(product => product.brand.id === filters.value.brand.id);
  }

  // Apply stock status filter
  if (filters.value.stockStatus) {
    if (filters.value.stockStatus === 'low') {
      result = result.filter(product => product.stock <= 10);
    } else if (filters.value.stockStatus === 'medium') {
      result = result.filter(product => product.stock > 10 && product.stock <= 50);
    } else if (filters.value.stockStatus === 'high') {
      result = result.filter(product => product.stock > 50);
    }
  }

  // Apply featured filter
  if (filters.value.featured) {
    const isFeatured = filters.value.featured === 'true';
    result = result.filter(product => product.isFeature === isFeatured);
  }

  // Apply sort
  const [field, direction] = sortOrder.value.split('_');

  result.sort((a, b) => {
    let comparison = 0;

    if (field === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (field === 'price') {
      comparison = parseFloat(a.price) - parseFloat(b.price);
    } else if (field === 'stock') {
      comparison = a.stock - b.stock;
    } else if (field === 'date') {
      comparison = new Date(a.createdAt) - new Date(b.createdAt);
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return result;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProducts.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value);
});

const displayedPages = computed(() => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  let l = 1;

  for (let i = 1; i <= totalPages.value; i++) {
    if (i === 1 || i === totalPages.value ||
      (i >= currentPage.value - delta && i <= currentPage.value + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

const paginationInfo = computed(() => {
  const total = filteredProducts.value.length;
  if (total === 0) return '';

  const start = (currentPage.value - 1) * itemsPerPage.value + 1;
  const end = Math.min(start + itemsPerPage.value - 1, total);

  return `${start}-${end} / ${total} ürün`;
});

// Helper methods
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString('tr-TR') + ' ₺';
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

const getStockClass = (stock) => {
  if (stock <= 10) return 'low-stock';
  if (stock <= 50) return 'medium-stock';
  return 'high-stock';
};

const getStockLabel = (stock) => {
  if (stock <= 10) return 'Düşük Stok';
  if (stock <= 50) return 'Orta Stok';
  return 'Yüksek Stok';
};

const getStockPercentage = (stock) => {
  // Cap at 100% for visual purposes
  const maxStock = 100;
  return Math.min(Math.round((stock / maxStock) * 100), 100);
};

const limitAttributes = (attributes) => {
  return attributes.slice(0, 3); // Show only first 3 attributes
};

// Filter and pagination methods
const applyFilters = () => {
  currentPage.value = 1; // Reset to first page when filters change
};

const resetFilters = () => {
  searchQuery.value = '';
  sortOrder.value = 'date_desc';
  filters.value = {
    brand: '',
    stockStatus: '',
    featured: ''
  };
  currentPage.value = 1;
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.product-list-container {
  font-family: 'Inter', sans-serif;
  color: #333;
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
  max-width: 100%;
}

/* Filters Section */
.filters-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.search-box {
  flex-grow: 1;
  position: relative;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #ff7f00;
  box-shadow: 0 0 0 3px rgba(255, 127, 0, 0.15);
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-dropdown {
  min-width: 140px;
}

.form-select {
  width: 100%;
  padding: 8px 30px 8px 12px;
  font-size: 14px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23343a40' viewBox='0 0 16 16'%3e%3cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px;
}

.form-select:focus {
  outline: none;
  border-color: #ff7f00;
  box-shadow: 0 0 0 3px rgba(255, 127, 0, 0.15);
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  border: 1px solid #eaeaea;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.12);
  border-color: #d9d9d9;
}

.product-image {
  position: relative;
  height: 200px;
  width: 100%;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #f0f0f0;
}

.product-image img {
  max-width: 90%;
  max-height: 90%;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: all 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.featured-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff7f00, #ff6a00);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.product-info {
  padding: 16px;
  flex-grow: 1;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.brand-name {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  background-color: #f8f9fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.stock-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.stock-badge.low-stock {
  background-color: #ffe8e8;
  color: #dc3545;
}

.stock-badge.medium-stock {
  background-color: #fff3cd;
  color: #856404;
}

.stock-badge.high-stock {
  background-color: #d4edda;
  color: #155724;
}

.product-description {
  font-size: 13px;
  color: #6c757d;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.product-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 10px 0;
}

.attribute-tag {
  background-color: #f0f2f5;
  color: #555;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #e6e6e6;
}

.more-attributes {
  font-size: 12px;
  color: #6c757d;
}

.product-variants {
  margin-top: auto;
}

.variants-label {
  font-size: 12px;
  background-color: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 4px;
}

.product-details {
  padding: 15px;
  background-color: #fcfcfc;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.price {
  font-size: 18px;
  font-weight: 700;
  color: #ff7f00;
}

.sku {
  font-size: 12px;
  color: #6c757d;
}

.stock-info {
  margin-bottom: 16px;
}

.stock-bar {
  height: 6px;
  background-color: #ececec;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 6px;
}

.stock-level {
  height: 100%;
  border-radius: 10px;
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.stock-level.low-stock {
  background-color: #ff5252;
}

.stock-level.medium-stock {
  background-color: #ffb142;
}

.stock-level.high-stock {
  background-color: #20bf6b;
}

.stock-count {
  font-size: 12px;
  color: #6c757d;
  display: block;
  text-align: right;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 6px;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.edit-btn {
  background-color: #ff7f00;
  color: white;
  flex-grow: 1;
  margin-right: 8px;
  box-shadow: 0 2px 5px rgba(255, 127, 0, 0.2);
}

.edit-btn:hover {
  background-color: #ff6a00;
  box-shadow: 0 4px 8px rgba(255, 127, 0, 0.3);
}

.edit-btn i {
  margin-right: 6px;
}

.more-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  border: 1px solid #e6e6e6;
}

/* Dropdown menu */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  bottom: 100%;
  margin-bottom: 5px;
  background-color: white;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  min-width: 180px;
  z-index: 10;
  display: none;
}

.dropdown:hover .dropdown-menu {
  display: block;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  font-size: 13px;
  color: #495057;
  text-decoration: none;
}

.dropdown-item i {
  margin-right: 8px;
  width: 16px;
  font-size: 14px;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.text-danger {
  color: #dc3545;
}

.dropdown-item.text-danger:hover {
  background-color: #ffe8e8;
}

/* Loading, Empty States, and Pagination */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.25rem;
}

.no-results {
  background-color: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.no-results i {
  font-size: 48px;
  color: #dee2e6;
  margin-bottom: 16px;
}

.no-results p {
  margin-bottom: 20px;
  color: #6c757d;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn {
  background-color: #f0f2f5;
  color: #495057;
}

.secondary-btn:hover {
  background-color: #e9ecef;
  color: #212529;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.showing-info {
  font-size: 14px;
  color: #6c757d;
}

.pagination-controls {
  display: flex;
  gap: 6px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.pagination-btn.active {
  background-color: #ff7f00;
  border-color: #ff7f00;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-controls {
    flex-wrap: wrap;
  }

  .filter-dropdown {
    flex-grow: 1;
    min-width: 45%;
  }

  .pagination-container {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .showing-info {
    order: 2;
    margin-top: 8px;
  }

  .pagination-controls {
    order: 1;
  }
}

@media (max-width: 992px) {
  .product-list-container {
    padding-left: 90px;
    /* Adjust based on your collapsed sidebar width */
  }
}

@media (max-width: 768px) {
  .product-list-container {
    padding-left: 20px;
  }
}
</style>