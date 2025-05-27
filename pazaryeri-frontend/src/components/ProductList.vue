<template>
  <div class="product-list-container">
    <div class="container">
      <!-- Ürün listesi -->
      <div class="products-container grid">
        <div v-if="isLoading" class="loading-container">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
          </div>
          <p>Ürünler yükleniyor...</p>
        </div>

        <div v-else-if="products.length === 0" class="no-products">
          <i class="bi bi-basket"></i>
          <p>Ürün bulunamadı.</p>
        </div>

        <template v-else>
          <!-- Grid görünümü -->
          <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
          >
            <div class="product-badges">
              <span v-if="product.isNew" class="badge new-badge">Yeni</span>
              <span v-if="product.discountRate" class="badge discount-badge"
                >%{{ product.discountRate }}</span
              >
            </div>

            <div class="product-image">
              <router-link :to="`/product/${product.id}`">
                <img
                  :src="product.imageUrl"
                  :alt="product.name"
                  @error="handleImageError"
                />
              </router-link>
            </div>

            <div class="product-info">
              <h3 class="product-title">
                <router-link :to="`/product/${product.id}`">{{
                  product.name
                }}</router-link>
              </h3>

              <div class="product-price">
                <span v-if="product.discountRate" class="old-price">{{
                  formatPrice(product.oldPrice)
                }}</span>
                <span class="current-price">{{
                  formatPrice(product.vatPrice)
                }}</span>
              </div>

              <button
                v-if="loggedInStore.loggedIn"
                class="add-to-cart-btn"
                @click="addToCart(product)"
              >
                <i class="bi bi-cart-plus"></i>
              </button>
              <button
                v-else
                class="add-to-cart-btn"
                @click="router.push('/login')"
              >
                <i class="bi bi-cart-plus"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import {
  useProductStore,
  useCartStore,
  useLoggedInStore,
} from "@/stores/counter";
import { useToast } from "vue-toast-notification";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import apiClient from "@/api";
import router from "@/router";

const route = useRoute();
const $toast = useToast();
const isLoading = ref(true);
const currentPage = ref(1);
const viewType = ref("grid");
const itemsPerPage = ref(20);
const totalItems = ref(0);
const productStore = useProductStore();
const cartStore = useCartStore();
const loggedInStore = useLoggedInStore();
const products = computed(() => productStore.products);

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / itemsPerPage.value);
});

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
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

const handleImageError = (event) => {
  event.target.src = "";
};

onMounted(() => {
  productStore.fetchProducts();
  isLoading.value = false;
});
</script>
  
  <style scoped>
.product-list-container {
  padding: 15px 0;
  background-color: #f8f8f8;
}

/* Ürün listesi görünümleri - daha fazla ürün gösterimi için sıklaştırılmış */
.products-container {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(6, 1fr); /* 6 sütun - Trendyol stili */
}

/* Ürün kartı - Küçültülmüş */
.product-card {
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.product-badges {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.badge {
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 0.65rem;
  font-weight: 600;
}

.new-badge {
  background-color: #4caf50;
  color: white;
}

.discount-badge {
  background-color: #f44336;
  color: white;
}

.product-image {
  position: relative;
  overflow: hidden;
  padding-top: 130%; /* Daha uzun görünüm için aspect ratio artırıldı */
  background-color: #f9f9f9;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* contain kullanarak ürünün tamamının görünmesini sağladık */
  transition: transform 0.2s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.03);
}

.product-info {
  padding: 8px 8px 30px 8px; /* Alt kısımda sepete ekle butonu için yer açıldı */
  position: relative;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 0.75rem;
  font-weight: 400;
  margin-bottom: 6px;
  line-height: 1.2;
  height: 2.4rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #333;
}

.product-title a {
  color: #333;
  text-decoration: none;
}

.product-title a:hover {
  color: #ff7f00;
}

.product-price {
  display: flex;
  flex-direction: column;
  margin-top: auto;
}

.old-price {
  color: #999;
  text-decoration: line-through;
  font-size: 0.7rem;
  margin-bottom: 2px;
}

.current-price {
  color: #333;
  font-size: 0.85rem;
  font-weight: 600;
}

.add-to-cart-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 24px;
  height: 24px;
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.7rem;
}

.add-to-cart-btn:hover {
  background-color: #e67300;
  transform: scale(1.1);
}

/* Yükleniyor ve "Ürün yok" durumları */
.loading-container,
.no-products {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  text-align: center;
}

.no-products i {
  font-size: 2.5rem;
  color: #ddd;
  margin-bottom: 15px;
}

.no-products p {
  color: #999;
  font-size: 1rem;
  margin-bottom: 15px;
}

/* Responsive tasarım - Trendyol benzeri görünüm için güncellendi */
@media (max-width: 1199px) {
  .products-container {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 991px) {
  .products-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 767px) {
  .products-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .products-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .product-title {
    font-size: 0.7rem;
  }

  .product-info {
    padding: 6px 6px 26px 6px;
  }
}

@media (max-width: 360px) {
  .products-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
  }
}
</style>