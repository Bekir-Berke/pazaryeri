<template>
  <div class="favorites-container">
    <div v-if="favorites && favorites.length > 0" class="favorites-grid">
      <div v-for="favorite in favorites" :key="favorite.id" class="favorite-card">
        <div class="favorite-image">
          <img :src="favorite.product.imageUrl" :alt="favorite.product.name">
          <button @click.stop="removeFavorite(favorite.product.id)" class="remove-favorite">
            <i class="bi bi-heart-fill"></i>
          </button>
        </div>
          <div class="favorite-content">
            <router-link :to="{ name: 'product', params: { id: favorite.product.id } }">
              <div class="store-name">{{ favorite.product.store.name }}</div>
              <h3 class="product-name">{{ favorite.product.name }}</h3>
            </router-link>
            <div class="product-price">
              {{ formatPrice(favorite.product.vatPrice) }}
            </div>
            <div class="favorite-actions">
              <button @click.stop="addToCart(favorite.product)" class="btn-add-cart">
                <i class="bi bi-cart-plus"></i>
                Sepete Ekle
              </button>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/counter';
import { useToast } from "vue-toast-notification";
import { onMounted } from 'vue';
import apiClient from '@/api';


const favorites = defineModel();
const cartStore = useCartStore();
const toast = useToast();

const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
};

const removeFavorite = (favoriteId) => {
  apiClient.delete(`/favorites/${favoriteId}`)
    .then(() => {
      toast.success('Ürün favorilerden kaldırıldı');
      favorites.value = favorites.value.filter(favorite => favorite.product.id !== favoriteId);
    })
    .catch(error => {
      console.error('Favori silinirken hata oluştu:', error);
    });
};

const addToCart = (product) => {
  cartStore.addToCart({
    product: product,
    quantity: 1
  });
};
onMounted(() => {
  favorites.value.forEach((favorite) => {
    console.log(favorite);
  });
})
</script>

<style scoped>
a {
  text-decoration: none;
}

.favorites-container {
  width: 100%;
  padding: 1rem 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  /* 280px'den 220px'e düşürdük */
  gap: 1rem;
  /* 1.5rem'den 1rem'e düşürdük */
  margin: 1rem 0;
}

.favorite-card {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  /* Gölgeyi azalttık */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.favorite-image {
  height: 160px;
  /* 200px'den 160px'e düşürdük */
  position: relative;
  overflow: hidden;
}

.favorite-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.favorite-card:hover .favorite-image img {
  transform: scale(1.05);
}

.remove-favorite {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.remove-favorite:hover {
  transform: scale(1.1);
  background-color: white;
}

.remove-favorite i {
  color: #e74c3c;
  font-size: 1rem;
}

.remove-favorite:hover i {
  color: #c0392b;
}

.favorite-content {
  padding: 0.8rem;
  /* 1rem'den 0.8rem'e düşürdük */
}

.store-name {
  color: #666;
  font-size: 0.75rem;
  /* 0.85rem'den 0.75rem'e düşürdük */
  margin-bottom: 0.3rem;
  /* 0.5rem'den 0.3rem'e düşürdük */
}

.product-name {
  font-size: 1rem;
  /* 1.1rem'den 1rem'e düşürdük */
  font-weight: 600;
  margin-bottom: 0.3rem;
  /* 0.5rem'den 0.3rem'e düşürdük */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2c3e50;
}

.product-price {
  font-size: 1.1rem;
  /* 1.2rem'den 1.1rem'e düşürdük */
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.8rem;
  /* 1rem'den 0.8rem'e düşürdük */
}

.favorite-actions {
  display: flex;
  justify-content: center;
}

.btn-add-cart {
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  /* 0.6rem 1.5rem'den 0.5rem 1.2rem'e düşürdük */
  font-size: 0.9rem;
  /* 0.95rem'den 0.9rem'e düşürdük */
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.btn-add-cart:hover {
  background-color: #e67e22;
}

.btn-add-cart i {
  font-size: 1rem;
  /* 1.1rem'den 1rem'e düşürdük */
}

.empty-favorites {
  text-align: center;
  padding: 4rem 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-favorites i {
  font-size: 4rem;
  color: #cbd5e0;
}

.empty-favorites p {
  font-size: 1.1rem;
  color: #64748b;
}

.btn-shop {
  display: inline-block;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-shop:hover {
  background-color: #2980b9;
}
</style>