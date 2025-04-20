<template>
  <div class="order-list">
    <div class="page-header">
      <h2 class="title">Siparişlerim</h2>
      
      <!-- Add filters and sort controls -->
      <div class="list-controls">
        <div class="filters">
          <div class="filter-group">
            <label>Durum</label>
            <select v-model="filters.status">
              <option value="">Tümü</option>
              <option v-for="status in availableStatuses" :key="status" :value="status">
                {{ statusText(status) }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Tarih Aralığı</label>
            <input 
              type="date" 
              v-model="filters.dateFrom" 
              :max="filters.dateTo"
              placeholder="Başlangıç"
            >
            <input 
              type="date" 
              v-model="filters.dateTo"
              :min="filters.dateFrom"
              placeholder="Bitiş"
            >
          </div>
          
          <div class="filter-group">
            <label>Minimum Tutar</label>
            <input 
              type="number" 
              v-model="filters.minAmount"
              placeholder="Min. Tutar"
            >
          </div>
        </div>
        
        <div class="sort-control">
          <label>Sıralama</label>
          <select v-model="sortBy">
            <option value="date-desc">Tarihe Göre (Yeni - Eski)</option>
            <option value="date-asc">Tarihe Göre (Eski - Yeni)</option>
            <option value="amount-desc">Tutara Göre (Yüksek - Düşük)</option>
            <option value="amount-asc">Tutara Göre (Düşük - Yüksek)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Update v-if condition to use filtered orders -->
    <div v-if="!filteredOrders.length" class="empty">
      <i class="fa fa-shopping-bag"></i>
      <p>{{ orders.length ? 'Filtrelenmiş sonuç bulunamadı.' : 'Henüz sipariş yok.' }}</p>
    </div>

    <!-- Update v-for to use filtered and sorted orders -->
    <div v-else v-for="order in filteredOrders" :key="order.id" class="order-card">
      <div class="order-header">
        <div class="order-header-left">
          <div class="order-number-wrapper">
            <span class="order-label">Sipariş No:</span>
            <span class="order-number">#{{ order.orderNumber }}</span>
          </div>
          <span class="order-date">
            <i class="fa fa-calendar-alt"></i>
            {{ formatDate(order.createdAt) }}
          </span>
        </div>
        <div class="order-total">
          <span class="total-label">Toplam:</span>
          <span class="total-amount">{{ formatPrice(order.totalAmount) }}₺</span>
        </div>
      </div>

      <div class="order-content">
        <div class="order-info">
          <div class="info-section order-user">
            <h4 class="section-title">
              <i class="fa fa-user-circle"></i>
              Müşteri Bilgileri
            </h4>
            <div class="info-content">
              <p class="customer-name">{{ order.user.firstName }} {{ order.user.lastName }}</p>
              <p class="customer-email">
                <i class="fa fa-envelope"></i>
                {{ order.user.email }}
              </p>
              <p class="customer-phone">
                <i class="fa fa-phone"></i>
                {{ order.phone }}
              </p>
            </div>
          </div>

          <div class="info-section order-address">
            <h4 class="section-title">
              <i class="fa fa-map-marker-alt"></i>
              Teslimat Adresi
            </h4>
            <div class="info-content">
              <p class="address-line">{{ order.address.fullAddress }}</p>
              <p class="address-detail">
                {{ order.address.neighborhood }}, {{ order.address.district }}, {{ order.address.city }}
              </p>
            </div>
          </div>
        </div>

        <div class="products-section">
          <h4 class="section-title">
            <i class="fa fa-box"></i>
            Sipariş İçeriği
          </h4>

          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-image-wrapper">
                <img :src="item.product.imageUrl || item.product.images?.[0]?.url || placeholder" class="item-image"
                  alt="Ürün görseli" />
              </div>

              <div class="item-info">
                <div class="item-main">
                  <h5 class="item-name">{{ item.productName }}</h5>
                  <p v-if="item.variant" class="item-variant">
                    {{ item.variant.name }}
                  </p>
                </div>

                <div class="item-details">
                  <span class="item-qty">
                    <i class="fa fa-cubes"></i>
                    {{ item.quantity }} adet
                  </span>
                  <span class="item-price">{{ formatPrice(item.price) }}₺</span>
                </div>

                <div class="item-status">
                  <div class="status-actions">
                    <span :class="['status-badge', 'status-' + item.status.toLowerCase()]">
                      <i class="fa" :class="getStatusIcon(item.status)"></i>
                      {{ statusText(item.status) }}
                    </span>
                    <button class="status-change-btn" @click="openStatusChange(item)" title="Durumu Değiştir">
                      <i class="fa fa-edit"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showStatusModal" class="status-modal">
      <div class="modal-content">
        <h3>Sipariş Durumunu Güncelle</h3>
        <div class="status-options">
          <button v-for="status in availableStatuses" :key="status"
            :class="['status-option', 'status-' + status.toLowerCase()]" @click="updateStatus(status)">
            <i class="fa" :class="getStatusIcon(status)"></i>
            {{ statusText(status) }}
          </button>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showStatusModal = false">İptal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineModel, ref, computed } from 'vue'
import apiClient from '@/api'

const placeholder = 'https://via.placeholder.com/80x80?text=No+Image'
const orders = defineModel({ default: () => [] })
const showStatusModal = ref(false)
const selectedItem = ref(null)

const OrderStatus = {
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
}

const availableStatuses = Object.values(OrderStatus)

// Add filter states
const filters = ref({
  status: '',
  dateFrom: '',
  dateTo: '',
  minAmount: ''
})

// Add sort state
const sortBy = ref('date-desc')

// Add computed property for filtered and sorted orders
const filteredOrders = computed(() => {
  let result = [...orders.value]

  // Apply status filter
  if (filters.value.status) {
    result = result.filter(order => 
      order.items.some(item => item.status === filters.value.status)
    )
  }

  // Apply date range filter
  if (filters.value.dateFrom) {
    const fromDate = new Date(filters.value.dateFrom)
    result = result.filter(order => new Date(order.createdAt) >= fromDate)
  }
  if (filters.value.dateTo) {
    const toDate = new Date(filters.value.dateTo)
    toDate.setHours(23, 59, 59) // Include full day
    result = result.filter(order => new Date(order.createdAt) <= toDate)
  }

  // Apply minimum amount filter
  if (filters.value.minAmount) {
    const minAmount = parseFloat(filters.value.minAmount)
    result = result.filter(order => parseFloat(order.totalAmount) >= minAmount)
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-desc':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'date-asc':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'amount-desc':
        return parseFloat(b.totalAmount) - parseFloat(a.totalAmount)
      case 'amount-asc':
        return parseFloat(a.totalAmount) - parseFloat(b.totalAmount)
      default:
        return 0
    }
  })

  return result
})

