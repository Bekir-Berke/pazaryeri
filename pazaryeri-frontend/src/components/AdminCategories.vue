<template>
  <div class="categories-container">
    <h2 class="section-title">Categories Management</h2>

    <div class="actions-bar">
      <button class="add-btn" @click="openAddModal">Add New Category</button>
    </div>

    <div v-if="loading" class="loading">Loading categories...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="categories.length === 0" class="no-data">No categories found</div>
    <div v-else class="categories-table-container">
      <table class="categories-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Description</th>
          <th>Level</th>
          <th>Parent Category</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="category in paginatedCategories" :key="category.id">
          <td>{{ category.id }}</td>
          <td>{{ category.name }}</td>
          <td>{{ category.description }}</td>
          <td>{{ category.level }}</td>
          <td>{{ getParentCategoryName(category.parentId) }}</td>
          <td><span :class="category.isActive ? 'status-active' : 'status-inactive'">
            {{ category.isActive ? 'Active' : 'Inactive' }}
          </span></td>
          <td>
            <div class="actions">
              <button class="details-btn" @click="viewCategory(category)">View</button>
              <button class="edit-btn" @click="editCategory(category)">Edit</button>
              <button class="delete-btn" @click="confirmDelete(category)">Delete</button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">Next</button>
    </div>

    <!-- Category Details Modal -->
    <div v-if="showModal" class="category-modal">
      <div class="modal-content">
        <span class="close-modal" @click="closeModal">&times;</span>
        <h3>{{ modalMode === 'add' ? 'Add New Category' : modalMode === 'edit' ? 'Edit Category' : 'Category Details' }}</h3>

        <form v-if="['add', 'edit'].includes(modalMode)" @submit.prevent="saveCategory">
          <div class="form-group">
            <label for="categoryName">Name:</label>
            <input type="text" id="categoryName" v-model="currentCategory.name" required />
          </div>

          <div class="form-group">
            <label for="categoryDescription">Description:</label>
            <textarea id="categoryDescription" v-model="currentCategory.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label for="parentCategory">Parent Category:</label>
            <select id="parentCategory" v-model="currentCategory.parentId">
              <option value="">None</option>
              <option v-for="cat in categories.filter(c => c.id !== currentCategory.id)"
                      :key="cat.id"
                      :value="cat.id">
                {{ cat.name }} (Level {{ cat.level }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="categoryStatus">Status:</label>
            <select id="categoryStatus" v-model="currentCategory.isActive">
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
            <button type="submit" class="save-btn">Save</button>
          </div>
        </form>

        <div v-else class="category-details">
          <div class="details-grid">
            <div class="detail-item">
              <strong>ID:</strong> {{ currentCategory.id }}
            </div>
            <div class="detail-item">
              <strong>Name:</strong> {{ currentCategory.name }}
            </div>
            <div class="detail-item">
              <strong>Description:</strong> {{ currentCategory.description }}
            </div>
            <div class="detail-item">
              <strong>Level:</strong> {{ currentCategory.level }}
            </div>
            <div class="detail-item">
              <strong>Parent Category:</strong>
              {{ getParentCategoryName(currentCategory.parentId) || 'None' }}
            </div>
            <div class="detail-item">
              <strong>Status:</strong>
              <span :class="currentCategory.isActive ? 'status-active' : 'status-inactive'">
                {{ currentCategory.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="detail-item">
              <strong>Created At:</strong> {{ formatDate(currentCategory.createdAt) }}
            </div>
            <div class="detail-item">
              <strong>Updated At:</strong> {{ formatDate(currentCategory.updatedAt) }}
            </div>
          </div>

          <div class="modal-actions">
            <button class="close-btn" @click="closeModal">Close</button>
            <button class="edit-btn" @click="editCategory(currentCategory)">Edit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="confirm-modal">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete the category "{{ currentCategory.name }}"?</p>
        <p class="warning" v-if="hasChildCategories(currentCategory)">
          Warning: This category has subcategories. Deleting it will affect all subcategories.
        </p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteConfirm = false">Cancel</button>
          <button class="delete-btn" @click="deleteCategory">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from "@/api.js";
import Swal from 'sweetalert2';

// State variables
const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const modalMode = ref('view'); // 'view', 'edit', or 'add'
const currentCategory = ref({});

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(categories.value.length / itemsPerPage);
});

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return categories.value.slice(start, end);
});

