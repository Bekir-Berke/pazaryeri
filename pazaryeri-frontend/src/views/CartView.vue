<template>
  <div class="cart-container">
    <div class="cart-header">
      <h1>Sepetim</h1>
      <p v-if="cartStore.cart.length > 0" class="cart-count">
        <span class="count-badge">{{ cartCount }}</span> ürün
      </p>
      <p v-else class="cart-empty-message">Sepetinizde ürün bulunmamaktadır</p>
    </div>

    <div class="cart-content" v-if="cartStore.cart.length > 0">
      <div class="cart-items">
        <!-- Sepet öğeleri -->
        <div class="cart-item" v-for="item in cartStore.cart" :key="item.id">
          <div class="item-image">
            <!-- Varyant varsa varyant resmini, yoksa ürün resmini göster -->
            <img :src="item.variant && item.variant.imageUrl ? item.variant.imageUrl : (item.product && item.product.imageUrl ? item.product.imageUrl : '')" alt="Ürün görseli" />
          </div>
          <div class="item-details">
            <router-link
              :to="{ name: 'product', params: { id: item.productId } }"
            >
              <!-- Varyant varsa varyant adını, yoksa ürün adını göster -->
              <h3 class="item-name">
                {{ item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name }}
              </h3>
            </router-link>
            <p class="item-seller">
              Satıcı:
              <span class="seller-name">{{ item.product && item.product.store ? item.product.store.name : 'Bilinmeyen' }}</span>
            </p>
          </div>
          <div class="item-quantity">
            <button class="quantity-btn decrease" :disabled="item.quantity == 1" @click="decreaseQuantity(item)">
              <i class="bi bi-dash"></i>
            </button>
            <span class="quantity-value">{{ item.quantity }}</span>
            <button class="quantity-btn increase" @click="increaseQuantity(item)">
              <i class="bi bi-plus"></i>
            </button>
          </div>
          <div class="item-price">
            <p class="current-price">{{ formatPrice(item.quantity * item.price) }}</p>
          </div>
          <div class="item-actions">
            <button class="remove-btn" title="Sepetten Çıkar" @click="deleteFromCart(item)">
              <i class="bi bi-trash"></i>
            </button>
            <button class="favorite-btn" title="Favorilere Ekle">
              <i class="bi bi-heart"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="cart-sidebar">
        <div class="cart-summary">
          <h2>Sipariş Özeti</h2>
          <div class="summary-row">
            <span>Ürünler Toplamı</span>
            <span>{{formatPrice(productTotalPrice)}}</span>
          </div>
          <div class="summary-row">
            <span>Kargo Ücreti</span>
            <span class="free-shipping">{{formatPrice(shippingCost)}}</span>
          </div>
          <div class="summary-row total">
            <span>Toplam</span>
            <span>{{ formatPrice(totalPrice) }}</span>
          </div>
          <router-link to="/checkout">
            <button class="checkout-btn">
              <i class="bi bi-lock"></i> Siparişi Tamamla
            </button>
          </router-link>
          <div class="secure-payment">
            <i class="bi bi-shield-check"></i> Güvenli Ödeme
          </div>
        </div>

        <div class="promo-code-container">
          <h3>İndirim Kodu</h3>
          <div class="promo-code">
            <input type="text" placeholder="İndirim kodunuz" />
            <button>Uygula</button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-cart" v-else>
      <div class="empty-cart-icon">
        <i class="bi bi-cart-x"></i>
      </div>
      <h2>Sepetiniz Boş</h2>
      <p>
        Sepetinizde ürün bulunmamaktadır. Alışverişe başlamak için ana sayfaya
        dönebilirsiniz.
      </p>
      <router-link to="/">
        <button class="continue-shopping-btn">
        <i class="bi bi-arrow-left"></i> Alışverişe Devam Et
      </button>
      </router-link>
    </div>
  </div>
