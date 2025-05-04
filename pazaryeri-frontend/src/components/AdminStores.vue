<template>
  <div>
    <!-- Header with search and filters -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
              type="text"
              class="form-control"
              placeholder="Mağaza ara..."
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
              :class="[filter === 'APPROVED' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('APPROVED')"
          >
            Aktif
          </button>
          <button
              class="btn"
              :class="[filter === 'PENDING' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('PENDING')"
          >
            Onay Bekliyor
          </button>
        </div>
        <button class="btn btn-success ms-2" @click="showAddStoreModal = true">
          <i class="bi bi-plus"></i> Yeni Mağaza
        </button>
      </div>
    </div>

    <!-- Stores Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
        <div v-else-if="filteredStores.length === 0" class="text-center my-5">
          <i class="bi bi-shop fs-1 text-muted"></i>
          <p class="mt-3">Mağaza bulunamadı</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
            <tr>
              <th>ID</th>
              <th>Mağaza Adı</th>
              <th>Sahibi</th>
              <th>İletişim</th>
              <th>Ürün Sayısı</th>
              <th>Durum</th>
              <th>Kayıt Tarihi</th>
              <th>İşlemler</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="store in filteredStores" :key="store.id">
              <td>{{ store.id }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="store-logo me-2">
                    <img
                        :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=007AFF&color=fff&size=90`"
                        alt="Store"
                        class="store-logo-img"
                    >
                  </div>
                  <span>{{ store.name }}</span>
                </div>
              </td>
              <td>{{ store.ownerFirstName + ' ' +store.ownerLastName }}</td>
              <td>
                <div>{{ store.email }}</div>
                <div class="text-muted small">{{ store.phone }}</div>
              </td>
              <td>
                <span class="badge bg-info">{{ store.products.length || 0 }}</span>
              </td>
              <td>
                  <span
                      class="badge"
                      :class="getBadgeClass(store.status)"
                  >
                    {{ getStatusText(store.status) }}
                  </span>
              </td>
              <td>{{ formatDate(store.createdAt) }}</td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary" @click="editStore(store)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                      v-if="store.status === 'PENDING'"
                      class="btn btn-sm btn-outline-success"
                      @click="approveStore(store)"
                  >
                    <i class="bi bi-check"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteStore(store)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <div>
          Toplam: <strong>{{ totalStores }}</strong> mağaza
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

    <!-- Add/Edit Store Modal -->
    <div class="modal fade" :class="{ show: showAddStoreModal }" tabindex="-1" style="display: block" v-if="showAddStoreModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingStore ? 'Mağaza Düzenle' : 'Yeni Mağaza Ekle' }}</h5>
            <button type="button" class="btn-close" @click="closeStoreModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveStore">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Mağaza Adı</label>
                  <input type="text" class="form-control" v-model="storeForm.name" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Sahibi</label>
                  <input type="text" class="form-control" v-model="storeForm.ownerName" required>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">E-posta</label>
                  <input type="email" class="form-control" v-model="storeForm.email" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Telefon</label>
                  <input type="tel" class="form-control" v-model="storeForm.phone" required>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Adres</label>
                <textarea class="form-control" v-model="storeForm.address" rows="2"></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Açıklama</label>
                <textarea class="form-control" v-model="storeForm.description" rows="3"></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Vergi Numarası</label>
                  <input type="text" class="form-control" v-model="storeForm.taxNumber">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Durum</label>
                  <select class="form-select" v-model="storeForm.status">
                    <option value="ACTIVE">Aktif</option>
                    <option value="PENDING">Onay Bekliyor</option>
                    <option value="SUSPENDED">Askıya Alındı</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Logo URL</label>
                <input type="text" class="form-control" v-model="storeForm.logoUrl">
              </div>

              <div class="mb-3">
                <label class="form-label">Komisyon Oranı (%)</label>
                <input type="number" class="form-control" v-model.number="storeForm.commissionRate" min="0" max="100" step="0.1">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeStoreModal">İptal</button>
            <button type="button" class="btn btn-primary" @click="saveStore" :disabled="formSubmitting">
              <span v-if="formSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddStoreModal"></div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteConfirm }" tabindex="-1" style="display: block" v-if="showDeleteConfirm">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Mağaza Sil</h5>
            <button type="button" class="btn-close" @click="showDeleteConfirm = false"></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>{{ storeToDelete?.name }}</strong> mağazasını silmek istediğinize emin misiniz?
            </p>
            <p class="text-danger">Bu işlem geri alınamaz! Tüm mağaza ürünleri de silinecektir.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">İptal</button>
            <button type="button" class="btn btn-danger" @click="deleteStore" :disabled="deleteSubmitting">
              <span v-if="deleteSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Mağazayı Sil
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteConfirm"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import apiClient from "@/api.js";

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalStores = ref(0);
const totalPages = computed(() => Math.ceil(totalStores.value / itemsPerPage.value));

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

// Stores data
const stores = ref([]);
const filteredStores = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const filter = ref('ALL');

// For add/edit modal
const showAddStoreModal = ref(false);
const editingStore = ref(null);
const formSubmitting = ref(false);

const storeForm = ref({
  name: '',
  ownerName: '',
  email: '',
  phone: '',
  address: '',
  description: '',
  taxNumber: '',
  status: 'PENDING',
  logoUrl: '',
  commissionRate: 5 // Default commission rate
});

// For delete modal
const showDeleteConfirm = ref(false);
const storeToDelete = ref(null);
const deleteSubmitting = ref(false);

// Fetch stores from API
const fetchStores = async () => {
  loading.value = true;
  apiClient.get('/admin/stores').then((response) => {
    stores.value = response.data;
    totalStores.value = response.data.length;
    filteredStores.value = stores.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value);
    loading.value = false;
  }).catch((error) => {
    console.error('Error fetching stores:', error);
    loading.value = false;
  })
};

// Format date to localized string
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('tr-TR');
};

// Get badge class based on store status
const getBadgeClass = (status) => {
  switch (status) {
    case 'ACTIVE': return 'bg-success';
    case 'PENDING': return 'bg-warning text-dark';
    case 'SUSPENDED': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

// Get status text based on store status
const getStatusText = (status) => {
  switch (status) {
    case 'APPROVED': return 'Aktif';
    case 'PENDING': return 'Onay Bekliyor';
    case 'SUSPENDED': return 'Askıya Alındı';
    case 'REJECTED': return 'Reddedildi';
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
  let result = [...stores.value];

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(store =>
        store.name?.toLowerCase().includes(query) ||
        store.ownerName?.toLowerCase().includes(query) ||
        store.email?.toLowerCase().includes(query)
    );
  }

  // Filter by status
  if (filter.value !== 'ALL') {
    result = result.filter(store => store.status === filter.value);
  }

  filteredStores.value = result;
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
  fetchStores();
};

// Edit store
const editStore = (store) => {
  editingStore.value = store;
  storeForm.value = {
    name: store.name,
    ownerName: store.ownerName,
    email: store.email,
    phone: store.phone || '',
    address: store.address || '',
    description: store.description || '',
    taxNumber: store.taxNumber || '',
    status: store.status,
    logoUrl: store.logoUrl || '',
    commissionRate: store.commissionRate || 5
  };
  showAddStoreModal.value = true;
};

// Approve store
const approveStore = (store) => {
  Swal.fire({
    title: 'Mağazayı Onayla',
    text: `"${store.name}" mağazasını onaylamak istediğinizden emin misiniz?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Evet, Onayla',
    cancelButtonText: 'İptal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await axios.patch(`/api/admin/stores/${store.id}/approve`, {
          status: 'ACTIVE'
        });

        Swal.fire({
          icon: 'success',
          title: 'Başarılı',
          text: 'Mağaza başarıyla onaylandı.'
        });

        fetchStores();
      } catch (error) {
        console.error('Error approving store:', error);
        Swal.fire({
          icon: 'error',
          title: 'Hata',
          text: 'Mağaza onaylanırken bir hata oluştu.'
        });
      }
    }
  });
};

