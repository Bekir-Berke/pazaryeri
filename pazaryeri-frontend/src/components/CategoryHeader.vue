<template>
  <div class="category-header">
    <div class="container">
      <div class="category-navigation">
        <!-- Tüm Kategoriler Butonu -->
        <div class="category-dropdown">
          <button class="main-category-button" @click="toggleCategoryMenu">
            <i class="bi bi-grid-3x3-gap-fill me-2"></i>
            <span>Tüm Kategoriler</span>
            <i class="bi bi-chevron-down ms-2" :class="{ 'rotate': showCategoryMenu }"></i>
          </button>
          
          <!-- Harita Stili Kategori Menüsü -->
          <div v-if="showCategoryMenu" class="category-mega-menu">
            <div class="category-mega-menu-container">
              <!-- Sol Kategori Listesi -->
              <div class="primary-categories">
                <div 
                  v-for="(category, index) in categoryStore.categories" 
                  :key="category.id" 
                  class="primary-category-item"
                  @mouseenter="activeCategory = index"
                  :class="{ 'active': activeCategory === index }"
                >
                  <div class="primary-category-content">
                    <span>{{ category.name }}</span>
                    <i v-if="hasChildren(category)" class="bi bi-chevron-right"></i>
                  </div>
                </div>
              </div>
              
              <!-- Sağ Alt Kategori Paneli -->
              <div class="secondary-categories">
                <div class="secondary-categories-wrapper" v-if="activeCategory !== null && categoryStore.categories.length > 0">
                  <div class="subcategory-list">
                    <div 
                      v-for="subCategory in categoryStore.categories[activeCategory]?.children || []" 
                      :key="subCategory.id" 
                      class="subcategory-group"
                    >
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
            
            <button class="close-menu-button" @click="showCategoryMenu = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
        
        <!-- Popüler Kategoriler -->
        <div class="popular-categories">
          <template v-if="categoryStore.categories && categoryStore.categories.length">
            <router-link 
              v-for="category in visibleCategories" 
              :key="category.id" 
              :to="`/category/${category.id}`" 
              class="popular-category-link"
            >
              {{ category.name }}
            </router-link>
          </template>
          <div v-else class="loading-categories">
            <span>Kategoriler yükleniyor...</span>
          </div>
        </div>
        
        <!-- Daha Fazla Kategoriler Dropdown -->
        <div class="more-categories" v-if="hiddenCategories.length > 0">
          <div class="more-dropdown">
            <button class="more-button" @click="toggleMoreCategories">
              <span>Daha Fazla</span>
              <i class="bi bi-chevron-down ms-1" :class="{ 'rotate': showMoreCategories }"></i>
            </button>
            
            <div v-if="showMoreCategories" class="more-dropdown-menu">
              <router-link 
                v-for="category in hiddenCategories" 
                :key="category.id" 
                :to="`/category/${category.id}`" 
                class="more-dropdown-link"
              >
                {{ category.name }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Arka Plan Overlay -->
    <div v-if="showCategoryMenu" class="category-overlay" @click="showCategoryMenu = false"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useCategoryStore } from "@/stores/counter";

// Store
const categoryStore = useCategoryStore();

// UI State
const showCategoryMenu = ref(false);
const showMoreCategories = ref(false);
const activeCategory = ref(0);
const visibleCategoryCount = ref(6);

// Computed Properties
const visibleCategories = computed(() => {
  if (!categoryStore.categories) return [];
  return categoryStore.categories.slice(0, visibleCategoryCount.value);
});

const hiddenCategories = computed(() => {
  if (!categoryStore.categories) return [];
  return categoryStore.categories.slice(visibleCategoryCount.value);
});

// Methods
function hasChildren(category) {
  return category?.children && category.children.length > 0;
}

function toggleCategoryMenu() {
  showCategoryMenu.value = !showCategoryMenu.value;
  if (showCategoryMenu.value) {
    // Reset active category when menu opens
    activeCategory.value = 0;
    // Close other menus if open
    showMoreCategories.value = false;
  }
}

function toggleMoreCategories() {
  showMoreCategories.value = !showMoreCategories.value;
  if (showMoreCategories.value) {
    // Close category menu if open
    showCategoryMenu.value = false;
  }
}

// Event handlers for outside clicks
function handleOutsideClick(event) {
  const moreDropdown = document.querySelector('.more-dropdown');
  const moreButton = document.querySelector('.more-button');
  
  if (showMoreCategories.value && 
      moreDropdown && 
      !moreDropdown.contains(event.target) && 
      !moreButton.contains(event.target)) {
    showMoreCategories.value = false;
  }
}

