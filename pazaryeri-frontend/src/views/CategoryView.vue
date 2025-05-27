<template>
    <div class="category-view">
        <div class="container py-4">
            <!-- Hero bölümü -->
            <div class="category-hero mb-4">
                <div class="row g-3 align-items-center">
                    <div class="col-lg-6">
                        <h1 class="category-title">{{ categoryName }}</h1>
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item"><router-link to="/">Ana Sayfa</router-link></li>
                                <li v-if="parentCategory" class="breadcrumb-item">
                                    <router-link :to="{ name: 'category', params: { id: parentCategory.id } }">
                                        {{ parentCategory.name }}
                                    </router-link>
                                </li>
                                <li class="breadcrumb-item active" aria-current="page">{{ categoryName }}</li>
                            </ol>
                        </nav>
                    </div>
                    <div class="col-lg-6">
                        <div class="filter-controls d-flex justify-content-lg-end">
                            <div class="d-flex align-items-center flex-wrap">
                                <span class="filter-label me-2">Sırala:</span>
                                <select class="form-select form-select-sm" v-model="sortOption">
                                    <option value="default">Önerilen Sıralama</option>
                                    <option value="price_asc">Fiyat (Artan)</option>
                                    <option value="price_desc">Fiyat (Azalan)</option>
                                    <option value="name_asc">İsim (A-Z)</option>
                                    <option value="name_desc">İsim (Z-A)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ana içerik alanı (İki kolonlu düzen) -->
            <div class="row">
                <!-- Sol taraf - Kategoriler -->
                <div class="col-12 col-md-3 mb-4 mb-md-0">
                    <div class="categories-sidebar">
                        <div class="sidebar-block">
                            <h4 class="sidebar-title">Kategoriler</h4>
                            
                            <!-- Parent category link if exists -->
                            <div v-if="parentCategory" class="sidebar-parent-category mb-2">
                                <router-link :to="{ name: 'category', params: { id: parentCategory.id } }" class="d-flex align-items-center">
                                    <i class="bi bi-arrow-left-short me-1"></i>
                                    {{ parentCategory.name }}
                                </router-link>
                            </div>
                            
                            <!-- Current category -->
                            <div class="sidebar-current-category mb-2">
                                <span class="current-category-name">{{ categoryName }}</span>
                            </div>
                            
                            <!-- Subcategories list -->
                            <div v-if="subCategories.length > 0" class="sidebar-subcategories">
                                <ul class="category-list">
                                    <li v-for="category in subCategories" :key="category.id" class="category-item">
                                        <router-link :to="{ name: 'category', params: { id: category.id } }">
                                            {{ category.name }}
                                            <span v-if="category.productCount" class="category-count">({{ category.productCount }})</span>
                                        </router-link>
                                    </li>
                                </ul>
                                <div v-if="subCategories.length > 10 && !showAllSubcategories" class="mt-2">
                                    <button class="btn btn-sm btn-outline-secondary w-100" @click="showAllSubcategories = true">
                                        Tüm Kategorileri Göster
                                    </button>
                                </div>
                                <div v-if="showAllSubcategories && subCategories.length > 10" class="mt-2">
                                    <button class="btn btn-sm btn-outline-secondary w-100" @click="showAllSubcategories = false">
                                        Daha Az Göster
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Buraya ekstra filtreler eklenebilir -->
                    </div>
                </div>
                
                <!-- Sağ taraf - Ürünler -->
                <div class="col-12 col-md-9">
                    <!-- Yükleniyor durumu -->
                    <div v-if="loading" class="loading-container">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Yükleniyor...</span>
                        </div>
                        <p>Ürünler Yükleniyor...</p>
                    </div>

                    <!-- Ürün bulunamazsa -->
                    <div v-else-if="sortedProducts.length === 0" class="no-products">
                        <div class="no-products-content">
                            <i class="bi bi-search"></i>
                            <h3>Bu kategoride ürün bulunamadı</h3>
                            <p>Başka bir kategori seçmeyi deneyin veya ana sayfaya dönün.</p>
                            <router-link to="/" class="btn btn-primary">Ana Sayfaya Dön</router-link>
                        </div>
                    </div>

                    <!-- Ürünler Kart Görünümü -->
                    <div v-else class="products-grid">
                        <div class="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-2">
                            <div v-for="(product, index) in sortedProducts" :key="product.id || index" class="col">
                                <div class="product-card">
                                    <div class="product-badges" v-if="product.isDiscounted">
                                        <span class="badge bg-danger">%{{ calculateDiscount(product) }}</span>
                                    </div>
                                    <div class="product-image">
                                        <router-link :to="{ name: 'product', params: { id: product.id } }">
                                            <img :src="product.imageUrl" :alt="product.name" @error="handleImageError">
                                        </router-link>
                                    </div>
                                    <div class="product-info">
                                        <div class="product-name">
                                            <router-link :to="{ name: 'product', params: { id: product.id } }">
                                                {{ product.name }}
                                            </router-link>
                                        </div>
                                        <div class="product-price">
                                            <span class="original-price">
                                                {{ formatPrice(product.vatPrice) }}
                                            </span>
                                        </div>
                                        <div class="product-actions">
                                            <button v-if="loggedInStore.loggedIn" class="btn addToCart w-100" @click="addToCart(product)">
                                                Sepete Ekle
                                            </button>
                                            <button v-else class="btn addToCart w-100" @click="router.push('/login')">
                                                Sepete Ekle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from "vue-toast-notification";
