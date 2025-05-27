<template>
  <div class="invoice-list-component">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="m-0">Faturalar</h5>
        <div class="search-filter">
          <input 
            type="text" 
            class="form-control form-control-sm" 
            placeholder="Fatura ara..." 
            v-model="searchQuery"
          >
        </div>
      </div>
      
      <div class="card-body p-0">
        <div v-if="loading" class="text-center p-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
        
        <div v-else-if="!filteredInvoices.length" class="text-center p-4">
          <p class="mb-0">Fatura bulunamadı.</p>
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover invoice-table">
            <thead>
              <tr>
                <th @click="sortBy('invoiceNumber')" class="sortable">
                  Fatura No 
                  <i v-if="sortColumn === 'invoiceNumber'" 
                     :class="sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </th>
                <th @click="sortBy('issuedAt')" class="sortable">
                  Tarih
                  <i v-if="sortColumn === 'issuedAt'" 
                     :class="sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </th>
                <th @click="sortBy('amount')" class="sortable">
                  Tutar
                  <i v-if="sortColumn === 'amount'" 
                     :class="sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </th>
                <th @click="sortBy('taxAmount')" class="sortable">
                  Vergi
                  <i v-if="sortColumn === 'taxAmount'" 
                     :class="sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </th>
                <th @click="sortBy('paidAt')" class="sortable">
                  Ödeme Durumu
                  <i v-if="sortColumn === 'paidAt'" 
                     :class="sortDirection === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in filteredInvoices" :key="invoice.id">
                <td>{{ invoice.invoiceNumber }}</td>
                <td>{{ formatDate(invoice.issuedAt) }}</td>
                <td>{{ formatPrice(invoice.amount) }}</td>
                <td>{{ formatPrice(invoice.taxAmount) }}</td>
                <td>
                  <span 
                    :class="invoice.paidAt ? 'badge bg-success' : 'badge bg-warning'"
                  >
                    {{ invoice.paidAt ? 'Ödendi' : 'Bekliyor' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button 
                      class="btn btn-sm btn-outline-primary" 
                      @click="viewInvoiceDetails(invoice.id)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-secondary" 
                      @click="downloadInvoice(invoice.id)"
                    >
                      <i class="bi bi-download"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Invoice Details Modal -->
    <div v-if="selectedInvoice" class="modal fade" id="invoiceDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Fatura #{{ selectedInvoice.invoiceNumber }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <p><strong>Fatura No:</strong> {{ selectedInvoice.invoiceNumber }}</p>
                <p><strong>Sipariş ID:</strong> {{ selectedInvoice.orderId }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Tarih:</strong> {{ formatDate(selectedInvoice.issuedAt) }}</p>
                <p><strong>Ödeme Durumu:</strong> 
                  <span :class="selectedInvoice.paidAt ? 'badge bg-success' : 'badge bg-warning'">
                    {{ selectedInvoice.paidAt ? 'Ödendi' : 'Bekliyor' }}
                  </span>
                </p>
              </div>
            </div>
            
            <h6>Fatura Kalemleri</h6>
            <table class="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Açıklama</th>
                  <th>Miktar</th>
                  <th>Birim Fiyat</th>
                  <th>KDV Oranı</th>
                  <th>KDV</th>
                  <th>Toplam</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedInvoice.items" :key="item.id">
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatPrice(item.unitPrice) }}</td>
                  <td>{{ item.vatRate }}%</td>
                  <td>{{ formatPrice(item.taxAmount) }}</td>
                  <td>{{ formatPrice(item.totalPrice) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-end"><strong>Ara Toplam:</strong></td>
                  <td colspan="2">{{ formatPrice(selectedInvoice.amount - selectedInvoice.taxAmount) }}</td>
                </tr>
                <tr>
                  <td colspan="4" class="text-end"><strong>KDV Toplam:</strong></td>
                  <td colspan="2">{{ formatPrice(selectedInvoice.taxAmount) }}</td>
                </tr>
                <tr>
                  <td colspan="4" class="text-end"><strong>Genel Toplam:</strong></td>
                  <td colspan="2"><strong>{{ formatPrice(selectedInvoice.amount) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kapat</button>
            <button type="button" class="btn btn-primary" @click="downloadInvoice(selectedInvoice.id)">
              <i class="bi bi-download me-1"></i> İndir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import apiClient from '@/api';

const invoices = defineModel({ default: () => [] })
// State 
const loading = ref(false);
const searchQuery = ref('');
const sortColumn = ref('issuedAt');
const sortDirection = ref('desc');
const selectedInvoice = ref(null);
let invoiceDetailsModal = null;

// Filtrelenmiş ve sıralanmış faturalar
const filteredInvoices = computed(() => {
  let result = [...invoices.value];
  
  // Arama filtresi
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(invoice => 
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.orderId.toString().includes(query)
    );
  }
  
  // Sıralama
  result.sort((a, b) => {
    let comparison = 0;
    
    if (sortColumn.value === 'issuedAt' || sortColumn.value === 'paidAt') {
      comparison = new Date(a[sortColumn.value] || 0) - new Date(b[sortColumn.value] || 0);
    } else if (sortColumn.value === 'amount' || sortColumn.value === 'taxAmount') {
      comparison = a[sortColumn.value] - b[sortColumn.value];
    } else {
      comparison = String(a[sortColumn.value]).localeCompare(String(b[sortColumn.value]));
    }
    
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
  
  return result;
});

// Fatura verilerini yükle
const fetchInvoices = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get(`/store/${props.storeId}`);
    if (response.status === 200 && response.data.invoices) {
      invoices.value = response.data.invoices;
    }
  } catch (error) {
    console.error('Faturalar yüklenirken hata oluştu:', error);
  } finally {
    loading.value = false;
  }
};

// Sıralama değiştir
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'desc';
  }
};

// Fatura detaylarını görüntüle
const viewInvoiceDetails = (invoiceId) => {
  const invoice = invoices.value.find(inv => inv.id === invoiceId);
  if (invoice) {
    selectedInvoice.value = invoice;
    
    // Modal'ı göster
    if (!invoiceDetailsModal) {
      invoiceDetailsModal = new Modal(document.getElementById('invoiceDetailsModal'));
    }
    invoiceDetailsModal.show();
  }
};

// Fatura indir
const downloadInvoice = (invoiceId) => {
  // Bu kısım backend'e istek atıp PDF indirme işlemini gerçekleştirecek
  console.log('Fatura indiriliyor:', invoiceId);
  try {
    window.open(`${apiClient.defaults.baseURL}/invoice/${invoiceId}/download`, '_blank');
  } catch (error) {
    console.error('Fatura indirme hatası:', error);
  }
};

// Tarih formatı
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Para formatı
const formatPrice = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount || 0);
};

onMounted(() => {
});
</script>

<style scoped>
.invoice-list-component {
  margin-bottom: 2rem;
}

.invoice-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.invoice-table th.sortable:hover {
  background-color: #f8f9fa;
}

.invoice-table th i {
  margin-left: 5px;
  font-size: 0.8rem;
}

.table th, .table td {
  vertical-align: middle;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .search-filter {
    margin-top: 10px;
    width: 100%;
  }
}
</style>
