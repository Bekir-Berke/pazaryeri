<template>
  <div class="checkout-container">
    <div class="checkout-header">
      <h2>Ödeme Sayfası</h2>
      <div class="cart-badge">
        <i class="bi bi-cart"></i>
        <span>{{ cartCount }}</span>
      </div>
    </div>

    <!-- Sepet Özeti Bölümü -->
    <div class="checkout-section">
      <h3>Sepet Özeti</h3>
      <div class="cart-summary">
        <div v-for="item in cartStore.cart" :key="item.id" class="cart-item" >
          <div class="cart-item-image">
            <router-link :to="{ name: 'product', params: { id: item.product.id } }" >
              <img :src="item.product.imageUrl || 'https://via.placeholder.com/60'" alt="Ürün görseli">
            </router-link>
          </div>
          <div class="cart-item-details">
            <h4>{{ item.product.name }}</h4>
            <p class="cart-item-price">{{ formatPrice(item.price) }} x {{ item.quantity }}</p>
          </div>
          <div class="cart-item-total">
            {{ formatPrice(item.price * item.quantity)}}
          </div>
        </div>
        <div class="cart-total">
          <span>Toplam:</span>
          <span>{{ formatPrice(cartTotal) }}</span>
        </div>
      </div>
    </div>

    <div class="checkout-section">
      <h3>Teslimat Adresi</h3>
      <div class="form-group">
        <div class="address-cards">
          <div v-for="address in user.addresses" :key="address.id" 
               class="address-card" 
               :class="{ 'selected': orderDto.addressId === address.id }"
               @click="orderDto.addressId = address.id">
            <h5>{{ address.fullName }}</h5>
            <p v-if="address.fullAdress">{{ address.fullAdress }}</p>
            <div class="address-card-footer">
              <span class="badge" v-if="orderDto.addressId === address.id">Seçildi</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="checkout-section">
      <h3>Ödeme Bilgileri</h3>
      <div class="form-group">
        <div class="payment-cards">
          <div v-for="card in user.cards" :key="card.id" 
               class="payment-card" 
               :class="{ 
                 'selected': orderDto.cardId === card.id,
                 'card-visa': card.cardType?.toLowerCase() === 'visa',
                 'card-mastercard': card.cardType?.toLowerCase() === 'mastercard',
                 'card-amex': card.cardType?.toLowerCase() === 'american express',
                 'card-troy': card.cardType?.toLowerCase() === 'troy'
               }"
               @click="orderDto.cardId = card.id">
            <div class="card-chip"></div>
            <h5>{{ formatCardNumber(card.cardNumber) }}</h5>
            <div class="card-info">
              <span v-if="card.cardHolderName">{{ card.cardHolderName }}</span>
              <span v-if="card.expiryMonth && card.expiryYear">{{ card.expiryMonth + "/" + card.expiryYear }}</span>
            </div>
            <div class="card-type" v-if="card.cardType">{{ card.cardType }}</div>
            <div class="address-card-footer">
              <span class="badge" v-if="orderDto.cardId === card.id">Seçildi</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="checkout-footer">
      <button class="btn-checkout" :disabled="!orderDto.addressId || !orderDto.cardId" @click="checkout()">
        Ödemeyi Tamamla
      </button>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import { useRoute } from "vue-router";
import apiClient from "@/api.js";
import {useCartStore} from "@/stores/counter.js";
import Swal from "sweetalert2";
const cartStore = useCartStore();
const router = useRoute();
const cartCount = computed(() => {
  return cartStore.cart.map(item => item.quantity).reduce((a, b) => a + b, 0);
});