import apiClient from '@/api';
import { useLoggedInStore } from '@/stores/counter';
const route = useRoute();
const router = useRouter();
const id = route.params.id;
const loading = ref(true);
const loggedInStore = useLoggedInStore();
const $toast = useToast();
const products = ref([]);
const categoryName = ref('');
const sortOption = ref('default');
const parentCategory = ref(null);
const subCategories = ref([]);
const showAllSubcategories = ref(false);
const visibleSubcategoriesCount = 6;

// Ürünleri sıralama
const sortedProducts = computed(() => {
    if (!products.value.length) return [];

    let sorted = [...products.value];

    switch (sortOption.value) {
        case 'price_asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'name_asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name_desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Varsayılan sıralama, değişiklik yok
            break;
    }

    return sorted;
});

const fetchProducts = async (id) => {
    const response = await apiClient.get(`/category/${id}`);
    if (response.status === 200) {
        categoryName.value = response.data.name;
        parentCategory.value = response.data.parent;

        // Alt kategorileri ürün sayısı bilgisiyle genişlet
        if (response.data.children && response.data.children.length > 0) {
            subCategories.value = response.data.children.map(child => {
                let productCount = 0;
                
                // Alt kategorinin kendi ürünleri
                if (child.products && child.products.length > 0) {
                    productCount += child.products.length;
                }
                
                // Alt kategorinin alt kategorilerinin ürünleri
                if (child.children && child.children.length > 0) {
                    child.children.forEach(subChild => {
                        if (subChild.products && subChild.products.length > 0) {
                            productCount += subChild.products.length;
                        }
                    });
                }
                
                return {
                    ...child,
                    productCount
                };
            });
        } else {
            subCategories.value = [];
        }

        // Ürünleri topla
        const allProducts = [];
        
        // Ana kategorinin kendi ürünleri
        if (response.data.products && response.data.products.length > 0) {
            response.data.products.forEach(productRelation => {
                if (productRelation.product) {
                    allProducts.push(productRelation.product);
                }
            });
        }
        
        // 1. seviye alt kategorilerin ürünleri
        if (response.data.children && response.data.children.length > 0) {
            response.data.children.forEach((child) => {
                // Alt kategorinin kendi ürünleri
                if (child.products && child.products.length > 0) {
                    child.products.forEach(productRelation => {
                        if (productRelation.product) {
                            allProducts.push(productRelation.product);
                        }
                    });
                }
                
                // 2. seviye alt kategorilerin ürünleri
                if (child.children && child.children.length > 0) {
                    child.children.forEach((subChild) => {
                        if (subChild.products && subChild.products.length > 0) {
                            subChild.products.forEach(productRelation => {
                                if (productRelation.product) {
                                    allProducts.push(productRelation.product);
                                }
                            });
                        }
                    });
                }
            });
        }
        
        console.log('Tüm ürünler yüklendi:', allProducts);
        return allProducts;
    } else {
        throw new Error('Ürünler yüklenemedi');
    }
}
// Kategori ve ürünleri yükle
onMounted(async() => {
    loading.value = true;
    const allProducts = await fetchProducts(route.params.id);
    products.value = allProducts;
    loading.value = false;
})
watch(
    () => route.params.id,
    (newId) => {
        loading.value = true;
        fetchProducts(newId).then((allProducts) => {
            products.value = allProducts;
            loading.value = false;
        }).catch(error => {
            console.error('Kategori yüklenirken hata oluştu:', error);
            loading.value = false;
        });
    }
)

// Resim yükleme hatası durumu
const handleImageError = (event) => {
    event.target.src = "";
};

// Fiyat formatı
const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2
    }).format(price);
};

