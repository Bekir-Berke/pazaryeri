<template>
  <div>
    <!-- Header with search and filters -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
              type="text"
              class="form-control"
              placeholder="Sipariş ara..."
              v-model="searchQuery"
              @input="handleSearch"
          >
          <button class="btn btn-primary" type="button">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
              class="btn"
              :class="[filter === 'ALL' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('ALL')"
          >
            Tümü
          </button>
          <button
              class="btn"
              :class="[filter === 'PENDING' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('PENDING')"
          >
            Bekleyen
          </button>
          <button
              class="btn"
              :class="[filter === 'PROCESSING' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('PROCESSING')"
          >
            İşlemde
          </button>
          <button
              class="btn"
              :class="[filter === 'SHIPPED' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('SHIPPED')"
          >
            Kargoda
          </button>
          <button
              class="btn"
              :class="[filter === 'DELIVERED' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('DELIVERED')"
          >
            Teslim Edildi
          </button>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
        <div v-else-if="filteredOrders.length === 0" class="text-center my-5">
          <i class="bi bi-box-seam fs-1 text-muted"></i>
          <p class="mt-3">Sipariş bulunamadı</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
            <tr>
              <th scope="col">Sipariş No</th>
              <th scope="col">Müşteri</th>
              <th scope="col">Tarih</th>
              <th scope="col">Toplam</th>
              <th scope="col">İşlem</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="order in filteredOrders" :key="order.id" @click="expandOrder(order)" class="cursor-pointer">
              <td>{{ order.orderNumber }}</td>
              <td>{{ order.user?.firstName }} {{ order.user?.lastName }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>{{ formatPrice(order.totalAmount) }} TL</td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" @click.stop="viewOrderDetails(order)">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click.stop="updateOrderStatus(order)">
                  <i class="bi bi-pencil"></i>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <div>
          Toplam: <strong>{{ totalOrders }}</strong> sipariş
        </div>
        <nav v-if="totalPages > 1">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </a>
            </li>
            <li
                v-for="page in displayedPages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div class="modal fade" :class="{ show: showOrderModal }" tabindex="-1" style="display: block" v-if="showOrderModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sipariş Detayı #{{ selectedOrder?.orderNumber }}</h5>
            <button type="button" class="btn-close" @click="closeOrderModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedOrder" class="order-details">
              <!-- Order Summary -->
              <div class="card mb-3">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h6>Sipariş Bilgileri</h6>
                      <p class="mb-1"><strong>Sipariş No:</strong> {{ selectedOrder.orderNumber }}</p>
                      <p class="mb-1"><strong>Tarih:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
                      <p class="mb-1"><strong>Ödeme Yöntemi:</strong> {{ selectedOrder.paymentMethod }}</p>
                    </div>
                    <div class="col-md-6">
                      <h6>Müşteri Bilgileri</h6>
                      <p class="mb-1"><strong>Ad Soyad:</strong> {{ selectedOrder.user?.firstName }} {{ selectedOrder.user?.lastName }}</p>
                      <p class="mb-1"><strong>E-posta:</strong> {{ selectedOrder.user?.email }}</p>
                      <p class="mb-1"><strong>Telefon:</strong> {{ selectedOrder.phone }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Shipping Address -->
              <div v-if="!selectedOrder.address" class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Teslimat Adresi</h6>
                </div>
                <div class="card-body">
                  <p class="mb-1"><strong>{{ selectedOrder.fullName }}</strong></p>
                  <p class="mb-1">{{ selectedOrder.fullAddress }}</p>
                  <p class="mb-1">{{ selectedOrder.neighborhood }}, {{ selectedOrder.district }}</p>
                  <p class="mb-1">{{ selectedOrder.city }}</p>
                  <p class="mb-0">{{ selectedOrder.phone }}</p>
                </div>
              </div>
              <div v-else class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Teslimat Adresi</h6>
                </div>
                <div class="card-body">
                  <p class="mb-1"><strong>{{ selectedOrder.address.fullName }}</strong></p>
                  <p class="mb-1">{{ selectedOrder.address.fullAddress }}</p>
                  <p class="mb-1">{{ selectedOrder.address.neighborhood }}, {{ selectedOrder.address.district }}</p>
                  <p class="mb-1">{{ selectedOrder.address.city }}</p>
                  <p class="mb-0">{{ selectedOrder.address.phone }}</p>
                </div>
              </div>

              <!-- Order Items -->
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Sipariş Ürünleri</h6>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table mb-0">
                      <thead>
                      <tr>
                        <th>Ürün</th>
                        <th>Mağaza</th>
                        <th>Sipariş Durumu</th>
                        <th class="text-center">Adet</th>
                        <th class="text-end">Fiyat</th>
                        <th class="text-end">Toplam</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="item in selectedOrder.items" :key="item.id">
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="product-image me-2">
                              <img v-if="item.product?.imageUrl"
                                   :src="item.product.imageUrl"
                                   class="product-thumbnail"
                                   alt="Ürün görseli">
                              <div v-else class="product-no-image">
                                <i class="bi bi-image"></i>
                              </div>
                            </div>
                            <div>
                              <p class="mb-0 fw-medium">{{ item.product?.name }}</p>
                              <small v-if="item.variant" class="text-muted">
                                {{ item.variant.name }}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{{ item.store?.name }}</td>
                        <td>
                        <p class="mb-1"><strong>Durum:</strong>
                        <span class="badge" :class="getStatusBadgeClass(item.status)">
                          {{ getStatusText(item.status) }}
                        </span>
                      </p>
                        </td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end">{{ formatPrice(Number(item.vatPrice)) }} TL</td>
                        <td class="text-end">{{ formatPrice(Number(item.vatPrice) * item.quantity) }} TL</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Ara Toplam:</span>
                    <span>{{ formatPrice(selectedOrder.subtotalAmount) }} TL</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>KDV:</span>
                    <span>{{ formatPrice(selectedOrder.totalVatAmount) }} TL</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Kargo:</span>
                    <span>{{ formatPrice(selectedOrder.shippingAmount) }} TL</span>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between">
                    <strong>Genel Toplam:</strong>
                    <strong>{{ formatPrice(selectedOrder.totalAmount) }} TL</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeOrderModal">Kapat</button>
            <button type="button" class="btn btn-primary" @click="updateOrderStatus(selectedOrder)">Durumu Güncelle</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showOrderModal"></div>

    <!-- Update Status Modal -->
    <div class="modal fade" :class="{ show: showStatusModal }" tabindex="-1" style="display: block" v-if="showStatusModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sipariş Durumunu Güncelle</h5>
            <button type="button" class="btn-close" @click="closeStatusModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="orderStatus" class="form-label">Yeni Durum</label>
              <select id="orderStatus" class="form-select" v-model="newStatus">
                <option value="PENDING">Beklemede</option>
                <option value="PROCESSING">İşlemde</option>
                <option value="SHIPPED">Kargoya Verildi</option>
                <option value="DELIVERED">Teslim Edildi</option>
                <option value="CANCELLED">İptal Edildi</option>
                <option value="REFUNDED">İade Edildi</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="statusNote" class="form-label">Not (Opsiyonel)</label>
              <textarea id="statusNote" class="form-control" v-model="statusNote" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeStatusModal">İptal</button>
            <button type="button" class="btn btn-primary" @click="saveOrderStatus">
              <span v-if="statusSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Güncelle
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showStatusModal"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import apiClient from '@/api.js';
import Swal from 'sweetalert2';

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalOrders = ref(0);
const totalPages = computed(() => Math.ceil(totalOrders.value / itemsPerPage.value));

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  const endPage = Math.min(totalPages.value, startPage + maxPages - 1);

  startPage = Math.max(1, endPage - maxPages + 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// Orders data
const orders = ref([]);
const filteredOrders = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const filter = ref('ALL');

// Selected order for viewing details
const selectedOrder = ref(null);
const showOrderModal = ref(false);

// Update status modal
const showStatusModal = ref(false);
const orderToUpdate = ref(null);
const newStatus = ref('');
const statusNote = ref('');
const statusSubmitting = ref(false);

// Fetch orders from API
const fetchOrders = async () => {
  loading.value = true;
  try {
    // Replace with your actual API endpoint
    const response = await apiClient.get('/admin/orders', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value
      }
    });

    orders.value = response.data || [];
    totalOrders.value = response.data.total || orders.value.length;
    applyFilters();
  } catch (error) {
    console.error('Error fetching orders:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Siparişler yüklenirken bir hata oluştu.'
    });
  } finally {
    loading.value = false;
  }
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  if (!price) return '0.00';
  return Number(price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-warning text-dark';
    case 'PROCESSING': return 'bg-info text-dark';
    case 'SHIPPED': return 'bg-primary';
    case 'DELIVERED': return 'bg-success';
    case 'CANCELLED': return 'bg-danger';
    case 'REFUNDED': return 'bg-secondary';
    default: return 'bg-secondary';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'PROCESSING': return 'İşlemde';
    case 'SHIPPED': return 'Kargoya Verildi';
    case 'DELIVERED': return 'Teslim Edildi';
    case 'CANCELLED': return 'İptal Edildi';
    case 'REFUNDED': return 'İade Edildi';
    default: return 'Bilinmiyor';
  }
};