// Methods
const fetchCategories = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get('/admin/categories');
    categories.value = response.data;
  } catch (err) {
    console.error('Failed to fetch categories', err);
    error.value = 'Failed to load categories. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const getParentCategoryName = (parentId) => {
  if (!parentId) return 'None';
  const parent = categories.value.find(cat => cat.id === parentId);
  return parent ? parent.name : 'Unknown';
};

const hasChildCategories = (category) => {
  return categories.value.some(cat => cat.parentId === category.id);
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const viewCategory = (category) => {
  currentCategory.value = { ...category };
  modalMode.value = 'view';
  showModal.value = true;
};

const editCategory = (category) => {
  currentCategory.value = { ...category };
  modalMode.value = 'edit';
  showModal.value = true;
};

const openAddModal = () => {
  currentCategory.value = {
    name: '',
    description: '',
    parentId: '',
    isActive: true
  };
  modalMode.value = 'add';
  showModal.value = true;
};

const confirmDelete = (category) => {
  currentCategory.value = category;
  showDeleteConfirm.value = true;
};

const deleteCategory = async () => {
  try {
    await apiClient.delete(`/category/${currentCategory.value.id}`);

    await Swal.fire({
      icon: 'success',
      title: 'Category Deleted',
      text: `${currentCategory.value.name} has been deleted successfully.`,
      timer: 2000,
      showConfirmButton: false
    });

    fetchCategories();
    showDeleteConfirm.value = false;
  } catch (err) {
    console.error('Failed to delete category', err);
    Swal.fire({
      icon: 'error',
      title: 'Delete Failed',
      text: 'Failed to delete category. Please try again later.'
    });
  }
};

const saveCategory = async () => {
  try {
    // Calculate level based on parent category
    if (currentCategory.value.parentId) {
      const parent = categories.value.find(cat => cat.id === currentCategory.value.parentId);
      if (parent) {
        currentCategory.value.level = parent.level + 1;
      }
    } else {
      currentCategory.value.level = 0;
    }

    if (modalMode.value === 'add') {
      await apiClient.post('/category', currentCategory.value);
      await Swal.fire({
        icon: 'success',
        title: 'Category Added',
        text: `${currentCategory.value.name} has been added successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      await apiClient.patch(`/admin/categories/${currentCategory.value.id}`, currentCategory.value);
      await Swal.fire({
        icon: 'success',
        title: 'Category Updated',
        text: `${currentCategory.value.name} has been updated successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    }

    fetchCategories();
    closeModal();
  } catch (err) {
    console.error('Failed to save category', err);
    Swal.fire({
      icon: 'error',
      title: 'Save Failed',
      text: 'Failed to save category. Please try again later.'
    });
  }
};

const closeModal = () => {
  showModal.value = false;
  currentCategory.value = {};
  modalMode.value = 'view';
};

onMounted(fetchCategories);
</script>

<style scoped>
.categories-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.add-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.categories-table-container {
  overflow-x: auto;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.categories-table th,
.categories-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.categories-table th {
  background-color: #f5f5f5;
  font-weight: 500;
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

.details-btn {
  background-color: #2196f3;
  color: white;
}

.edit-btn {
  background-color: #ff9800;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.status-active {
  color: #4caf50;
  font-weight: 500;
}

.status-inactive {
  color: #f44336;
  font-weight: 500;
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

.category-modal, .confirm-modal {
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
  max-width: 600px;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.save-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #9e9e9e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.warning {
  color: #f44336;
  font-weight: 500;
  margin: 10px 0;
}
</style>