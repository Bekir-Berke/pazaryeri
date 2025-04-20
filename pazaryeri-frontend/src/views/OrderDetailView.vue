<template>
  <div class="order-detail-container">
    <div v-if="order" class="order-detail">
      <div class="order-header">
        <h1>Sipariş Detayı</h1>
        <div class="order-meta">
          <div class="order-number">
            <span class="label">Sipariş No:</span>
            <span class="value">#{{ order.orderNumber }}</span>
          </div>
          <div class="order-date">
            <span class="label">Tarih:</span>
            <span class="value">{{ formatDate(order.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="order-sections">
        <div class="order-section">
          <h2>Sipariş Özeti</h2>
          <div class="order-summary">
            <div class="summary-item">
              <span class="label">Toplam Tutar:</span>
              <span class="value price">{{ formatPrice(order.totalAmount) }} ₺</span>
            </div>
          </div>
        </div>

        <div class="order-section">
          <h2>Kargo Adresi</h2>
          <div class="address-card">
            <h3>{{ order.address.addressTitle }}</h3>
            <p class="recipient">{{ order.address.fullName }}</p>
            <p class="address-detail">{{ order.address.fullAddress }}</p>
            <p class="address-location">
              {{ order.address.neighborhood }}, {{ order.address.district }} / {{ order.address.city }}
            </p>
            <p class="address-phone">{{ formatPhone(order.phone) }}</p>
          </div>
        </div>

        <div class="order-section">
          <h2>Ödeme Bilgileri</h2>
          <div class="payment-card">
            <div class="card-type">
              <span class="card-icon" :class="order.card.cardType.toLowerCase()">
                {{ order.card.cardType }}
              </span>
            </div>
            <div class="card-details">
              <p class="card-holder">{{ order.card.cardHolderName }}</p>
              <p class="card-number">{{ maskCardNumber(order.card.cardNumber) }}</p>
              <p class="card-expiry">Son Kullanma: {{ order.card.expiryMonth }}/{{ order.card.expiryYear }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="order-items-section">
        <h2>Sipariş Ürünleri</h2>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div class="item-image">
              <img 
                :src="item.product.imageUrl || '/placeholder-product.png'" 
                :alt="item.product.name"
              />
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.product.name }}</h3>
              <p v-if="item.variant" class="item-variant">{{ item.variant.name }}</p>
              <p class="item-store">Satıcı: {{ item.product.store.name }}</p>
              <p class="item-status" :class="item.status.toLowerCase()">
                {{ translateStatus(item.status) }}
              </p>
            </div>
            <div class="item-quantity">
              <span>{{ item.quantity }} adet</span>
            </div>
            <div class="item-price">
              <p class="unit-price">{{ formatPrice(item.price) }} ₺</p>
              <p class="total-price">Toplam: {{ formatPrice(item.price * item.quantity) }} ₺</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>Sipariş bilgileri yükleniyor...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/api';

const route = useRoute();
const order = ref(null);

const fetchOrder = async () => {
    try {
        const response = await apiClient.get(`/order/${route.params.id}`);
        order.value = response.data;
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching order:', error);
    }
}

onMounted(() => {
    fetchOrder();
});

watch(() => route.params.id, () => {
    fetchOrder();
});

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatPrice = (price) => {
    return Number(price).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
};

const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    return cardNumber.replace(/\s/g, '').replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 •••• ••••');
};

const translateStatus = (status) => {
    const translations = {
        'PROCESSING': 'Hazırlanıyor',
        'SHIPPED': 'Kargoya Verildi',
        'DELIVERED': 'Teslim Edildi',
        'CANCELLED': 'İptal Edildi',
    };
    return translations[status] || status;
};
</script>

<style scoped>
.order-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.order-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1.5rem;
}

.order-header h1 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
}

.order-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.95rem;
}

.order-meta .label {
  font-weight: 500;
  color: #666;
  margin-right: 0.5rem;
}

.order-meta .value {
  font-weight: 600;
  color: #333;
}

.order-status {
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
}

.order-status.processing {
  background-color: #fff8e6;
  color: #b7791f;
}

.order-status.shipped {
  background-color: #e6f7ff;
  color: #0c71c3;
}

.order-status.delivered {
  background-color: #e6ffed;
  color: #2f855a;
}

.order-status.cancelled {
  background-color: #fff0f0;
  color: #e53e3e;
}

.order-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.order-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.order-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #444;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.75rem;
}

.order-summary .summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.order-summary .price {
  font-weight: 700;
  color: #111;
  font-size: 1.1rem;
}

.address-card, .payment-card {
  padding: 1rem 0;
}

.address-card h3 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.address-card p {
  margin: 0.3rem 0;
  color: #555;
  font-size: 0.95rem;
}

.address-card .recipient {
  font-weight: 500;
}

.card-type {
  margin-bottom: 1rem;
}

.card-icon {
  display: inline-block;
  padding: 0.35rem 0.7rem;
  border-radius: 4px;
  font-weight: 600;
}

.card-icon.mastercard {
  background-color: #ffebee;
  color: #d32f2f;
}

.card-icon.visa {
  background-color: #e3f2fd;
  color: #1565c0;
}

.card-details p {
  margin: 0.4rem 0;
  color: #555;
}

.card-holder {
  font-weight: 500;
}

.order-items-section {
  margin-top: 2rem;
}

.order-items-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #444;
}

.order-items {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.order-item {
  display: grid;
  grid-template-columns: auto 3fr 1fr 1fr;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.item-details h3 {
  font-size: 1.05rem;
  margin-bottom: 0.4rem;
}

.item-variant, .item-store {
  font-size: 0.85rem;
  color: #666;
  margin: 0.2rem 0;
}

.item-status {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.item-status.processing {
  background-color: #fff8e6;
  color: #b7791f;
}

.item-status.shipped {
  background-color: #e6f7ff;
  color: #0c71c3;
}

.item-status.delivered {
  background-color: #e6ffed;
  color: #2f855a;
}

.item-status.cancelled {
  background-color: #fff0f0;
  color: #e53e3e;
}

.item-quantity {
  text-align: center;
  font-weight: 500;
}

.item-price {
  text-align: right;
}

.unit-price {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.35rem;
}

.total-price {
  font-weight: 600;
  color: #111;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-top: 4px solid #0070f3;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .order-meta {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .order-item {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 0.75rem;
  }
  
  .item-image {
    margin: 0 auto;
  }
  
  .item-price, .item-quantity {
    text-align: center;
  }
  
  .order-sections {
    grid-template-columns: 1fr;
  }
}
</style>