// Confirm delete store
const confirmDeleteStore = (store) => {
  storeToDelete.value = store;
  showDeleteConfirm.value = true;
};

// Delete store
const deleteStore = async () => {
  if (!storeToDelete.value) return;

  deleteSubmitting.value = true;
  try {
    // Replace with your actual API endpoint
    await axios.delete(`/api/admin/stores/${storeToDelete.value.id}`);

    Swal.fire({
      icon: 'success',
      title: 'Başarılı',
      text: 'Mağaza başarıyla silindi.'
    });

    // Refresh store list
    fetchStores();
    showDeleteConfirm.value = false;
  } catch (error) {
    console.error('Error deleting store:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Mağaza silinirken bir hata oluştu.'
    });
  } finally {
    deleteSubmitting.value = false;
  }
};

// Save store (create/edit)
const saveStore = async () => {
  formSubmitting.value = true;

  try {
    if (editingStore.value) {
      // Update existing store
      await axios.put(`/api/admin/stores/${editingStore.value.id}`, storeForm.value);

      Swal.fire({
        icon: 'success',
        title: 'Başarılı',
        text: 'Mağaza başarıyla güncellendi.'
      });
    } else {
      // Create new store
      await axios.post('/api/admin/stores', storeForm.value);

      Swal.fire({
        icon: 'success',
        title: 'Başarılı',
        text: 'Mağaza başarıyla oluşturuldu.'
      });
    }

    // Refresh store list and close modal
    closeStoreModal();
    fetchStores();
  } catch (error) {
    console.error('Error saving store:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: error.response?.data?.message || 'Mağaza kaydedilirken bir hata oluştu.'
    });
  } finally {
    formSubmitting.value = false;
  }
};

// Close store modal and reset form
const closeStoreModal = () => {
  showAddStoreModal.value = false;
  editingStore.value = null;
  storeForm.value = {
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    taxNumber: '',
    status: 'PENDING',
    logoUrl: '',
    commissionRate: 5
  };
};

// Watch for filter changes
watch([filter], () => {
  applyFilters();
});

// Load stores on component mount
onMounted(() => {
  fetchStores();
});
</script>

<style scoped>
.store-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.store-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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