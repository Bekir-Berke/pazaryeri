<template>
    <div class="search-results-container">
      <div class="container">
        <div class="search-header">
          <h1>Arama Sonuçları</h1>
          <p v-if="searchQuery">
            <strong>"{{ searchQuery }}"</strong> için {{ totalResults }} sonuç bulundu
          </p>
        </div>
  
        <!-- Yükleme Durumu -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Ürünler yükleniyor...</p>
        </div>
  
        <!-- Hata Durumu -->
        <div v-else-if="error" class="error-message">
          <i class="bi bi-exclamation-triangle"></i>
          <p>{{ error }}</p>
          <button @click="fetchResults" class="btn-retry">Tekrar Dene</button>
        </div>
  
        <!-- Sonuç Bulunamadı -->
        <div v-else-if="products.length === 0" class="no-results">
          <i class="bi bi-search"></i>
          <h2>Sonuç Bulunamadı</h2>
          <p>Aramanızla eşleşen ürün bulunamadı.</p>
          <p>Öneriler:</p>
          <ul>
            <li>Farklı anahtar kelimeler deneyin</li>
            <li>Daha genel terimler kullanın</li>
            <li>Yazım hatalarını kontrol edin</li>
          </ul>
        </div>
  
        <!-- Sonuçlar -->
        <div v-else class="search-results">
          <div class="search-filters">
            <div class="filter-section">
              <h3>Filtreler</h3>
              <div class="filter-group">
                <h4>Kategoriler</h4>
                <div v-if="categories.length" class="filter-options">
                  <label v-for="category in categories" :key="category._id" class="filter-option">
                    <input 
                      type="checkbox" 
                      :value="category._id" 
                      v-model="selectedCategories"
                      @change="applyFilters"
                    >
                    <span>{{ category.name }}</span>
                  </label>
                </div>
              </div>
  
              <div class="filter-group">
                <h4>Markalar</h4>
                <div v-if="brands.length" class="filter-options">
                  <label v-for="brand in brands" :key="brand._id" class="filter-option">
                    <input 
                      type="checkbox" 
                      :value="brand._id" 
                      v-model="selectedBrands"
                      @change="applyFilters"
                    >
                    <span>{{ brand.name }}</span>
                  </label>
                </div>
              </div>
  
              <div class="filter-group">
                <h4>Fiyat Aralığı</h4>
                <div class="price-range">
                  <div class="range-inputs">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      v-model="priceRange.min"
                      @change="applyFilters"
                    >
                    <span>-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      v-model="priceRange.max"
                      @change="applyFilters"
                    >
                  </div>
                  <button @click="applyFilters" class="btn-apply">Uygula</button>
                </div>
              </div>
            </div>
          </div>
  
          <div class="results-content">
            <div class="results-toolbar">
              <div class="sort-options">
                <label for="sort-select">Sırala:</label>
                <select id="sort-select" v-model="sortOption" @change="applyFilters">
                  <option value="newest">En Yeni</option>
                  <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="popular">En Popüler</option>
                  <option value="rating">En Yüksek Puanlı</option>
                </select>
              </div>
              <div class="view-options">
                <button 
                  @click="viewMode = 'grid'" 
                  :class="{ active: viewMode === 'grid' }"
                  class="btn-view"
                >
                  <i class="bi bi-grid"></i>
                </button>
                <button 
                  @click="viewMode = 'list'" 
                  :class="{ active: viewMode === 'list' }"
                  class="btn-view"
                >
                  <i class="bi bi-list"></i>
                </button>
              </div>
            </div>
  
            <div :class="['products-container', `view-${viewMode}`]">
              <div 
                v-for="product in products" 
                :key="product.id" 
                class="product-card"
                @click="goToProduct(product.id)"
              >
                <div class="product-image">
                  <img 
                    :src="product.imageUrl" 
                    :alt="product.name"
                  >
                </div>
                <div class="product-details">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <div class="product-brand" v-if="product.brand">{{ product.brand.name }}</div>
                  <div class="product-rating">
                    <div class="stars">
                      <i 
                        v-for="star in 5" 
                        :key="star" 
                        :class="['bi', star <= Math.round(product.rating) ? 'bi-star-fill' : 'bi-star']"
                      ></i>
                    </div>
                    <span class="rating-count">({{ product.reviewCount || 0 }})</span>
                  </div>
                  <div class="product-price">{{ formatPrice(product.price) }} TL</div>
                </div>
              </div>
            </div>
  
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button 
                @click="changePage(currentPage - 1)" 
                :disabled="currentPage === 1"
                class="btn-page"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              
              <button 
                v-for="page in paginationRange" 
                :key="page" 
                @click="changePage(page)"
                :class="['btn-page', { active: currentPage === page }]"
              >
                {{ page }}
              </button>
              
              <button 
                @click="changePage(currentPage + 1)" 
                :disabled="currentPage === totalPages"
                class="btn-page"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import apiClient from '@/api';
  
  // Router ve Route
  const router = useRouter();
  const route = useRoute();
  
  // State
  const loading = ref(false);
  const error = ref(null);
  const products = ref([]);
  const categories = ref([]);
  const brands = ref([]);
  const totalResults = ref(0);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const viewMode = ref('grid');
  
  // Filtreler
  const searchQuery = ref('');
  const selectedCategories = ref([]);
  const selectedBrands = ref([]);
  const priceRange = ref({ min: '', max: '' });
  const sortOption = ref('newest');
  
  // Sonuçları getir - Bu fonksiyonu watch'dan önce tanımlıyoruz
  const fetchResults = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Arama parametrelerini oluştur
      const params = {
        q: searchQuery.value,
        page: currentPage.value,
        limit: 24,
        sort: sortOption.value
      };
      
      // Diğer filtreleri ekle
      if (selectedCategories.value.length) {
        params.categories = selectedCategories.value;
      }
      
      if (selectedBrands.value.length) {
        params.brands = selectedBrands.value;
      }
      
      if (priceRange.value.min) {
        params.min_price = priceRange.value.min;
      }
      
      if (priceRange.value.max) {
        params.max_price = priceRange.value.max;
      }
      
      // API isteği yap
      const response = await apiClient.get('/product/search', { params });
      
      // Sonuçları ayarla
      products.value = response.data.products || [];
      totalResults.value = response.data.pagination?.total || 0;
      totalPages.value = response.data.pagination?.totalPages || 1;
      
      // Kategoriler ve markalar varsa ayarla
      if (response.data.availableFilters) {
        categories.value = response.data.availableFilters.categories || [];
        brands.value = response.data.availableFilters.brands || [];
      }
      
    } catch (err) {
      console.error('Search error:', err);
      error.value = 'Arama sonuçları yüklenirken bir hata oluştu.';
    } finally {
      loading.value = false;
    }
  };
  
  // URL parametrelerini izle
  watch(() => route.query, (newQuery) => {
    // URL'den parametreleri al
    searchQuery.value = newQuery.q || '';
    currentPage.value = parseInt(newQuery.page) || 1;
    sortOption.value = newQuery.sort || 'newest';
    
    // Diğer filtreler için URL parametrelerini kontrol et
    if (newQuery.categories) {
      selectedCategories.value = Array.isArray(newQuery.categories) 
        ? newQuery.categories 
        : [newQuery.categories];
    } else {
      selectedCategories.value = [];
    }
    
    if (newQuery.brands) {
      selectedBrands.value = Array.isArray(newQuery.brands) 
        ? newQuery.brands 
        : [newQuery.brands];
    } else {
      selectedBrands.value = [];
    }
    
    priceRange.value.min = newQuery.min_price || '';
    priceRange.value.max = newQuery.max_price || '';
    
    // Arama sonuçlarını getir
    fetchResults();
  }, { immediate: true, deep: true });
  
  // Sayfalama hesaplamaları
  const paginationRange = computed(() => {
    const range = [];
    const maxVisible = 5;
    
    // Başlangıç sayfasını belirle
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages.value, start + maxVisible - 1);
    
    // Başlangıç ve bitiş sayfalarını ayarla
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    // Sayfa aralığını oluştur
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  });
  
  // Filtreleri uygula ve URL'yi güncelle
  const applyFilters = () => {
    const query = { ...route.query };
    
    // Arama parametrelerini güncelle
    query.page = 1; // Filtre değiştiğinde ilk sayfaya dön
    query.sort = sortOption.value;
    
    // Kategori filtrelerini ekle
    if (selectedCategories.value.length) {
      query.categories = selectedCategories.value;
    } else {
      delete query.categories;
    }
    
    // Marka filtrelerini ekle
    if (selectedBrands.value.length) {
      query.brands = selectedBrands.value;
    } else {
      delete query.brands;
    }
    
    // Fiyat aralığı filtrelerini ekle
    if (priceRange.value.min) {
      query.min_price = priceRange.value.min;
    } else {
      delete query.min_price;
    }
    
    if (priceRange.value.max) {
      query.max_price = priceRange.value.max;
    } else {
      delete query.max_price;
    }
    
    // URL'yi güncelle
    router.push({ path: '/search', query });
  };
  
  // Sayfa değiştir
  const changePage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    
    // Route'u güncelle
    router.push({
      path: '/search',
      query: { ...route.query, page }
    });
  };
  
  // Ürün detay sayfasına git
  const goToProduct = (productId) => {
    router.push(`/product/${productId}`);
  };
  
  // Fiyat formatla
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price);
  };
  
  onMounted(() => {
    if (route.query.q) {
      fetchResults();
    }
  });
  </script>
  
  <style scoped>
  .search-results-container {
    padding: 30px 0;
  }
  
  .search-header {
    margin-bottom: 30px;
  }
  
  .search-header h1 {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }
  
  /* Yükleme İndikatörü */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 0;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: #ff7f00;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Hata Mesajı */
  .error-message {
    text-align: center;
    padding: 40px 0;
  }
  
  .error-message i {
    font-size: 3rem;
    color: #dc3545;
    margin-bottom: 15px;
  }
  
  .btn-retry {
    margin-top: 15px;
    padding: 8px 20px;
    background-color: #ff7f00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* Sonuç Bulunamadı */
  .no-results {
    text-align: center;
    padding: 40px 0;
  }
  
  .no-results i {
    font-size: 3rem;
    color: #6c757d;
    margin-bottom: 15px;
  }
  
  .no-results h2 {
    color: #343a40;
    margin-bottom: 15px;
  }
  
  .no-results ul {
    max-width: 400px;
    margin: 0 auto;
    text-align: left;
    list-style-type: disc;
    padding-left: 20px;
  }
  
  .no-results li {
    margin-bottom: 5px;
  }
  
  /* Ana İçerik Düzeni */
  .search-results {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 30px;
  }
  
  /* Filtreler */
  .search-filters {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    background-color: #f9f9f9;
  }
  
  .filter-section h3 {
    font-size: 1.2rem;
    margin-bottom: 20px;
    font-weight: 600;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 10px;
  }
  
  .filter-group {
    margin-bottom: 25px;
  }
  
  .filter-group h4 {
    font-size: 1rem;
    margin-bottom: 10px;
    font-weight: 500;
  }
  
  .filter-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-option {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .filter-option input {
    margin-right: 8px;
  }
  
  .price-range {
    margin-top: 10px;
  }
  
  .range-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  
  .range-inputs input {
    width: 80px;
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
  }
  
  .btn-apply {
    padding: 6px 12px;
    background-color: #ff7f00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  /* Sonuçlar Araç Çubuğu */
  .results-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .sort-options {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .sort-options select {
    padding: 8px 12px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .view-options {
    display: flex;
    gap: 5px;
  }
  
  .btn-view {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ced4da;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-view.active {
    background-color: #ff7f00;
    color: white;
    border-color: #ff7f00;
  }
  
  /* Ürün Konteyneri */
  .products-container {
    display: grid;
    gap: 20px;
  }
  
  .view-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .view-list {
    grid-template-columns: 1fr;
  }
  
  /* Ürün Kartı */
  .product-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    background-color: white;
    cursor: pointer;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .view-grid .product-card {
    display: flex;
    flex-direction: column;
  }
  
  .view-list .product-card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
  
  .product-image {
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-color: #f9f9f9;
  }
  
  .product-image img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .product-details {
    padding: 15px;
  }
  
  .product-name {
    font-size: 1rem;
    margin-bottom: 8px;
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .product-brand {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  .product-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 10px;
  }
  
  .stars {
    display: flex;
    gap: 2px;
    color: #ffc107;
  }
  
  .rating-count {
    color: #6c757d;
    font-size: 0.8rem;
  }
  
  .product-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: #ff7f00;
  }
  
  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 30px;
  }
  
  .btn-page {
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border: 1px solid #ced4da;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-page.active {
    background-color: #ff7f00;
    color: white;
    border-color: #ff7f00;
  }
  
  .btn-page:disabled {
    color: #adb5bd;
    cursor: not-allowed;
  }
  
  /* Responsive Tasarım */
  @media (max-width: 992px) {
    .search-results {
      grid-template-columns: 1fr;
    }
    
    .search-filters {
      margin-bottom: 20px;
    }
  }
  
  @media (max-width: 768px) {
    .view-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
    
    .view-list .product-card {
      grid-template-columns: 120px 1fr;
    }
    
    .results-toolbar {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
  }
  
  @media (max-width: 576px) {
    .product-image {
      height: 150px;
    }
    
    .view-list .product-card {
      grid-template-columns: 100px 1fr;
    }
  }
  </style>