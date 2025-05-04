<template>
  <div>
    <!-- Header with search and filters -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
              type="text"
              class="form-control"
              placeholder="Kullanıcı ara..."
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
              :class="[filter === 'ADMIN' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('ADMIN')"
          >
            Admin
          </button>
          <button
              class="btn"
              :class="[filter === 'USER' ? 'btn-primary' : 'btn-outline-primary']"
              @click="setFilter('USER')"
          >
            Standart
          </button>
        </div>
        <button class="btn btn-success ms-2" @click="showAddUserModal = true">
          <i class="bi bi-plus"></i> Yeni Kullanıcı
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
        <div v-else-if="filteredUsers.length === 0" class="text-center my-5">
          <i class="bi bi-search fs-1 text-muted"></i>
          <p class="mt-3">Kullanıcı bulunamadı</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
            <tr>
              <th>ID</th>
              <th>Ad Soyad</th>
              <th>E-posta</th>
              <th>Rol</th>
              <th>Durum</th>
              <th>Kayıt Tarihi</th>
              <th>Silinme Tarihi</th>
              <th>İşlemler</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="avatar me-2">
                    <img
                        :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=007AFF&color=fff&size=90`"
                        alt="User"
                        class="user-avatar"
                    >
                  </div>
                  <span>{{ user.firstName }} {{ user.lastName }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                  <span
                      class="badge"
                      :class="user.role === 'ADMIN' ? 'bg-danger' : 'bg-info'"
                  >
                    {{ user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı' }}
                  </span>
              </td>
              <td>
                  <span
                      class="badge"
                      :class="user.isActive ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ user.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ formatDate(user.deletedAt) }}</td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-sm btn-outline-primary" @click="editUser(user)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteUser(user)">
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
          Toplam: <strong>{{ totalUsers }}</strong> kullanıcı
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

    <!-- Add/Edit User Modal -->
    <div class="modal fade" :class="{ show: showAddUserModal }" tabindex="-1" style="display: block" v-if="showAddUserModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle' }}</h5>
            <button type="button" class="btn-close" @click="closeUserModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label class="form-label">Ad</label>
                <input type="text" class="form-control" v-model="userForm.firstName" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Soyad</label>
                <input type="text" class="form-control" v-model="userForm.lastName" required>
              </div>
              <div class="mb-3">
                <label class="form-label">E-posta</label>
                <input type="email" class="form-control" v-model="userForm.email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Şifre</label>
                <input type="password" class="form-control" v-model="userForm.passwordHash"
                       :required="!editingUser">
                <small class="text-muted" v-if="editingUser">Boş bırakırsanız şifre değişmeyecektir</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Rol</label>
                <select class="form-select" v-model="userForm.role">
                  <option value="USER">Standart</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" v-model="userForm.isActive" id="activeStatus">
                <label class="form-check-label" for="activeStatus">
                  Aktif
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeUserModal">İptal</button>
            <button type="button" class="btn btn-primary" @click="saveUser" :disabled="formSubmitting">
              <span v-if="formSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAddUserModal"></div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteConfirm }" tabindex="-1" style="display: block" v-if="showDeleteConfirm">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Kullanıcı Sil</h5>
            <button type="button" class="btn-close" @click="showDeleteConfirm = false"></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}</strong> kullanıcısını silmek istediğinize emin misiniz?
            </p>
            <p class="text-danger">Bu işlem geri alınamaz!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">İptal</button>
            <button type="button" class="btn btn-danger" @click="deleteUser" :disabled="deleteSubmitting">
              <span v-if="deleteSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Kullanıcıyı Sil
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
import apiClient from '@/api.js';
import Swal from 'sweetalert2';

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalUsers = ref(0);
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage.value));

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

// Users data
const users = ref([]);
const filteredUsers = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const filter = ref('ALL');

// For add/edit modal
const showAddUserModal = ref(false);
const editingUser = ref(null);
const formSubmitting = ref(false);

const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'USER',
  isActive: true
});

// For delete modal
const showDeleteConfirm = ref(false);
const userToDelete = ref(null);
const deleteSubmitting = ref(false);

// Fetch users from API
const fetchUsers = async () => {
  loading.value = true;
  apiClient.get('/admin/users').then((response) => {
    users.value = response.data;
    totalUsers.value = response.data.length;
    filteredUsers.value = users.value.slice((currentPage.value - 1) * itemsPerPage.value, currentPage.value * itemsPerPage.value);
    loading.value = false;
  }).catch((error) => {
    console.error('Error fetching users:', error);
    loading.value = false;
  })
};

// Format date to localized string
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('tr-TR');
};

// Handle search
const handleSearch = () => {
  currentPage.value = 1;
  applyFilters();
};

// Apply filters based on search query and role filter
const applyFilters = () => {
  let result = [...users.value];

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(user =>
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }

  // Filter by role
  if (filter.value !== 'ALL') {
    result = result.filter(user => user.role === filter.value);
  }

  filteredUsers.value = result;
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
  fetchUsers();
};

// Edit user
const editUser = (user) => {
  editingUser.value = user;
  userForm.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    passwordHash: '', // Leave password empty when editing
    role: user.role,
    isActive: user.isActive !== false
  };
  showAddUserModal.value = true;
};

// Confirm delete user
const confirmDeleteUser = (user) => {
  userToDelete.value = user;
  showDeleteConfirm.value = true;
};

// Delete user
const deleteUser = async () => {
  if (!userToDelete.value) return;

  deleteSubmitting.value = true;
  try {
    // Replace with your actual API endpoint
    await apiClient.delete(`/admin/users/${userToDelete.value.id}`);

    Swal.fire({
      icon: 'success',
      title: 'Başarılı',
      text: 'Kullanıcı başarıyla silindi.'
    });

    // Refresh user list
    fetchUsers();
    showDeleteConfirm.value = false;
  } catch (error) {
    console.error('Error deleting user:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: 'Kullanıcı silinirken bir hata oluştu.'
    });
  } finally {
    deleteSubmitting.value = false;
  }
};

// Save user (create/edit)
const saveUser = async () => {
  formSubmitting.value = true;

  try {
    if (editingUser.value) {
      // Update existing user
      const userData = { ...userForm.value };

      // Don't send empty password
      if (!userData.passwordHash) {
        delete userData.passwordHash;
      }

      // Replace with your actual API endpoint
      await apiClient.patch(`/admin/users/${editingUser.value.id}`, userData);

      Swal.fire({
        icon: 'success',
        title: 'Başarılı',
        text: 'Kullanıcı başarıyla güncellendi.'
      });
    } else {
      // Create new user
      // Replace with your actual API endpoint
      await apiClient.post('/admin/users', userForm.value);

      Swal.fire({
        icon: 'success',
        title: 'Başarılı',
        text: 'Kullanıcı başarıyla oluşturuldu.'
      });
    }

    // Refresh user list and close modal
    closeUserModal();
    fetchUsers();
  } catch (error) {
    console.error('Error saving user:', error);
    Swal.fire({
      icon: 'error',
      title: 'Hata',
      text: error.response?.data?.message || 'Kullanıcı kaydedilirken bir hata oluştu.'
    });
  } finally {
    formSubmitting.value = false;
  }
};

// Close user modal and reset form
const closeUserModal = () => {
  showAddUserModal.value = false;
  editingUser.value = null;
  userForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    passwordHash: '',
    role: 'USER',
    isActive: true
  };
};

// Watch for filter changes
watch([filter], () => {
  applyFilters();
});

// Load users on component mount
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
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

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>