</template>
<script setup>
import { useCartStore } from "@/stores/counter";
import { useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { useToast } from "vue-toast-notification";
import apiClient from "@/api";
const cartStore = useCartStore();
const router = useRouter();
const toast = useToast();
const isLoading = ref(false);
const cartCount = computed(() => {
  return cartStore.cart.map(item => item.quantity).reduce((a, b) => a + b, 0);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

const productTotalPrice = computed(() => {
  return cartStore.cart
    .map(item => item.quantity * item.price)
    .reduce((a, b) => a + b, 0);
});

const shippingCost = computed(() => {
  return productTotalPrice.value > 100 ? 0 : 20;
});

const totalPrice = computed(() => {
  return productTotalPrice.value + shippingCost.value;
});

const deleteFromCart = (item) => {
  try {
    const deleteData = {
    productId: item.productId,
    variantId: item.variant ? item.variant.id : null,
  };
  apiClient.delete(`/cart`, {
    data: deleteData
  })
    .then(() => {
      cartStore.removeFromCart(item);
      toast.success("Ürün sepetten çıkarıldı");
    })
    .catch((error) => {
      console.error(error);
      toast.error("Ürün sepetten çıkarılamadı");
    });
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    toast.error("Ürün sepetten çıkarılamadı");
  }
}

const increaseQuantity = (item) => {
  const productDto = {
    productId: item.productId,
    quantity: 1
  };
  
  // Eğer varyant varsa, varyant ID'sini ekle
  if (item.variant && item.variant.id) {
    productDto.variantId = item.variant.id;
  }
  
  apiClient.post(`/cart`, productDto, { 
  })
    .then(() => {
      toast.success("Ürün sepetinize eklendi");
    })
    .catch((error) => {
      console.error(error);
      toast.error("Ürün sepete eklenemedi");
    });
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    const productDto = {
      productId: item.productId,
      quantity: -1
    };
    
    // Eğer varyant varsa, varyant ID'sini ekle
    if (item.variant && item.variant.id) {
      productDto.variantId = item.variant.id;
    }
    
    apiClient.post(`/cart`, productDto, { 
    })
      .then(() => {
        cartStore.decreaseQuantity(item);
        toast.success("Ürün sepetinizden çıkarıldı");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Ürün sepetinizden çıkarılamadı");
      });
  }
};

onMounted(() => {
  isLoading.value = true;
  apiClient.get("/cart")
    .then((response) => {
      if (response.data) {
        cartStore.initCart(response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching cart:", error);
    })
    .finally(() => {
      isLoading.value = false;
    });
});
</script>
<style scoped>
.quantity-btn:disabled:hover {
  background-color: inherit;
  box-shadow: none;
  color: #aaa;
}
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

.cart-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.cart-header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0;
  position: relative;
}

.cart-header h1::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 4px;
  background-color: #ff7f00;
  border-radius: 2px;
}

.cart-count {
  color: #666;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.count-badge {
  display: inline-block;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  text-align: center;
  line-height: 24px;
  margin-right: 8px;
  font-size: 0.9rem;
}

.cart-empty-message {
  color: #666;
  font-style: italic;
}

.cart-content {
  display: grid;
  grid-template-columns: 3fr 1.5fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}

.cart-items {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 120px 3fr 1fr 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #eaeaea;
  align-items: center;
  position: relative;
}

.cart-item:hover {
  background-color: #f9f9f9;
}

.cart-item:last-child {
  border-bottom: none;
}

@media (max-width: 992px) {
  .cart-item {
    grid-template-columns: 100px 2fr 1fr 1fr auto;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 80px 3fr;
    grid-template-areas:
      "image details"
      "image price"
      "quantity actions";
    row-gap: 1rem;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    border: 1px solid #eaeaea;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .item-image {
    grid-area: image;
  }

  .item-details {
    grid-area: details;
  }

  .item-quantity {
    grid-area: quantity;
    justify-self: start;
  }

  .item-price {
    grid-area: price;
    justify-self: start;
    text-align: left;
    margin-top: 0.5rem;
  }

  .item-actions {
    grid-area: actions;
    justify-self: end;
    display: flex;
    gap: 0.5rem;
  }
}

.item-image {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.item-image img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-image:hover img {
  transform: scale(1.05);
}

.item-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #ff5722;
  color: white;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  transition: color 0.2s;
}

.item-name:hover {
  color: #4caf50;
}

.item-seller {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.seller-name {
  font-weight: 600;
  color: #333;
}

.item-delivery {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delivery-icon {
  color: #4caf50;
}

.delivery-time {
  font-weight: 600;
  color: #4caf50;
}

.item-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.option-tag {
  background-color: #f5f5f5;
  color: #666;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background-color: white;
  border: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.quantity-btn:hover {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.quantity-value {
  font-size: 1rem;
  width: 32px;
  text-align: center;
  font-weight: 600;
}

.item-price {
  text-align: right;
}

.current-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.original-price {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
  margin: 0.25rem 0;
}

.saving {
  font-size: 0.85rem;
  background-color: #e8f5e9;
  color: #4caf50;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.remove-btn,
.favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.5rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn {
  color: #ff5722;
  background-color: #fee8e7;
}

.remove-btn:hover {
  background-color: #ff5722;
  color: white;
}

.favorite-btn {
  color: #f06292;
  background-color: #fce4ec;
}

.favorite-btn:hover {
  background-color: #f06292;
  color: white;
}

.cart-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-summary,
.promo-code-container,
.delivery-info {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.cart-summary {
  position: sticky;
  top: 2rem;
}

.cart-summary h2,
.promo-code-container h3,
.delivery-info h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eaeaea;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #666;
}

.free-shipping {
  color: #4caf50;
  font-weight: 600;
}

.summary-row.discount {
  color: #4caf50;
  font-weight: 500;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eaeaea;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin: 1.5rem 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.checkout-btn:hover {
  background-color: #ff9800;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
}

.secure-payment {
  text-align: center;
  color: #757575;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.promo-code {
  display: flex;
  gap: 0.5rem;
}

.promo-code input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: #f9f9f9;
  transition: all 0.2s;
}

.promo-code input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  background-color: white;
}

.promo-code button {
  padding: 0.75rem 1.25rem;
  background-color: #673ab7;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.promo-code button:hover {
  background-color: #5e35b1;
}

.delivery-option {
  display: flex;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  transition: all 0.2s;
}

.delivery-option:hover {
  background-color: #f9f9f9;
  border-color: #ddd;
}

.delivery-option input[type="radio"] {
  margin-right: 1rem;
  accent-color: #4caf50;
}

.delivery-option label {
  flex: 1;
  cursor: pointer;
}

.option-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.option-price {
  font-weight: 600;
  color: #4caf50;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.empty-cart-icon {
  font-size: 4rem;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-cart h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
}

.empty-cart p {
  color: #666;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.continue-shopping-btn {
  padding: 1rem 2rem;
  background-color: #ff7f00;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
}

.continue-shopping-btn:hover {
  background-color: #ff9800;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(33, 150, 243, 0.4);
}

.recommended-products {
  margin-top: 3rem;
}

.recommended-products h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.recommended-products h2::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 4px;
  background-color: #ff9800;
  border-radius: 2px;
}

.product-slider {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  display: block;
  transition: transform 0.5s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.product-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
}

.product-badge.new {
  background-color: #2196f3;
  color: white;
}

.product-badge.discount {
  background-color: #ff5722;
  color: white;
}

.quick-view-btn {
  position: absolute;
  bottom: -40px;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 0.5rem;
  font-size: 0.9rem;
  transition: bottom 0.3s;
  cursor: pointer;
}

.product-card:hover .quick-view-btn {
  bottom: 0;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.product-name:hover {
  color: #ff9800;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #ff9800;
}

.product-rating span {
  color: #757575;
  margin-left: 0.25rem;
}

.product-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-to-cart-btn:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
}

/* Diğer ekranlar için medya sorguları */
@media (max-width: 576px) {
  .cart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-count {
    margin-top: 0.5rem;
  }

  .product-slider {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>