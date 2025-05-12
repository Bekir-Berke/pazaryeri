<template>
  <div class="admin-coupons">
    <div class="header-section">
      <h1>Kuponlar</h1>
      <button class="add-button" @click="showAddModal = true">Yeni Kupon Ekle</button>
    </div>

    <div class="search-filter-section">
      <input type="text" v-model="searchTerm" placeholder="Arama..." class="search-input" />
      <select v-model="filterStatus" class="filter-select">
        <option value="all">Tüm Durumlar</option>
        <option value="active">Aktif</option>
        <option value="inactive">Pasif</option>
      </select>
    </div>

    <div class="table-container">
      <table v-if="coupons.length > 0">
        <thead>
          <tr>
            <th>Kupon Kodu</th>
            <th>Açıklama</th>
            <th>İndirim Tipi</th>
            <th>İndirim Değeri</th>
            <th>Min. Sipariş Tutarı</th>
            <th>Başlangıç Tarihi</th>
            <th>Bitiş Tarihi</th>
            <th>Kullanım Limiti</th>
            <th>Kullanım Sayısı</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coupon in filteredCoupons" :key="coupon.id">
            <td>{{ coupon.code }}</td>
            <td>{{ coupon.description }}</td>
            <td>{{ formatDiscountType(coupon.type) }}</td>
            <td>{{ formatDiscountValue(coupon.type, coupon.value) }}</td>
            <td>{{ formatCurrency(coupon.minOrderAmount) }}</td>
            <td>{{ formatDate(coupon.startDate) }}</td>
            <td>{{ formatDate(coupon.endDate) }}</td>
            <td>{{ coupon.usageLimit }}</td>
            <td>{{ coupon.usedCount }}</td>
            <td>
              <span :class="['status-badge', coupon.isActive ? 'active' : 'inactive']">
                {{ coupon.isActive ? 'Aktif' : 'Pasif' }}
              </span>
            </td>
            <td class="actions">
              <button @click="editCoupon(coupon)" class="edit-button">Düzenle</button>
              <button @click="confirmDelete(coupon)" class="delete-button">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else-if="loading" class="loading-message">
        Kuponlar yükleniyor...
      </div>
      <div v-else class="empty-message">
        Henüz kupon bulunmamaktadır.
      </div>
    </div>

    <!-- Coupon Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ showEditModal ? 'Kupon Düzenle' : 'Yeni Kupon Ekle' }}</h2>
        <form @submit.prevent="submitCoupon">
          <div class="form-group">
            <label>Kupon Kodu:</label>
            <input type="text" v-model="couponForm.code" required />
          </div>
          <div class="form-group">
            <label>Açıklama:</label>
            <input type="text" v-model="couponForm.description" required />
          </div>
          <div class="form-group">
            <label>İndirim Tipi:</label>
            <select v-model="couponForm.type">
              <option value="PERCENTAGE">Yüzde İndirim (%)</option>
              <option value="AMOUNT">Tutar İndirim (₺)</option>
            </select>
          </div>
          <div class="form-group">
            <label>İndirim Değeri:</label>
            <input type="number" v-model="couponForm.value" min="0" required />
          </div>
          <div class="form-group">
            <label>Minimum Sipariş Tutarı (₺):</label>
            <input type="number" v-model="couponForm.minOrderAmount" min="0" required />
          </div>
          <div v-if="couponForm.type === 'PERCENTAGE'" class="form-group">
            <label>Maksimum İndirim Tutarı (₺, opsiyonel):</label>
            <input type="number" v-model="couponForm.maxDiscount" min="0" />
          </div>
          <div class="form-group">
            <label>Başlangıç Tarihi:</label>
            <input type="datetime-local" v-model="couponForm.startDate" required />
          </div>
          <div class="form-group">
            <label>Bitiş Tarihi:</label>
            <input type="datetime-local" v-model="couponForm.endDate" required />
          </div>
          <div class="form-group">
            <label>Toplam Kullanım Limiti:</label>
            <input type="number" v-model="couponForm.usageLimit" min="1" required />
          </div>
          <div class="form-group">
            <label>Kişi Başı Kullanım Limiti:</label>
            <input type="number" v-model="couponForm.perUserLimit" min="1" required />
          </div>
          <div class="form-group">
            <label>Mağaza ID (Opsiyonel):</label>
            <input type="text" v-model="couponForm.storeId" />
            <small>Boş bırakılırsa tüm mağazalarda geçerli olur</small>
          </div>
          <div class="form-group">
            <label>Durum:</label>
            <select v-model="couponForm.isActive">
              <option :value="true">Aktif</option>
              <option :value="false">Pasif</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-button">İptal</button>
            <button type="submit" class="submit-button">{{ showEditModal ? 'Güncelle' : 'Ekle' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content delete-modal">
        <h2>Kuponu Sil</h2>
        <p>Bu kuponu silmek istediğinize emin misiniz?</p>
        <div class="form-actions">
          <button @click="showDeleteModal = false" class="cancel-button">İptal</button>
          <button @click="deleteCoupon" class="delete-button">Sil</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, computed } from "vue";
import apiClient from "@/api";

// States
const coupons = ref([]);
const loading = ref(true);
const searchTerm = ref("");
const filterStatus = ref("all");
const showAddModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedCoupon = ref(null);
const couponForm = ref({
  id: null,
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxDiscount: null,
  startDate: "",
  endDate: "",
  usageLimit: 1000,
  perUserLimit: 1,
  storeId: "",
  isActive: true
});

// Fetch coupons from API
const fetchCoupons = async() => {
  loading.value = true;
  try {
    const response = await apiClient.get("/admin/coupons");
    coupons.value = response.data;
  } catch (error) {
    console.error("Kuponlar yüklenirken bir hata oluştu:", error);
  } finally {
    loading.value = false;
  }
};

// Filter coupons based on search term and status filter
const filteredCoupons = computed(() => {
  return coupons.value.filter(coupon => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.value.toLowerCase());
    
    const matchesFilter = 
      filterStatus.value === "all" || 
      (filterStatus.value === "active" && coupon.isActive) || 
      (filterStatus.value === "inactive" && !coupon.isActive);
    
    return matchesSearch && matchesFilter;
  });
});

