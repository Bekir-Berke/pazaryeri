<template>
  <header class="category-header">
    <div class="container">
      <div class="category-wrapper">
        <div class="category-list">
          <div class="all-categories">
            <div class="category-dropdown">
              <button class="category-btn all-btn" @click="toggleAllCategories">
                <i class="bi bi-grid me-2"></i>Tüm Kategoriler
                <i class="bi bi-chevron-down ms-2"></i>
              </button>

              <!-- Tüm kategoriler dropdown menüsü -->
              <div v-show="showAllCategories" class="all-categories-menu">
                <div class="all-categories-wrapper">
                  <div class="categories-container">
                    <div v-for="category in categoryStore.categories" :key="category.id" class="main-category-item">
                      <router-link :to="`/category/${category.id}`" class="main-category-link">
                        {{ category.name }}
                      </router-link>
                      
                      <div v-if="hasChildren(category)" class="subcategories-list">
                        <div v-for="subCategory in category.children" :key="subCategory.id" class="subcategory-group">
                          <router-link :to="`/category/${subCategory.id}`" class="subcategory-title">
                            {{ subCategory.name }}
                          </router-link>
                          
                          <div v-if="hasChildren(subCategory)" class="subcategory-items">
                            <router-link 
                              v-for="subSubCategory in subCategory.children" 
                              :key="subSubCategory.id"
                              :to="`/category/${subSubCategory.id}`" 
                              class="subcategory-item"
                            >
                              {{ subSubCategory.name }}
                            </router-link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button class="close-btn" @click="showAllCategories = false">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="categories">
            <template v-if="categoryStore.categories && categoryStore.categories.length">
              <div class="category-dropdown" v-for="category in visibleCategories" :key="category.id">
                <router-link
                  :to="`/category/${category.id}`"
                  class="category-item"
                >
                  {{ category.name }}
                  <i v-if="hasChildren(category)" class="bi bi-chevron-down dropdown-indicator"></i>
                </router-link>
                
                <!-- Alt kategoriler menüsü (hover) -->
                <div v-if="hasChildren(category)" class="subcategories-menu">
                  <div class="subcategories-wrapper">
                    <div v-for="subCategory in category.children" :key="subCategory.id" class="subcategory-group">
                      <router-link :to="`/category/${subCategory.id}`" class="subcategory-title">
                        {{ subCategory.name }}
                      </router-link>
                      
                      <div v-if="hasChildren(subCategory)" class="subcategory-items">
                        <router-link 
                          v-for="subSubCategory in subCategory.children" 
                          :key="subSubCategory.id"
                          :to="`/category/${subSubCategory.id}`" 
                          class="subcategory-item"
                        >
                          {{ subSubCategory.name }}
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="loading">Kategoriler yükleniyor...</div>
            </template>
          </div>
          
          <div class="more-categories" v-if="hiddenCategories.length > 0">
            <div class="dropdown">
              <button class="more-btn dropdown-toggle" type="button" id="categoryDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                Daha Fazla
              </button>
              <ul class="dropdown-menu" aria-labelledby="categoryDropdown">
                <li v-for="category in hiddenCategories" :key="category.id">
                  <router-link :to="`/category/${category.id}`" class="dropdown-item">
                    {{ category.name }}
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tüm kategoriler arka plan örtüsü -->
    <div v-if="showAllCategories" class="modal-backdrop" @click="showAllCategories = false"></div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useCategoryStore } from "@/stores/counter";

// Store'u başlat
const categoryStore = useCategoryStore();

// Tüm kategoriler menüsü açık/kapalı durumu
const showAllCategories = ref(false);

// Kaç adet kategori görüntülenecek
const visibleCategoryCount = ref(5);

// Görünür kategoriler
const visibleCategories = computed(() => {
  if (!categoryStore.categories) return [];
  return categoryStore.categories.slice(0, visibleCategoryCount.value);
});

// Gizli kategoriler (Daha Fazla menüsünde gösterilecek)
const hiddenCategories = computed(() => {
  if (!categoryStore.categories) return [];
  return categoryStore.categories.slice(visibleCategoryCount.value);
});

// Kategorinin alt kategorileri var mı kontrol et
function hasChildren(category) {
  return category.children && category.children.length > 0;
}

