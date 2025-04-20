<template>
    <div class="category-view">
        <div class="container py-4">
            <!-- Kategori başlık ve filtreleme bölümü -->
            <div class="category-header">
                <div class="row align-items-center mb-4">
                    <div class="col-lg-6">
                        <h1 class="category-title">{{ categoryName }}</h1>
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item"><router-link to="/">Ana Sayfa</router-link></li>
                                <li class="breadcrumb-item active" aria-current="page">{{ categoryName }}</li>
                            </ol>
                        </nav>
                    </div>
                    <div class="col-lg-6">
                        <div class="filter-controls">
                            <div class="row g-2">
                                <div class="col-md-6 ms-auto">
                                    <select class="form-select" v-model="sortOption">
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
            </div>

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
                <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-2">
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
                                    <span v-if="product.originalPrice && product.originalPrice > product.price"
                                        class="original-price">
                                        {{ formatPrice(product.originalPrice) }}
                                    </span>
                                    {{ formatPrice(product.price) }}
                                </div>
                                <div class="product-actions">
                                    <button class="btn addToCart w-100" @click="addToCart(product)">
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
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/api';

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const loading = ref(true);
const products = ref([]);
const categoryName = ref('');
const sortOption = ref('default');

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

        // Ürünleri topla
        const allProducts = [];
        response.data.children.forEach((child) => {
            child.children.forEach((subChild) => {
                if (subChild.products && subChild.products.length > 0) {
                    subChild.products.forEach(productRelation => {
                        if (productRelation.product) {
                            allProducts.push(productRelation.product);
                        }
                    });
                }
            });
        });
        console.log('Ürünler yüklendi:', allProducts);
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
    event.target.src = "/placeholder-image.jpg";
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
    // Sepet ekleme mantığı burada olacak
    console.log('Sepete eklenen ürün:', product);
};
</script>

<style scoped>
.addToCart {
    background-color: #ff7f00;
    color: white;
    border: none;
    padding: 0.4rem;
    border-radius: 4px;
    font-size: 0.8rem;
    transition: background-color 0.3s;
}

.addToCart:hover {
    background-color: #e67300;
}

.category-view {
    min-height: 60vh;
    padding-bottom: 3rem;
}

.category-header {
    margin-bottom: 1.5rem;
}

.category-title {
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 600;
    font-size: 1.5rem;
}

.breadcrumb {
    margin-bottom: 0;
    font-size: 0.85rem;
}

.breadcrumb a {
    color: #666;
    text-decoration: none;
}

.breadcrumb a:hover {
    color: #ff7f00;
}

.filter-controls {
    display: flex;
    justify-content: flex-end;
}

/* Loading spinner */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
}

.loading-container p {
    margin-top: 1rem;
    color: #666;
}

/* No products found */
.no-products {
    text-align: center;
    padding: 3rem 0;
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
    border-radius: 6px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    background-color: #fff;
    position: relative;
}

.product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.08);
}

.product-badges {
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 2;
}

.badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.4rem;
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

.product-info {
    padding: 0.75rem;
}

.product-name {
    font-weight: 500;
    margin-bottom: 0.4rem;
    height: 2.2rem;
    overflow: hidden;
    font-size: 0.85rem;
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
    font-size: 0.95rem;
    font-weight: 600;
    color: #ff7f00;
    margin-bottom: 0.5rem;
}

.original-price {
    text-decoration: line-through;
    color: #999;
    font-size: 0.75rem;
    font-weight: normal;
    margin-right: 0.3rem;
}

.product-actions {
    margin-top: 0.3rem;
}

/* Media queries */
@media (max-width: 992px) {
    .filter-controls {
        margin-top: 1rem;
        justify-content: flex-start;
    }
}

@media (max-width: 576px) {
    .category-title {
        font-size: 1.3rem;
    }
}
</style>