const cartTotal = computed(() => {
  return cartStore.cart.reduce((total, item) => 
    total + (item.price * item.quantity), 0).toFixed(2);
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(price);
};

const getBankName = (cardNumber, index) => {
  axios.get(`https://bin.bekirberke.tr/bin/${cardNumber}`)
    .then(response => {
      cards.value[index] = {
        ...cards.value[index],
        issuer: response.data.issuer || 'Bilinmiyor',
        type: response.data.type || '',
        category: response.data.category || '',
        brand: response.data.brand || '',
        issuerPhone: response.data.issuerPhone || '',
        issuerUrl: response.data.issuerUrl || '',
        country: response.data.country || '',
        alpha_2: response.data.alpha_2 || '',
        alpha_3: response.data.alpha_3 || '',
        showDetails: false
      }
    })
    .catch(error => {
      console.error('Error fetching bank name:', error);
      cards.value[index].issuer = 'Bilinmiyor';
    });
}

const orderDto = ref({
  addressId: null,
  cardId: null,
  phone: null
});

const user = ref({});
const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const lastFourDigits = cardNumber.slice(-4);
  const maskedPart = cardNumber.slice(0, -4).replace(/\d/g, '*');
  const formattedNumber = (maskedPart + lastFourDigits).match(/.{1,4}/g)?.join(' ') || '';
  return formattedNumber;
};

const checkout = () => {
  orderDto.value.phone = user.value.addresses.find(address => address.id === orderDto.value.addressId)?.phone;
  apiClient.post('/order', orderDto.value).then((response) => {
    Swal.fire({
      icon: 'success',
      title: 'Siparişiniz Başarılıyla Oluşturuldu',
      text: 'Siparişi numaranız: ' + response.data.orderNumber,
      timer:2000,
      showConfirmButton: false,
    }).then(() => {
      cartStore.clearCart();
      router.push({path:'/'});
    });
  }).catch((error) => {
    console.error("Error placing order:", error);
  });
}

onMounted(() => {
  apiClient.get('/users/profile').then((response) => {
    user.value = response.data;
    console.log("User profile fetched successfully:", user.value.addresses);
  }).catch((error) => {
    console.error("Error fetching user profile:", error);
  });
});
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.cart-badge {
  background-color: #4a6da7;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkout-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Sepet özeti stilleri */
.cart-summary {
  background-color: white;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.cart-item {
  display: flex;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  margin-right: 1rem;
  border-radius: 4px;
  overflow: hidden;
}

.cart-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-item-details {
  flex: 1;
}

.cart-item-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.cart-item-price {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.cart-item-total {
  font-weight: bold;
  color: #4a6da7;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #eee;
  font-size: 1.1rem;
}

h2 {
  color: #333;
  margin: 0;
}

h3 {
  color: #444;
  margin-top: 0;
  margin-bottom: 1.2rem;
  font-weight: 500;
}

.form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 16px;
  background-color: white;
}

.address-cards, .payment-cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.address-card {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.address-card:hover {
  border-color: #bbb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.payment-card {
  position: relative;
  background: linear-gradient(135deg, #444, #222);
  color: white;
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Kart tiplerine göre renkler */
.card-visa {
  background: linear-gradient(135deg, #0057a0, #00338d);
}

.card-mastercard {
  background: linear-gradient(135deg, #ee0b2d, #a9021e);
}

.card-amex {
  background: linear-gradient(135deg, #2671b5, #275e9e);
}

.card-troy {
  background: linear-gradient(135deg, #00a185, #008160);
}

.payment-card.selected {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #4a6da7;
}

.selected {
  border: 2px solid #4a6da7;
  background-color: #f0f5ff;
}

.address-card h5, .payment-card h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.address-card p {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.address-card-footer {
  display: flex;
  justify-content: flex-end;
}

.badge {
  background-color: #4a6da7;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.card-chip {
  width: 40px;
  height: 30px;
  background: linear-gradient(to bottom, #ccc, #999);
  border-radius: 5px;
  margin-bottom: 1rem;
}

.card-info {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  font-size: 0.8rem;
  opacity: 0.9;
}

.card-type {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.checkout-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-checkout {
  background-color: #4a6da7;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-checkout:hover {
  background-color: #3a5d97;
}

.btn-checkout:disabled {
  background-color: #b0b0b0;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 1rem;
  }

  .address-cards, .payment-cards {
    grid-template-columns: 1fr;
  }

  .checkout-section {
    padding: 1rem;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cart-item-image {
    margin-bottom: 0.5rem;
  }
  
  .cart-item-total {
    align-self: flex-end;
    margin-top: 0.5rem;
  }
}
</style>