// Handle search
const handleSearch = () => {
  currentPage.value = 1;
  applyFilters();
};

// Apply filters based on search query and status filter
const applyFilters = () => {
  let result = [...orders.value];

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(order =>
        order.orderNumber?.toLowerCase().includes(query) ||
        `${order.user?.firstName} ${order.user?.lastName}`.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query)
    );
  }

  // Filter by status
  if (filter.value !== 'ALL') {
    result = result.filter(order => order.status === filter.value);
  }

  filteredOrders.value = result;
};

// Change current filter
const setFilter = (newFilter) => {
  filter.value = newFilter;
  currentPage.value = 1;
  applyFilters();
};

// Change page
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchOrders();
};

// View order details
const viewOrderDetails = async (order) => {
  try {
    // Get detailed order data
    const response = await apiClient.get(`/admin/orders/${order.id}`);
    selectedOrder.value = response.data;
    selectedOrder.value.subtotalAmount = Number(response.data.totalAmount) - Number(response.data.totalVatAmount)
    console.log(selectedOrder.value);
    showOrderModal.value = true;
  } catch (error) {
    console.error('Error fetching order details:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Sipariş detayları yüklenirken bir hata oluştu.'
    });
  }
};

// Update order status
const updateOrderStatus = (order) => {
  orderToUpdate.value = order;
  newStatus.value = order.status;
  statusNote.value = '';
  showStatusModal.value = true;
};