// İndirim hesapla
const calculateDiscount = (product) => {
    if (product.originalPrice && product.price < product.originalPrice) {
        return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
};

// Açıklama kısaltma
const truncateDescription = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Ürün detaylarını görüntüle
const viewProductDetails = (product) => {
    router.push({ name: 'product', params: { id: product.id } });
};

// Sepete ekle
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

// Alt kategorileri göster
const displayedSubCategories = computed(() => {
    if (showAllSubcategories.value || subCategories.value.length <= visibleSubcategoriesCount) {
        return subCategories.value;
    }
    return subCategories.value.slice(0, visibleSubcategoriesCount);
});
</script>

<style scoped>
.category-view {
    min-height: 60vh;
    padding-bottom: 3rem;
}

.category-hero {
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    margin-bottom: 2rem;
}

.category-title {
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 1.75rem;
}

.breadcrumb {
    margin-bottom: 0;
    font-size: 0.85rem;
    padding: 0;
    background-color: transparent;
}

.breadcrumb a {
    color: #666;
    text-decoration: none;
}

.breadcrumb a:hover {
    color: #ff7f00;
}

.filter-label {
    color: #555;
    font-size: 0.9rem;
    font-weight: 500;
}

.filter-controls {
    display: flex;
    justify-content: flex-end;
}

/* Categories sidebar */
.categories-sidebar {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    overflow: hidden;
}

.sidebar-block {
    padding: 1.25rem;
    border-bottom: 1px solid #eee;
}

.sidebar-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
}

.sidebar-parent-category a {
    color: #666;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.2s;
}

.sidebar-parent-category a:hover {
    color: #ff7f00;
}

.sidebar-current-category {
    font-weight: 600;
    color: #ff7f00;
    padding: 0.5rem 0;
}

.category-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.category-item {
    margin-bottom: 0.5rem;
}

.category-item a {
    display: block;
    color: #555;
    padding: 0.5rem;
    border-radius: 4px;
    text-decoration: none;
    transition: all 0.2s;
}

.category-item a:hover {
    background-color: #f8f9fa;
    color: #ff7f00;
}

.category-count {
    font-size: 0.8rem;
    color: #999;
    margin-left: 0.25rem;
}

/* Loading spinner */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.loading-container p {
    margin-top: 1rem;
    color: #666;
}

/* No products found */
.no-products {
    text-align: center;
    padding: 3rem 0;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.no-products-content {
    max-width: 400px;
    margin: 0 auto;
}

.no-products-content i {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 1rem;
}

.no-products-content h3 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1rem;
}

.no-products-content p {
    color: #666;
    margin-bottom: 1.5rem;
}

/* Products Grid View */
.products-grid {
    margin-bottom: 2rem;
}

.product-card {
    height: 100%;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    background-color: #fff;
    position: relative;
}

.product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.product-badges {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 2;
}

.badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.4rem;
    border-radius: 4px;
}

.product-image {
    position: relative;
    padding-top: 100%;
    overflow: hidden;
    background-color: #f8f9fa;
}

.product-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s;
}

.product-image img:hover {
    transform: scale(1.05);
}

.product-info {
    padding: 1rem;
}

.product-name {
    font-weight: 500;
    margin-bottom: 0.5rem;
    height: 2.2rem;
    overflow: hidden;
    font-size: 0.9rem;
    line-height: 1.1rem;
}

.product-name a {
    color: #333;
    text-decoration: none;
}

.product-name a:hover {
    color: #ff7f00;
}

.product-price {
    font-size: 1rem;
    font-weight: 600;
    color: #ff7f00;
    margin-bottom: 0.75rem;
}

.original-price {
  color: #333;
  font-size: 0.85rem;
  font-weight: 600;
}

.product-actions {
    margin-top: 0.5rem;
}

.addToCart {
    background-color: #ff7f00;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    transition: background-color 0.3s;
    font-weight: 500;
}

.addToCart:hover {
    background-color: #e67300;
}

/* Media queries */
@media (max-width: 992px) {
    .filter-controls {
        margin-top: 1rem;
        justify-content: flex-start;
    }
    
    .category-hero {
        padding: 1.25rem;
    }
    
    .category-title {
        font-size: 1.5rem;
    }
}

@media (max-width: 768px) {
    .categories-sidebar {
        margin-bottom: 1.5rem;
    }
}

@media (max-width: 576px) {
    .category-title {
        font-size: 1.3rem;
    }
    
    .category-hero {
        padding: 1rem;
    }
    
    .sidebar-title {
        font-size: 1rem;
    }
}
</style>