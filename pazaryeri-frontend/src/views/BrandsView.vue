<template>
  <div class="brands-container">
    <div class="brands-header">
      <h1>Markalar</h1>
      <div class="filters-container">
        <div class="search-filter">
          <i class="bi bi-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Marka ara..."
            @input="filterBrands"
          />
        </div>
        <div class="sort-filter">
          <select v-model="sortBy" @change="sortBrands">
            <option value="name">İsme Göre</option>
            <option value="name-desc">İsme Göre (Z-A)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="brands-grid">
      <div v-for="brand in filteredBrands" :key="brand.id" class="brand-card">
        <div class="brand-content">
          <div class="brand-info">
            <h2>{{ brand.name }}</h2>
            <router-link :to="{ name: 'brand-products', params: { id: brand.id }}" class="view-products-btn">
              Ürünleri Gör
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredBrands.length === 0" class="no-results">
      <i class="bi bi-search"></i>
      <p>Aradığınız kriterlere uygun marka bulunamadı.</p>
      <button @click="resetFilters" class="reset-btn">Filtreleri Sıfırla</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/api';
import { useRoute } from 'vue-router';

const brands = ref([]);
const filteredBrands = ref([]);
const searchQuery = ref('');
const sortBy = ref('name');
const route = useRoute();

const fetchBrands = async () => {
  try {
    const response = await apiClient.get(`/brand`);
    brands.value = response.data;
    filteredBrands.value = response.data;
  } catch (error) {
    console.error('Markalar yüklenirken hata oluştu:', error);
  }
};

const filterBrands = () => {
  if (!searchQuery.value) {
    filteredBrands.value = brands.value;
    return;
  }

  const query = searchQuery.value.toLowerCase();
  filteredBrands.value = brands.value.filter(brand => 
    brand.name.toLowerCase().includes(query)
  );
};

const sortBrands = () => {
  filteredBrands.value.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy.value === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });
};

const resetFilters = () => {
  searchQuery.value = '';
  sortBy.value = 'name';
  filteredBrands.value = brands.value;
};

onMounted(() => {
  fetchBrands();
});
</script>

<style scoped>
.brands-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.brands-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.brands-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  position: relative;
}

.brands-header h1::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 4px;
  background-color: #ff7f00;
  border-radius: 2px;
}

.search-filter {
  position: relative;
}

.search-filter i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-filter input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  width: 300px;
  transition: all 0.2s;
}

.sort-filter select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.search-filter input:focus,
.sort-filter select:focus {
  outline: none;
  border-color: #ff7f00;
  box-shadow: 0 0 0 2px rgba(255, 127, 0, 0.2);
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.brand-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.brand-content {
  padding: 2rem;
  text-align: center;
}

.brand-info h2 {
  margin: 0 0 1rem;
  font-size: 1.4rem;
  color: #333;
}

.view-products-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #ff7f00;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.view-products-btn:hover {
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
  .brands-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-container {
    flex-direction: column;
    width: 100%;
  }

  .search-filter input,
  .sort-filter select {
    width: 100%;
  }

  .brands-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style> 