// Tüm kategoriler menüsünü aç/kapat
function toggleAllCategories() {
  showAllCategories.value = !showAllCategories.value;
}

// Sayfa dışı tıklamaları dinle
function handleClickOutside(event) {
  const allCategoriesMenu = document.querySelector('.all-categories-menu');
  const allCategoriesBtn = document.querySelector('.all-btn');
  
  if (showAllCategories.value && allCategoriesMenu && !allCategoriesMenu.contains(event.target) && !allCategoriesBtn.contains(event.target)) {
    showAllCategories.value = false;
  }
}

// Event listener'ları ekle ve temizle
onMounted(() => {
  // Kategorileri getir
  if (!categoryStore.categories || categoryStore.categories.length === 0) {
    categoryStore.fetchCategories();
  }
  
  // Dışarı tıklama listener'ı ekle
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  // Listener'ı temizle
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.category-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.category-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.category-list {
  display: flex;
  align-items: center;
  width: 100%;
}

.all-categories {
  margin-right: 15px;
  position: relative;
}

.loading {
  padding: 8px 12px;
  color: #666;
  font-style: italic;
}

.category-btn {
  display: flex;
  align-items: center;
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.category-btn:hover {
  background-color: #e67300;
}

.all-btn {
  font-weight: 600;
}

.categories {
  display: flex;
  align-items: center;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  flex-grow: 1;
}

.categories::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.category-dropdown {
  position: relative;
}

.category-item {
  text-decoration: none;
  color: #333;
  padding: 8px 12px;
  margin: 0 4px;
  border-radius: 5px;
  font-size: 0.95rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.dropdown-indicator {
  margin-left: 4px;
  font-size: 0.75rem;
}

.category-item:hover {
  color: #ff7f00;
  background-color: rgba(255, 127, 0, 0.1);
}

.more-categories {
  margin-left: auto;
}

.more-btn {
  background: transparent;
  color: #555;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.more-btn:hover {
  color: #ff7f00;
  background-color: rgba(255, 127, 0, 0.1);
}

/* Hover ile açılan alt kategoriler menüsü */
.subcategories-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: auto;
  min-width: 220px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 15px;
  margin-top: 5px;
  display: none;
  z-index: 1000;
}

.category-dropdown:hover .subcategories-menu {
  display: block;
}

/* Tüm Kategoriler menüsü */
.all-categories-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-width: 800px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 20px;
  margin-top: 10px;
  z-index: 1001;
  max-height: 80vh;
  overflow-y: auto;
}

.all-categories-wrapper {
  display: flex;
  flex-direction: column;
}

.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
}

.main-category-item {
  margin-bottom: 15px;
}

.main-category-link {
  display: block;
  color: #333;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 10px;
  text-decoration: none;
  transition: color 0.2s;
}

.main-category-link:hover {
  color: #ff7f00;
}

.subcategories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subcategory-group {
  margin-bottom: 8px;
}

.subcategory-title {
  display: block;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 6px;
  text-decoration: none;
  transition: color 0.2s;
}

.subcategory-title:hover {
  color: #ff7f00;
}

.subcategory-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 10px;
}

.subcategory-item {
  color: #777;
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}

.subcategory-item:hover {
  color: #ff7f00;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #777;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.close-btn:hover {
  color: #ff7f00;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Modal arka plan */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* Diğer dropdown stilleri */
.dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  padding: 8px 0;
}

.dropdown-item {
  padding: 8px 16px;
  color: #333;
}

.dropdown-item:hover {
  background-color: rgba(255, 127, 0, 0.1);
  color: #ff7f00;
}

@media (max-width: 768px) {
  .category-list {
    flex-wrap: wrap;
  }

  .all-categories {
    width: 100%;
    margin-bottom: 10px;
  }

  .categories {
    width: 100%;
    margin-bottom: 10px;
  }

  .more-categories {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  /* Mobilde all-kategoriler menüsü */
  .all-categories-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    max-width: none;
    border-radius: 0;
    margin-top: 0;
    padding: 15px;
    overflow-y: auto;
  }

  .categories-container {
    grid-template-columns: 1fr;
  }

  .close-btn {
    top: 15px;
    right: 15px;
  }
}
</style>