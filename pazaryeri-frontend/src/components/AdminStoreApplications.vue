<template>
  <div class="admin-store-applications">
    <h1 class="title">Mağaza Başvuruları</h1>
    
    <div class="filters">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Mağaza adı veya sahibi ile ara..."
          @input="filterApplications"
        />
      </div>
      
      <div class="status-filter">
        <select v-model="statusFilter" @change="filterApplications">
          <option value="all">Tüm Başvurular</option>
          <option value="PENDING">Bekleyen</option>
          <option value="APPROVED">Onaylanan</option>
          <option value="REJECTED">Reddedilen</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <span>Yükleniyor...</span>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchApplications">Tekrar Dene</button>
    </div>

    <div v-else-if="filteredApplications.length === 0" class="no-data">
      <p>Gösterilecek başvuru bulunamadı.</p>
    </div>

    <div v-else class="applications-table-container">
      <table class="applications-table">
        <thead>
          <tr>
            <th @click="sortBy('id')">ID {{ sortKey === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</th>
            <th @click="sortBy('name')">Mağaza Adı {{ sortKey === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</th>
            <th @click="sortBy('ownerFullName')">Başvuru Sahibi {{ sortKey === 'ownerFullName' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</th>
            <th @click="sortBy('taxNumber')">Vergi No {{ sortKey === 'taxNumber' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</th>
            <th @click="sortBy('createdAt')">Başvuru Tarihi {{ sortKey === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</th>
            <th @click="sortBy('status')">Durum {{ sortKey === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="application in filteredApplications" :key="application.id" :class="application.status.toLowerCase()">
            <td>{{ application.id }}</td>
            <td>{{ application.name }}</td>
            <td>{{ getOwnerFullName(application) }}</td>
            <td>{{ application.taxNumber }}</td>
            <td>{{ formatDate(application.createdAt) }}</td>
            <td>
              <span class="status-badge" :class="application.status.toLowerCase()">
                {{ getStatusText(application.status) }}
              </span>
            </td>
            <td class="actions">
              <button 
                v-if="application.status === 'PENDING'" 
                class="approve-btn" 
                @click="updateStatus(application.id, 'APPROVED')"
              >
                Onayla
              </button>
              <button 
                v-if="application.status === 'PENDING'" 
                class="reject-btn" 
                @click="updateStatus(application.id, 'REJECTED')"
              >
                Reddet
              </button>
              <button class="details-btn" @click="viewDetails(application.id)">Detaylar</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
        >
          Önceki
        </button>
        <span>Sayfa {{ currentPage }} / {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
        >
          Sonraki
        </button>
      </div>
    </div>

    <div v-if="selectedApplication" class="application-details-modal">
      <div class="modal-content">
        <span class="close-modal" @click="selectedApplication = null">&times;</span>
        <h2>Başvuru Detayları</h2>
        <div class="details-grid">
          <div class="detail-item">
            <strong>Mağaza Adı:</strong> {{ selectedApplication.name }}
          </div>
          <div class="detail-item">
            <strong>Başvuru Sahibi:</strong> {{ getOwnerFullName(selectedApplication) }}
          </div>
          <div class="detail-item">
            <strong>E-posta:</strong> {{ selectedApplication.ownerEmail }}
          </div>
          <div class="detail-item">
            <strong>Telefon:</strong> {{ selectedApplication.ownerPhone }}
          </div>
          <div class="detail-item">
            <strong>Şirket Adı:</strong> {{ selectedApplication.companyName }}
          </div>
          <div class="detail-item">
            <strong>Vergi No:</strong> {{ selectedApplication.taxNumber }}
          </div>
          <div class="detail-item">
            <strong>Vergi Dairesi:</strong> {{ selectedApplication.taxOffice }}
          </div>
          <div class="detail-item">
            <strong>IBAN:</strong> {{ selectedApplication.iban }}
          </div>
          <div class="detail-item">
            <strong>Mağaza Telefonu:</strong> {{ selectedApplication.phone }}
          </div>
          <div class="detail-item">
            <strong>Başvuru Tarihi:</strong> {{ formatDate(selectedApplication.createdAt) }}
          </div>
          <div class="detail-item full-width">
            <strong>Adres:</strong> 
            <p>{{ selectedApplication.address }}</p>
          </div>
        </div>
        <div class="modal-actions">
          <button 
            v-if="selectedApplication.status === 'PENDING'" 
            class="approve-btn" 
            @click="updateStatus(selectedApplication.id, 'APPROVED')"
          >
            Onayla
          </button>
          <button 
            v-if="selectedApplication.status === 'PENDING'" 
            class="reject-btn" 
            @click="updateStatus(selectedApplication.id, 'REJECTED')"
          >
            Reddet
          </button>
          <button class="close-btn" @click="selectedApplication = null">Kapat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/api.js'

// State variables
const applications = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const statusFilter = ref('all');
const sortKey = ref('createdAt');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const selectedApplication = ref(null);

// Get owner's full name
const getOwnerFullName = (application) => {
  return `${application.ownerFirstName} ${application.ownerLastName}`;
};

// Fetch applications from API
const fetchApplications = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await apiClient.get('/admin/stores/applications');
    applications.value = response.data;
  } catch (err) {
    console.error('Error fetching applications:', err);
    error.value = 'Başvuruları yüklerken bir hata oluştu.';
  } finally {
    loading.value = false;
  }
};

// Sort applications
const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get status text
const getStatusText = (status) => {
  switch (status) {
    case 'PENDING': return 'Beklemede';
    case 'APPROVED': return 'Onaylandı';
    case 'REJECTED': return 'Reddedildi';
    default: return status;
  }
};

// Filter applications
const filterApplications = () => {
  currentPage.value = 1;
};

// Update application status
const updateStatus = async (id, status) => {
  try {
    await apiClient.put(`/admin/stores/applications/${id}/status`, { status });
    
    // Update local state
    const index = applications.value.findIndex(app => app.id === id);
    if (index !== -1) {
      applications.value[index].status = status;
    }
    
    // If viewing details, update that too
    if (selectedApplication.value && selectedApplication.value.id === id) {
      selectedApplication.value.status = status;
    }
  } catch (err) {
    console.error('Error updating application status:', err);
    alert('Durum güncellenirken bir hata oluştu.');
  }
};

// View application details
const viewDetails = async (id) => {
  const application = applications.value.find(app => app.id === id);
  if (application) {
    selectedApplication.value = application;
  }
};

// Change page
const changePage = (page) => {
  currentPage.value = page;
};

// Computed properties
const filteredApplications = computed(() => {
  let filtered = [...applications.value];
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status === statusFilter.value);
  }
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(app => 
      (app.name && app.name.toLowerCase().includes(query)) || 
      (app.ownerFirstName && app.ownerFirstName.toLowerCase().includes(query)) ||
      (app.ownerLastName && app.ownerLastName.toLowerCase().includes(query)) ||
      (app.companyName && app.companyName.toLowerCase().includes(query))
    );
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let valueA, valueB;
    
    if (sortKey.value === 'ownerFullName') {
      valueA = getOwnerFullName(a).toLowerCase();
      valueB = getOwnerFullName(b).toLowerCase();
    } else {
      valueA = a[sortKey.value];
      valueB = b[sortKey.value];
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
    }
    
    if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filtered.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  let filtered = [...applications.value];
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(app => app.status === statusFilter.value);
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(app => 
      (app.name && app.name.toLowerCase().includes(query)) || 
      (app.ownerFirstName && app.ownerFirstName.toLowerCase().includes(query)) ||
      (app.ownerLastName && app.ownerLastName.toLowerCase().includes(query)) ||
      (app.companyName && app.companyName.toLowerCase().includes(query))
    );
  }
  
  return Math.ceil(filtered.length / itemsPerPage.value) || 1;
});

// Lifecycle hooks
onMounted(() => {
  fetchApplications();
});
</script>

<style scoped>
.admin-store-applications {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box input, .status-filter select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.applications-table-container {
  overflow-x: auto;
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.applications-table th, .applications-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.applications-table th {
  background-color: #f5f5f5;
  cursor: pointer;
  user-select: none;
}

.applications-table th:hover {
  background-color: #e0e0e0;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fff8e1;
  color: #ff8f00;
}

.status-badge.approved {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.rejected {
  background-color: #ffebee;
  color: #c62828;
}

.actions {
  display: flex;
  gap: 5px;
}

.actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.approve-btn {
  background-color: #4caf50;
  color: white;
}

.reject-btn {
  background-color: #f44336;
  color: white;
}

.details-btn {
  background-color: #2196f3;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 15px;
  border: none;
  background-color: #f5f5f5;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading, .error, .no-data {
  padding: 30px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin: 20px 0;
}

.error {
  color: #d32f2f;
}

.application-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.detail-item.full-width {
  grid-column: span 2;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

tr.pending:hover {
  background-color: #fff8e1;
}

tr.approved:hover {
  background-color: #e8f5e9;
}

tr.rejected:hover {
  background-color: #ffebee;
}
</style>
