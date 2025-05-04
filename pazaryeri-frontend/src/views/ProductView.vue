<template>
  <div class="product-detail-container">
    <div class="container py-4">
      <!-- Yükleniyor durumu -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Yükleniyor...</span>
        </div>
        <p>Ürün bilgileri yükleniyor...</p>
      </div>

      <!-- Ürün detayları -->
      <div v-else-if="product" class="product-detail">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="breadcrumb-container">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/"
                ><i class="bi bi-house-door-fill"></i> Ana Sayfa</router-link
              >
            </li>
            <li class="breadcrumb-item" v-if="product.categories">
              <router-link
                :to="`/categories/${product.categories[0].categoryId}`"
              >
                <i class="bi bi-tag"></i>
                {{ product.categories[0].category.name }}
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ product.name }}
            </li>
          </ol>
        </nav>

        <div class="row">
          <!-- Ürün görseli -->
          <div class="col-lg-5 mb-4 mb-lg-0">
            <div class="product-image-container">
              <div class="product-badges" v-if="product.isFeature">
                <span class="badge featured-badge">Öne Çıkan</span>
              </div>
              <img
                :src="selectedImage"
                :alt="product.name"
                class="main-image"
                @error="handleImageError"
              />

              <!-- Küçük resimler (varsa) -->
              <div
                class="product-thumbnails"
                v-if="product.images && product.images.length > 0"
              >
                <!-- Ana ürün görseli için thumbnail -->
                <div
                  class="thumbnail-item"
                  :class="{ active: selectedImage === product.imageUrl }"
                  @click="selectedImage = product.imageUrl"
                >
                  <img
                    :src="product.imageUrl"
                    :alt="`${product.name} - Ana Görsel`"
                  />
                </div>
                
                <!-- Diğer görseller için thumbnails - ana görsel hariç -->
                <div
                  class="thumbnail-item"
                  v-for="(image, index) in filteredImages"
                  :key="index"
                  :class="{ active: selectedImage === image.url }"
                  @click="selectedImage = image.url"
                >
                  <img
                    :src="image.url"
                    :alt="`${product.name} - Görsel ${index + 1}`"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Ürün bilgileri -->
          <div class="col-lg-7">
            <div class="product-info">
              <h1 class="product-title">{{ currentProduct.name }}</h1>

              <!-- Kategori Bilgisi -->
              <div class="category-info" v-if="product.category">
                <span>Kategori: </span>
                <router-link
                  :to="`/categories/${product.category.id}`"
                  class="category-name"
                >
                  <i class="bi bi-tag-fill"></i> {{ product.category.name }}
                </router-link>
              </div>

              <div class="store-info">
                <span>Satıcı: </span>
                <router-link
                  :to="`/store/${product.store.id}`"
                  class="store-name"
                >
                  <i class="bi bi-shop"></i> {{ product.store.name }}
                </router-link>
              </div>
              <div class="brand-info" v-if="product.brand">
                <span>Marka: </span>
                <router-link
                  :to="`/brands/${product.brand.id}`"
                  class="brand-name"
                >
                  <i class="bi bi-shop"></i> {{ product.brand.name }}
                </router-link>
              </div>

              <div class="sku-info">
                <span class="sku-badge"
                  ><i class="bi bi-upc-scan"></i> SKU:
                  {{ currentProduct.sku || product.sku }}</span
                >
                <span
                  class="barcode-badge"
                  v-if="currentProduct.barcode || product.barcode"
                >
                  <i class="bi bi-upc"></i> Barkod:
                  {{ currentProduct.barcode || product.barcode }}
                </span>
              </div>

              <div class="product-price">
                <span class="current-price">{{
                  formatPrice(currentProduct.vatPrice)
                }}</span>
              </div>

              <!-- Varyant seçimi (varsa) -->
              <div
                v-if="product.variants && product.variants.length > 0"
                class="product-variants"
              >
                <label><i class="bi bi-palette"></i> Varyant Seçimi:</label>
                <div class="variant-options">
                  <button
                    class="variant-btn"
                    :class="{ active: selectedVariant === null }"
                    @click="selectVariant(null)"
                  >
                    {{ product.name }}
                  </button>
                  <button
                    v-for="variant in product.variants"
                    :key="variant.id"
                    class="variant-btn"
                    :class="{
                      active:
                        selectedVariant && selectedVariant.id === variant.id,
                    }"
                    @click="selectVariant(variant)"
                  >
                    {{ variant.name }}
                  </button>
                </div>
                <div class="variant-details" v-if="selectedVariant">
                  <span class="variant-highlight"
                    >Seçilen varyant:
                    <strong>{{ selectedVariant.name }}</strong></span
                  >
                </div>
              </div>

              <!-- Adet seçimi -->
              <div class="quantity-selector">
                <label><i></i> Adet:</label>
                <div class="quantity-controls">
                  <button
                    @click="decreaseQuantity"
                    :disabled="quantity <= 1"
                    class="quantity-btn"
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                  <input type="number" v-model.number="quantity" min="1" />
                  <button @click="increaseQuantity" class="quantity-btn">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Sepete ekle ve favorilere ekle butonları -->
              <div class="add-to-cart-section">
                <!-- Sepete ekle butonu -->
                <button
                  v-if="loggedInStore.loggedIn"
                  class="add-to-cart-btn"
                  @click="addToCart(currentProduct)"
                >
                  <i class="bi bi-cart-plus"></i> Sepete Ekle
                </button>
                <button
                  v-else
                  class="add-to-cart-btn"
                  @click="router.push('/login')"
                >
                  <i class="bi bi-cart-plus"></i> Sepete Ekle
                </button>
                
                <!-- Favorilere ekle butonu - login kontrolü ekledik -->
                <button
                  v-if="loggedInStore.loggedIn && !product.isFavorited"
                  @click="addToFavorites()"
                  class="wishlist-btn"
                >
                  <i class="bi bi-heart"></i>
                </button>
                <button
                  v-else-if="loggedInStore.loggedIn && product.isFavorited"
                  @click="removeFromFavorites()"
                  class="wishlist-btn favorited"
                >
                  <i class="bi bi-heart-fill"></i>  
                </button>
                <button
                  v-else
                  @click="router.push('/login')"
                  class="wishlist-btn"
                >
                  <i class="bi bi-heart"></i>  
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ürün açıklaması ve diğer detaylar -->
        <div class="product-details-tabs mt-5">
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'description' }"
                @click="activeTab = 'description'"
                type="button" 
                role="tab"
              >
                <i class="bi bi-info-circle"></i> Ürün Açıklaması
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'specs' }"
                @click="activeTab = 'specs'"
                type="button" 
                role="tab"
              >
                <i class="bi bi-list-check"></i> Teknik Özellikler
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                :class="{ active: activeTab === 'reviews' }"
                @click="activeTab = 'reviews'"
                type="button" 
                role="tab"
              >
                <i class="bi bi-star"></i> Değerlendirmeler
              </button>
            </li>
          </ul>
          <div class="tab-content">
            <div 
              class="tab-pane" 
              :class="{ 'fade show active': activeTab === 'description' }"
              role="tabpanel"
            >
              <p>{{ product.description || 'Bu ürün için açıklama bulunmamaktadır.' }}</p>
            </div>
            <div 
              class="tab-pane" 
              :class="{ 'fade show active': activeTab === 'specs' }"
              role="tabpanel"
            >
              <div v-if="product.attributes && product.attributes.length > 0">
                <table class="specs-table">
                  <tbody>
                    <tr v-for="attr in product.attributes" :key="attr.id">
                      <th><i class="bi bi-check2-circle"></i> {{ attr.name }}</th>
                      <td>{{ attr.value }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="no-specs">
                <i class="bi bi-exclamation-circle"></i>
                <p>Bu ürün için teknik özellik bulunmamaktadır.</p>
              </div>
            </div>
            
            <!-- Değerlendirmeler sekmesi -->
            <div 
              class="tab-pane" 
              :class="{ 'fade show active': activeTab === 'reviews' }"
              role="tabpanel"
            >
              <div v-if="product.reviews.length > 0">
                <div class="reviews-summary">
                  <div class="average-rating">
                    <div class="rating-number">{{ calculateAverageRating() }}</div>
                    <div class="rating-stars">
                      <i v-for="star in 5" :key="star" class="bi" 
                        :class="star <= Math.round(calculateAverageRating()) ? 'bi-star-fill' : 'bi-star'"></i>
                    </div>
                    <div class="rating-count">{{ product.reviews.length }} değerlendirme</div>
                  </div>
                </div>
                
                <div class="reviews-list">
                  <div v-for="review in product.reviews" :key="review.id" class="review-item">
                    <div class="review-header">
                      <div class="review-user">
                        <i class="bi bi-person-circle"></i>
                        <span class="user-name">{{ review.user.firstName }}</span>
                      </div>
                      <div class="review-date">{{ formatReviewDate(review.createdAt) }}</div>
                    </div>
                    
                    <div class="review-rating">
                      <i v-for="star in 5" :key="star" class="bi" 
                        :class="star <= review.rating ? 'bi-star-fill' : 'bi-star'"></i>
                    </div>
                    
                    <div class="review-comment">{{ review.comment }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="no-reviews">
                <i class="bi bi-chat-square-text"></i>
                <p>Bu ürün için henüz değerlendirme bulunmamaktadır.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ürün bulunamadı -->
      <div v-else class="product-not-found">
        <i class="bi bi-exclamation-triangle"></i>
        <h2>Ürün Bulunamadı</h2>
        <p>Aradığınız ürün mağazamızda bulunmamaktadır.</p>
        <router-link to="/" class="btn continue-shopping">
          <i class="bi bi-arrow-left"></i> Alışverişe Devam Et
        </router-link>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toast-notification";
import { useCartStore, useLoggedInStore } from "@/stores/counter";
import apiClient from "@/api";

const route = useRoute();
const router = useRouter();
const $toast = useToast();
const cartStore = useCartStore();
const currentProduct = computed(() => selectedVariant.value || product.value);
const isLoading = ref(true);
const product = ref(null);
const quantity = ref(1);
const selectedVariant = ref(null);
const selectedImage = ref("");
const loggedInStore = useLoggedInStore();
const activeTab = ref("description");

// Resim yükleme hatası durumu
/*const handleImageError = (event) => {
  event.target.src = "/placeholder-image.jpg";
};*/
const addToFavorites = () => {
  const productId = route.params.id;
  apiClient.post("/favorites", {
    productId: productId
  }).then((response) => {
    product.value.isFavorited = true;
    $toast.success("Ürün favorilere eklendi", { duration: 1000 });
  }).catch((error) => {
    console.error(error);
    $toast.error("Favorilere eklenirken bir hata oluştu.", { duration: 1000 }); 
  });
}

const removeFromFavorites = () => {
  const productId = route.params.id;
  apiClient.delete(`/favorites/${productId}`)
    .then((response) => {
      product.value.isFavorited = false;
      $toast.error("Ürün favorilerden kaldırıldı", { duration: 1000 });
    })
    .catch((error) => {
      console.error(error);
      $toast.error("Favorilerden kaldırılırken bir hata oluştu.", { duration: 1000 });
    });
}

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

const increaseQuantity = () => {
  return quantity.value++;
};

const decreaseQuantity = () => {
  return quantity.value > 1 ? quantity.value-- : 1;
};

const addToCart = (currentProduct) => {
  const productDto = {
    productId: product.value.id,
    quantity: quantity.value,
  };

  if (selectedVariant.value && selectedVariant.value.id) {
    productDto.variantId = selectedVariant.value.id;
  }

  apiClient
    .post("/cart", productDto, {
    })
    .then((response) => {
      $toast.success(`${currentProduct.name} sepete eklendi`, {
        duration: 1000,
      });
    })
    .catch((error) => {
      console.error(error);
      $toast.error("Sepete eklenirken bir hata oluştu.", { duration: 1000 });
    });
};

const selectVariant = (variant) => {
  selectedVariant.value = variant;
  quantity.value = 1;
  
  // Varyant seçildiğinde görseli güncelle
  if (variant && variant.imageUrl) {
    selectedImage.value = variant.imageUrl;
  } else if (product.value) {
    // Varsayılan ürün görseline dön
    selectedImage.value = product.value.imageUrl;
  }
};

// Tekrarları önlemek için filtrelenmiş görsel listesi
const filteredImages = computed(() => {
  if (!product.value || !product.value.images) return [];
  
  // Ana görseli listeden çıkar
  return product.value.images.filter(image => 
    image.url !== product.value.imageUrl
  );
});

const calculateAverageRating = () => {
  if (!product.value || !product.value.reviews) return 0;
  const totalRating = product.value.reviews.reduce((sum, review) => {
    return sum + review.rating;
  }, 0);
  return (totalRating / product.value.reviews.length).toFixed(1);
};

const formatReviewDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  isLoading.value = true;
  const productId = route.params.id;
  apiClient
    .get(`/product/${productId}`)
    .then((response) => {
      product.value = response.data;
      selectedImage.value = product.value.imageUrl; // Varsayılan görsel
      isLoading.value = false;
      console.log(product.value.attributes);
    })
    .catch((error) => {
      console.error("Error fetching product data:", error);
      isLoading.value = false;
    });
});
</script>
  
