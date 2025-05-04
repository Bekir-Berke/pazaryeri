<template>
    <div class="admin-invoices-container">
      <div class="header-actions">
        <h2>Faturalar</h2>
        <div class="header-buttons">
        </div>
      </div>
  
      <!-- Filtreler -->
      <div class="filters">
        <div class="filter-row">
          <div class="search-box">
            <i class="bi bi-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Fatura, kullanıcı ya da firma ara..."
              @input="debouncedSearch"
            />
            <i v-if="searchQuery" @click="clearSearch" class="bi bi-x-circle clear-search"></i>
          </div>
  
          <div class="date-filters">
            <div class="date-filter">
              <label>Başlangıç:</label>
              <input 
                v-model="startDate" 
                type="date" 
                @change="applyFilters"
              />
            </div>
            <div class="date-filter">
              <label>Bitiş:</label>
              <input 
                v-model="endDate" 
                type="date" 
                @change="applyFilters"
              />
            </div>
            <button v-if="startDate || endDate" @click="clearDateFilters" class="btn-clear-date">
              <i class="bi bi-x"></i> Temizle
            </button>
          </div>
        </div>
  
        <div class="filter-row">
          <div class="select-filters">
            <div class="select-filter">
              <label>Durum:</label>
              <select v-model="statusFilter" @change="applyFilters">
                <option value="">Tümü</option>
                <option value="PAID">Ödendi</option>
                <option value="PENDING">Beklemede</option>
                <option value="CANCELED">İptal Edildi</option>
                <option value="REFUNDED">İade Edildi</option>
              </select>
            </div>
            <div class="select-filter">
              <label>Türü:</label>
              <select v-model="typeFilter" @change="applyFilters">
                <option value="">Tümü</option>
                <option value="SALE">Satış</option>
                <option value="REFUND">İade</option>
                <option value="COMMISSION">Komisyon</option>
              </select>
            </div>
            <div class="select-filter">
              <label>Sıralama:</label>
              <select v-model="sortOption" @change="applyFilters">
                <option value="dateDesc">Tarih (Yeni-Eski)</option>
                <option value="dateAsc">Tarih (Eski-Yeni)</option>
                <option value="amountDesc">Tutar (Yüksek-Düşük)</option>
                <option value="amountAsc">Tutar (Düşük-Yüksek)</option>
                <option value="invoiceNumber">Fatura No</option>
              </select>
            </div>
          </div>
          
          <button @click="clearAllFilters" class="btn-clear-all" v-if="hasActiveFilters">
            <i class="bi bi-eraser"></i> Tüm Filtreleri Temizle
          </button>
        </div>
      </div>
  
      <!-- Yükleniyor -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Faturalar yükleniyor...</p>
      </div>
  
      <!-- Hata -->
      <div v-else-if="error" class="error-message">
        <i class="bi bi-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="fetchInvoices" class="btn-retry">Tekrar Dene</button>
      </div>
  
      <!-- Sonuç bulunamadı -->
      <div v-else-if="filteredInvoices.length === 0" class="no-results">
        <i class="bi bi-file-earmark-x"></i>
        <p>Arama kriterlerinize uygun fatura bulunamadı.</p>
        <button @click="clearAllFilters" class="btn-clear" v-if="hasActiveFilters">
          Filtreleri Temizle
        </button>
      </div>
  
      <!-- Fatura Listesi -->
      <div v-else class="invoice-list">
        <table>
          <thead>
            <tr>
              <th>Fatura No</th>
              <th>Tarih</th>
              <th>Alıcı</th>
              <th>Türü</th>
              <th>Tutar</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in paginatedInvoices" :key="invoice.id">
              <td class="invoice-number">{{ invoice.invoiceNumber }}</td>
              <td class="invoice-date">{{ formatDate(invoice.createdAt) }}</td>
              <td class="customer-info">
                <div class="customer-name">{{ invoice.customer.name + " " + invoice.customer.lastName}}</div>
              </td>
              <td class="invoice-type">
                <span :class="getTypeClass(invoice.type)">
                  {{ translateType(invoice.type) }}
                </span>
              </td>
              <td class="invoice-amount">{{ formatCurrency(invoice.totalAmount) }}</td>
              <td class="invoice-status">
                <span :class="getStatusClass(invoice.status)">
                  {{ translateStatus(invoice.status) }}
                </span>
              </td>
              <td class="actions">
                <button @click="viewInvoice(invoice)" class="btn-view" title="Görüntüle">
                  <i class="bi bi-eye"></i>
                </button>
                <button @click="downloadInvoice(invoice)" class="btn-download" title="İndir">
                  <i class="bi bi-download"></i>
                </button>
                <button 
                  v-if="invoice.status === 'PENDING'" 
                  @click="updateInvoiceStatus(invoice.id, 'PAID')" 
                  class="btn-pay" 
                  title="Öde"
                >
                  <i class="bi bi-check-circle"></i>
                </button>
                <button 
                  v-if="invoice.status === 'PENDING'" 
                  @click="updateInvoiceStatus(invoice.id, 'CANCELED')" 
                  class="btn-cancel" 
                  title="İptal Et"
                >
                  <i class="bi bi-x-circle"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Pagination -->
      <div v-if="filteredInvoices.length > 0" class="pagination">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)" 
          :disabled="currentPage === 1"
          class="btn-page"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        
        <button 
          v-for="page in displayedPages" 
          :key="page" 
          @click="currentPage = page"
          :class="{ active: currentPage === page }"
          class="btn-page"
        >
          {{ page }}
        </button>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="btn-page"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
  
      <!-- Fatura Görüntüleme Modal -->
      <div v-if="showInvoiceModal" class="modal-overlay" @click.self="closeModal">
        <div class="invoice-modal">
          <div class="modal-header">
            <h3>Fatura Detayı</h3>
            <button @click="closeModal" class="btn-close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="invoice-details" v-if="selectedInvoice">
              <div class="invoice-header-info">
                <div class="invoice-meta">
                  <h4>Fatura Bilgileri</h4>
                  <div class="info-row">
                    <span class="label">Fatura No:</span>
                    <span class="value">{{ selectedInvoice.invoiceNumber }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Tarih:</span>
                    <span class="value">{{selectedInvoice.createdAt}}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Türü:</span>
                    <span class="value" :class="getTypeClass(selectedInvoice.type)">
                      {{ translateType(selectedInvoice.type) }}
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="label">Durum:</span>
                    <span class="value" :class="getStatusClass(selectedInvoice.status)">
                      {{ translateStatus(selectedInvoice.status) }}
                    </span>
                  </div>
                </div>
                
                <div class="customer-meta">
                  <h4>Alıcı Bilgileri</h4>
                  <div class="info-row">
                    <span class="label">Ad Soyad</span>
                    <span class="value">{{ selectedInvoice.customer.name}}</span>
                  </div>
                  <div class="info-row" v-if="selectedInvoice.customer.vkn">
                    <span class="label">VKN:</span>
                    <span class="value">{{ selectedInvoice.customer.vkn }}</span>
                  </div>
                  <div class="info-row" v-else-if="selectedInvoice.customer.tckn">
                    <span class="label">TCKN:</span>
                    <span class="value">{{ selectedInvoice.customer.tckn }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Adres:</span>
                    <span class="value">{{ selectedInvoice.customer.address }}</span>
                  </div>
                </div>
              </div>
              
              <h4>Fatura Kalemleri</h4>
              <table class="invoice-items">
                <thead>
                  <tr>
                    <th>Ürün / Hizmet</th>
                    <th>Miktar</th>
                    <th>Birim Fiyat</th>
                    <th>KDV</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedInvoice.items" :key="index">
                    <td>{{ item.description }}</td>
                    <td>{{ item.quantity }} {{ item.unit }}</td>
                    <td>{{ formatCurrency(item.unitPrice) }}</td>
                    <td>%{{ item.taxRate }}</td>
                    <td>{{ formatCurrency(item.total) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3"></td>
                    <td>Ara Toplam:</td>
                    <td>{{ formatCurrency(selectedInvoice.subtotal) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3"></td>
                    <td>KDV:</td>
                    <td>{{ formatCurrency(selectedInvoice.taxAmount) }}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3"></td>
                    <td>Genel Toplam:</td>
                    <td>{{ formatCurrency(selectedInvoice.totalAmount) }}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div class="invoice-notes" v-if="selectedInvoice.notes">
                <h4>Notlar</h4>
                <p>{{ selectedInvoice.notes }}</p>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="downloadInvoice(selectedInvoice)" class="btn-download-pdf">
              <i class="bi bi-file-pdf"></i> PDF İndir
            </button>
            <button 
              v-if="selectedInvoice && selectedInvoice.status === 'PENDING'" 
              @click="updateInvoiceStatus(selectedInvoice.id, 'PAID')" 
              class="btn-pay-large"
            >
              <i class="bi bi-check-circle"></i> Ödenmiş Olarak İşaretle
            </button>
            <button 
              v-if="selectedInvoice && selectedInvoice.status === 'PENDING'" 
              @click="updateInvoiceStatus(selectedInvoice.id, 'CANCELED')" 
              class="btn-cancel-large"
            >
              <i class="bi bi-x-circle"></i> İptal Et
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import Swal from 'sweetalert2';
  import apiClient from '@/api';
  
  // Ana durum değişkenleri
  const invoices = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const currentPage = ref(1);
  const pageSize = 10;
  
  // Filtre değişkenleri
  const searchQuery = ref('');
  const startDate = ref('');
  const endDate = ref('');
  const statusFilter = ref('');
  const typeFilter = ref('');
  const sortOption = ref('dateDesc');
  
  // Modal durumu
  const showInvoiceModal = ref(false);
  const selectedInvoice = ref(null);
  
  // Aktif filtreleri kontrol et
  const hasActiveFilters = computed(() => {
    return searchQuery.value || startDate.value || endDate.value || statusFilter.value || typeFilter.value;
  });
  
  // Filtreleri temizle
  const clearSearch = () => {
    searchQuery.value = '';
    applyFilters();
  };
  
  const clearDateFilters = () => {
    startDate.value = '';
    endDate.value = '';
    applyFilters();
  };
  
  const clearAllFilters = () => {
    searchQuery.value = '';
    startDate.value = '';
    endDate.value = '';
    statusFilter.value = '';
    typeFilter.value = '';
    sortOption.value = 'dateDesc';
    applyFilters();
  };
  
  // Filtrelenmiş faturalar
  const filteredInvoices = computed(() => {
    let result = [...invoices.value];
    
    // Arama filtrelemesi
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customer.name.toLowerCase().includes(query) ||
        (invoice.customer.vkn && invoice.customer.vkn.includes(query)) ||
        (invoice.customer.tckn && invoice.customer.tckn.includes(query))
      );
    }
    
    // Tarih filtresi
    if (startDate.value) {
      const start = new Date(startDate.value);
      start.setHours(0, 0, 0, 0);
      result = result.filter(invoice => new Date(invoice.createdAt) >= start);
    }
    
    if (endDate.value) {
      const end = new Date(endDate.value);
      end.setHours(23, 59, 59, 999);
      result = result.filter(invoice => new Date(invoice.createdAt) <= end);
    }
    
    // Durum filtresi
    if (statusFilter.value) {
      result = result.filter(invoice => invoice.status === statusFilter.value);
    }
    
    // Tür filtresi
    if (typeFilter.value) {
      result = result.filter(invoice => invoice.type === typeFilter.value);
    }
    
    // Sıralama
    switch (sortOption.value) {
      case 'dateDesc':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'dateAsc':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'amountDesc':
        result.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case 'amountAsc':
        result.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
      case 'invoiceNumber':
        result.sort((a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber));
        break;
    }
    
    return result;
  });
  
  // Sayfalanmış faturalar
  const paginatedInvoices = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize;
    return filteredInvoices.value.slice(startIndex, startIndex + pageSize);
  });
  
  // Toplam sayfa sayısı
  const totalPages = computed(() => 
    Math.ceil(filteredInvoices.value.length / pageSize)
  );
  
  // Görüntülenecek sayfa numaraları (maksimum 5 sayfa göster)
  const displayedPages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }
    
    if (current >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }
    
    return [current - 2, current - 1, current, current + 1, current + 2];
  });
  
  // Arama için debounce
  let searchTimeout;
  const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    currentPage.value = 1;
    searchTimeout = setTimeout(() => {
      applyFilters();
    }, 300);
  };
  
  // Filtreleri uygula
  const applyFilters = () => {
    currentPage.value = 1;
    // Burada gerekirse API çağrısı yapılabilir
  };
  
  // Tarihi formatla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Tarihi tam formatla
  const formatDateFull = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Para birimini formatla
  const formatCurrency = (amount) => {
    console.log('formatCurrency', amount);
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };
  
  // Durum çevirisi
  const translateStatus = (status) => {
    const statusMap = {
      'PAID': 'Ödendi',
      'PENDING': 'Beklemede',
      'CANCELED': 'İptal Edildi',
      'REFUNDED': 'İade Edildi'
    };
    return statusMap[status] || status;
  };
  
  // Tür çevirisi
  const translateType = (type) => {
    const typeMap = {
      'SALE': 'Satış',
      'REFUND': 'İade',
      'COMMISSION': 'Komisyon'
    };
    return typeMap[type] || type;
  };
  
  // Durum sınıfı
  const getStatusClass = (status) => {
    const statusClassMap = {
      'PAID': 'status-paid',
      'PENDING': 'status-pending',
      'CANCELED': 'status-canceled',
      'REFUNDED': 'status-refunded'
    };
    return statusClassMap[status] || '';
  };
  
  // Tür sınıfı
  const getTypeClass = (type) => {
    const typeClassMap = {
      'SALE': 'type-sale',
      'REFUND': 'type-refund',
      'COMMISSION': 'type-commission'
    };
    return typeClassMap[type] || '';
  };
  
  // Fatura görüntüleme
  const viewInvoice = (invoice) => {
    console.log('Fatura görüntüleme:', invoice);
    selectedInvoice.value = {
      ...invoice,
      customer: {
        name: `${invoice.customer.name } ${invoice.customer.lastName}` || 'Müşteri Bilgisi Yok',
        vkn: invoice.order?.user?.vkn ? invoice.order?.user?.tckn : 11111111111,
        address: invoice.customer.address || 'Adres Bilgisi Yok'
      },
      createdAt: invoice.issuedAt,
      subtotal: invoice.totalAmount - invoice.taxAmount,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      type: 'SALE',
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit: 'Adet',
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        total: item.total
      }))
    };
    showInvoiceModal.value = true;
  };
  
  // Fatura indirme
  const downloadInvoice = (invoice) => {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else {
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'error',
        title: 'PDF bulunamadı',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };
  
  // Fatura durumunu güncelle
  const updateInvoiceStatus = (invoiceId, newStatus) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: `Fatura durumunu "${translateStatus(newStatus)}" olarak değiştirmek istediğinize emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Değiştir',
      cancelButtonText: 'İptal',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const invoiceIndex = invoices.value.findIndex(inv => inv.id === invoiceId);
        if (invoiceIndex !== -1) {
          invoices.value[invoiceIndex].status = newStatus;
          
          if (selectedInvoice.value && selectedInvoice.value.id === invoiceId) {
            selectedInvoice.value.status = newStatus;
          }
        }
        
        Swal.fire({
          title: 'Başarılı',
          text: 'Fatura durumu güncellendi',
          icon: 'success',
          confirmButtonText: 'Tamam'
        });
      }
    });
  };
  
  // Modalı kapat
  const closeModal = () => {
    showInvoiceModal.value = false;
    setTimeout(() => {
      selectedInvoice.value = null;
    }, 300);
  };
  
  // Faturaları getir
  const fetchInvoices = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await apiClient.get('/admin/invoices');
      invoices.value = response.data.map(invoice => ({
        id: invoice.id,
        orderId: invoice.orderId,
        invoiceNumber: invoice.invoiceNumber,
        createdAt: invoice.issuedAt,
        pdfUrl: invoice.pdfUrl,
        status: 'PAID',
        type: 'SALE',
        customer: {
          name: invoice.order?.user?.firstName || 'Müşteri Bilgisi Yok',
          lastName: invoice.order?.user?.lastName || 'Müşteri Bilgisi Yok',
          vkn: invoice.order?.user?.vkn || 11111111111,
          tckn: invoice.order?.user?.tckn || null,
          address: `${invoice.order.address.fullAddress} ${invoice.order.address.district} / ${invoice.order.address.city}` || 'Adres Bilgisi Yok'
        },
        totalAmount: parseFloat(invoice.amount),
        subtotal: parseFloat(invoice.amount) - parseFloat(invoice.taxAmount),
        taxAmount: parseFloat(invoice.taxAmount),
        items: invoice.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: 'Adet',
          unitPrice: parseFloat(item.unitPrice),
          taxRate: item.vatRate,
          total: parseFloat(item.totalPrice)
        }))
      }));
      loading.value = false;
      console.log('Faturalar yüklendi:', invoices.value);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      error.value = 'Faturalar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      loading.value = false;
    }
  };
  
  // Sayfa yüklendiğinde faturaları getir
  onMounted(() => {
    fetchInvoices();
  });
  </script>
  
  <style scoped>
  .admin-invoices-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .header-actions h2 {
    margin: 0;
    font-size: 1.8rem;
    color: #333;
  }
  
  .header-buttons {
    display: flex;
    gap: 10px;
  }
  
  .btn-export {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-export:hover {
    background-color: #218838;
  }
  
  /* Filtreler */
  .filters {
    margin-bottom: 20px;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }
  
  .search-box {
    flex: 1;
    position: relative;
    max-width: 350px;
  }
  
  .search-box input {
    width: 100%;
    padding: 8px 35px 8px 35px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
  }
  
  .search-box .bi-search {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
  }
  
  .clear-search {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #777;
    cursor: pointer;
  }
  
  .clear-search:hover {
    color: #333;
  }
  
  .date-filters {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .date-filter {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .date-filter label {
    font-size: 0.9rem;
    color: #555;
    white-space: nowrap;
  }
  
  .date-filter input {
    padding: 7px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .btn-clear-date {
    padding: 6px 10px;
    background-color: transparent;
    border: 1px solid #dc3545;
    color: #dc3545;
    border-radius: 4px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-clear-date:hover {
    background-color: #dc3545;
    color: white;
  }
  
  .select-filters {
    display: flex;
    gap: 15px;
  }
  
  .select-filter {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .select-filter label {
    font-size: 0.9rem;
    color: #555;
    white-space: nowrap;
  }
  
  .select-filter select {
    padding: 7px 25px 7px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 0.9rem;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 16px 12px;
  }
  
  .btn-clear-all {
    padding: 6px 12px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #495057;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-clear-all:hover {
    background-color: #e9ecef;
  }
  
  /* Yükleniyor */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .loading p {
    color: #666;
    font-size: 1rem;
  }
  
  /* Hata mesajı */
  .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #721c24;
    text-align: center;
  }
  
  .error-message i {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .btn-retry {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-retry:hover {
    background-color: #c82333;
  }
  
  /* Sonuç Bulunamadı */
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #666;
    text-align: center;
  }
  
  .no-results i {
    font-size: 2.5rem;
    color: #aaa;
    margin-bottom: 15px;
  }
  
  .btn-clear {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 4px;
    color: #444;
    cursor: pointer;
  }
  
  .btn-clear:hover {
    background-color: #e9ecef;
  }
  
  /* Fatura Listesi */
  .invoice-list {
    overflow-x: auto;
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  
  thead th {
    background-color: #f8f9fa;
    color: #495057;
    padding: 12px 15px;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
  }
  
  tbody td {
    padding: 12px 15px;
    border-bottom: 1px solid #e9ecef;
    vertical-align: middle;
  }
  
  .invoice-number {
    font-family: monospace;
    font-weight: 500;
  }
  
  .invoice-date {
    color: #666;
    white-space: nowrap;
  }
  
  .customer-info {
    min-width: 200px;
  }
  
  .customer-name {
    font-weight: 500;
  }
  
  .customer-id {
    font-size: 0.8rem;
    color: #777;
    margin-top: 2px;
  }
  
  .invoice-type span, .invoice-status span {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 30px;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
  }
  
  /* Durum renkleri */
  .status-paid {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status-pending {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .status-canceled {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .status-refunded {
    background-color: #d1ecf1;
    color: #0c5460;
  }
  
  /* Fatura türü renkleri */
  .type-sale {
    background-color: #e0f3e5;
    color: #2d6a4f;
  }
  
  .type-refund {
    background-color: #ffeaee;
    color: #971e3a;
  }
  
  .type-commission {
    background-color: #e7f1ff;
    color: #0c5396;
  }
  
  .invoice-amount {
    font-weight: 500;
    white-space: nowrap;
  }
  
  .actions {
    white-space: nowrap;
    min-width: 120px;
    text-align: center;
  }
  
  .actions button {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: transparent;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: 5px;
  }
  
  .btn-view {
    border-color: #6c757d;
    color: #6c757d;
  }
  
  .btn-view:hover {
    background-color: #6c757d;
    color: white;
  }
  
  .btn-download {
    border-color: #17a2b8;
    color: #17a2b8;
  }
  
  .btn-download:hover {
    background-color: #17a2b8;
    color: white;
  }
  
  .btn-pay {
    border-color: #28a745;
    color: #28a745;
  }
  
  .btn-pay:hover {
    background-color: #28a745;
    color: white;
  }
  
  .btn-cancel {
    border-color: #dc3545;
    color: #dc3545;
  }
  
  .btn-cancel:hover {
    background-color: #dc3545;
    color: white;
  }
  
  /* Pagination */
  .pagination {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-top: 20px;
  }
  
  .btn-page {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dee2e6;
    background-color: white;
    color: #495057;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-page:hover:not(:disabled) {
    background-color: #e9ecef;
    border-color: #dee2e6;
    color: #0056b3;
  }
  
  .btn-page.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }
  
  .btn-page:disabled {
    color: #adb5bd;
    cursor: not-allowed;
  }
  
  /* Fatura Modalı */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .invoice-modal {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #e9ecef;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #333;
  }
  
  .btn-close {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
  }
  
  .btn-close:hover {
    color: #343a40;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .invoice-details h4 {
    color: #333;
    margin: 20px 0 10px 0;
    font-size: 1.1rem;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
  }
  
  .invoice-header-info {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    margin-bottom: 20px;
  }
  
  .invoice-meta, .customer-meta {
    flex: 1;
    min-width: 250px;
  }
  
  .info-row {
    margin: 8px 0;
    display: flex;
    align-items: baseline;
  }
  
  .info-row .label {
    font-weight: 500;
    color: #555;
    width: 120px;
    margin-right: 10px;
  }
  
  .info-row .value {
    color: #333;
  }
  
  .invoice-items {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  
  .invoice-items th {
    background-color: #f8f9fa;
    color: #495057;
    padding: 10px;
    font-weight: 600;
    border-bottom: 2px solid #dee2e6;
    text-align: left;
  }
  
  .invoice-items td {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .invoice-items tfoot td {
    padding: 10px;
    text-align: right;
    font-weight: 500;
  }
  
  .invoice-items tfoot .total-row {
    background-color: #f8f9fa;
    font-weight: 700;
  }
  
  .invoice-items tfoot .total-row td {
    border-top: 2px solid #dee2e6;
  }
  
  .invoice-notes {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 5px;
    margin-top: 20px;
  }
  
  .invoice-notes h4 {
    margin-top: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .invoice-notes p {
    margin: 0;
    color: #555;
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .btn-download-pdf {
    padding: 8px 16px;
    background-color: #17a2b8;
    color: white;
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  .btn-download-pdf:hover {
    background-color: #138496;
  }
  
  .btn-pay-large {
    padding: 8px 16px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  .btn-pay-large:hover {
    background-color: #218838;
  }
  
  .btn-cancel-large {
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  
  .btn-cancel-large:hover {
    background-color: #c82333;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-box {
      max-width: 100%;
    }
    
    .date-filters {
      flex-wrap: wrap;
    }
    
    .select-filters {
      flex-wrap: wrap;
    }
    
    .select-filter {
      width: 100%;
    }
    
    .invoice-header-info {
      flex-direction: column;
      gap: 15px;
    }
    
    .modal-footer {
      flex-wrap: wrap;
    }
  }
  </style>