async function updateStatus(newStatus) {
  try {
    const response = await apiClient.patch(`/order/${selectedItem.value.id}/status`, {
      status: OrderStatus[newStatus]
    })
    if (response.data) {
      selectedItem.value.status = newStatus
      showStatusModal.value = false
      alert('Sipariş durumu güncellendi')
    }
  } catch (error) {
    console.error('Status update failed:', error)
    alert('Durum güncellenirken bir hata oluştu')
  }
}

function openStatusChange(item) {
  selectedItem.value = item
  showStatusModal.value = true
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr)
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatPrice(price) {
  if (price === null || price === undefined) return '0,00';
  return Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })
}

// Update the statusText function to use the enum
function statusText(status) {
  switch (status) {
    case OrderStatus.PROCESSING: return 'Hazırlanıyor'
    case OrderStatus.SHIPPED: return 'Kargoda'
    case OrderStatus.DELIVERED: return 'Teslim Edildi'
    case OrderStatus.CANCELLED: return 'İptal Edildi'
    default: return status || 'Bilinmiyor'
  }
}

// Update the getStatusIcon function to use the enum
function getStatusIcon(status) {
  switch (status) {
    case OrderStatus.PROCESSING: return 'fa-gear fa-spin'
    case OrderStatus.SHIPPED: return 'fa-truck'
    case OrderStatus.DELIVERED: return 'fa-check-circle'
    case OrderStatus.CANCELLED: return 'fa-times-circle'
    default: return 'fa-circle-question'
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.order-list {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 3rem;
  text-align: center;
}

.title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1a237e;
  margin: 0;
  letter-spacing: -0.5px;
}

.empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #9e9e9e;
}

.empty i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty p {
  font-size: 1.1rem;
  margin: 0;
}

.order-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.order-header {
  background: #f8faff;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e8eaf6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.order-number-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-label {
  color: #666;
  font-size: 0.9rem;
}

.order-number {
  font-weight: 700;
  color: #1a237e;
  font-size: 1.1rem;
}

.order-date {
  color: #666;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-total {
  background: #1a237e;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.total-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.total-amount {
  font-weight: 700;
  font-size: 1.1rem;
}

.order-content {
  padding: 1.5rem;
}

.order-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section {
  background: #f8faff;
  border-radius: 12px;
  padding: 1.25rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a237e;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #1976d2;
}

.info-content {
  color: #444;
  font-size: 0.95rem;
}

.info-content p {
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-content i {
  color: #666;
  width: 1rem;
}

.products-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e8eaf6;
}

.order-items {
  display: grid;
  gap: 1rem;
}

.order-item {
  display: flex;
  gap: 1.25rem;
  padding: 1rem;
  background: #f8faff;
  border-radius: 12px;
  align-items: center;
}

.item-image-wrapper {
  flex-shrink: 0;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.item-info {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 1rem;
  align-items: center;
}

.item-name {
  font-weight: 600;
  color: #1a237e;
  margin: 0;
  font-size: 1rem;
}

.item-variant {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.item-qty {
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-price {
  font-weight: 600;
  color: #1a237e;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-processing {
  background: #e3f2fd;
  color: #1976d2;
}

.status-shipped {
  background: #fff3e0;
  color: #f57c00;
}

.status-delivered {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-cancelled {
  background: #ffebee;
  color: #c62828;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-change-btn {
  background: none;
  border: none;
  color: #666;
  padding: 0.25rem;
  cursor: pointer;
  transition: color 0.2s;
}

.status-change-btn:hover {
  color: #1976d2;
}

.status-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin: 0 0 1.5rem;
  color: #1a237e;
}

.status-options {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.status-option:hover {
  transform: translateX(5px);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.list-controls {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8faff;
  border-radius: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: flex-end;
}

.filters {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #333;
  min-width: 150px;
}

.filter-group input[type="date"] {
  min-width: 140px;
}

.sort-control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sort-control select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #333;
  min-width: 200px;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .order-total {
    width: 100%;
    justify-content: center;
  }

  .item-info {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .item-details {
    flex-direction: row;
    justify-content: space-between;
  }

  .list-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filters {
    flex-direction: column;
    width: 100%;
  }
  
  .filter-group,
  .sort-control {
    width: 100%;
  }
  
  .filter-group select,
  .filter-group input,
  .sort-control select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .order-list {
    padding: 1rem;
  }

  .order-header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }
}
</style>