<style scoped>
.product-detail-container {
  padding: 20px 0;
  background-color: #f8f9fa;
}

.product-detail {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
}

/* Breadcrumb */
.breadcrumb-container {
  margin-bottom: 25px;
  padding: 10px 0;
}

.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin-bottom: 0;
}

.breadcrumb-item a {
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.breadcrumb-item a:hover {
  color: #ff7f00;
}

.breadcrumb-item.active {
  color: #333;
  font-weight: 500;
}

/* Brand bilgisi */
.brand-info {
  margin-bottom: 15px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.brand-name {
  color: #e67300;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  padding: 5px 12px;
  border-radius: 20px;
}

.brand-name:hover {
  color: #e67300;
  transform: translateY(-2px);
}

.brand-name i {
  color: #e67300;
}

/* Kategori bilgisi */
.category-info {
  margin-bottom: 15px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.category-name {
  color: #2c7be5;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  background-color: rgba(44, 123, 229, 0.08);
  padding: 5px 12px;
  border-radius: 20px;
}

.category-name:hover {
  color: #1a68d1;
  background-color: rgba(44, 123, 229, 0.12);
  transform: translateY(-2px);
}

.category-name i {
  color: #2c7be5;
}

/* Yükleniyor ve ürün bulunamadı */
.loading-container,
.product-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
}

.product-not-found i {
  font-size: 4.5rem;
  color: #f0ad4e;
  margin-bottom: 20px;
}

.product-not-found h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
}

.product-not-found p {
  color: #777;
  margin-bottom: 25px;
  font-size: 1.1rem;
}

.continue-shopping {
  background-color: #ff7f00;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.continue-shopping:hover {
  background-color: #e67300;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 127, 0, 0.2);
}

/* Ürün görseli */
.product-image-container {
  position: relative;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.product-badges {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.badge {
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 600;
}

.featured-badge {
  background-color: #ff7f00;
  color: white;
}

.main-image {
  width: 100%;
  border-radius: 8px;
  transition: transform 0.5s;
  object-fit: contain;
  background-color: #fff;
  height: 350px;
}

.product-image-container:hover .main-image {
  transform: scale(1.05);
}

.product-thumbnails {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}

.product-thumbnails::-webkit-scrollbar {
  height: 6px;
}

.product-thumbnails::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 10px;
}

.thumbnail-item {
  width: 75px;
  height: 75px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.thumbnail-item:hover {
  border-color: #ddd;
  transform: translateY(-3px);
}

.thumbnail-item.active {
  border-color: #ff7f00;
  transform: translateY(-3px);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Ürün bilgileri */
.product-info {
  padding: 10px 15px;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.3;
}

.store-info {
  margin-bottom: 15px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.store-name {
  color: #ff7f00;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.store-name:hover {
  color: #e67300;
  text-decoration: underline;
}

.sku-info {
  display: flex;
  gap: 15px;
  color: #777;
  font-size: 0.9rem;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.sku-badge,
.barcode-badge {
  background-color: #f5f5f5;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.product-price {
  margin: 25px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.current-price {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ff7f00;
}

.stock-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.stock-status.in-stock {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.stock-status.low-stock {
  color: #f0ad4e;
  background-color: rgba(240, 173, 78, 0.1);
}

/* Varyant seçimi */
.product-variants {
  margin-bottom: 25px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
}

.product-variants label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #444;
  display: flex;
  align-items: center;
  gap: 6px;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.variant-btn {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.variant-btn:hover:not(.active) {
  border-color: #ccc;
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

.variant-btn.active {
  border-color: #ff7f00;
  background-color: #fff3e6;
  color: #ff7f00;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(255, 127, 0, 0.15);
  transform: translateY(-2px);
}

/* Varyant detayları */
.variant-details {
  margin-top: 12px;
  padding: 10px 15px;
  background-color: #fff3e6;
  border-radius: 8px;
  border-left: 3px solid #ff7f00;
}

.variant-highlight {
  color: #555;
  font-size: 0.95rem;
}

.variant-highlight strong {
  color: #ff7f00;
}

/* Adet seçimi */
.quantity-selector {
  margin-bottom: 25px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.quantity-selector label {
  display: block;
  font-weight: 600;
  color: #444;
  margin-right: 10px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #ccc;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-controls input {
  width: 60px;
  height: 38px;
  border: 1px solid #ddd;
  border-radius: 0;
  text-align: center;
  margin: 0 5px;
  font-weight: 500;
}

.quantity-controls input:focus {
  outline: none;
  border-color: #ff7f00;
}

.stock-info {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.low-stock-text {
  color: #f0ad4e;
  font-weight: 600;
}

/* Sepete ekle */
.add-to-cart-section {
  margin-top: 30px;
  display: flex;
  gap: 15px;
  align-items: stretch;
}

.add-to-cart-btn {
  padding: 14px 30px;
  border-radius: 8px;
  border: none;
  background-color: #ff7f00;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(255, 127, 0, 0.2);
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #e67300;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 127, 0, 0.3);
}

.add-to-cart-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.add-to-cart-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #ccc;
  box-shadow: none;
}

.wishlist-btn {
  width: 50px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 1.1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wishlist-btn:hover {
  background-color: #f0f0f0;
  color: #ff7f00;
  border-color: #ff7f00;
  transform: translateY(-3px);
}

.stock-warning {
  color: #dc3545;
  margin-top: 15px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background-color: rgba(220, 53, 69, 0.1);
  border-radius: 6px;
}

/* Hızlı bilgi blokları */
.quick-info {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.quick-info-item {
  flex: 1;
  min-width: 150px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-info-item i {
  font-size: 1.2rem;
  color: #ff7f00;
}

.quick-info-item span {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

/* Ürün detay tabları */
.product-details-tabs {
  margin-top: 50px;
}

.nav-tabs {
  border-bottom: 1px solid #ddd;
  gap: 10px;
}

.nav-link {
  color: #666;
  font-weight: 500;
  border: none;
  padding: 12px 25px;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link i {
  font-size: 1.1rem;
}

.nav-link:hover:not(.active) {
  border-color: transparent;
  background-color: #f5f5f5;
  color: #555;
}

.nav-link.active {
  color: #ff7f00;
  border-bottom: 3px solid #ff7f00;
  background-color: #fff3e6;
  font-weight: 600;
}

.tab-content {
  padding: 25px 15px;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tab-pane p {
  color: #555;
  line-height: 1.8;
  font-size: 1.05rem;
}

/* Teknik özellikler tablosu */
.specs-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  margin-top: 10px;
}

.specs-table th,
.specs-table td {
  padding: 16px 20px;
  text-align: left;
  vertical-align: middle;
}

.specs-table tr {
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
}

.specs-table tr:hover {
  background-color: #fffaf3;
}

.specs-table tr:last-child {
  border-bottom: none;
}

.specs-table th {
  width: 35%;
  color: #333;
  font-weight: 600;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.specs-table th i {
  color: #ff7f00;
  font-size: 1.1rem;
}

.specs-table td {
  color: #444;
  background-color: white;
  font-weight: 500;
}

.specs-table tr:nth-child(even) td {
  background-color: #fafafa;
}

/* Teknik özellikler - boş durum */
.no-specs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #777;
  text-align: center;
}

.no-specs i {
  font-size: 2.5rem;
  color: #ddd;
  margin-bottom: 15px;
}

.no-specs p {
  font-size: 1.1rem;
}

.reviews-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ff7f00;
  line-height: 1;
}

.rating-stars {
  margin: 10px 0;
  color: #ff9900;
  font-size: 1.3rem;
}

.rating-count {
  color: #666;
  font-size: 0.9rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 20px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #ff7f00;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-user i {
  font-size: 1.3rem;
  color: #666;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.review-date {
  color: #888;
  font-size: 0.85rem;
}

.review-rating {
  margin-bottom: 12px;
  color: #ff9900;
  font-size: 1.1rem;
}

.review-comment {
  color: #444;
  line-height: 1.6;
}

.no-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #777;
  text-align: center;
}

.no-reviews i {
  font-size: 2.5rem;
  color: #ddd;
  margin-bottom: 15px;
}

.no-reviews p {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .reviews-summary {
    flex-direction: column;
    padding: 15px;
  }
  
  .review-item {
    padding: 15px;
  }
}

/* Responsive tasarım */
@media (max-width: 991px) {
  .product-title {
    font-size: 1.6rem;
  }

  .current-price {
    font-size: 1.8rem;
  }

  .main-image {
    height: 300px;
  }

  .quick-info {
    gap: 10px;
  }

  .quick-info-item {
    padding: 10px;
    min-width: 120px;
  }
}

@media (max-width: 767px) {
  .product-details-tabs {
    margin-top: 35px;
  }

  .nav-link {
    padding: 10px 15px;
    font-size: 0.95rem;
  }

  .specs-table th {
    width: 40%;
  }

  .product-detail {
    padding: 15px;
  }

  .quantity-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .stock-info {
    margin-left: 0;
  }

  .quick-info-item {
    min-width: 100%;
  }

  .main-image {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .product-title {
    font-size: 1.4rem;
  }

  .current-price {
    font-size: 1.6rem;
  }

  .variant-options {
    gap: 8px;
  }

  .variant-btn {
    padding: 8px 12px;
    font-size: 0.9rem;
  }

  .add-to-cart-btn {
    padding: 12px 20px;
    font-size: 1rem;
  }

  .product-price {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .nav-tabs {
    gap: 5px;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
}
</style>