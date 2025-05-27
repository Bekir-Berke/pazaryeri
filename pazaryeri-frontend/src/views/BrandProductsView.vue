<template>
  <div class="brand-products-container">
    <div class="brand-header">
      <div class="back-button">
        <router-link :to="{ name: 'brands' }" class="back-link">
          <i class="bi bi-arrow-left"></i> Markalara Dön
        </router-link>
      </div>
      <h1>{{ brand?.name }} Ürünleri</h1>
    </div>

    <div class="filters-container">
      <div class="search-filter">
        <i class="bi bi-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Ürün ara..."
          @input="filterProducts"
        />
      </div>
      <div class="sort-filter">
        <select v-model="sortBy" @change="sortProducts">
          <option value="name">İsme Göre</option>
          <option value="name-desc">İsme Göre (Z-A)</option>
          <option value="price">Fiyata Göre (Düşükten Yükseğe)</option>
          <option value="price-desc">Fiyata Göre (Yüksekten Düşüğe)</option>
        </select>
      </div>
    </div>

    <div class="products-grid">
      <div v-for="product in filteredProducts.products" :key="product.id" class="product-card">
        <router-link :to="`/product/${product.id}`">
          <div class="product-image">
            <img :src="product.imageUrl" :alt="product.name" />
          </div>
        </router-link>
        <div class="product-info">
          <h2>{{ product.name }}</h2>
          <p class="product-price">{{ formatPrice(product.vatPrice) }} TL</p>
          <p class="product-description">{{ product.description }}</p>
          <button class="add-to-cart-btn" @click="addToCart(product)">
            <i class="bi bi-cart-plus"></i>
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>

    <div v-if="filteredProducts.length === 0" class="no-results">
      <i class="bi bi-search"></i>
      <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
      <button @click="resetFilters" class="reset-btn">Filtreleri Sıfırla</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api';
import { useToast } from 'vue-toast-notification';

const route = useRoute();
const brand = ref(null);
const products = ref([]);
const $toast = useToast();
const filteredProducts = ref([]);
const searchQuery = ref('');
const sortBy = ref('name');

const fetchBrandAndProducts = async () => {
  try {
    // Marka bilgilerini al
    const brandResponse = await apiClient.get(`/brand/${route.params.id}`);
    brand.value = brandResponse.data;

    // Markanın ürünlerini al
    const productsResponse = await apiClient.get(`/brand/${route.params.id}`);
    products.value = productsResponse.data;
    filteredProducts.value = productsResponse.data;
  } catch (error) {
    console.error('Veriler yüklenirken hata oluştu:', error);
  }
};

const filterProducts = () => {
  if (!searchQuery.value) {
    filteredProducts.value = products.value;
    return;
  }

  const query = searchQuery.value.toLowerCase();
  filteredProducts.value = products.value.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );
};

const addToCart = (product) => {
  const productDto = {
    productId: product.id,
    quantity: 1,
  };
  apiClient
    .post("/cart", productDto)
    .then((response) => {
      $toast.success(`${product.name} sepete eklendi`, { duration: 1000 });
    })
    .catch((error) => {
      console.error(error);
      $toast.error("Sepete eklenirken bir hata oluştu.", { duration: 1000 });
    });
};

const sortProducts = () => {
  filteredProducts.value.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      default:
        return 0;
    }
  });
};

const resetFilters = () => {
  searchQuery.value = '';
  sortBy.value = 'name';
  filteredProducts.value = products.value;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR').format(price);
};

onMounted(() => {
  fetchBrandAndProducts();
});
</script>

<style scoped>
.brand-products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.brand-header {
  margin-bottom: 2rem;
  position: relative;
}

.back-button {
  margin-bottom: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover {
  color: #ff7f00;
}

.brand-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  position: relative;
}

.brand-header h1::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 4px;
  background-color: #ff7f00;
  border-radius: 2px;
}

.filters-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-filter {
  position: relative;
  flex: 1;
}

.search-filter i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-filter input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.sort-filter select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  min-width: 200px;
}

.search-filter input:focus,
.sort-filter select:focus {
  outline: none;
  border-color: #ff7f00;
  box-shadow: 0 0 0 2px rgba(255, 127, 0, 0.2);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 200px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 1.5rem;
}

.product-info h2 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: #333;
}

.product-price {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ff7f00;
  margin: 0.5rem 0;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-to-cart-btn:hover {
  background-color: #ff9800;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.no-results i {
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.reset-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background-color: #ff9800;
}

@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
  }

  .sort-filter select {
    width: 100%;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style> 