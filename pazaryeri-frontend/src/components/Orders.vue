<template>
  <div class="orders-container">
    <h2 class="orders-title">Siparişlerim</h2>
    
    <div v-if="!orders || orders.length === 0" class="no-orders">
      <p>Henüz siparişiniz bulunmamaktadır.</p>
    </div>
    
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3 class="order-number">Sipariş #{{ order.orderNumber }}</h3>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div class="order-status" :class="getStatusClass(order.status)">
            {{ translateStatus(order.status) }}
          </div>
        </div>
        
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div class="item-image">
              <img 
                v-if="item.product.imageUrl" 
                :src="item.product.imageUrl" 
                :alt="item.product.name"
              >
              <div v-else class="no-image">Görsel Yok</div>
            </div>
            <div class="item-details">
              <h4 class="item-name">{{ item.product.name }}</h4>
              <p v-if="item.variant" class="item-variant">
                <span class="variant-label">Varyant:</span>
                {{ item.variant.name }}
              </p>
              <p class="item-store">Satıcı: {{ item.product.store.name }}</p>
              <p class="item-price">
                {{ formatPrice(item.variant ? item.variant.price : item.price) }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <span>Toplam:</span>
            <span class="total-amount">{{ formatPrice(order.totalAmount) }}</span>
          </div>
          <router-link :to="{ name: 'order', params: { id: order.id } }">
            <button class="btn-details">Detayları Görüntüle</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineModel } from 'vue';

const orders = defineModel();

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price);
};

const translateStatus = (status) => {
  const statusMap = {
    'PROCESSING': 'İşleniyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  return {
    'status-processing': status === 'PROCESSING',
    'status-shipped': status === 'SHIPPED',
    'status-delivered': status === 'DELIVERED',
    'status-cancelled': status === 'CANCELLED'
  };
};
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.orders-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #e0e0e0;
}

.no-orders {
  text-align: center;
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  background-color: #f6f8fa;
  border-bottom: 1px solid #eaeaea;
}

.order-number {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.3rem 0;
}

.order-date {
  font-size: 0.85rem;
  color: #666;
}

.order-status {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
}

/* Tema uyumlu durum renkleri */
.status-processing {
  background-color: #fff3e6;
  color: #ff7f00;
}

.status-shipped {
  background-color: #e6f7ff;
  color: #0066cc;
}

.status-delivered {
  background-color: #e6fff0;
  color: #00994d;
}

.status-cancelled {
  background-color: #ffebee;
  color: #cc0000;
}

.order-items {
  padding: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.order-item {
  display: flex;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 1rem;
  background-color: #f0f0f0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.8rem;
  text-align: center;
}

.item-details {
  flex: 1;
}

.item-name {
  margin: 0 0 0.3rem 0;
  font-size: 1rem;
  color: #333;
}

.item-variant {
  margin: 0 0 0.3rem 0;
  font-size: 0.85rem;
  color: #666;
}

.variant-label {
  font-weight: 600;
}

.item-store {
  margin: 0 0 0.3rem 0;
  font-size: 0.85rem;
  color: #666;
}

.item-price {
  margin: 0;
  color: #ff7f00; /* Tema rengi */
  font-weight: 600;
  font-size: 0.95rem;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
}

.order-total {
  font-size: 1rem;
}

.total-amount {
  font-weight: 600;
  color: #ff7f00; /* Tema rengi */
  margin-left: 0.5rem;
}

.btn-details {
  background-color: transparent;
  border: 1px solid #ff7f00; /* Tema rengi */
  color: #ff7f00; /* Tema rengi */
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-details:hover {
  background-color: #ff7f00; /* Tema rengi */
  color: white;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .order-status {
    align-self: flex-start;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-details {
    width: 100%;
  }
}
</style>