// Format discount type for display
const formatDiscountType = (type) => {
  switch (type) {
    case 'PERCENTAGE':
      return 'Yüzde İndirim';
    case 'AMOUNT':
      return 'Tutar İndirim';
    default:
      return type;
  }
};

// Format discount value
const formatDiscountValue = (type, value) => {
  return type === 'PERCENTAGE' ? `%${value}` : formatCurrency(value);
};

// Format currency
const formatCurrency = (value) => {
  if (!value) return '-';
  return `${Number(value).toLocaleString('tr-TR')} ₺`;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("tr-TR", {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date for input field
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
};

// Edit coupon
const editCoupon = (coupon) => {
  selectedCoupon.value = coupon;
  
  couponForm.value = { 
    ...coupon,
    startDate: formatDateForInput(coupon.startDate),
    endDate: formatDateForInput(coupon.endDate),
    // Ensure numeric fields are properly set
    value: String(coupon.value),
    minOrderAmount: String(coupon.minOrderAmount),
    maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : null,
    usageLimit: Number(coupon.usageLimit),
    perUserLimit: Number(coupon.perUserLimit)
  };
  
  showEditModal.value = true;
};

// Confirm delete
const confirmDelete = (coupon) => {
  selectedCoupon.value = coupon;
  showDeleteModal.value = true;
};

// Delete coupon
const deleteCoupon = async () => {
  try {
    await apiClient.delete(`/admin/coupons/${selectedCoupon.value.id}`);
    fetchCoupons();
    showDeleteModal.value = false;
  } catch (error) {
    console.error("Kupon silinirken bir hata oluştu:", error);
  }
};

// Submit coupon form (add or edit)
const submitCoupon = async () => {
  try {
    const formData = { ...couponForm.value };
    
    // If maxDiscount is empty and type is not PERCENTAGE, set it to null
    if (formData.type !== 'PERCENTAGE' || !formData.maxDiscount) {
      formData.maxDiscount = null;
    }
    
    // If storeId is empty, set it to null
    if (!formData.storeId.trim()) {
      formData.storeId = null;
    }
    
    if (showEditModal.value) {
      await apiClient.put(`/admin/coupons/${formData.id}`, formData);
    } else {
      await apiClient.post("/admin/coupons", formData);
    }
    fetchCoupons();
    closeModal();
  } catch (error) {
    console.error("Kupon kaydedilirken bir hata oluştu:", error);
  }
};

// Close all modals
const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  couponForm.value = {
    id: null,
    code: "",
    description: "",
    type: "PERCENTAGE",
    value: "",
    minOrderAmount: "",
    maxDiscount: null,
    startDate: "",
    endDate: "",
    usageLimit: 1000,
    perUserLimit: 1,
    storeId: "",
    isActive: true
  };
};

onMounted(() => {
  fetchCoupons();
});
</script>
<style scoped>
.admin-coupons {
  padding: 24px;
  background-color: #f9fafb;
  min-height: 100vh;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #edf2f7;
}

.header-section h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.search-filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input, .filter-select {
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus, .filter-select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.search-input {
  flex-grow: 1;
  min-width: 250px;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  -webkit-overflow-scrolling: touch; /* For smoother scrolling on iOS */
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: 0;
  table-layout: auto;
  min-width: 900px; /* Ensure table has minimum width for content */
}

th, td {
  padding: 14px 16px;
  text-align: left;
}

th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #e2e8f0;
}

th:first-child {
  border-top-left-radius: 8px;
}

th:last-child {
  border-top-right-radius: 8px;
}

tr:not(:last-child) td {
  border-bottom: 1px solid #edf2f7;
}

tr:hover td {
  background-color: #f7fafc;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-block;
}

.status-badge.active {
  background-color: #c6f6d5;
  color: #22543d;
}

.status-badge.inactive {
  background-color: #fed7d7;
  color: #822727;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  cursor: pointer;
  padding: 9px 16px;
  border-radius: 6px;
  font-weight: 500;
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

.add-button {
  background-color: #38a169;
  color: white;
  padding: 10px 18px;
  box-shadow: 0 2px 4px rgba(56, 161, 105, 0.2);
}

.edit-button {
  background-color: #3182ce;
  color: white;
  box-shadow: 0 1px 2px rgba(49, 130, 206, 0.2);
}

.delete-button {
  background-color: #e53e3e;
  color: white;
  box-shadow: 0 1px 2px rgba(229, 62, 62, 0.2);
}

.cancel-button {
  background-color: #edf2f7;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.submit-button {
  background-color: #38a169;
  color: white;
  box-shadow: 0 2px 4px rgba(56, 161, 105, 0.2);
  padding-left: 20px;
  padding-right: 20px;
}

.empty-message, .loading-message {
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 1.1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  width: 550px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content h2 {
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
  padding-bottom: 16px;
  border-bottom: 1px solid #edf2f7;
}

.delete-modal {
  width: 420px;
  text-align: center;
}

.delete-modal p {
  color: #4a5568;
  font-size: 1.1rem;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

.form-group small {
  display: block;
  color: #718096;
  font-size: 0.85rem;
  margin-top: 4px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .search-filter-section {
    flex-direction: column;
  }
  
  .search-input, .filter-select {
    width: 100%;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .add-button {
    width: 100%;
  }
  
  .table-container {
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
  
  .table-container::-webkit-scrollbar {
    height: 6px;
  }
  
  .table-container::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .table-container::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .table-container::after {
    content: '→';
    position: absolute;
    right: 10px;
    bottom: 10px;
    color: rgba(0, 0, 0, 0.3);
    font-size: 20px;
    pointer-events: none;
    animation: scrollHint 1.5s ease-in-out infinite;
    display: block;
  }
  
  @keyframes scrollHint {
    0%, 100% { opacity: 0.3; transform: translateX(0); }
    50% { opacity: 0.7; transform: translateX(5px); }
  }
}

@media (max-width: 480px) {
  .admin-coupons {
    padding: 16px;
  }
  
  th, td {
    padding: 12px 14px;
  }
  
  .actions {
    flex-direction: column;
    gap: 6px;
  }
  
  .actions button {
    width: 100%;
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}
</style>