// Save updated order status
const saveOrderStatus = async () => {
  if (!orderToUpdate.value) return;

  statusSubmitting.value = true;
  try {
    await apiClient.put(`/admin/orders/${orderToUpdate.value.id}/status`, {
      status: newStatus.value,
      note: statusNote.value
    });

    Swal.fire({
      icon: 'success',
      title: 'Başarılı',
      text: 'Sipariş durumu güncellendi.'
    });

    // Update order in local state
    if (selectedOrder.value && selectedOrder.value.id === orderToUpdate.value.id) {
      selectedOrder.value.status = newStatus.value;
    }

    // Refresh orders list
    fetchOrders();
    closeStatusModal();
  } catch (error) {
    console.error('Error updating order status:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Sipariş durumu güncellenirken bir hata oluştu.'
    });
  } finally {
    statusSubmitting.value = false;
  }
};

// Expand row to see order details
const expandOrder = (order) => {
  viewOrderDetails(order);
};

// Close order details modal
const closeOrderModal = () => {
  showOrderModal.value = false;
  selectedOrder.value = null;
};

// Close status update modal
const closeStatusModal = () => {
  showStatusModal.value = false;
  orderToUpdate.value = null;
  newStatus.value = '';
  statusNote.value = '';
};

// Watch for filter changes
watch([filter], () => {
  applyFilters();
});

// Load orders on component mount
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
  display: block;
}

.modal.fade:not(.show) {
  display: none;
}

.page-link {
  color: #ff7f00;
}

.page-item.active .page-link {
  background-color: #ff7f00;
  border-color: #ff7f00;
  color: white;
}

.btn-primary {
  background-color: #ff7f00;
  border-color: #ff7f00;
}

.btn-primary:hover,
.btn-primary:active,
.btn-primary:focus {
  background-color: #e67300;
  border-color: #e67300;
}

.btn-outline-primary {
  color: #ff7f00;
  border-color: #ff7f00;
}

.btn-outline-primary:hover,
.btn-outline-primary:active,
.btn-outline-primary:focus {
  background-color: #ff7f00;
  color: white;
  border-color: #ff7f00;
}
</style>