// Lifecycle hooks
onMounted(() => {
  // Fetch categories if not loaded
  if (!categoryStore.categories || categoryStore.categories.length === 0) {
    categoryStore.fetchCategories();
  }
  
  // Add event listeners
  document.addEventListener('click', handleOutsideClick);
  
  // Adjust visible categories based on window width
  adjustVisibleCategories();
  window.addEventListener('resize', adjustVisibleCategories);
});

onBeforeUnmount(() => {
  // Clean up event listeners
  document.removeEventListener('click', handleOutsideClick);
  window.removeEventListener('resize', adjustVisibleCategories);
});

// Responsive adjustment for visible categories
function adjustVisibleCategories() {
  const width = window.innerWidth;
  if (width < 768) {
    visibleCategoryCount.value = 3;
  } else if (width < 992) {
    visibleCategoryCount.value = 4;
  } else if (width < 1200) {
    visibleCategoryCount.value = 5;
  } else {
    visibleCategoryCount.value = 6;
  }
}

// Close menus on route change
watch(() => window.location.href, () => {
  showCategoryMenu.value = false;
  showMoreCategories.value = false;
});
</script>

<style scoped>
.category-header {
  position: relative;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 10px 0;
  z-index: 100;
}

.container {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 15px;
}

.category-navigation {
  display: flex;
  align-items: center;
  position: relative;
}

/* Main Category Button */
.category-dropdown {
  position: relative;
  margin-right: 20px;
}

.main-category-button {
  display: flex;
  align-items: center;
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.main-category-button:hover {
  background-color: #e67300;
}

.main-category-button i {
  font-size: 16px;
}

.main-category-button .rotate {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

/* Mega Menu */
.category-mega-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 900px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
}

.category-mega-menu-container {
  display: flex;
  height: 450px;
}

/* Primary Categories */
.primary-categories {
  width: 280px;
  background-color: #f8f9fa;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #eaeaea;
}

.primary-category-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-category-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.primary-category-item:hover,
.primary-category-item.active {
  background-color: #fff;
}

.primary-category-item:hover .primary-category-content,
.primary-category-item.active .primary-category-content {
  color: #ff7f00;
  font-weight: 500;
}

/* Secondary Categories */
.secondary-categories {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
  height: 100%;
}

.subcategory-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.subcategory-group {
  margin-bottom: 16px;
}

.subcategory-title {
  display: block;
  color: #222;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  text-decoration: none;
  transition: color 0.2s;
}

.subcategory-title:hover {
  color: #ff7f00;
}

.subcategory-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subcategory-item {
  color: #666;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.subcategory-item:hover {
  color: #ff7f00;
}

/* Popular Categories */
.popular-categories {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 16px;
  flex-grow: 1;
}

.popular-category-link {
  color: #444;
  text-decoration: none;
  font-size: 14px;
  padding: 6px 0;
  white-space: nowrap;
  transition: color 0.2s;
}

.popular-category-link:hover {
  color: #ff7f00;
}

.loading-categories {
  color: #888;
  font-style: italic;
  font-size: 14px;
}

/* More Categories Dropdown */
.more-categories {
  position: relative;
  margin-left: 10px;
}

.more-button {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: #444;
  font-size: 14px;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.more-button:hover {
  color: #ff7f00;
  background-color: rgba(255, 127, 0, 0.05);
}

.more-button .rotate {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}

.more-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 180px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 1000;
  margin-top: 8px;
}

.more-dropdown-link {
  display: block;
  padding: 8px 16px;
  color: #444;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.more-dropdown-link:hover {
  background-color: rgba(255, 127, 0, 0.08);
  color: #ff7f00;
}

/* Close Button */
.close-menu-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: #666;
  font-size: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-menu-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

/* Overlay */
.category-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .category-mega-menu {
    width: 90vw;
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .category-navigation {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .category-dropdown {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .main-category-button {
    width: 100%;
    justify-content: space-between;
  }
  
  .popular-categories {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 5px;
    flex-wrap: nowrap;
  }
  
  .more-categories {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
  
  .more-button {
    width: 100%;
    justify-content: center;
  }
  
  .more-dropdown-menu {
    left: 0;
    right: 0;
    width: 100%;
  }
  
  .category-mega-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
    margin-top: 0;
  }
  
  .category-mega-menu-container {
    flex-direction: column;
    height: 100%;
  }
  
  .primary-categories {
    width: 100%;
    height: auto;
    max-height: 40%;
    border-right: none;
    border-bottom: 1px solid #eaeaea;
  }
  
  .secondary-categories {
    height: auto;
    flex: 1;
    overflow-y: auto;
  }
  
  .subcategory-list {
    grid-template-columns: 1fr;
  }
  
  .close-menu-button {
    top: 10px;
    right: 10px;
    z-index: 1010;
  }
}
</style>